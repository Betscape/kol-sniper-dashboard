import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Token from '@/models/Token';
import GlobalKOL from '@/models/GlobalKOL';
import { APIClient } from '@/lib/api-client';
import { DataProcessor } from '@/lib/data-processor';

export async function POST() {
  try {
    console.log('🚀 Starting direct data fetch...');
    
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
    
    // Process and store tokens
    let processedCount = 0;
    let createdCount = 0;
    let updatedCount = 0;
    
    for (const apiToken of apiTokens) {
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
        
        if (processedCount % 100 === 0) {
          console.log(`📈 Processed ${processedCount}/${apiTokens.length} tokens...`);
        }
      } catch (error) {
        console.error(`Error processing token ${apiToken.id}:`, error);
      }
    }
    
    console.log(`✅ Data processing complete: ${createdCount} created, ${updatedCount} updated`);
    
    // Update global KOL stats
    console.log('🔄 Updating global KOL statistics...');
    await updateGlobalKOLStats();
    
    return NextResponse.json({
      success: true,
      message: 'Data fetched and stored successfully',
      stats: {
        totalFetched: apiTokens.length,
        processed: processedCount,
        created: createdCount,
        updated: updatedCount
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error fetching data:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function updateGlobalKOLStats() {
  try {
    // Get all tokens with KOL buyers
    const tokens = await Token.find({ 'kol_buyers.0': { $exists: true } });
    console.log(`📊 Found ${tokens.length} tokens with KOL data`);
    
    // Aggregate KOL data across all tokens
    const kolMap = new Map();
    
    for (const token of tokens) {
      for (const kol of token.kol_buyers) {
        const walletAddress = kol.wallet_address;
        
        if (!kolMap.has(walletAddress)) {
          kolMap.set(walletAddress, {
            name: kol.name,
            wallet_address: kol.wallet_address,
            twitter: kol.twitter,
            profile_image: kol.profile_image,
            total_tokens_traded: 0,
            total_volume_sol: 0,
            total_realized_pnl_sol: 0,
            total_trades: 0,
            pnl_values: [],
            hold_times: [],
            last_active: new Date(kol.first_buy_at)
          });
        }
        
        const kolData = kolMap.get(walletAddress);
        kolData.total_tokens_traded += 1;
        kolData.total_volume_sol += kol.total_volume_sol || 0;
        kolData.total_realized_pnl_sol += kol.realized_pnl_sol || 0;
        kolData.total_trades += (kol.total_buys || 0) + (kol.total_sells || 0);
        kolData.pnl_values.push(kol.realized_pnl_percent || 0);
        kolData.hold_times.push(kol.avg_hold_time_seconds || 0);
        
        if (new Date(kol.first_buy_at) > kolData.last_active) {
          kolData.last_active = new Date(kol.first_buy_at);
        }
      }
    }
    
    let processedKOLs = 0;
    for (const [walletAddress, kolAggData] of kolMap.entries()) {
      const avgPnl = kolAggData.pnl_values.length > 0
        ? kolAggData.pnl_values.reduce((a, b) => a + b, 0) / kolAggData.pnl_values.length
        : 0;
      const winRate = kolAggData.pnl_values.length > 0
        ? (kolAggData.pnl_values.filter(pnl => pnl > 0).length / kolAggData.pnl_values.length) * 100
        : 0;
      const avgHoldTimeHours = kolAggData.hold_times.length > 0
        ? kolAggData.hold_times.reduce((a, b) => a + b, 0) / kolAggData.hold_times.length / 3600
        : 0;
      
      const globalKOLData = {
        name: kolAggData.name,
        wallet_address: kolAggData.wallet_address,
        twitter: kolAggData.twitter,
        profile_image: kolAggData.profile_image,
        total_tokens_traded: kolAggData.total_tokens_traded,
        avg_pnl_percent: avgPnl,
        win_rate: winRate,
        total_realized_pnl_sol: kolAggData.total_realized_pnl_sol,
        momentum_score: DataProcessor.calculateGlobalKOLMomentumScore({
          win_rate: winRate,
          avg_pnl_percent: avgPnl,
          avg_hold_time_hours: avgHoldTimeHours
        }),
        last_active: kolAggData.last_active,
        total_volume_sol: kolAggData.total_volume_sol,
        avg_hold_time_hours: avgHoldTimeHours,
        best_trade_pnl: Math.max(...kolAggData.pnl_values, 0),
        worst_trade_pnl: Math.min(...kolAggData.pnl_values, 0),
        current_positions: 0,
        total_trades: kolAggData.total_trades
      };
      
      await GlobalKOL.findOneAndUpdate(
        { wallet_address: globalKOLData.wallet_address },
        globalKOLData,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      processedKOLs++;
    }
    
    console.log(`✅ Successfully updated ${processedKOLs} global KOLs`);
  } catch (error) {
    console.error('❌ Error updating global KOL stats:', error);
  }
}
