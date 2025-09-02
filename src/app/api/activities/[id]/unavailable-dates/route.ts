import { NextRequest, NextResponse } from 'next/server';
import { memoryDataStore } from '@/lib/memory-data-store';
import { z } from 'zod';

// Validation schemas
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Use YYYY-MM-DD');
const datesArraySchema = z.array(dateSchema);

/**
 * GET /api/activities/[id]/unavailable-dates
 * Get all unavailable dates for a specific activity
 * 특정 액티비티의 모든 불가 날짜를 조회합니다
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate activity exists
    const activity = memoryDataStore.getActivityById(id);
    if (!activity) {
      return NextResponse.json(
        { success: false, error: 'Activity not found' },
        { status: 404 }
      );
    }

    const unavailableDates = memoryDataStore.getActivityUnavailableDates(id);

    return NextResponse.json({
      success: true,
      data: {
        activity_id: id,
        unavailable_dates: unavailableDates,
        total_dates: unavailableDates.length,
      },
    });
  } catch (error) {
    console.error('Error fetching activity unavailable dates:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/activities/[id]/unavailable-dates
 * Add a new unavailable date to an activity
 * 액티비티에 새로운 불가 날짜를 추가합니다
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate activity exists
    const activity = memoryDataStore.getActivityById(id);
    if (!activity) {
      return NextResponse.json(
        { success: false, error: 'Activity not found' },
        { status: 404 }
      );
    }

    // Validate request body
    if (!body.date) {
      return NextResponse.json(
        { success: false, error: 'Date is required' },
        { status: 400 }
      );
    }

    // Validate date format
    const dateValidation = dateSchema.safeParse(body.date);
    if (!dateValidation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    // Add the unavailable date
    const success = memoryDataStore.addActivityUnavailableDate(id, body.date);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to add unavailable date' },
        { status: 500 }
      );
    }

    // Get updated unavailable dates
    const updatedDates = memoryDataStore.getActivityUnavailableDates(id);

    return NextResponse.json(
      {
        success: true,
        data: {
          activity_id: id,
          added_date: body.date,
          unavailable_dates: updatedDates,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding activity unavailable date:', error);
    
    // Handle specific validation errors
    if (error instanceof Error) {
      if (error.message.includes('Invalid date format') || 
          error.message.includes('already in unavailable dates list')) {
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
 * PUT /api/activities/[id]/unavailable-dates
 * Set all unavailable dates for an activity (replace existing)
 * 액티비티의 모든 불가 날짜를 설정합니다 (기존 데이터 교체)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate activity exists
    const activity = memoryDataStore.getActivityById(id);
    if (!activity) {
      return NextResponse.json(
        { success: false, error: 'Activity not found' },
        { status: 404 }
      );
    }

    // Validate request body
    if (!Array.isArray(body.unavailable_dates)) {
      return NextResponse.json(
        { success: false, error: 'unavailable_dates must be an array' },
        { status: 400 }
      );
    }

    // Validate dates format
    const datesValidation = datesArraySchema.safeParse(body.unavailable_dates);
    if (!datesValidation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid date format. All dates must be in YYYY-MM-DD format',
          details: datesValidation.error.errors
        },
        { status: 400 }
      );
    }

    // Set the unavailable dates
    const success = memoryDataStore.setActivityUnavailableDates(id, body.unavailable_dates);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to set unavailable dates' },
        { status: 500 }
      );
    }

    // Get updated unavailable dates
    const updatedDates = memoryDataStore.getActivityUnavailableDates(id);

    return NextResponse.json({
      success: true,
      data: {
        activity_id: id,
        unavailable_dates: updatedDates,
        total_dates: updatedDates.length,
      },
    });
  } catch (error) {
    console.error('Error setting activity unavailable dates:', error);
    
    // Handle specific validation errors
    if (error instanceof Error) {
      if (error.message.includes('Invalid date format')) {
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
 * DELETE /api/activities/[id]/unavailable-dates
 * Remove a specific unavailable date from an activity
 * 액티비티에서 특정 불가 날짜를 제거합니다
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    // Validate activity exists
    const activity = memoryDataStore.getActivityById(id);
    if (!activity) {
      return NextResponse.json(
        { success: false, error: 'Activity not found' },
        { status: 404 }
      );
    }

    // Validate date parameter
    if (!date) {
      return NextResponse.json(
        { success: false, error: 'Date parameter is required' },
        { status: 400 }
      );
    }

    // Validate date format
    const dateValidation = dateSchema.safeParse(date);
    if (!dateValidation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    // Remove the unavailable date
    const success = memoryDataStore.removeActivityUnavailableDate(id, date);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to remove unavailable date' },
        { status: 500 }
      );
    }

    // Get updated unavailable dates
    const updatedDates = memoryDataStore.getActivityUnavailableDates(id);

    return NextResponse.json({
      success: true,
      data: {
        activity_id: id,
        removed_date: date,
        unavailable_dates: updatedDates,
      },
    });
  } catch (error) {
    console.error('Error removing activity unavailable date:', error);
    
    // Handle specific validation errors
    if (error instanceof Error) {
      if (error.message.includes('not in unavailable dates list')) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
