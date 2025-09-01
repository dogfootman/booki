import { NextRequest, NextResponse } from 'next/server';
import { memoryDataStore } from '@/lib/memory-data-store';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Agency ID is required' },
        { status: 400 }
      );
    }

    const agency = memoryDataStore.getAgencyById(id);
    
    if (!agency) {
      return NextResponse.json(
        { success: false, error: 'Agency not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: agency,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Agency ID is required' },
        { status: 400 }
      );
    }

    // Check if agency exists
    const existingAgency = memoryDataStore.getAgencyById(id);
    if (!existingAgency) {
      return NextResponse.json(
        { success: false, error: 'Agency not found' },
        { status: 404 }
      );
    }

    // Update agency using memory data store
    const updatedAgency = memoryDataStore.updateAgency(id, {
      name: body.name,
      description: body.description,
      address: body.address,
      phone: body.phone,
      email: body.email,
      website: body.website,
      logo_url: body.logo_url,
      is_active: body.is_active,
    });

    if (!updatedAgency) {
      return NextResponse.json(
        { success: false, error: 'Failed to update agency' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedAgency,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Agency ID is required' },
        { status: 400 }
      );
    }

    // Check if agency exists
    const existingAgency = memoryDataStore.getAgencyById(id);
    if (!existingAgency) {
      return NextResponse.json(
        { success: false, error: 'Agency not found' },
        { status: 404 }
      );
    }

    // Check if there are agents associated with this agency
    const associatedAgents = memoryDataStore.getAgents({ agencyId: id });
    if (associatedAgents.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Cannot delete agency. ${associatedAgents.length} agent(s) are still associated with this agency.` 
        },
        { status: 400 }
      );
    }

    // Delete agency using memory data store
    const success = memoryDataStore.deleteAgency(id);
    
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete agency' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Agency deleted successfully',
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
