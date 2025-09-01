import { NextRequest, NextResponse } from 'next/server';
import { createAgentSchema, CreateAgentRequest } from '@/types/agent';
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

    // Get filtered agents from memory data store
    const filteredAgents = memoryDataStore.getAgents(filters);

    // Apply pagination
    const total = filteredAgents.length;
    const offset = (page - 1) * limit;
    const paginatedAgents = filteredAgents.slice(offset, offset + limit);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: paginatedAgents,
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
    const body: CreateAgentRequest = await request.json();

    // Validate input
    const validationResult = createAgentSchema.safeParse(body);
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
        { success: false, error: 'Agent with this email already exists' },
        { status: 409 }
      );
    }

    // Create new agent using memory data store
    const newAgent = memoryDataStore.createAgent({
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
    });

    return NextResponse.json(
      { success: true, data: newAgent },
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
