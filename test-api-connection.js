const API_BASE_URL = 'https://pocketbase-production-a9f3.up.railway.app/api/collections/token/records';

async function testAPIConnection() {
  try {
    console.log('🔍 Testing API connection...');
    
    // Test basic connection
    const response = await fetch(`${API_BASE_URL}?page=1&perPage=5`);
    const data = await response.json();
    
    console.log('✅ API Response Status:', response.status);
    console.log('📊 Total Items:', data.totalItems);
    console.log('📄 Items per page:', data.perPage);
    console.log('📄 Total pages:', data.totalPages);
    console.log('🔢 Items returned:', data.items.length);
    
    if (data.items.length > 0) {
      console.log('📝 Sample token:', {
        id: data.items[0].id,
        name: data.items[0].name,
        symbol: data.items[0].symbol,
        kols_count: data.items[0].kols_count
      });
    }
    
    return data;
  } catch (error) {
    console.error('❌ API Connection Error:', error);
    return null;
  }
}

testAPIConnection();

