import { Agent, Activity, Booking, Agency } from '@/types';
import { mockAgents, mockActivities, mockBookings, mockAgencies } from './mock-data';

// Global instance to ensure persistence across Next.js API routes
let globalInstance: MemoryDataStore | null = null;

/**
 * Memory-based data store for managing application data during runtime
 * 데이터를 메모리에 저장하여 런타임 중 CRUD 작업을 지원하는 저장소
 */
export class MemoryDataStore {
  private agents: Map<string, Agent>;
  private activities: Map<string, Activity>;
  private bookings: Map<string, Booking>;
  private agencies: Map<string, Agency>;
  
  private constructor() {
    this.agents = new Map();
    this.activities = new Map();
    this.bookings = new Map();
    this.agencies = new Map();
    
    this.initializeData();
  }
  
  /**
   * Get singleton instance of MemoryDataStore
   * MemoryDataStore의 싱글톤 인스턴스를 반환합니다
   */
  public static getInstance(): MemoryDataStore {
    if (!globalInstance) {
      globalInstance = new MemoryDataStore();
    }
    return globalInstance;
  }
  
  /**
   * Initialize data store with mock data
   * 모의 데이터로 데이터 저장소를 초기화합니다
   */
  private initializeData(): void {
    // Initialize agents
    mockAgents.forEach(agent => {
      this.agents.set(agent.id, { ...agent });
    });
    
    // Initialize activities
    mockActivities.forEach(activity => {
      this.activities.set(activity.id, { ...activity });
    });
    
    // Initialize bookings
    if (mockBookings) {
      mockBookings.forEach(booking => {
        this.bookings.set(booking.id, { ...booking });
      });
    }
    
    // Initialize agencies
    if (mockAgencies) {
      mockAgencies.forEach(agency => {
        this.agencies.set(agency.id, { ...agency });
      });
    }
  }
  
  // Agent CRUD operations
  /**
   * Get all agents with optional filtering
   * 모든 에이전트를 반환합니다 (필터링 옵션 포함)
   */
  public getAgents(filters?: {
    isActive?: boolean;
    search?: string;
    agencyId?: string;
  }): Agent[] {
    let agents = Array.from(this.agents.values());
    
    if (filters?.isActive !== undefined) {
      agents = agents.filter(agent => agent.is_active === filters.isActive);
    }
    
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      agents = agents.filter(agent =>
        agent.name.toLowerCase().includes(searchLower) ||
        agent.email.toLowerCase().includes(searchLower)
      );
    }
    
    if (filters?.agencyId) {
      agents = agents.filter(agent => agent.agency_id === filters.agencyId);
    }
    
