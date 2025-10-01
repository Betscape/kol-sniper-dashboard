import connectDB from './mongodb';
import Token from '@/models/Token';
import GlobalKOL from '@/models/GlobalKOL';

export interface SimulationConfig {
  kolNames: string[];
  startDate: Date;
  endDate: Date;
  initialCapital: number;
  maxPositionSize: number; // Percentage of capital per trade
  stopLossPercent?: number; // Optional stop loss
  takeProfitPercent?: number; // Optional take profit
  followStrategy: 'immediate' | 'delayed' | 'filtered'; // When to follow KOL buys
  delayMinutes?: number; // For delayed strategy
  minKolsCount?: number; // For filtered strategy (minimum KOLs buying)
}

export interface Trade {
  tokenAddress: string;
  tokenName: string;
  tokenSymbol: string;
  kolName: string;
  buyPrice: number;
  sellPrice: number;
  buyTime: Date;
  sellTime: Date;
  holdTimeHours: number;
  pnlPercent: number;
  pnlSol: number;
  positionSize: number;
  reason: 'kol_sell' | 'stop_loss' | 'take_profit' | 'end_date';
}

export interface SimulationResult {
  config: SimulationConfig;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  totalPnlPercent: number;
  totalPnlSol: number;
  finalCapital: number;
  maxDrawdown: number;
  sharpeRatio: number;
  bestTrade: Trade | null;
  worstTrade: Trade | null;
  trades: Trade[];
  dailyReturns: Array<{ date: string; capital: number; pnl: number }>;
  kolPerformance: Array<{
    kolName: string;
    trades: number;
    winRate: number;
    avgPnl: number;
    totalPnl: number;
  }>;
}

export class CopytradeSimulator {
  async simulate(config: SimulationConfig): Promise<SimulationResult> {
    await connectDB();
    
    console.log(`🎮 Starting copytrade simulation for ${config.kolNames.join(', ')}`);
    
    // Get all tokens with KOL activity in the date range
    const tokens = await Token.find({
      last_kol_buy: { $gte: config.startDate, $lte: config.endDate },
      'kol_buyers.name': { $in: config.kolNames }
    }).sort({ last_kol_buy: 1 });
    
    console.log(`📊 Found ${tokens.length} tokens with KOL activity`);
    
    const trades: Trade[] = [];
    let currentCapital = config.initialCapital;
    const dailyReturns: Array<{ date: string; capital: number; pnl: number }> = [];
    const capitalHistory: number[] = [currentCapital];
    
    // Process each token chronologically
    for (const token of tokens) {
      const tokenTrades = await this.processTokenTrades(token, config, currentCapital);
      trades.push(...tokenTrades);
      
      // Update capital after each trade
      for (const trade of tokenTrades) {
        currentCapital += trade.pnlSol;
        capitalHistory.push(currentCapital);
      }
    }
    
    // Calculate daily returns
    const startDate = new Date(config.startDate);
    const endDate = new Date(config.endDate);
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    for (let i = 0; i <= daysDiff; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const tradesOnDate = trades.filter(trade => 
        trade.buyTime <= date && (trade.sellTime >= date || !trade.sellTime)
      );
      
      const capitalOnDate = config.initialCapital + tradesOnDate.reduce((sum, trade) => sum + trade.pnlSol, 0);
      const pnlOnDate = capitalOnDate - config.initialCapital;
      
      dailyReturns.push({
        date: date.toISOString().split('T')[0],
        capital: capitalOnDate,
        pnl: pnlOnDate
      });
    }
    
    // Calculate performance metrics
    const result = this.calculatePerformanceMetrics(config, trades, currentCapital, capitalHistory, dailyReturns);
    
    console.log(`✅ Simulation complete: ${result.totalTrades} trades, ${result.winRate.toFixed(1)}% win rate, ${result.totalPnlPercent.toFixed(1)}% PNL`);
    
    return result;
  }
  
