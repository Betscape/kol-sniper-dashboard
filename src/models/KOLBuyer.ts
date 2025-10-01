import mongoose, { Document, Schema } from 'mongoose';

export interface IKOLBuyer extends Document {
  name: string;
  wallet_address: string;
  twitter: string;
  profile_image: string;
  avg_buy_price: number;
  avg_sell_price: number;
  avg_hold_time_seconds: number;
  first_buy_at: Date;
  last_action: 'buy' | 'sell';
  position_status: 'holding' | 'fully_sold';
  realized_pnl_percent: number;
  realized_pnl_sol: number;
  total_buys: number;
  total_sells: number;
  total_volume_sol: number;
  win_rate: number;
  last_updated: Date;
}

const KOLBuyerSchema = new Schema<IKOLBuyer>({
  name: { type: String, required: true },
  wallet_address: { type: String, required: true, unique: true },
  twitter: { type: String, required: true },
  profile_image: { type: String, required: true },
  avg_buy_price: { type: Number, required: true },
  avg_sell_price: { type: Number, required: true },
  avg_hold_time_seconds: { type: Number, required: true },
  first_buy_at: { type: Date, required: true },
  last_action: { type: String, enum: ['buy', 'sell'], required: true },
  position_status: { type: String, enum: ['holding', 'fully_sold'], required: true },
  realized_pnl_percent: { type: Number, required: true },
  realized_pnl_sol: { type: Number, required: true },
  total_buys: { type: Number, required: true },
  total_sells: { type: Number, required: true },
  total_volume_sol: { type: Number, required: true },
  win_rate: { type: Number, required: true },
  last_updated: { type: Date, default: Date.now }
});

export default mongoose.models.KOLBuyer || mongoose.model<IKOLBuyer>('KOLBuyer', KOLBuyerSchema);
