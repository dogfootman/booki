import { NextRequest, NextResponse } from 'next/server';
import { updateActivityStaffSchema, UpdateActivityStaffRequest, activityStaffIdSchema } from '@/types/activity-staff';
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
    const activityStaff = memoryDataStore.getActivityStaffByIdById(id);
    
    if (!activityStaff) {
      return NextResponse.json(
        { success: false, error: 'Activity staff not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: activityStaff,
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
    const body: UpdateActivityStaffRequest = await request.json();

    // Validate ID
    const idValidation = activityStaffIdSchema.safeParse({ id });
    if (!idValidation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid activity staff ID' },
        { status: 400 }
      );
    }

    // Validate input
    const validationResult = updateActivityStaffSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed', 
          details: validationResult.error.errors 
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

    // Check if email is being changed and if it already exists
    if (body.email && body.email !== existingActivityStaff.email) {
      if (memoryDataStore.isEmailExists(body.email)) {
        return NextResponse.json(
          { success: false, error: 'Activity staff with this email already exists' },
          { status: 409 }
        );
      }
    }

    // Update activity staff using memory data store
    const updatedActivityStaff = memoryDataStore.updateActivityStaff(id, body);

    return NextResponse.json({
      success: true,
      data: updatedActivityStaff,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
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

    // Check if activity staff exists
    const existingActivityStaff = memoryDataStore.getActivityStaffById(id);
    if (!existingActivityStaff) {
      return NextResponse.json(
        { success: false, error: 'Activity staff not found' },
        { status: 404 }
      );
    }

    // Delete activity staff using memory data store
    const deleted = memoryDataStore.deleteActivityStaff(id);
    
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete activity staff' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Activity staff deleted successfully',
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
