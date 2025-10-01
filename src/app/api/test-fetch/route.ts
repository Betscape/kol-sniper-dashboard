import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Token from '@/models/Token';

export async function GET() {
  try {
    console.log('🧪 Testing data fetch with small sample...');
    
    // Connect to database
    await connectDB();
    console.log('✅ Connected to MongoDB');
    
    // Fetch a small sample from API
    const response = await fetch('https://pocketbase-production-a9f3.up.railway.app/api/collections/token/records?page=1&perPage=5');
    const data = await response.json();
    
    console.log('📊 API Response:', {
      totalItems: data.totalItems,
      itemsReturned: data.items.length
    });
    
    if (data.items.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No data from API'
      });
    }
    
    // Process and store just one token as a test
    const apiToken = data.items[0];
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
    
    // Check how many tokens we have in the database
    const tokenCount = await Token.countDocuments();
    console.log(`📊 Total tokens in database: ${tokenCount}`);
    
    return NextResponse.json({
      success: true,
      message: 'Test fetch successful',
      data: {
        apiTotalItems: data.totalItems,
        processedToken: {
          id: apiToken.id,
          name: apiToken.name,
          symbol: apiToken.symbol,
          kols_count: apiToken.kols_count
        },
        databaseTokenCount: tokenCount
      }
    });
    
  } catch (error) {
    console.error('❌ Test fetch error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Test fetch failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

