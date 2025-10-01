import { NextResponse } from 'next/server';

export async function POST() {
  try {
    console.log('🚀 Starting data population...');
    
    // Test API connection first
    const testResponse = await fetch('https://pocketbase-production-a9f3.up.railway.app/api/collections/token/records?page=1&perPage=5');
    const testData = await testResponse.json();
    
    console.log('✅ API Test:', {
      status: testResponse.status,
      totalItems: testData.totalItems,
      itemsReturned: testData.items.length
    });
    
    if (testData.items.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'API returned no data',
        details: 'External API is not responding with data'
      });
    }
    
    // Import modules dynamically
    const connectDB = (await import('@/lib/mongodb')).default;
    const Token = (await import('@/models/Token')).default;
    
    // Connect to database
    await connectDB();
    console.log('✅ Connected to MongoDB');
    
    // Process and store the test data
    const apiToken = testData.items[0];
    console.log('📝 Processing token:', apiToken.id, apiToken.name, apiToken.symbol);
    
    const tokenData = {
      _id: apiToken.id,
      name: apiToken.name,
      symbol: apiToken.symbol,
      decimals: apiToken.decimals,
      image_url: apiToken.image_url,
      uri: apiToken.uri,
      supply: apiToken.supply,
      on_chain: apiToken.on_chain,
      off_chain: apiToken.off_chain,
      kols_count: apiToken.kols_count,
      first_kol_buy: new Date(apiToken.first_kol_buy),
      last_kol_buy: new Date(apiToken.last_kol_buy),
      token_address: apiToken.token_address,
      created: new Date(apiToken.created),
      updated: new Date(apiToken.updated),
      fetched_at: new Date(apiToken.fetched_at),
      kol_buyers: apiToken.kol_buyers || []
    };
    
    // Upsert token
    const existingToken = await Token.findById(apiToken.id);
    if (existingToken) {
      await Token.findByIdAndUpdate(apiToken.id, tokenData);
      console.log('✅ Updated existing token');
    } else {
      await Token.create(tokenData);
      console.log('✅ Created new token');
    }
    
    // Check database count
    const tokenCount = await Token.countDocuments();
    console.log(`📊 Total tokens in database: ${tokenCount}`);
    
    return NextResponse.json({
      success: true,
      message: 'Data populated successfully',
      data: {
        apiTotalItems: testData.totalItems,
        processedToken: {
          id: apiToken.id,
          name: apiToken.name,
          symbol: apiToken.symbol,
          kols_count: apiToken.kols_count
        },
        databaseTokenCount: tokenCount
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Data population error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to populate data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
