import { APIToken } from './api-client';
import { IToken } from '@/models/Token';
import { IGlobalKOL } from '@/models/GlobalKOL';
import { IKOLBuyer } from '@/models/KOLBuyer';

export class DataProcessor {
  static processTokenData(apiToken: APIToken): Partial<IToken> {
    return {
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
      total_volume: this.calculateTotalVolume(apiToken.kol_buyers),
      avg_kol_pnl: this.calculateAverageKOLPNL(apiToken.kol_buyers),
      momentum_score: this.calculateTokenMomentumScore(apiToken)
    };
  }

  static processKOLBuyerData(kolBuyer: Record<string, unknown>): Partial<IKOLBuyer> {
    return {
      name: kolBuyer.name as string,
      wallet_address: kolBuyer.wallet_address as string,
      twitter: kolBuyer.twitter as string,
      profile_image: kolBuyer.profile_image as string,
      avg_buy_price: kolBuyer.avg_buy_price as number,
      avg_sell_price: kolBuyer.avg_sell_price as number,
      avg_hold_time_seconds: kolBuyer.avg_hold_time_seconds as number,
      first_buy_at: new Date(kolBuyer.first_buy_at as string),
      last_action: kolBuyer.last_action as 'buy' | 'sell',
      position_status: kolBuyer.position_status as 'holding' | 'fully_sold',
      realized_pnl_percent: kolBuyer.realized_pnl_percent as number,
      realized_pnl_sol: kolBuyer.realized_pnl_sol as number,
      total_buys: kolBuyer.total_buys as number,
      total_sells: kolBuyer.total_sells as number,
      total_volume_sol: kolBuyer.total_volume_sol as number,
      win_rate: this.calculateWinRate(kolBuyer),
      last_updated: new Date()
    };
  }

  static calculateTotalVolume(kolBuyers: Array<{ total_volume_sol?: number }>): number {
    return kolBuyers.reduce((total, kol) => total + (kol.total_volume_sol || 0), 0);
  }

  static calculateAverageKOLPNL(kolBuyers: Array<{ realized_pnl_percent?: number }>): number {
    if (kolBuyers.length === 0) return 0;
    const totalPnl = kolBuyers.reduce((total, kol) => total + (kol.realized_pnl_percent || 0), 0);
    return totalPnl / kolBuyers.length;
  }

  static calculateTokenMomentumScore(apiToken: APIToken): number {
    const kolsCount = apiToken.kols_count;
    const avgPnl = this.calculateAverageKOLPNL(apiToken.kol_buyers);
    const totalVolume = this.calculateTotalVolume(apiToken.kol_buyers);
    const timeSinceLastBuy = Date.now() - new Date(apiToken.last_kol_buy).getTime();
    const hoursSinceLastBuy = timeSinceLastBuy / (1000 * 60 * 60);

    // Momentum score formula: (KOLs count * 0.3) + (avg PNL * 0.3) + (volume factor * 0.2) + (recency factor * 0.2)
    const kolFactor = Math.min(kolsCount / 10, 1) * 30; // Max 30 points for KOL count
    const pnlFactor = Math.max(0, Math.min(avgPnl / 1000, 1)) * 30; // Max 30 points for PNL
    const volumeFactor = Math.min(totalVolume / 100, 1) * 20; // Max 20 points for volume
    const recencyFactor = Math.max(0, 1 - (hoursSinceLastBuy / 24)) * 20; // Max 20 points for recency

    return Math.round(kolFactor + pnlFactor + volumeFactor + recencyFactor);
  }

  static calculateWinRate(kolBuyer: { total_sells?: number; realized_pnl_percent?: number }): number {
    if (!kolBuyer.total_sells || kolBuyer.total_sells === 0) return 0;
    const profitableSells = kolBuyer.total_sells * ((kolBuyer.realized_pnl_percent || 0) > 0 ? 1 : 0);
    return (profitableSells / kolBuyer.total_sells) * 100;
  }

  static calculateGlobalKOLMomentumScore(kolData: { win_rate?: number; avg_pnl_percent?: number; avg_hold_time_hours?: number }): number {
    const winRate = kolData.win_rate || 0;
    const avgPnl = kolData.avg_pnl_percent || 0;
    const holdTime = kolData.avg_hold_time_hours || 1;
    
    // Momentum score formula: (win_rate * 0.4) + (avg_pnl * 0.3) + (1 / avg_hold_time * 0.3)
    const winRateFactor = (winRate / 100) * 40;
    const pnlFactor = Math.max(0, Math.min(avgPnl / 1000, 1)) * 30;
    const holdTimeFactor = Math.min(1 / holdTime, 1) * 30;
    
    return Math.round(winRateFactor + pnlFactor + holdTimeFactor);
  }

  static aggregateKOLData(kolBuyers: Array<Record<string, unknown>>): Partial<IGlobalKOL>[] {
    const uniqueKOLs = new Map();
    
    kolBuyers.forEach(kol => {
      if (!uniqueKOLs.has(kol.wallet_address)) {
        uniqueKOLs.set(kol.wallet_address, {
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
          last_active: new Date(kol.first_buy_at as string)
        });
      }
      
      const kolData = uniqueKOLs.get(kol.wallet_address);
      kolData.total_tokens_traded += 1;
      kolData.total_volume_sol += (kol.total_volume_sol as number) || 0;
      kolData.total_realized_pnl_sol += (kol.realized_pnl_sol as number) || 0;
      kolData.total_trades += ((kol.total_buys as number) || 0) + ((kol.total_sells as number) || 0);
      kolData.pnl_values.push((kol.realized_pnl_percent as number) || 0);
      kolData.hold_times.push((kol.avg_hold_time_seconds as number) || 0);
      
      if (new Date(kol.first_buy_at as string) > kolData.last_active) {
        kolData.last_active = new Date(kol.first_buy_at as string);
      }
    });

    const aggregatedKOLs = Array.from(uniqueKOLs.values()).map(kol => {
      const avgPnl = kol.pnl_values.length > 0 
        ? kol.pnl_values.reduce((a: number, b: number) => a + b, 0) / kol.pnl_values.length 
        : 0;
      const winRate = kol.pnl_values.length > 0 
        ? (kol.pnl_values.filter((pnl: number) => pnl > 0).length / kol.pnl_values.length) * 100 
        : 0;
      const avgHoldTime = kol.hold_times.length > 0 
        ? kol.hold_times.reduce((a: number, b: number) => a + b, 0) / kol.hold_times.length / 3600 
        : 0;

      return {
        name: kol.name,
        wallet_address: kol.wallet_address,
        twitter: kol.twitter,
        profile_image: kol.profile_image,
        total_tokens_traded: kol.total_tokens_traded,
        avg_pnl_percent: avgPnl,
        win_rate: winRate,
        total_realized_pnl_sol: kol.total_realized_pnl_sol,
        momentum_score: this.calculateGlobalKOLMomentumScore({ win_rate: winRate, avg_pnl_percent: avgPnl, avg_hold_time_hours: avgHoldTime }),
        last_active: kol.last_active,
        total_volume_sol: kol.total_volume_sol,
        avg_hold_time_hours: avgHoldTime,
        best_trade_pnl: Math.max(...kol.pnl_values, 0),
        worst_trade_pnl: Math.min(...kol.pnl_values, 0),
        current_positions: 0, // This would need to be calculated based on current holdings
        total_trades: kol.total_trades
      };
    });

    return aggregatedKOLs;
  }
}
