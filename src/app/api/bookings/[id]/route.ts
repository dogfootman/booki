import { NextRequest, NextResponse } from 'next/server';
import { Booking, BookingStatus, updateBookingSchema, UpdateBookingRequest } from '@/types/booking';
import { memoryDataStore } from '@/lib/memory-data-store';

// GET /api/bookings/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Validate ID format
    if (!id || typeof id !== 'string' || id.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Invalid booking ID format' },
        { status: 400 }
      );
    }
    
    const booking = memoryDataStore.getBookingById(id);
    
    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          error: '예약을 찾을 수 없습니다.',
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '예약 정보를 불러오는데 실패했습니다.',
      },
      { status: 500 }
    );
  }
}

// PUT /api/bookings/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: UpdateBookingRequest = await request.json();
    console.log('Received booking update request:', body);

    // Validate input
    const validationResult = updateBookingSchema.safeParse(body);
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
    
    // Check if booking exists
    const existingBooking = memoryDataStore.getBookingById(id);
    
    if (!existingBooking) {
      return NextResponse.json(
        {
          success: false,
          error: '예약을 찾을 수 없습니다.',
        },
        { status: 404 }
      );
    }

    // Validate that activity exists if activity_id is being updated
    if (body.activity_id) {
      const activity = memoryDataStore.getActivityById(body.activity_id);
      if (!activity) {
        return NextResponse.json(
          { success: false, error: 'Activity not found' },
          { status: 404 }
        );
      }

      // Check participant limits against new activity
      const participants = body.participants || existingBooking.participants;
      if (participants > activity.max_participants) {
        return NextResponse.json(
          { 
            success: false, 
            error: `Number of participants (${participants}) exceeds activity maximum (${activity.max_participants})` 
          },
          { status: 400 }
        );
      }

      if (participants < activity.min_participants) {
        return NextResponse.json(
          { 
            success: false, 
            error: `Number of participants (${participants}) is below activity minimum (${activity.min_participants})` 
          },
          { status: 400 }
        );
      }
    }

    // Validate that agent exists if agent_id is being updated
    if (body.agent_id) {
      const agent = memoryDataStore.getAgentById(body.agent_id);
      if (!agent) {
        return NextResponse.json(
          { success: false, error: 'Agent not found' },
          { status: 404 }
        );
      }
    }

    // Check participant limits against current activity if only participants are updated
    if (body.participants && !body.activity_id) {
      const activity = memoryDataStore.getActivityById(existingBooking.activity_id);
      if (activity) {
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
      }
    }

    // Update booking using memory data store with slot validation
    try {
      const updatedBooking = memoryDataStore.updateBooking(id, body);

      if (!updatedBooking) {
        return NextResponse.json(
          { success: false, error: 'Failed to update booking' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: updatedBooking,
      });
    } catch (validationError: any) {
      console.log('Slot validation failed during update:', validationError.message);
      return NextResponse.json(
        { 
          success: false, 
          error: validationError.message || 'Slot validation failed during update'
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

// DELETE /api/bookings/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Validate ID format
    if (!id || typeof id !== 'string' || id.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Invalid booking ID format' },
        { status: 400 }
      );
    }
    
    // Check if booking exists
    const existingBooking = memoryDataStore.getBookingById(id);
    
    if (!existingBooking) {
      return NextResponse.json(
        {
          success: false,
          error: '예약을 찾을 수 없습니다.',
        },
        { status: 404 }
      );
    }

    // Delete booking using memory data store
    const deleted = memoryDataStore.deleteBooking(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete booking' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: '예약이 성공적으로 삭제되었습니다.',
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
