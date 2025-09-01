import { NextRequest, NextResponse } from 'next/server';
import { Booking, BookingStatus, createBookingSchema, CreateBookingRequest } from '@/types/booking';
import { memoryDataStore } from '@/lib/memory-data-store';

// GET /api/bookings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const agent_id = searchParams.get('agent_id');
    const activity_id = searchParams.get('activity_id');

    // Build filters object
    const filters: {
      status?: string;
      agentId?: string;
      activityId?: string;
    } = {};
    
    if (status) {
      filters.status = status;
    }
    
    if (agent_id) {
      filters.agentId = agent_id;
    }
    
    if (activity_id) {
      filters.activityId = activity_id;
    }

    // Get filtered bookings from memory data store
    let filteredBookings = memoryDataStore.getBookings(filters);
    
    // Apply search filter (not supported by data store yet)
    if (search) {
      const searchTerm = search.toLowerCase();
      filteredBookings = filteredBookings.filter(booking =>
        booking.customer_name.toLowerCase().includes(searchTerm) ||
        booking.customer_email.toLowerCase().includes(searchTerm)
      );
    }



    return NextResponse.json({
      success: true,
      data: filteredBookings,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: '예약 목록을 불러오는데 실패했습니다.',
      },
      { status: 500 }
    );
  }
}

// POST /api/bookings
export async function POST(request: NextRequest) {
  try {
    const body: CreateBookingRequest = await request.json();
    console.log('Received booking creation request:', body);

    // Validate input
    const validationResult = createBookingSchema.safeParse(body);
    if (!validationResult.success) {
      console.log('Validation failed:', validationResult.error.errors);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed', 
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

    // Validate that agent exists if agent_id is provided
    if (body.agent_id) {
      const agent = memoryDataStore.getAgentById(body.agent_id);
      if (!agent) {
        return NextResponse.json(
          { success: false, error: 'Agent not found' },
          { status: 404 }
        );
      }
    }

    // Check if participants exceed activity limits
    if (body.participants > activity.max_participants) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Number of participants (${body.participants}) exceeds activity maximum (${activity.max_participants})` 
        },
        { status: 400 }
      );
    }

    if (body.participants < activity.min_participants) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Number of participants (${body.participants}) is below activity minimum (${activity.min_participants})` 
        },
        { status: 400 }
      );
    }

    // Create new booking using memory data store with slot validation
    try {
      const newBooking = memoryDataStore.createBooking({
        activity_id: body.activity_id,
        agent_id: body.agent_id,
        customer_name: body.customer_name,
        customer_email: body.customer_email,
        customer_phone: body.customer_phone,
        participants: body.participants,
        start_time: body.start_time,
        end_time: body.end_time,
        total_price_usd: body.total_price_usd,
        status: BookingStatus.PENDING,
        notes: body.notes,
      });

      if (!newBooking) {
        return NextResponse.json(
          { success: false, error: 'Failed to create booking due to validation error' },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { success: true, data: newBooking },
        { status: 201 }
      );
    } catch (validationError: any) {
      console.log('Slot validation failed:', validationError.message);
      return NextResponse.json(
        { 
          success: false, 
          error: validationError.message || 'Slot validation failed'
        },
        { status: 409 } // Conflict status for slot availability issues
      );
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
