import { NextRequest, NextResponse } from 'next/server';
import { memoryDataStore } from '@/lib/memory-data-store';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'stats':
        // Get data store statistics
        const stats = memoryDataStore.getStats();
        return NextResponse.json({
          success: true,
          data: {
            message: 'Memory Data Store Statistics',
            stats,
            timestamp: new Date().toISOString(),
          },
        });

      case 'reset':
        // Reset data store to initial state
        memoryDataStore.reset();
        return NextResponse.json({
          success: true,
          data: {
            message: 'Data store reset to initial state',
            timestamp: new Date().toISOString(),
          },
        });

      case 'agents':
        // Get all agents
        const agents = memoryDataStore.getAgents();
        return NextResponse.json({
          success: true,
          data: {
            message: 'All agents from memory data store',
            count: agents.length,
            agents: agents.slice(0, 3), // Show first 3 for brevity
            timestamp: new Date().toISOString(),
          },
        });

      case 'activities':
        // Get all activities
        const activities = memoryDataStore.getActivities();
        return NextResponse.json({
          success: true,
          data: {
            message: 'All activities from memory data store',
            count: activities.length,
            activities: activities.slice(0, 3), // Show first 3 for brevity
            timestamp: new Date().toISOString(),
          },
        });

      case 'bookings':
        // Get all bookings
        const bookings = memoryDataStore.getBookings();
        return NextResponse.json({
          success: true,
          data: {
            message: 'All bookings from memory data store',
            count: bookings.length,
            bookings: bookings.slice(0, 3), // Show first 3 for brevity
            timestamp: new Date().toISOString(),
          },
        });

      case 'agencies':
        // Get all agencies
        const agencies = memoryDataStore.getAgencies();
        return NextResponse.json({
          success: true,
          data: {
            message: 'All agencies from memory data store',
            count: agencies.length,
            agencies: agencies.slice(0, 3), // Show first 3 for brevity
            timestamp: new Date().toISOString(),
          },
        });

      default:
        return NextResponse.json({
          success: true,
          data: {
            message: 'Memory Data Store Test Endpoint',
            available_actions: [
              'stats - Get data store statistics',
              'reset - Reset data store to initial state',
              'agents - Get all agents',
              'activities - Get all activities',
              'bookings - Get all bookings',
              'agencies - Get all agencies',
            ],
            usage: 'Add ?action=<action_name> to the URL',
            example: '/api/test?action=stats',
            timestamp: new Date().toISOString(),
          },
        });
    }
  } catch (error) {
    console.error('Test API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST() {
  return NextResponse.json({
    success: true,
    message: 'Test POST API is working!',
    timestamp: new Date().toISOString(),
  });
}
