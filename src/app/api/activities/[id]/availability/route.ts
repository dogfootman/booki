import { NextRequest, NextResponse } from 'next/server';
import { memoryDataStore } from '@/lib/memory-data-store';

// GET /api/activities/[id]/availability
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date'); // YYYY-MM-DD format
    const participants = searchParams.get('participants');

    if (!date) {
      return NextResponse.json(
        { success: false, error: 'Date parameter is required' },
        { status: 400 }
      );
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        { success: false, error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    // Validate activity exists
    const activity = memoryDataStore.getActivityById(id);
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

    // Get slot availability for the date
    const slotAvailability = memoryDataStore.getSlotAvailabilityForDate(id, date);

    // Filter by minimum participants if specified
    let filteredSlots = slotAvailability;
    if (participants) {
      const minParticipants = parseInt(participants, 10);
      if (isNaN(minParticipants) || minParticipants < 1) {
        return NextResponse.json(
          { success: false, error: 'Invalid participants number' },
          { status: 400 }
        );
      }

      filteredSlots = slotAvailability.filter(slot => 
        slot.is_available && slot.remaining_capacity >= minParticipants
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        activity_id: id,
        date,
        slots: filteredSlots,
        summary: {
          total_slots: slotAvailability.length,
          available_slots: slotAvailability.filter(slot => slot.is_available).length,
          fully_booked_slots: slotAvailability.filter(slot => slot.remaining_capacity === 0).length,
          total_capacity: slotAvailability.reduce((sum, slot) => sum + slot.max_capacity, 0),
          total_bookings: slotAvailability.reduce((sum, slot) => sum + slot.current_bookings, 0),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching slot availability:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
