import { NextRequest, NextResponse } from 'next/server';
import { memoryDataStore } from '@/lib/memory-data-store';

// GET /api/agents/[id]/unavailable-dates
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate agent exists
    const agent = memoryDataStore.getAgentById(id);
    if (!agent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      );
    }

    const unavailableDates = memoryDataStore.getAgentUnavailableDates(id);

    return NextResponse.json({
      success: true,
      data: {
        agent_id: id,
        unavailable_dates: unavailableDates,
      },
    });
  } catch (error) {
    console.error('Error getting agent unavailable dates:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/agents/[id]/unavailable-dates
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    console.log('Adding agent unavailable date:', { agentId: id, ...body });

    // Validate agent exists
    const agent = memoryDataStore.getAgentById(id);
    if (!agent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      );
    }

    // Validate request body
    if (!body.date || typeof body.date !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Date is required and must be a string' },
        { status: 400 }
      );
    }

    // Add the unavailable date
    try {
      memoryDataStore.addAgentUnavailableDate(id, body.date);
    } catch (dataError) {
      const errorMessage = dataError instanceof Error ? dataError.message : 'Failed to add unavailable date';
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 400 }
      );
    }

    // Return updated unavailable dates
    const updatedUnavailableDates = memoryDataStore.getAgentUnavailableDates(id);

    return NextResponse.json({
      success: true,
      data: {
        agent_id: id,
        unavailable_dates: updatedUnavailableDates,
      },
    });
  } catch (error) {
    console.error('Error adding agent unavailable date:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/agents/[id]/unavailable-dates
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    console.log('Removing agent unavailable date:', { agentId: id, ...body });

    // Validate agent exists
    const agent = memoryDataStore.getAgentById(id);
    if (!agent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      );
    }

    // Validate request body
    if (!body.date || typeof body.date !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Date is required and must be a string' },
        { status: 400 }
      );
    }

    // Remove the unavailable date
    try {
      memoryDataStore.removeAgentUnavailableDate(id, body.date);
    } catch (dataError) {
      const errorMessage = dataError instanceof Error ? dataError.message : 'Failed to remove unavailable date';
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 400 }
      );
    }

    // Return updated unavailable dates
    const updatedUnavailableDates = memoryDataStore.getAgentUnavailableDates(id);

    return NextResponse.json({
      success: true,
      data: {
        agent_id: id,
        unavailable_dates: updatedUnavailableDates,
      },
    });
  } catch (error) {
    console.error('Error removing agent unavailable date:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/agents/[id]/unavailable-dates
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    console.log('Setting agent unavailable dates:', { agentId: id, ...body });

    // Validate agent exists
    const agent = memoryDataStore.getAgentById(id);
    if (!agent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      );
    }

    // Validate request body
    if (!Array.isArray(body.dates)) {
      return NextResponse.json(
        { success: false, error: 'Dates must be an array' },
        { status: 400 }
      );
    }

    // Set the unavailable dates
    try {
      memoryDataStore.setAgentUnavailableDates(id, body.dates);
    } catch (dataError) {
      const errorMessage = dataError instanceof Error ? dataError.message : 'Failed to set unavailable dates';
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 400 }
      );
    }

    // Return updated unavailable dates
    const updatedUnavailableDates = memoryDataStore.getAgentUnavailableDates(id);

    return NextResponse.json({
      success: true,
      data: {
        agent_id: id,
        unavailable_dates: updatedUnavailableDates,
      },
    });
  } catch (error) {
    console.error('Error setting agent unavailable dates:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
