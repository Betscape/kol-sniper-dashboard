import mongoose, { Document, Schema } from 'mongoose';
import { IKOLBuyer } from './KOLBuyer';

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
  kol_buyers: IKOLBuyer[];
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
  kol_buyers: [{ type: Schema.Types.ObjectId, ref: 'KOLBuyer' }],
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
