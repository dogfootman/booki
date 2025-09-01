import { Activity, ActivitySlot } from '@/types/activity';
import { Booking, BookingStatus } from '@/types/booking';
import { MemoryDataStore } from './memory-data-store';

/**
 * Slot availability calculation service
 * 슬롯 가용성 계산 서비스
 */
export interface SlotAvailability {
  slot_id?: string;
  start_time: string;
  end_time: string;
  max_capacity: number;
  current_bookings: number;
  remaining_capacity: number;
  is_available: boolean;
}

/**
 * Booking conflict information
 * 예약 충돌 정보
 */
export interface BookingConflict {
  type: 'capacity_exceeded' | 'time_overlap' | 'activity_unavailable';
  message: string;
  conflicting_bookings?: Booking[];
  suggested_slots?: SlotAvailability[];
}

/**
 * Service for managing slot availability and booking conflicts
 * 슬롯 가용성 및 예약 충돌 관리 서비스
 */
export class SlotAvailabilityService {
  private dataStore: MemoryDataStore;

  constructor(dataStore: MemoryDataStore) {
    this.dataStore = dataStore;
  }

  /**
   * Calculate slot availability for a specific activity and date
   * 특정 액티비티와 날짜의 슬롯 가용성을 계산합니다
   */
  public calculateSlotAvailability(
    activityId: string,
    date: string // YYYY-MM-DD format
  ): SlotAvailability[] {
    const activity = this.dataStore.getActivityById(activityId);
    if (!activity) {
      return [];
    }

    // Get day of week (0 = Sunday, 6 = Saturday)
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay();

    // Find daily schedule for this day
    const dailySchedule = activity.daily_schedules?.find(
      schedule => schedule.day_of_week === dayOfWeek
    );

    if (!dailySchedule?.time_slots) {
      return [];
    }

    // Get all confirmed bookings for this activity and date
    const dayBookings = this.getBookingsForActivityAndDate(activityId, date);

    // Calculate availability for each time slot
    return dailySchedule.time_slots.map(slot => {
      const slotStart = `${date}T${slot.start_time}:00`;
      const slotEnd = `${date}T${slot.end_time}:00`;

      // Count bookings that overlap with this time slot
      const overlappingBookings = dayBookings.filter(booking =>
        this.doTimePeriodsOverlap(
          booking.start_time,
          booking.end_time,
          slotStart,
          slotEnd
        )
      );

      // Calculate total participants in overlapping bookings
      const currentBookings = overlappingBookings.reduce(
        (total, booking) => total + booking.participants,
        0
      );

      const maxCapacity = slot.max_capacity || activity.max_participants;
      const remainingCapacity = Math.max(0, maxCapacity - currentBookings);

      return {
        slot_id: slot.id,
        start_time: slot.start_time || '',
        end_time: slot.end_time || '',
        max_capacity: maxCapacity,
        current_bookings: currentBookings,
        remaining_capacity: remainingCapacity,
        is_available: slot.is_available !== false && remainingCapacity > 0,
      };
    });
  }

  /**
   * Check if a booking can be created without conflicts
   * 예약이 충돌 없이 생성될 수 있는지 확인합니다
   */
  public validateBookingAvailability(
    activityId: string,
    startTime: string,
    endTime: string,
    participants: number,
    excludeBookingId?: string
  ): { isValid: boolean; conflict?: BookingConflict } {
    const activity = this.dataStore.getActivityById(activityId);
    if (!activity) {
      return {
        isValid: false,
        conflict: {
          type: 'activity_unavailable',
          message: 'Activity not found or inactive',
        },
      };
    }

    // Check activity participant limits
    if (participants > activity.max_participants) {
      return {
        isValid: false,
        conflict: {
          type: 'capacity_exceeded',
          message: `Participants (${participants}) exceed activity maximum (${activity.max_participants})`,
        },
      };
    }

    if (participants < activity.min_participants) {
      return {
        isValid: false,
        conflict: {
          type: 'capacity_exceeded',
          message: `Participants (${participants}) below activity minimum (${activity.min_participants})`,
        },
      };
    }

    // Get date from start time
    const date = startTime.split('T')[0];
    
    // Get overlapping bookings
    const overlappingBookings = this.getOverlappingBookings(
      activityId,
      startTime,
      endTime,
      excludeBookingId
    );

    // Calculate total participants in overlapping bookings
    const totalOverlappingParticipants = overlappingBookings.reduce(
      (total, booking) => total + booking.participants,
      0
    );

    // Find the relevant time slot for capacity checking
    const slotAvailability = this.calculateSlotAvailability(activityId, date);
    
    const relevantSlot = slotAvailability.find(slot => {
      const slotStart = `${date}T${slot.start_time}:00`;
      const slotEnd = `${date}T${slot.end_time}:00`;
      return this.doTimePeriodsOverlap(startTime, endTime, slotStart, slotEnd);
    });

    if (relevantSlot) {
      const wouldExceedCapacity = 
        totalOverlappingParticipants + participants > relevantSlot.max_capacity;

      if (wouldExceedCapacity) {
        return {
          isValid: false,
          conflict: {
            type: 'capacity_exceeded',
            message: `Booking would exceed slot capacity. Current: ${totalOverlappingParticipants}, Requested: ${participants}, Maximum: ${relevantSlot.max_capacity}`,
            conflicting_bookings: overlappingBookings,
            suggested_slots: slotAvailability.filter(slot => 
              slot.is_available && slot.remaining_capacity >= participants
            ),
          },
        };
      }
    }

    return { isValid: true };
  }

