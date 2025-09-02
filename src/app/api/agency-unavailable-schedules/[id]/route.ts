import { NextRequest, NextResponse } from 'next/server';
import { memoryDataStore } from '@/lib/memory-data-store';

/**
 * GET /api/agency-unavailable-schedules/[id]
 * Get a specific agency unavailable schedule by ID
 * 특정 에이전시 불가 스케줄을 ID로 조회합니다
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Schedule ID is required' },
        { status: 400 }
      );
    }

    const schedule = memoryDataStore.getAgencyUnavailableScheduleById(id);
    
    if (!schedule) {
      return NextResponse.json(
        { success: false, error: 'Schedule not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: schedule,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/agency-unavailable-schedules/[id]
 * Update a specific agency unavailable schedule
 * 특정 에이전시 불가 스케줄을 업데이트합니다
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Schedule ID is required' },
        { status: 400 }
      );
    }

    // Check if schedule exists
    const existingSchedule = memoryDataStore.getAgencyUnavailableScheduleById(id);
    if (!existingSchedule) {
      return NextResponse.json(
        { success: false, error: 'Schedule not found' },
        { status: 404 }
      );
    }

    // Update schedule using memory data store
    const updatedSchedule = memoryDataStore.updateAgencyUnavailableSchedule(id, {
      date: body.date,
      reason: body.reason,
      is_active: body.is_active,
    });

    if (!updatedSchedule) {
      return NextResponse.json(
        { success: false, error: 'Failed to update schedule' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedSchedule,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    
    // Handle specific validation errors
    if (error instanceof Error) {
      if (error.message.includes('Invalid date format') || 
          error.message.includes('already exists')) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/agency-unavailable-schedules/[id]
 * Delete a specific agency unavailable schedule
 * 특정 에이전시 불가 스케줄을 삭제합니다
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Schedule ID is required' },
        { status: 400 }
      );
    }

    // Check if schedule exists
    const existingSchedule = memoryDataStore.getAgencyUnavailableScheduleById(id);
    if (!existingSchedule) {
      return NextResponse.json(
        { success: false, error: 'Schedule not found' },
        { status: 404 }
      );
    }

    // Delete schedule using memory data store
    const success = memoryDataStore.deleteAgencyUnavailableSchedule(id);
    
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete schedule' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Schedule deleted successfully',
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
