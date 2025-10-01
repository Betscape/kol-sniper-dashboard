// Simple test to trigger polling service
const API_BASE_URL = 'https://pocketbase-production-a9f3.up.railway.app/api/collections/token/records';

async function testPolling() {
  try {
    console.log('🚀 Testing polling service...');
    
    // Test with a small batch first
    const response = await fetch(`${API_BASE_URL}?page=1&perPage=10&sort=-created`);
    const data = await response.json();
    
    console.log('✅ API Response:', {
      status: response.status,
      totalItems: data.totalItems,
      totalPages: data.totalPages,
      itemsReturned: data.items.length
    });
    
    if (data.items.length > 0) {
      const sample = data.items[0];
      console.log('📝 Sample token data:', {
        id: sample.id,
        name: sample.name,
        symbol: sample.symbol,
        kols_count: sample.kols_count,
        kol_buyers: sample.kol_buyers?.length || 0
      });
    }
    
    return data;
  } catch (error) {
    console.error('❌ Polling test error:', error);
    return null;
  }
}

testPolling();

