import { NextRequest, NextResponse } from 'next/server';
import { activityStaffIdSchema, activityStaffUnavailableDatesSchema } from '@/types/activity-staff';
import { memoryDataStore } from '@/lib/memory-data-store';

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    
    // Validate ID
    const idValidation = activityStaffIdSchema.safeParse({ id });
    if (!idValidation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid activity staff ID' },
        { status: 400 }
      );
    }

    // Get activity staff from memory data store
    const activityStaff = memoryDataStore.getActivityStaffById(id);
    
    if (!activityStaff) {
      return NextResponse.json(
        { success: false, error: 'Activity staff not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: activityStaff.unavailable_dates,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate ID
    const idValidation = activityStaffIdSchema.safeParse({ id });
    if (!idValidation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid activity staff ID' },
        { status: 400 }
      );
    }

    // Validate unavailable dates
    const datesValidation = activityStaffUnavailableDatesSchema.safeParse(body.unavailable_dates);
    if (!datesValidation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid unavailable dates format', 
          details: datesValidation.error.errors 
        },
        { status: 400 }
      );
    }

    // Check if activity staff exists
    const existingActivityStaff = memoryDataStore.getActivityStaffById(id);
    if (!existingActivityStaff) {
      return NextResponse.json(
        { success: false, error: 'Activity staff not found' },
        { status: 404 }
      );
    }

    // Update unavailable dates using memory data store
    const updatedActivityStaff = memoryDataStore.updateActivityStaff(id, {
      unavailable_dates: datesValidation.data,
    });

    return NextResponse.json({
      success: true,
      data: updatedActivityStaff.unavailable_dates,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
