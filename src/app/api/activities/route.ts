import { NextRequest, NextResponse } from 'next/server';
import { createActivitySchema, CreateActivityRequest, ActivityQueryParams } from '@/types/activity';
import { memoryDataStore } from '@/lib/memory-data-store';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');
    const isActive = searchParams.get('is_active');
    const minPrice = searchParams.get('min_price');
    const maxPrice = searchParams.get('max_price');
    const search = searchParams.get('search');

    // Build filters object
    const filters: {
      isActive?: boolean;
      search?: string;
      category?: string;
    } = {};
    
    if (isActive !== null) {
      filters.isActive = isActive === 'true';
    }
    
    if (search) {
      filters.search = search;
    }
    
    if (category) {
      filters.category = category;
    }

    // Get filtered activities from memory data store
    let filteredActivities = memoryDataStore.getActivities(filters);

    // Apply additional filters that aren't supported by the data store yet
    if (minPrice) {
      filteredActivities = filteredActivities.filter(activity => 
        activity.price_usd >= parseFloat(minPrice)
      );
    }

    if (maxPrice) {
      filteredActivities = filteredActivities.filter(activity => 
        activity.price_usd <= parseFloat(maxPrice)
      );
    }

    // Apply pagination
    const total = filteredActivities.length;
    const offset = (page - 1) * limit;
    const paginatedActivities = filteredActivities.slice(offset, offset + limit);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: paginatedActivities,
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
    const body: CreateActivityRequest = await request.json();
    console.log('Received activity creation request:', body); // 디버깅 로그

    // Validate input
    const validationResult = createActivitySchema.safeParse(body);
    if (!validationResult.success) {
      console.log('Validation failed:', validationResult.error.errors); // 유효성 검사 실패 로그
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed', 
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    // Create new activity using memory data store
    const newActivity = memoryDataStore.createActivity({
      title_en: body.title_en,
      title_ko: body.title_ko,
      description_en: body.description_en,
      description_ko: body.description_ko,
      image_url: body.image_url,
      price_usd: body.price_usd,
      duration_minutes: body.duration_minutes,
      max_participants: body.max_participants,
      min_participants: body.min_participants || 1,
      location: body.location,
      category: body.category,
      tags: body.tags || [],
      daily_schedules: body.daily_schedules || [],
      activity_slots: body.activity_slots || [],
      is_active: true,
    });

    return NextResponse.json(
      { success: true, data: newActivity },
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
