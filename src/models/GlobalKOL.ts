import mongoose, { Document, Schema } from 'mongoose';

export interface IGlobalKOL extends Document {
  name: string;
  wallet_address: string;
  twitter: string;
  profile_image: string;
  total_tokens_traded: number;
  avg_pnl_percent: number;
  win_rate: number;
  total_realized_pnl_sol: number;
  momentum_score: number;
  last_active: Date;
  tokens: string[]; // Array of Token _ids
  // Additional computed fields
  total_volume_sol: number;
  avg_hold_time_hours: number;
  best_trade_pnl: number;
  worst_trade_pnl: number;
  current_positions: number;
  total_trades: number;
}

const GlobalKOLSchema = new Schema<IGlobalKOL>({
  name: { type: String, required: true, unique: true },
  wallet_address: { type: String, required: true, unique: true },
  twitter: { type: String, required: true },
  profile_image: { type: String, required: true },
  total_tokens_traded: { type: Number, required: true, default: 0 },
  avg_pnl_percent: { type: Number, required: true, default: 0 },
  win_rate: { type: Number, required: true, default: 0 },
  total_realized_pnl_sol: { type: Number, required: true, default: 0 },
  momentum_score: { type: Number, required: true, default: 0 },
  last_active: { type: Date, required: true, default: Date.now },
  tokens: [{ type: String, ref: 'Token' }],
  // Additional computed fields
  total_volume_sol: { type: Number, default: 0 },
  avg_hold_time_hours: { type: Number, default: 0 },
  best_trade_pnl: { type: Number, default: 0 },
  worst_trade_pnl: { type: Number, default: 0 },
  current_positions: { type: Number, default: 0 },
  total_trades: { type: Number, default: 0 }
});

// Index for efficient queries
GlobalKOLSchema.index({ momentum_score: -1 });
GlobalKOLSchema.index({ win_rate: -1 });
GlobalKOLSchema.index({ total_realized_pnl_sol: -1 });
GlobalKOLSchema.index({ last_active: -1 });

export default mongoose.models.GlobalKOL || mongoose.model<IGlobalKOL>('GlobalKOL', GlobalKOLSchema);
