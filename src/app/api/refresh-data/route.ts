import { NextRequest, NextResponse } from 'next/server';
import pollingService from '@/lib/polling-service';

export async function POST() {
  try {
    console.log('🔄 Starting direct data refresh...');
    
    // Import required modules
    const { APIClient } = await import('@/lib/api-client');
    const { DataProcessor } = await import('@/lib/data-processor');
    const connectDB = (await import('@/lib/mongodb')).default;
    const Token = (await import('@/models/Token')).default;
    const GlobalKOL = (await import('@/models/GlobalKOL')).default;
    
    // Connect to database
    await connectDB();
    console.log('✅ Connected to MongoDB');
    
    // Fetch data from API
    const apiClient = APIClient.getInstance();
    const apiTokens = await apiClient.fetchAllTokens();
    console.log(`📊 Fetched ${apiTokens.length} tokens from API`);
    
    if (apiTokens.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No data fetched from API',
        details: 'API returned empty results'
      });
    }
    
    // Process and store tokens (limit to first 100 for testing)
    const tokensToProcess = apiTokens.slice(0, 100);
    let processedCount = 0;
    let createdCount = 0;
    let updatedCount = 0;
    
    for (const apiToken of tokensToProcess) {
      try {
        // Process token data
        const tokenData = DataProcessor.processTokenData(apiToken);
        
        // Process KOL buyers
        const kolBuyers = apiToken.kol_buyers.map(kol => 
          DataProcessor.processKOLBuyerData(kol)
        );
        
        // Upsert token
        const existingToken = await Token.findById(apiToken.id);
        if (existingToken) {
          await Token.findByIdAndUpdate(apiToken.id, {
            ...tokenData,
            kol_buyers: kolBuyers,
            fetched_at: new Date()
          });
          updatedCount++;
        } else {
          await Token.create({
            ...tokenData,
            kol_buyers: kolBuyers,
            fetched_at: new Date()
          });
          createdCount++;
        }
        
        processedCount++;
        
        if (processedCount % 10 === 0) {
          console.log(`📈 Processed ${processedCount}/${tokensToProcess.length} tokens...`);
        }
      } catch (error) {
        console.error(`Error processing token ${apiToken.id}:`, error);
      }
    }
    
    console.log(`✅ Data processing complete: ${createdCount} created, ${updatedCount} updated`);
    
    return NextResponse.json({
      success: true,
      message: 'Data refreshed successfully',
      stats: {
        totalFetched: apiTokens.length,
        processed: processedCount,
        created: createdCount,
        updated: updatedCount
      },
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
