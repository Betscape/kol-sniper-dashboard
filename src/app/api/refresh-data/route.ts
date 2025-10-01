import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import APIClient from '@/lib/api-client';
import { DataProcessor } from '@/lib/data-processor';
import Token from '@/models/Token';
import GlobalKOL from '@/models/GlobalKOL';
import KOLBuyer from '@/models/KOLBuyer';

export async function POST() {
  try {
    await connectDB();
    
    console.log('Starting data refresh...');
    
    // Fetch all tokens from API
    const apiClient = APIClient;
    const apiTokens = await apiClient.fetchAllTokens();
    
    console.log(`Fetched ${apiTokens.length} tokens from API`);
    
    let processedTokens = 0;
    let processedKOLs = 0;
    
    // Process each token
    for (const apiToken of apiTokens) {
      try {
        // Process token data
        const tokenData = DataProcessor.processTokenData(apiToken);
        
        // Process KOL buyers
        const kolBuyers = [];
        for (const kolBuyer of apiToken.kol_buyers) {
          const kolData = DataProcessor.processKOLBuyerData(kolBuyer);
          const kolBuyerDoc = new KOLBuyer(kolData);
          await kolBuyerDoc.save();
          kolBuyers.push(kolBuyerDoc._id);
        }
        
        // Update token with KOL buyer references
        tokenData.kol_buyers = kolBuyers;
        
        // Upsert token
        await Token.findOneAndUpdate(
          { _id: apiToken.id },
          tokenData,
          { upsert: true, new: true }
        );
        
        processedTokens++;
        
        if (processedTokens % 100 === 0) {
          console.log(`Processed ${processedTokens} tokens...`);
        }
      } catch (error) {
        console.error(`Error processing token ${apiToken.id}:`, error);
        continue;
      }
    }
    
    // Aggregate global KOL data
    console.log('Aggregating global KOL data...');
    const allTokens = await Token.find().populate('kol_buyers');
    const allKOLBuyers = allTokens.flatMap(token => token.kol_buyers);
    
    const aggregatedKOLs = DataProcessor.aggregateKOLData(allKOLBuyers);
    
    // Update global KOLs
    for (const kolData of aggregatedKOLs) {
      await GlobalKOL.findOneAndUpdate(
        { wallet_address: kolData.wallet_address },
        kolData,
        { upsert: true, new: true }
      );
      processedKOLs++;
    }
    
    console.log(`Data refresh completed. Processed ${processedTokens} tokens and ${processedKOLs} KOLs`);
    
    return NextResponse.json({
      success: true,
      message: 'Data refresh completed successfully',
      stats: {
        tokensProcessed: processedTokens,
        kolsProcessed: processedKOLs,
        totalTokens: apiTokens.length
      }
    });
    
  } catch (error) {
    console.error('Error refreshing data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to refresh data' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Use POST to trigger data refresh' });
}