    return agents.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }
  
  /**
   * Get agent by ID
   * ID로 에이전트를 조회합니다
   */
  public getAgentById(id: string): Agent | undefined {
    return this.agents.get(id);
  }
  
  /**
   * Create new agent
   * 새로운 에이전트를 생성합니다
   */
  public createAgent(agentData: Omit<Agent, 'id' | 'created_at' | 'updated_at'>): Agent {
    const id = this.generateId();
    const now = this.getCurrentTimestamp();
    
    const newAgent: Agent = {
      ...agentData,
      id,
      created_at: now,
      updated_at: now,
    };
    
    this.agents.set(id, newAgent);
    return newAgent;
  }
  
  /**
   * Update existing agent
   * 기존 에이전트를 업데이트합니다
   */
  public updateAgent(id: string, updates: Partial<Agent>): Agent | null {
    const agent = this.agents.get(id);
    if (!agent) return null;
    
    const updatedAgent: Agent = {
      ...agent,
      ...updates,
      updated_at: this.getCurrentTimestamp(),
    };
    
    this.agents.set(id, updatedAgent);
    return updatedAgent;
  }
  
  /**
   * Delete agent by ID
   * ID로 에이전트를 삭제합니다
   */
  public deleteAgent(id: string): boolean {
    return this.agents.delete(id);
  }
  
  /**
   * Check if email already exists
   * 이메일이 이미 존재하는지 확인합니다
   */
  public isEmailExists(email: string, excludeId?: string): boolean {
    return Array.from(this.agents.values()).some(agent => 
      agent.email === email && agent.id !== excludeId
    );
  }
  
  // Activity CRUD operations
  /**
   * Get all activities with optional filtering
   * 모든 액티비티를 반환합니다 (필터링 옵션 포함)
   */
  public getActivities(filters?: {
    isActive?: boolean;
    search?: string;
    category?: string;
  }): Activity[] {
    let activities = Array.from(this.activities.values());
    
    if (filters?.isActive !== undefined) {
      activities = activities.filter(activity => activity.is_active === filters.isActive);
    }
    
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      activities = activities.filter(activity =>
        activity.title_en.toLowerCase().includes(searchLower) ||
        activity.title_ko?.toLowerCase().includes(searchLower) ||
        activity.description_en?.toLowerCase().includes(searchLower)
      );
    }
    
    if (filters?.category) {
      activities = activities.filter(activity => activity.category === filters.category);
    }
    
    return activities.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }
  
  /**
   * Get activity by ID
   * ID로 액티비티를 조회합니다
   */
  public getActivityById(id: string): Activity | undefined {
    return this.activities.get(id);
  }
  
  /**
   * Create new activity
   * 새로운 액티비티를 생성합니다
   */
  public createActivity(activityData: Omit<Activity, 'id' | 'created_at' | 'updated_at'>): Activity {
    const id = this.generateId();
    const now = this.getCurrentTimestamp();
    
    const newActivity: Activity = {
      ...activityData,
      id,
      created_at: now,
      updated_at: now,
    };
    
    this.activities.set(id, newActivity);
    return newActivity;
  }
  
  /**
   * Update existing activity
   * 기존 액티비티를 업데이트합니다
   */
  public updateActivity(id: string, updates: Partial<Activity>): Activity | null {
    const activity = this.activities.get(id);
    if (!activity) return null;
    
    const updatedActivity: Activity = {
      ...activity,
      ...updates,
      updated_at: this.getCurrentTimestamp(),
    };
    
    this.activities.set(id, updatedActivity);
    return updatedActivity;
  }
  
  /**
   * Delete activity by ID
   * ID로 액티비티를 삭제합니다
   */
  public deleteActivity(id: string): boolean {
    return this.activities.delete(id);
  }
  
  // Booking CRUD operations
  /**
   * Get all bookings with optional filtering
   * 모든 예약을 반환합니다 (필터링 옵션 포함)
   */
  public getBookings(filters?: {
    status?: string;
    agentId?: string;
    activityId?: string;
    date?: string;
  }): Booking[] {
    let bookings = Array.from(this.bookings.values());
    
    if (filters?.status) {
      bookings = bookings.filter(booking => booking.status === filters.status);
    }
    
    if (filters?.agentId) {
      bookings = bookings.filter(booking => booking.agent_id === filters.agentId);
    }
    
    if (filters?.activityId) {
      bookings = bookings.filter(booking => booking.activity_id === filters.activityId);
    }
    
    if (filters?.date) {
      const targetDate = new Date(filters.date);
      bookings = bookings.filter(booking => {
        const bookingDate = new Date(booking.start_time);
        return bookingDate.toDateString() === targetDate.toDateString();
      });
    }
    
    return bookings.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }
  
  /**
   * Get booking by ID
   * ID로 예약을 조회합니다
   */
  public getBookingById(id: string): Booking | undefined {
    return this.bookings.get(id);
  }
  
  /**
   * Create new booking with slot availability validation
   * 슬롯 가용성 검증과 함께 새로운 예약을 생성합니다
   */
  public createBooking(bookingData: Omit<Booking, 'id' | 'created_at' | 'updated_at'>): Booking | null {
    // Validate slot availability before creating booking
    const validationResult = this.validateBookingSlotAvailability(
      bookingData.activity_id,
      bookingData.start_time,
      bookingData.end_time,
      bookingData.participants
    );

    if (!validationResult.isValid) {
      throw new Error(validationResult.error || 'Booking validation failed');
    }

    const id = this.generateId();
    const now = this.getCurrentTimestamp();
    
    const newBooking: Booking = {
      ...bookingData,
      id,
      created_at: now,
      updated_at: now,
    };
    
    this.bookings.set(id, newBooking);
    return newBooking;
  }

  /**
   * Create new booking without validation (for internal use)
   * 검증 없이 새로운 예약을 생성합니다 (내부 사용용)
   */
  public createBookingUnsafe(bookingData: Omit<Booking, 'id' | 'created_at' | 'updated_at'>): Booking {
    const id = this.generateId();
    const now = this.getCurrentTimestamp();
    
    const newBooking: Booking = {
      ...bookingData,
      id,
      created_at: now,
      updated_at: now,
    };
    
    this.bookings.set(id, newBooking);
    return newBooking;
  }
  
  /**
   * Update existing booking with slot availability validation
   * 슬롯 가용성 검증과 함께 기존 예약을 업데이트합니다
   */
  public updateBooking(id: string, updates: Partial<Booking>): Booking | null {
    const booking = this.bookings.get(id);
    if (!booking) return null;

    // If updating critical booking fields, validate slot availability
    const needsValidation = updates.activity_id || updates.start_time || 
                           updates.end_time || updates.participants;

    if (needsValidation) {
      const updatedData = { ...booking, ...updates };
      const validationResult = this.validateBookingSlotAvailability(
        updatedData.activity_id,
        updatedData.start_time,
        updatedData.end_time,
        updatedData.participants,
        id // exclude current booking from validation
      );

      if (!validationResult.isValid) {
        throw new Error(validationResult.error || 'Booking update validation failed');
      }
    }
    
    const updatedBooking: Booking = {
      ...booking,
      ...updates,
      updated_at: this.getCurrentTimestamp(),
    };
    
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }

  /**
   * Update existing booking without validation (for internal use)
   * 검증 없이 기존 예약을 업데이트합니다 (내부 사용용)
   */
  public updateBookingUnsafe(id: string, updates: Partial<Booking>): Booking | null {
    const booking = this.bookings.get(id);
    if (!booking) return null;
    
    const updatedBooking: Booking = {
      ...booking,
      ...updates,
      updated_at: this.getCurrentTimestamp(),
    };
    
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }
  
  /**
   * Delete booking by ID
   * ID로 예약을 삭제합니다
   */
  public deleteBooking(id: string): boolean {
    return this.bookings.delete(id);
  }
  
  // Agency CRUD operations
  /**
   * Get all agencies
   * 모든 에이전시를 반환합니다
   */
  public getAgencies(): Agency[] {
    return Array.from(this.agencies.values()).sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }
  
  /**
   * Get agency by ID
   * ID로 에이전시를 조회합니다
   */
  public getAgencyById(id: string): Agency | undefined {
    return this.agencies.get(id);
  }
  
  /**
   * Create new agency
   * 새로운 에이전시를 생성합니다
   */
  public createAgency(agencyData: Omit<Agency, 'id' | 'created_at' | 'updated_at'>): Agency {
    const id = this.generateId();
    const now = this.getCurrentTimestamp();
    
    const newAgency: Agency = {
      ...agencyData,
      id,
      created_at: now,
      updated_at: now,
    };
    
    this.agencies.set(id, newAgency);
    return newAgency;
  }
  
  /**
   * Update existing agency
   * 기존 에이전시를 업데이트합니다
   */
  public updateAgency(id: string, updates: Partial<Agency>): Agency | null {
    const agency = this.agencies.get(id);
    if (!agency) return null;
    
    const updatedAgency: Agency = {
      ...agency,
      ...updates,
      updated_at: this.getCurrentTimestamp(),
    };
    
    this.agencies.set(id, updatedAgency);
    return updatedAgency;
  }
  
  /**
   * Delete agency by ID
   * ID로 에이전시를 삭제합니다
   */
  public deleteAgency(id: string): boolean {
    return this.agencies.delete(id);
  }
  
  // Utility methods
  /**
   * Generate unique ID
   * 고유 ID를 생성합니다
   */
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
  
  /**
   * Get current timestamp in ISO format
   * 현재 타임스탬프를 ISO 형식으로 반환합니다
   */
  private getCurrentTimestamp(): string {
    return new Date().toISOString();
  }
  
  /**
   * Reset data store to initial state
   * 데이터 저장소를 초기 상태로 리셋합니다
   */
  public reset(): void {
    this.agents.clear();
    this.activities.clear();
    this.bookings.clear();
    this.agencies.clear();
    this.initializeData();
  }
  
  /**
   * Get data store statistics
   * 데이터 저장소 통계를 반환합니다
   */
  public getStats(): {
    agents: number;
    activities: number;
    bookings: number;
    agencies: number;
  } {
    return {
      agents: this.agents.size,
      activities: this.activities.size,
      bookings: this.bookings.size,
      agencies: this.agencies.size,
    };
  }

  // Slot availability and validation methods
  /**
   * Validate booking slot availability
   * 예약 슬롯 가용성을 검증합니다
   */
  public validateBookingSlotAvailability(
    activityId: string,
    startTime: string,
    endTime: string,
    participants: number,
    excludeBookingId?: string
  ): { isValid: boolean; error?: string } {
    const activity = this.getActivityById(activityId);
    if (!activity || !activity.is_active) {
      return {
        isValid: false,
        error: 'Activity not found or inactive',
      };
    }

    // Check activity participant limits
    if (participants > activity.max_participants) {
      return {
        isValid: false,
        error: `Participants (${participants}) exceed activity maximum (${activity.max_participants})`,
      };
    }

    if (participants < activity.min_participants) {
      return {
        isValid: false,
        error: `Participants (${participants}) below activity minimum (${activity.min_participants})`,
      };
    }

    // Get date and day of week
    const startDate = new Date(startTime);
    const dayOfWeek = startDate.getDay();
    const dateStr = startDate.toISOString().split('T')[0];

    // Find daily schedule for this day
    const dailySchedule = activity.daily_schedules?.find(
      schedule => schedule.day_of_week === dayOfWeek
    );

    if (!dailySchedule?.time_slots) {
      return {
        isValid: false,
        error: 'No schedule available for this day',
      };
    }

    // Find overlapping time slot
    const requestStartTime = this.extractTimeFromDateTime(startTime);
    const requestEndTime = this.extractTimeFromDateTime(endTime);

    const overlappingSlot = dailySchedule.time_slots.find(slot => {
      if (!slot.start_time || !slot.end_time) return false;
      return this.doTimeSlotsOverlap(
        requestStartTime,
        requestEndTime,
        slot.start_time,
        slot.end_time
      );
    });

    if (!overlappingSlot) {
      return {
        isValid: false,
        error: 'No available time slot found for requested time',
      };
    }

    if (!overlappingSlot.is_available) {
      return {
        isValid: false,
        error: 'Time slot is not available',
      };
    }

    // Check slot capacity
    const conflictingBookings = this.getConflictingBookings(
      activityId,
      startTime,
      endTime,
      excludeBookingId
    );

    const totalConflictingParticipants = conflictingBookings.reduce(
      (total, booking) => total + booking.participants,
      0
    );

    const slotCapacity = overlappingSlot.max_capacity || activity.max_participants;
    
    if (totalConflictingParticipants + participants > slotCapacity) {
      return {
        isValid: false,
        error: `Slot capacity exceeded. Current: ${totalConflictingParticipants}, Requested: ${participants}, Maximum: ${slotCapacity}`,
      };
    }

    return { isValid: true };
  }

  /**
   * Get conflicting bookings for a time period
   * 시간대에 대한 충돌 예약을 가져옵니다
   */
  public getConflictingBookings(
    activityId: string,
    startTime: string,
    endTime: string,
    excludeBookingId?: string
  ): Booking[] {
    const allBookings = this.getBookings({ activityId });
    
    return allBookings.filter(booking => {
      if (excludeBookingId && booking.id === excludeBookingId) {
        return false;
      }

      // Only consider confirmed and pending bookings
      if (!['confirmed', 'pending'].includes(booking.status)) {
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
   * Get slot availability for a specific date and activity
   * 특정 날짜와 액티비티의 슬롯 가용성을 가져옵니다
   */
  public getSlotAvailabilityForDate(
    activityId: string,
    date: string // YYYY-MM-DD format
  ): Array<{
    start_time: string;
    end_time: string;
    max_capacity: number;
    current_bookings: number;
    remaining_capacity: number;
    is_available: boolean;
  }> {
    const activity = this.getActivityById(activityId);
    if (!activity) return [];

    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay();

    const dailySchedule = activity.daily_schedules?.find(
      schedule => schedule.day_of_week === dayOfWeek
    );

    if (!dailySchedule?.time_slots) return [];

    return dailySchedule.time_slots.map(slot => {
      const slotStart = `${date}T${slot.start_time}:00`;
      const slotEnd = `${date}T${slot.end_time}:00`;

      const conflictingBookings = this.getConflictingBookings(
        activityId,
        slotStart,
        slotEnd
      );

      const currentBookings = conflictingBookings.reduce(
        (total, booking) => total + booking.participants,
        0
      );

      const maxCapacity = slot.max_capacity || activity.max_participants;
      const remainingCapacity = Math.max(0, maxCapacity - currentBookings);

      return {
        start_time: slot.start_time || '',
        end_time: slot.end_time || '',
        max_capacity: maxCapacity,
        current_bookings: currentBookings,
        remaining_capacity: remainingCapacity,
        is_available: slot.is_available !== false && remainingCapacity > 0,
      };
    });
  }

  // Utility methods for time calculations
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

    return start1Date < end2Date && start2Date < end1Date;
  }

  /**
   * Check if two time slots overlap (HH:mm format)
   * 두 시간 슬롯이 겹치는지 확인합니다 (HH:mm 형식)
   */
  private doTimeSlotsOverlap(
    start1: string,
    end1: string,
    start2: string,
    end2: string
  ): boolean {
    const [start1Hours, start1Minutes] = start1.split(':').map(Number);
    const [end1Hours, end1Minutes] = end1.split(':').map(Number);
    const [start2Hours, start2Minutes] = start2.split(':').map(Number);
    const [end2Hours, end2Minutes] = end2.split(':').map(Number);

    const start1Total = start1Hours * 60 + start1Minutes;
    const end1Total = end1Hours * 60 + end1Minutes;
    const start2Total = start2Hours * 60 + start2Minutes;
    const end2Total = end2Hours * 60 + end2Minutes;

    return start1Total < end2Total && start2Total < end1Total;
  }

  /**
   * Extract time (HH:mm) from datetime string
   * 날짜시간 문자열에서 시간(HH:mm)을 추출합니다
   */
  private extractTimeFromDateTime(datetime: string): string {
    const date = new Date(datetime);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }
}

// Export singleton instance
export const memoryDataStore = MemoryDataStore.getInstance();
