import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  name?: string;
  followed_kols: string[]; // Array of GlobalKOL names
  alert_settings: {
    emailAlerts: boolean;
    pushAlerts: boolean;
    kolBuyAlerts: boolean;
    highPnlAlerts: boolean;
    minPnlThreshold: number;
  };
  simulation_history: Array<{
    id: string;
    kol: string;
    startDate: Date;
    endDate: Date;
    hypothetical_pnl: number;
    total_trades: number;
    win_rate: number;
    created_at: Date;
  }>;
  preferences: {
    theme: 'light' | 'dark';
    default_timeframe: '1h' | '4h' | '1d' | '1w';
    auto_refresh: boolean;
    refresh_interval: number; // in seconds
  };
  subscription: {
    plan: 'free' | 'premium';
    expires_at?: Date;
    features: string[];
  };
  created_at: Date;
  last_login: Date;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  name: { type: String },
  followed_kols: [{ type: String }],
  alert_settings: {
    emailAlerts: { type: Boolean, default: false },
    pushAlerts: { type: Boolean, default: true },
    kolBuyAlerts: { type: Boolean, default: true },
    highPnlAlerts: { type: Boolean, default: false },
    minPnlThreshold: { type: Number, default: 100 } // 100% PNL threshold
  },
  simulation_history: [{
    id: { type: String, required: true },
    kol: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    hypothetical_pnl: { type: Number, required: true },
    total_trades: { type: Number, required: true },
    win_rate: { type: Number, required: true },
    created_at: { type: Date, default: Date.now }
  }],
  preferences: {
    theme: { type: String, enum: ['light', 'dark'], default: 'dark' },
    default_timeframe: { type: String, enum: ['1h', '4h', '1d', '1w'], default: '1d' },
    auto_refresh: { type: Boolean, default: true },
    refresh_interval: { type: Number, default: 30 } // 30 seconds
  },
  subscription: {
    plan: { type: String, enum: ['free', 'premium'], default: 'free' },
    expires_at: { type: Date },
    features: [{ type: String }]
  },
  created_at: { type: Date, default: Date.now },
  last_login: { type: Date, default: Date.now }
});

// Index for efficient queries
UserSchema.index({ email: 1 });
UserSchema.index({ followed_kols: 1 });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
