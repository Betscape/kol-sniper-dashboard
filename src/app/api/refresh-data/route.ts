import { NextRequest, NextResponse } from 'next/server';
import pollingService from '@/lib/polling-service';

export async function POST() {
  try {
    console.log('🔄 Starting data refresh...');
    
    // Start the polling service
    await pollingService.poll();
    
    const status = pollingService.getStatus();
    
    return NextResponse.json({
      success: true,
      message: 'Data refreshed successfully',
      stats: status.apiStats,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error refreshing data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to refresh data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    if (action === 'start') {
      await pollingService.startPolling();
      return NextResponse.json({
        success: true,
        message: 'Polling service started',
        status: pollingService.getStatus()
      });
    } else if (action === 'stop') {
      pollingService.stopPolling();
      return NextResponse.json({
        success: true,
        message: 'Polling service stopped',
        status: pollingService.getStatus()
      });
    } else if (action === 'status') {
      return NextResponse.json({
        success: true,
        status: pollingService.getStatus()
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'KOL Sniper Dashboard API',
      endpoints: {
        'POST /api/refresh-data': 'Trigger data refresh',
        'GET /api/refresh-data?action=start': 'Start polling service',
        'GET /api/refresh-data?action=stop': 'Stop polling service',
        'GET /api/refresh-data?action=status': 'Get polling status'
      }
    });
    
  } catch (error) {
    console.error('❌ Error handling request:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to handle request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
