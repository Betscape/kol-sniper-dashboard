import { NextResponse } from 'next/server';
import { APIClient } from '@/lib/api-client';

export async function GET() {
  try {
    console.log('🧪 Testing polling service directly...');
    
    const apiClient = APIClient.getInstance();
    
    // Test fetching just one page
    const response = await apiClient.fetchTokens(1, 10);
    
    console.log('✅ API Response:', {
      totalItems: response.totalItems,
      totalPages: response.totalPages,
      itemsReturned: response.items.length
    });
    
    if (response.items.length > 0) {
      const sample = response.items[0];
      console.log('📝 Sample token:', {
        id: sample.id,
        name: sample.name,
        symbol: sample.symbol,
        kols_count: sample.kols_count
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Polling test successful',
      data: {
        totalItems: response.totalItems,
        totalPages: response.totalPages,
        itemsReturned: response.items.length,
        sampleToken: response.items[0] || null
      }
    });
    
  } catch (error) {
    console.error('❌ Polling test error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Polling test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
