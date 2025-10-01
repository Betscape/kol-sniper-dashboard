import { APIClient } from './api-client';
import { DataProcessor } from './data-processor';
import connectDB from './mongodb';
import Token from '@/models/Token';
import GlobalKOL from '@/models/GlobalKOL';
import { IGlobalKOL } from '@/models/GlobalKOL';

export class PollingService {
  private apiClient: APIClient;
  private isRunning: boolean = false;
  private lastPollTime: Date | null = null;
  private pollInterval: number = 5 * 60 * 1000; // 5 minutes in milliseconds

  constructor() {
    this.apiClient = APIClient.getInstance();
  }

  async startPolling(): Promise<void> {
    if (this.isRunning) {
      console.log('⚠️ Polling service is already running');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Starting KOL Sniper Dashboard polling service...');
    
    // Initial poll
    await this.poll();
    
    // Set up interval
    setInterval(async () => {
      if (this.isRunning) {
        await this.poll();
      }
    }, this.pollInterval);
  }

  stopPolling(): void {
    this.isRunning = false;
    console.log('⏹️ Polling service stopped');
  }

  async poll(): Promise<void> {
    try {
      console.log('📡 Starting API poll...');
      this.lastPollTime = new Date();
      
      // Connect to database
      await connectDB();
      
      // Fetch all tokens from API
      const apiTokens = await this.apiClient.fetchAllTokens();
      console.log(`📊 Fetched ${apiTokens.length} tokens from API`);
      
      // Process and store tokens
      let processedCount = 0;
      let updatedCount = 0;
      let createdCount = 0;
      
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
          
          if (processedCount % 1000 === 0) {
            console.log(`📈 Processed ${processedCount}/${apiTokens.length} tokens...`);
          }
        } catch (error) {
          console.error(`Error processing token ${apiToken.id}:`, error);
        }
      }
      
      console.log(`✅ Token processing complete: ${createdCount} created, ${updatedCount} updated`);
      
      // Update global KOL statistics
      await this.updateGlobalKOLStats();
      
      console.log('🎉 Polling cycle completed successfully');
      
    } catch (error) {
      console.error('❌ Error during polling:', error);
    }
  }

  private async updateGlobalKOLStats(): Promise<void> {
    try {
      console.log('🔄 Updating global KOL statistics...');
      
      // Get all tokens with KOL buyers
      const tokens = await Token.find({ 'kol_buyers.0': { $exists: true } });
      
      // Aggregate KOL data across all tokens
      const kolMap = new Map<string, {
        name: string;
        wallet_address: string;
        twitter: string;
        profile_image: string;
        total_tokens_traded: number;
        total_volume_sol: number;
        total_realized_pnl_sol: number;
        total_trades: number;
        pnl_values: number[];
        hold_times: number[];
        last_active: Date;
      }>();
      
      for (const token of tokens) {
        for (const kol of token.kol_buyers as any[]) {
          const walletAddress = kol.wallet_address;
          
          if (!kolMap.has(walletAddress)) {
            kolMap.set(walletAddress, {
              name: kol.name,
              wallet_address: walletAddress,
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
      
      // Calculate aggregated stats and upsert to GlobalKOL collection
      for (const [walletAddress, kolData] of kolMap) {
        const avgPnl = kolData.pnl_values.length > 0 
          ? kolData.pnl_values.reduce((a: number, b: number) => a + b, 0) / kolData.pnl_values.length 
          : 0;
        const winRate = kolData.pnl_values.length > 0 
          ? (kolData.pnl_values.filter((pnl: number) => pnl > 0).length / kolData.pnl_values.length) * 100 
          : 0;
        const avgHoldTime = kolData.hold_times.length > 0 
          ? kolData.hold_times.reduce((a: number, b: number) => a + b, 0) / kolData.hold_times.length / 3600 
          : 0;

        const globalKOLData: Partial<IGlobalKOL> = {
          name: kolData.name,
          wallet_address: walletAddress,
          twitter: kolData.twitter,
          profile_image: kolData.profile_image,
          total_tokens_traded: kolData.total_tokens_traded,
          avg_pnl_percent: avgPnl,
          win_rate: winRate,
          total_realized_pnl_sol: kolData.total_realized_pnl_sol,
          momentum_score: DataProcessor.calculateGlobalKOLMomentumScore({ 
            win_rate: winRate, 
            avg_pnl_percent: avgPnl, 
            avg_hold_time_hours: avgHoldTime 
          }),
          last_active: kolData.last_active,
          total_volume_sol: kolData.total_volume_sol,
          avg_hold_time_hours: avgHoldTime,
          best_trade_pnl: Math.max(...kolData.pnl_values, 0),
          worst_trade_pnl: Math.min(...kolData.pnl_values, 0),
          current_positions: 0, // This would need to be calculated based on current holdings
          total_trades: kolData.total_trades,
          last_updated: new Date()
        };

        await GlobalKOL.findOneAndUpdate(
          { wallet_address: walletAddress },
          globalKOLData,
          { upsert: true, new: true }
        );
      }
      
      console.log(`✅ Updated ${kolMap.size} global KOL records`);
      
    } catch (error) {
      console.error('❌ Error updating global KOL stats:', error);
    }
  }

  getStatus(): {
    isRunning: boolean;
    lastPollTime: Date | null;
    pollInterval: number;
    apiStats: any;
  } {
    return {
      isRunning: this.isRunning,
      lastPollTime: this.lastPollTime,
      pollInterval: this.pollInterval,
      apiStats: this.apiClient.getPollingStats()
    };
  }

  async getTopKOLs(limit: number = 50): Promise<IGlobalKOL[]> {
    await connectDB();
    return GlobalKOL.find()
      .sort({ momentum_score: -1 })
      .limit(limit)
      .lean();
  }

  async getLatestTokens(limit: number = 50): Promise<unknown[]> {
    await connectDB();
    return Token.find()
      .sort({ last_kol_buy: -1 })
      .limit(limit)
      .lean();
  }

  async getTokensByKOL(kolName: string, limit: number = 50): Promise<unknown[]> {
    await connectDB();
    return Token.find({
      'kol_buyers.name': { $regex: kolName, $options: 'i' }
    })
      .sort({ last_kol_buy: -1 })
      .limit(limit)
      .lean();
  }
}

const pollingService = new PollingService();
export default pollingService;
