import mongoose, { Document, Schema } from 'mongoose';

export interface IToken extends Document {
  _id: string;
  name: string;
  symbol: string;
  decimals: number;
  image_url: string;
  uri: string;
  supply: number;
  on_chain: {
    mint: string;
    name: string;
    symbol: string;
    updateAuthority: string;
    uri: string;
  };
  off_chain: {
    attributes: unknown[];
    description: string;
    image: string;
    name: string;
    symbol: string;
  };
  kols_count: number;
  first_kol_buy: Date;
  last_kol_buy: Date;
  token_address: string;
  created: Date;
  updated: Date;
  fetched_at: Date;
  kol_buyers: Array<{
    name: string;
    wallet_address: string;
    twitter: string;
    profile_image: string;
    avg_buy_price: number;
    avg_sell_price: number;
    avg_hold_time_seconds: number;
    first_buy_at: Date;
    last_action: 'buy' | 'sell';
    position_status: 'holding' | 'fully_sold' | 'partial_sold';
    realized_pnl_percent: number;
    realized_pnl_sol: number;
    total_buys: number;
    total_sells: number;
    total_volume_sol: number;
    win_rate: number;
    last_updated: Date;
  }>;
  // Computed fields
  total_volume: number;
  avg_kol_pnl: number;
  momentum_score: number;
}

const TokenSchema = new Schema<IToken>({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  symbol: { type: String, required: true },
  decimals: { type: Number, required: true },
  image_url: { type: String, required: true },
  uri: { type: String, required: true },
  supply: { type: Number, required: true },
  on_chain: {
    mint: { type: String, required: true },
    name: { type: String, required: true },
    symbol: { type: String, required: true },
    updateAuthority: { type: String, required: true },
    uri: { type: String, required: true }
  },
  off_chain: {
    attributes: { type: Schema.Types.Mixed, default: [] },
    description: { type: String, required: true },
    image: { type: String, required: true },
    name: { type: String, required: true },
    symbol: { type: String, required: true }
  },
  kols_count: { type: Number, required: true },
  first_kol_buy: { type: Date, required: true },
  last_kol_buy: { type: Date, required: true },
  token_address: { type: String, required: true, unique: true },
  created: { type: Date, required: true },
  updated: { type: Date, required: true },
  fetched_at: { type: Date, default: Date.now },
  kol_buyers: [{
    name: { type: String, required: true },
    wallet_address: { type: String, required: true },
    twitter: { type: String, required: true },
    profile_image: { type: String, required: true },
    avg_buy_price: { type: Number, required: true },
    avg_sell_price: { type: Number, required: true },
    avg_hold_time_seconds: { type: Number, required: true },
    first_buy_at: { type: Date, required: true },
    last_action: { type: String, enum: ['buy', 'sell'], required: true },
    position_status: { type: String, enum: ['holding', 'fully_sold', 'partial_sold'], required: true },
    realized_pnl_percent: { type: Number, required: true },
    realized_pnl_sol: { type: Number, required: true },
    total_buys: { type: Number, required: true },
    total_sells: { type: Number, required: true },
    total_volume_sol: { type: Number, required: true },
    win_rate: { type: Number, required: true },
    last_updated: { type: Date, default: Date.now }
  }],
  // Computed fields
  total_volume: { type: Number, default: 0 },
  avg_kol_pnl: { type: Number, default: 0 },
  momentum_score: { type: Number, default: 0 }
});

// Index for efficient queries
TokenSchema.index({ last_kol_buy: -1 });
TokenSchema.index({ kols_count: -1 });
TokenSchema.index({ momentum_score: -1 });
TokenSchema.index({ token_address: 1 });

export default mongoose.models.Token || mongoose.model<IToken>('Token', TokenSchema);