  private async processTokenTrades(token: { token_address: string; name: string; symbol: string; kols_count: number; kol_buyers: Array<{ name: string; first_buy_at: string; avg_buy_price: number; position_status: string; last_action: string; avg_sell_price: number; avg_hold_time_seconds: number }> }, config: SimulationConfig, currentCapital: number): Promise<Trade[]> {
    const trades: Trade[] = [];
    
    // Get KOL buyers for this token
    const relevantKOLs = token.kol_buyers.filter((kol) => 
      config.kolNames.includes(kol.name)
    );
    
    if (relevantKOLs.length === 0) return trades;
    
    // Apply strategy filters
    if (config.followStrategy === 'filtered' && token.kols_count < (config.minKolsCount || 1)) {
      return trades;
    }
    
    // Sort KOLs by buy time
    relevantKOLs.sort((a, b) => new Date(a.first_buy_at).getTime() - new Date(b.first_buy_at).getTime());
    
    for (const kol of relevantKOLs) {
      const buyTime = new Date(kol.first_buy_at);
      const buyPrice = kol.avg_buy_price;
      
      // Check if buy time is within our date range
      if (buyTime < config.startDate || buyTime > config.endDate) continue;
      
      // Apply delay if configured
      if (config.followStrategy === 'delayed' && config.delayMinutes) {
        buyTime.setMinutes(buyTime.getMinutes() + config.delayMinutes);
      }
      
      // Calculate position size
      const positionSize = Math.min(
        currentCapital * (config.maxPositionSize / 100),
        currentCapital * 0.1 // Max 10% per trade
      );
      
      if (positionSize < 0.001) continue; // Skip if position too small
      
      // Determine sell conditions
      let sellTime: Date | null = null;
      let sellPrice: number = buyPrice;
      let reason: Trade['reason'] = 'end_date';
      
      // Check if KOL sold
      if (kol.position_status === 'fully_sold' && kol.last_action === 'sell') {
        sellTime = new Date(kol.first_buy_at);
        sellTime.setSeconds(sellTime.getSeconds() + (kol.avg_hold_time_seconds || 0));
        sellPrice = kol.avg_sell_price;
        reason = 'kol_sell';
      } else {
        // Check stop loss and take profit
        const currentPrice = buyPrice; // Simplified - in reality you'd get current price
        const pnlPercent = ((currentPrice - buyPrice) / buyPrice) * 100;
        
        if (config.stopLossPercent && pnlPercent <= -config.stopLossPercent) {
          sellTime = new Date(buyTime.getTime() + 24 * 60 * 60 * 1000); // Assume 1 day hold
          sellPrice = buyPrice * (1 - config.stopLossPercent / 100);
          reason = 'stop_loss';
        } else if (config.takeProfitPercent && pnlPercent >= config.takeProfitPercent) {
          sellTime = new Date(buyTime.getTime() + 24 * 60 * 60 * 1000); // Assume 1 day hold
          sellPrice = buyPrice * (1 + config.takeProfitPercent / 100);
          reason = 'take_profit';
        } else {
          // Hold until end date
          sellTime = config.endDate;
          sellPrice = buyPrice; // Simplified - assume no price change
        }
      }
      
      // Calculate trade metrics
      const holdTimeHours = (sellTime.getTime() - buyTime.getTime()) / (1000 * 60 * 60);
      const pnlPercent = ((sellPrice - buyPrice) / buyPrice) * 100;
      const pnlSol = (positionSize * pnlPercent) / 100;
      
      const trade: Trade = {
        tokenAddress: token.token_address,
        tokenName: token.name,
        tokenSymbol: token.symbol,
        kolName: kol.name,
        buyPrice,
        sellPrice,
        buyTime,
        sellTime,
        holdTimeHours,
        pnlPercent,
        pnlSol,
        positionSize,
        reason
      };
      
      trades.push(trade);
    }
    
    return trades;
  }
  
  private calculatePerformanceMetrics(
    config: SimulationConfig,
    trades: Trade[],
    finalCapital: number,
    capitalHistory: number[],
    dailyReturns: Array<{ date: string; capital: number; pnl: number }>
  ): SimulationResult {
    const totalTrades = trades.length;
    const winningTrades = trades.filter(trade => trade.pnlPercent > 0).length;
    const losingTrades = trades.filter(trade => trade.pnlPercent < 0).length;
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
    
    const totalPnlSol = trades.reduce((sum, trade) => sum + trade.pnlSol, 0);
    const totalPnlPercent = ((finalCapital - config.initialCapital) / config.initialCapital) * 100;
    
    // Calculate max drawdown
    let maxDrawdown = 0;
    let peak = config.initialCapital;
    for (const capital of capitalHistory) {
      if (capital > peak) peak = capital;
      const drawdown = (peak - capital) / peak;
      if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    }
    maxDrawdown *= 100;
    
    // Calculate Sharpe ratio (simplified)
    const returns = dailyReturns.map(d => d.pnl / config.initialCapital);
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const returnVariance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    const sharpeRatio = returnVariance > 0 ? avgReturn / Math.sqrt(returnVariance) : 0;
    
    // Find best and worst trades
    const bestTrade = trades.reduce((best, trade) => 
      !best || trade.pnlPercent > best.pnlPercent ? trade : best, null as Trade | null
    );
    const worstTrade = trades.reduce((worst, trade) => 
      !worst || trade.pnlPercent < worst.pnlPercent ? trade : worst, null as Trade | null
    );
    
    // Calculate KOL performance
    const kolPerformance = config.kolNames.map(kolName => {
      const kolTrades = trades.filter(trade => trade.kolName === kolName);
      const kolWinningTrades = kolTrades.filter(trade => trade.pnlPercent > 0).length;
      const kolWinRate = kolTrades.length > 0 ? (kolWinningTrades / kolTrades.length) * 100 : 0;
      const kolAvgPnl = kolTrades.length > 0 ? 
        kolTrades.reduce((sum, trade) => sum + trade.pnlPercent, 0) / kolTrades.length : 0;
      const kolTotalPnl = kolTrades.reduce((sum, trade) => sum + trade.pnlSol, 0);
      
      return {
        kolName,
        trades: kolTrades.length,
        winRate: kolWinRate,
        avgPnl: kolAvgPnl,
        totalPnl: kolTotalPnl
      };
    });
    
    return {
      config,
      totalTrades,
      winningTrades,
      losingTrades,
      winRate,
      totalPnlPercent,
      totalPnlSol,
      finalCapital,
      maxDrawdown,
      sharpeRatio,
      bestTrade,
      worstTrade,
      trades,
      dailyReturns,
      kolPerformance
    };
  }
  
  async getAvailableKOLs(): Promise<Array<{ name: string; momentum_score: number; total_trades: number }>> {
    await connectDB();
    
    return GlobalKOL.find()
      .select('name momentum_score total_trades')
      .sort({ momentum_score: -1 })
      .limit(100)
      .lean();
  }
  
  async getSimulationHistory(): Promise<SimulationResult[]> {
    // This would be implemented with a SimulationHistory model
    // For now, return empty array
    return [];
  }
  
  async saveSimulationResult(userId: string, result: SimulationResult): Promise<void> {
    // This would save the simulation result to the database
    // For now, just log it
    console.log(`💾 Saving simulation result for user ${userId}:`, {
      totalTrades: result.totalTrades,
      winRate: result.winRate,
      totalPnlPercent: result.totalPnlPercent
    });
  }
}

const copytradeSimulator = new CopytradeSimulator();
export default copytradeSimulator;
