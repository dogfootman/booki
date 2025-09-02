import { NextRequest, NextResponse } from 'next/server';
import { memoryDataStore } from '@/lib/memory-data-store';
import { createBookingSchema } from '@/types/booking';

// POST /api/bookings/validate
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Received booking validation request:', body);

    // Validate input schema first
    const validationResult = createBookingSchema.safeParse(body);
    if (!validationResult.success) {
      console.log('Schema validation failed:', validationResult.error.errors);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Schema validation failed', 
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    // Validate that activity exists
    const activity = memoryDataStore.getActivityById(body.activity_id);
    if (!activity) {
      return NextResponse.json(
        { success: false, error: 'Activity not found' },
        { status: 404 }
      );
    }

    if (!activity.is_active) {
      return NextResponse.json(
        { success: false, error: 'Activity is not active' },
        { status: 400 }
      );
    }

    // Validate that agent exists if agent_id is provided
    if (body.agent_id) {
      const agent = memoryDataStore.getAgentById(body.agent_id);
      if (!agent) {
        return NextResponse.json(
          { success: false, error: 'Agent not found' },
          { status: 404 }
        );
      }

      const bookingDate = new Date(body.start_time).toISOString().split('T')[0];

      // Check agent unavailable dates
      const isAgentDateUnavailable = memoryDataStore.isAgentDateUnavailable(body.agent_id, bookingDate);
      if (isAgentDateUnavailable) {
        return NextResponse.json(
          { 
            success: false, 
            error: `예약 불가 날짜입니다. ${bookingDate}는 해당 에이전트(${agent.name})의 휴무일입니다.`,
            validation_type: 'agent_unavailable_date'
          },
          { status: 400 }
        );
      }

      // Check agency unavailable dates
      if (agent.agency_id) {
        const isDateUnavailable = memoryDataStore.isAgencyDateUnavailable(agent.agency_id, bookingDate);
        if (isDateUnavailable) {
          return NextResponse.json(
            { 
              success: false, 
              error: `예약 불가 날짜입니다. ${bookingDate}는 해당 에이전시의 운영 중단일입니다.`,
              validation_type: 'agency_unavailable_date'
            },
            { status: 400 }
          );
        }
      }
    }

    // Perform slot availability validation
    const slotValidation = memoryDataStore.validateBookingSlotAvailability(
      body.activity_id,
      body.start_time,
      body.end_time,
      body.participants,
      body.exclude_booking_id // Optional for update validation
    );

    if (!slotValidation.isValid) {
      return NextResponse.json(
        { 
          success: false, 
          error: slotValidation.error,
          validation_type: 'slot_availability'
        },
        { status: 409 } // Conflict
      );
    }

    // Get conflicting bookings for additional information
    const conflictingBookings = memoryDataStore.getConflictingBookings(
      body.activity_id,
      body.start_time,
      body.end_time,
      body.exclude_booking_id
    );

    // Get slot availability for the date
    const date = new Date(body.start_time).toISOString().split('T')[0];
    const slotAvailability = memoryDataStore.getSlotAvailabilityForDate(
      body.activity_id,
      date
    );

    // Find the relevant slot for detailed information
    const requestStartTime = body.start_time.split('T')[1]?.substring(0, 5);
    const requestEndTime = body.end_time.split('T')[1]?.substring(0, 5);
    
    const relevantSlot = slotAvailability.find(slot => {
      return slot.start_time <= requestStartTime && slot.end_time >= requestEndTime;
    });

    return NextResponse.json({
      success: true,
      data: {
        is_valid: true,
        message: 'Booking can be created successfully',
        slot_info: relevantSlot ? {
          start_time: relevantSlot.start_time,
          end_time: relevantSlot.end_time,
          max_capacity: relevantSlot.max_capacity,
          current_bookings: relevantSlot.current_bookings,
          remaining_capacity: relevantSlot.remaining_capacity,
          capacity_after_booking: relevantSlot.remaining_capacity - body.participants,
        } : null,
        conflicting_bookings: conflictingBookings.length,
        suggestions: {
          alternative_slots: slotAvailability.filter(slot => 
            slot.is_available && 
            slot.remaining_capacity >= body.participants &&
            (slot.start_time !== requestStartTime || slot.end_time !== requestEndTime)
          ).slice(0, 3), // Show up to 3 alternative slots
        },
      },
    });
  } catch (error) {
    console.error('Unexpected error during validation:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