  /**
   * Get available time slots for a specific activity and date
   * 특정 액티비티와 날짜의 사용 가능한 시간 슬롯을 가져옵니다
   */
  public getAvailableSlotsForDate(
    activityId: string,
    date: string,
    minParticipants: number = 1
  ): SlotAvailability[] {
    const slotAvailability = this.calculateSlotAvailability(activityId, date);
    
    return slotAvailability.filter(slot => 
      slot.is_available && slot.remaining_capacity >= minParticipants
    );
  }

  /**
   * Get bookings for a specific activity and date
   * 특정 액티비티와 날짜의 예약을 가져옵니다
   */
  private getBookingsForActivityAndDate(
    activityId: string,
    date: string
  ): Booking[] {
    const allBookings = this.dataStore.getBookings({
      activityId,
      status: BookingStatus.CONFIRMED,
    });

    // Also include PENDING bookings as they might be confirmed
    const pendingBookings = this.dataStore.getBookings({
      activityId,
      status: BookingStatus.PENDING,
    });

    const relevantBookings = [...allBookings, ...pendingBookings];

    return relevantBookings.filter(booking => {
      const bookingDate = new Date(booking.start_time).toISOString().split('T')[0];
      return bookingDate === date;
    });
  }

  /**
   * Get bookings that overlap with a specific time period
   * 특정 시간대와 겹치는 예약을 가져옵니다
   */
  private getOverlappingBookings(
    activityId: string,
    startTime: string,
    endTime: string,
    excludeBookingId?: string
  ): Booking[] {
    const date = startTime.split('T')[0];
    const dayBookings = this.getBookingsForActivityAndDate(activityId, date);

    return dayBookings.filter(booking => {
      if (excludeBookingId && booking.id === excludeBookingId) {
        return false;
      }
      
      return this.doTimePeriodsOverlap(
        booking.start_time,
        booking.end_time,
        startTime,
        endTime
      );
    });
  }

  /**
   * Check if two time periods overlap
   * 두 시간대가 겹치는지 확인합니다
   */
  private doTimePeriodsOverlap(
    start1: string,
    end1: string,
    start2: string,
    end2: string
  ): boolean {
    const start1Date = new Date(start1);
    const end1Date = new Date(end1);
    const start2Date = new Date(start2);
    const end2Date = new Date(end2);

    // Two periods overlap if one starts before the other ends
    return start1Date < end2Date && start2Date < end1Date;
  }

  /**
   * Get slot utilization statistics for an activity
   * 액티비티의 슬롯 활용도 통계를 가져옵니다
   */
  public getSlotUtilizationStats(
    activityId: string,
    startDate: string,
    endDate: string
  ): {
    totalSlots: number;
    bookedSlots: number;
    utilizationRate: number;
    averageCapacityUsed: number;
  } {
    const activity = this.dataStore.getActivityById(activityId);
    if (!activity) {
      return {
        totalSlots: 0,
        bookedSlots: 0,
        utilizationRate: 0,
        averageCapacityUsed: 0,
      };
    }

    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    let totalSlots = 0;
    let bookedSlots = 0;
    let totalCapacityUsed = 0;
    let totalMaxCapacity = 0;

    // Iterate through each date in the range
    for (let d = new Date(startDateObj); d <= endDateObj; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const slotAvailability = this.calculateSlotAvailability(activityId, dateStr);
      
      totalSlots += slotAvailability.length;
      
      slotAvailability.forEach(slot => {
        totalMaxCapacity += slot.max_capacity;
        totalCapacityUsed += slot.current_bookings;
        
        if (slot.current_bookings > 0) {
          bookedSlots++;
        }
      });
    }

    const utilizationRate = totalSlots > 0 ? (bookedSlots / totalSlots) * 100 : 0;
    const averageCapacityUsed = totalMaxCapacity > 0 ? (totalCapacityUsed / totalMaxCapacity) * 100 : 0;

    return {
      totalSlots,
      bookedSlots,
      utilizationRate: Number(utilizationRate.toFixed(2)),
      averageCapacityUsed: Number(averageCapacityUsed.toFixed(2)),
    };
  }
}

// Export singleton instance
export const slotAvailabilityService = new SlotAvailabilityService(
  require('./memory-data-store').memoryDataStore
);
