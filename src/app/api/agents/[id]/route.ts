import { NextRequest, NextResponse } from 'next/server';
import { updateAgentSchema, agentIdSchema } from '@/types/agent';
import { memoryDataStore } from '@/lib/memory-data-store';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Validate ID format
    const idValidation = agentIdSchema.safeParse({ id });
    if (!idValidation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid agent ID format' },
        { status: 400 }
      );
    }

    const agent = memoryDataStore.getAgentById(id);

    if (!agent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: agent,
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

    // Validate ID format
    const idValidation = agentIdSchema.safeParse({ id });
    if (!idValidation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid agent ID format' },
        { status: 400 }
      );
    }

    // Validate update data
    const validationResult = updateAgentSchema.safeParse(body);
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

    // Check if agent exists
    const existingAgent = memoryDataStore.getAgentById(id);
    if (!existingAgent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      );
    }

    // If email is being updated, check for duplicates
    if (body.email && body.email !== existingAgent.email) {
      if (memoryDataStore.isEmailExists(body.email, id)) {
        return NextResponse.json(
          { success: false, error: 'Agent with this email already exists' },
          { status: 409 }
        );
      }
    }

    // Update agent using memory data store
    const updatedAgent = memoryDataStore.updateAgent(id, body);

    if (!updatedAgent) {
      return NextResponse.json(
        { success: false, error: 'Failed to update agent' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedAgent,
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
    
    // Validate ID format
    const idValidation = agentIdSchema.safeParse({ id });
    if (!idValidation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid agent ID format' },
        { status: 400 }
      );
    }

    // Check if agent exists
    const existingAgent = memoryDataStore.getAgentById(id);
    if (!existingAgent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      );
    }

    // Delete agent using memory data store
    const deleted = memoryDataStore.deleteAgent(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete agent' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Agent deleted successfully',
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
