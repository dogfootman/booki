import { NextRequest, NextResponse } from 'next/server';
import { memoryDataStore } from '@/lib/memory-data-store';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const isActive = searchParams.get('is_active');
    const search = searchParams.get('search');

    // Get all agencies from memory data store
    let filteredAgencies = memoryDataStore.getAgencies();

    // Apply filters
    if (isActive !== null) {
      filteredAgencies = filteredAgencies.filter(agency => 
        agency.is_active === (isActive === 'true')
      );
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredAgencies = filteredAgencies.filter(agency =>
        agency.name.toLowerCase().includes(searchLower) ||
        agency.description?.toLowerCase().includes(searchLower)
      );
    }

    // Apply pagination
    const total = filteredAgencies.length;
    const offset = (page - 1) * limit;
    const paginatedAgencies = filteredAgencies.slice(offset, offset + limit);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: paginatedAgencies,
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
    const body = await request.json();

    // Create new agency using memory data store
    const newAgency = memoryDataStore.createAgency({
      name: body.name,
      description: body.description,
      address: body.address,
      phone: body.phone,
      email: body.email,
      website: body.website,
      logo_url: body.logo_url,
      is_active: true,
    });

    return NextResponse.json(
      { success: true, data: newAgency },
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
