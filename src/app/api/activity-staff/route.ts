import { NextRequest, NextResponse } from 'next/server';
import { createActivityStaffSchema, CreateActivityStaffRequest } from '@/types/activity-staff';
import { memoryDataStore } from '@/lib/memory-data-store';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const isActive = searchParams.get('is_active');
    const search = searchParams.get('search');
    const agencyId = searchParams.get('agency_id');

    // Build filters object
    const filters: {
      isActive?: boolean;
      search?: string;
      agencyId?: string;
    } = {};
    
    if (isActive !== null) {
      filters.isActive = isActive === 'true';
    }
    
    if (search) {
      filters.search = search;
    }
    
    if (agencyId) {
      filters.agencyId = agencyId;
    }

    // Get filtered activity staff from memory data store
    const filteredActivityStaffs = memoryDataStore.getActivityStaffs(filters);

    // Apply pagination
    const total = filteredActivityStaffs.length;
    const offset = (page - 1) * limit;
    const paginatedActivityStaffs = filteredActivityStaffs.slice(offset, offset + limit);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: paginatedActivityStaffs,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateActivityStaffRequest = await request.json();

    // Validate input
    const validationResult = createActivityStaffSchema.safeParse(body);
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

    // Check if email already exists
    if (memoryDataStore.isEmailExists(body.email)) {
      return NextResponse.json(
        { success: false, error: 'Activity staff with this email already exists' },
        { status: 409 }
      );
    }

    // Create new activity staff using memory data store
    const newActivityStaff = memoryDataStore.createActivityStaff({
      name: body.name,
      email: body.email,
      phone: body.phone,
      avatar_url: body.avatar_url,
      bio: body.bio,
      languages: body.languages || [],
      specialties: body.specialties || [],
      hourly_rate: body.hourly_rate,
      max_hours_per_day: body.max_hours_per_day || 8,
      is_active: true,
      agency_id: body.agency_id,
      unavailable_dates: body.unavailable_dates || [],
    });

    return NextResponse.json(
      { success: true, data: newActivityStaff },
      { status: 201 }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
