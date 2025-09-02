import { NextRequest, NextResponse } from 'next/server';
import { memoryDataStore } from '@/lib/memory-data-store';

/**
 * GET /api/agency-unavailable-schedules
 * Get all agency unavailable schedules with filtering and pagination
 * 모든 에이전시 불가 스케줄을 조회합니다 (필터링 및 페이지네이션 포함)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const agencyId = searchParams.get('agency_id');
    const date = searchParams.get('date');
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');
    const isActive = searchParams.get('is_active');
    const search = searchParams.get('search');

    // Get all schedules from memory data store with filters
    let filteredSchedules = memoryDataStore.getAgencyUnavailableSchedules({
      agency_id: agencyId || undefined,
      date: date || undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
      is_active: isActive ? isActive === 'true' : undefined,
      search: search || undefined,
    });

    // Apply pagination
    const total = filteredSchedules.length;
    const offset = (page - 1) * limit;
    const paginatedSchedules = filteredSchedules.slice(offset, offset + limit);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: paginatedSchedules,
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

/**
 * POST /api/agency-unavailable-schedules
 * Create a new agency unavailable schedule
 * 새로운 에이전시 불가 스케줄을 생성합니다
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.agency_id) {
      return NextResponse.json(
        { success: false, error: 'Agency ID is required' },
        { status: 400 }
      );
    }

    if (!body.date) {
      return NextResponse.json(
        { success: false, error: 'Date is required' },
        { status: 400 }
      );
    }

    // Create new schedule using memory data store
    const newSchedule = memoryDataStore.createAgencyUnavailableSchedule({
      agency_id: body.agency_id,
      date: body.date,
      reason: body.reason,
      is_active: body.is_active !== undefined ? body.is_active : true,
    });

    return NextResponse.json(
      { success: true, data: newSchedule },
      { status: 201 }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    
    // Handle specific validation errors
    if (error instanceof Error) {
      if (error.message.includes('Agency not found') ||
          error.message.includes('Invalid date format') || 
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
