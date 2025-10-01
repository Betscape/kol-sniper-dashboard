import connectDB from './mongodb';
import Token from '@/models/Token';
import User from '@/models/User';

export interface AlertConfig {
  userId: string;
  kolNames: string[];
  minKolsCount?: number;
  minPnlPercent?: number;
  positionStatus?: 'holding' | 'fully_sold';
  alertTypes: ('email' | 'push' | 'browser')[];
  isActive: boolean;
}

export interface Alert {
  id: string;
  userId: string;
  type: 'kol_buy' | 'kol_sell' | 'high_pnl' | 'new_token';
  title: string;
  message: string;
  tokenAddress: string;
  tokenName: string;
  kolName: string;
  pnlPercent?: number;
  timestamp: Date;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: Record<string, unknown>;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

export class AlertsService {
  private alertQueue: Alert[] = [];
  private isProcessing: boolean = false;

  async createAlert(config: AlertConfig): Promise<void> {
    await connectDB();
    
    const user = await User.findById(config.userId);
    if (!user) throw new Error('User not found');
    
    // Update user's alert settings
    user.alert_settings = {
      kolNames: config.kolNames,
      minKolsCount: config.minKolsCount,
      minPnlPercent: config.minPnlPercent,
      positionStatus: config.positionStatus,
      alertTypes: config.alertTypes,
      isActive: config.isActive
    };
    
    await user.save();
    console.log(`🔔 Alert config updated for user ${config.userId}`);
  }

  async checkForNewAlerts(): Promise<void> {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    
    try {
      await connectDB();
      
      // Get all active users with alert settings
      const users = await User.find({
        'alert_settings.isActive': true,
        'alert_settings.kolNames.0': { $exists: true }
      }).select('_id email alert_settings').lean();
      
      console.log(`🔍 Checking alerts for ${users.length} users`);
      
      for (const user of users) {
        await this.checkUserAlerts(user as { _id: string; email: string; alert_settings: { isActive: boolean; kolNames: string[]; minKolsCount?: number; minPnlPercent?: number; positionStatus?: string; alertTypes: string[] } });
      }
      
    } catch (error) {
      console.error('❌ Error checking alerts:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  private async checkUserAlerts(user: { _id: string; email: string; alert_settings: { isActive: boolean; kolNames: string[]; minKolsCount?: number; minPnlPercent?: number; positionStatus?: string; alertTypes: string[] } }): Promise<void> {
    const settings = user.alert_settings;
    if (!settings || !settings.isActive) return;
    
    try {
      // Get recent tokens with KOL activity (last 5 minutes)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      
      const recentTokens = await Token.find({
        last_kol_buy: { $gte: fiveMinutesAgo },
        'kol_buyers.name': { $in: settings.kolNames }
      }).sort({ last_kol_buy: -1 }).limit(50);
      
      for (const token of recentTokens) {
        // Check if we already sent an alert for this token to this user
        const existingAlert = this.alertQueue.find(alert => 
          alert.userId === user._id.toString() && 
          alert.tokenAddress === token.token_address &&
          alert.timestamp > fiveMinutesAgo
        );
        
        if (existingAlert) continue;
        
        // Check KOL buyers for this token
        const relevantKOLs = token.kol_buyers.filter((kol: { name: string; first_buy_at: string; realized_pnl_percent: number }) => 
          settings.kolNames.includes(kol.name)
        );
        
        for (const kol of relevantKOLs) {
          // Check if this is a new buy (within last 5 minutes)
          const kolBuyTime = new Date(kol.first_buy_at);
          if (kolBuyTime < fiveMinutesAgo) continue;
          
          // Apply filters
          if (settings.minKolsCount && token.kols_count < settings.minKolsCount) continue;
          if (settings.minPnlPercent && kol.realized_pnl_percent < settings.minPnlPercent) continue;
          if (settings.positionStatus && kol.position_status !== settings.positionStatus) continue;
          
          // Create alert
          const alert = await this.createKOLBuyAlert(user._id.toString(), token, kol);
          this.alertQueue.push(alert);
          
          // Send notifications
          await this.sendNotifications(user, alert);
        }
      }
      
    } catch (error) {
      console.error(`❌ Error checking alerts for user ${user._id}:`, error);
    }
  }

  private async createKOLBuyAlert(userId: string, token: { token_address: string; name: string; symbol: string; kols_count: number }, kol: { name: string; wallet_address: string; avg_buy_price: number; realized_pnl_percent: number }): Promise<Alert> {
    const pnlPercent = kol.realized_pnl_percent || 0;
    const priority = this.determinePriority(pnlPercent, token.kols_count);
    
    const alert: Alert = {
      id: `${userId}-${token.token_address}-${kol.wallet_address}-${Date.now()}`,
      userId,
      type: 'kol_buy',
      title: `🚀 ${kol.name} bought ${token.symbol}`,
      message: `${kol.name} just bought ${token.symbol} at $${kol.avg_buy_price?.toFixed(8) || 'N/A'}. ${token.kols_count} KOLs active.`,
      tokenAddress: token.token_address,
      tokenName: token.name,
      kolName: kol.name,
      pnlPercent,
      timestamp: new Date(),
      isRead: false,
      priority
    };
    
    return alert;
  }

  private determinePriority(pnlPercent: number, kolsCount: number): Alert['priority'] {
    if (pnlPercent > 1000 || kolsCount > 10) return 'urgent';
    if (pnlPercent > 500 || kolsCount > 5) return 'high';
    if (pnlPercent > 100 || kolsCount > 2) return 'medium';
    return 'low';
  }

  private async sendNotifications(user: { email: string; _id: string; alert_settings: { alertTypes: string[] } }, alert: Alert): Promise<void> {
    const settings = user.alert_settings;
    if (!settings || !settings.alertTypes) return;
    
    for (const alertType of settings.alertTypes) {
      try {
        switch (alertType) {
          case 'email':
            await this.sendEmailAlert(user.email, alert);
            break;
          case 'push':
            await this.sendPushAlert(user, alert);
            break;
          case 'browser':
            await this.sendBrowserAlert(user, alert);
            break;
        }
      } catch (error) {
        console.error(`❌ Error sending ${alertType} alert:`, error);
      }
    }
  }

  private async sendEmailAlert(email: string, alert: Alert): Promise<void> {
    // This would integrate with SendGrid or similar email service
    console.log(`📧 Email alert to ${email}: ${alert.title}`);
    
    // For now, just log the email content
    const emailContent = {
      to: email,
      subject: alert.title,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">${alert.title}</h2>
          <p>${alert.message}</p>
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Token:</strong> ${alert.tokenName} (${alert.tokenAddress})</p>
            <p><strong>KOL:</strong> ${alert.kolName}</p>
            ${alert.pnlPercent ? `<p><strong>PNL:</strong> ${alert.pnlPercent.toFixed(2)}%</p>` : ''}
            <p><strong>Time:</strong> ${alert.timestamp.toLocaleString()}</p>
          </div>
          <a href="https://kol-sniper-dashboard.vercel.app/tokens/${alert.tokenAddress}" 
             style="background: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            View Token Details
          </a>
        </div>
      `
    };
    
    console.log('Email content:', emailContent);
  }

  private async sendPushAlert(user: { _id: string }, alert: Alert): Promise<void> {
    // This would integrate with OneSignal or similar push notification service
    console.log(`📱 Push alert to user ${user._id}: ${alert.title}`);
    
    const payload: NotificationPayload = {
      title: alert.title,
      body: alert.message,
      icon: '/favicon.ico',
      badge: '/badge.png',
      data: {
        tokenAddress: alert.tokenAddress,
        kolName: alert.kolName,
        type: alert.type
      },
      actions: [
        {
          action: 'view',
          title: 'View Token',
          icon: '/view-icon.png'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ]
    };
    
    console.log('Push payload:', payload);
  }

  private async sendBrowserAlert(user: { _id: string }, alert: Alert): Promise<void> {
    // This would use WebSocket or Server-Sent Events for real-time browser notifications
    console.log(`🌐 Browser alert to user ${user._id}: ${alert.title}`);
    
    // For now, just log the browser notification
    const browserNotification = {
      userId: user._id,
      alert,
      timestamp: new Date().toISOString()
    };
    
    console.log('Browser notification:', browserNotification);
  }

  async getUserAlerts(userId: string, limit: number = 50): Promise<Alert[]> {
    return this.alertQueue
      .filter(alert => alert.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async markAlertAsRead(alertId: string, userId: string): Promise<void> {
    const alert = this.alertQueue.find(a => a.id === alertId && a.userId === userId);
    if (alert) {
      alert.isRead = true;
    }
  }

  async getAlertStats(userId: string): Promise<{
    total: number;
    unread: number;
    byPriority: Record<string, number>;
    byType: Record<string, number>;
  }> {
    const userAlerts = this.alertQueue.filter(alert => alert.userId === userId);
    
    const stats = {
      total: userAlerts.length,
      unread: userAlerts.filter(alert => !alert.isRead).length,
      byPriority: {} as Record<string, number>,
      byType: {} as Record<string, number>
    };
    
    userAlerts.forEach(alert => {
      stats.byPriority[alert.priority] = (stats.byPriority[alert.priority] || 0) + 1;
      stats.byType[alert.type] = (stats.byType[alert.type] || 0) + 1;
    });
    
    return stats;
  }

  startAlertChecking(intervalMs: number = 30000): void {
    console.log(`🔔 Starting alert checking every ${intervalMs}ms`);
    
    setInterval(async () => {
      await this.checkForNewAlerts();
    }, intervalMs);
  }

  stopAlertChecking(): void {
    console.log('⏹️ Stopping alert checking');
    // In a real implementation, you'd store the interval ID and clear it
  }
}

const alertsService = new AlertsService();
export default alertsService;
