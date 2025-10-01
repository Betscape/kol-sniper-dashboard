import { NextResponse } from 'next/server';

export async function POST() {
  try {
    console.log('🌱 Starting data seeding...');
    
    // Import modules dynamically
    const connectDB = (await import('@/lib/mongodb')).default;
    const Token = (await import('@/models/Token')).default;
    const GlobalKOL = (await import('@/models/GlobalKOL')).default;
    
    // Connect to database
    await connectDB();
    console.log('✅ Connected to MongoDB');
    
    // Sample token data
    const sampleTokens = [
      {
        _id: 'sample_token_1',
        name: 'PEPE Coin',
        symbol: 'PEPE',
        decimals: 6,
        image_url: 'https://via.placeholder.com/64x64/10B981/FFFFFF?text=PEPE',
        uri: 'https://example.com/pepe',
        supply: 1000000000,
        on_chain: {
          mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
          name: 'PEPE Coin',
          symbol: 'PEPE',
          updateAuthority: 'Authority123',
          uri: 'https://example.com/pepe'
        },
        off_chain: {
          attributes: [],
          description: 'A meme coin with potential',
          image: 'https://via.placeholder.com/64x64/10B981/FFFFFF?text=PEPE',
          name: 'PEPE Coin',
          symbol: 'PEPE'
        },
        kols_count: 3,
        first_kol_buy: new Date('2024-01-15T10:30:00Z'),
        last_kol_buy: new Date('2024-01-15T14:45:00Z'),
        token_address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        created: new Date('2024-01-15T10:00:00Z'),
        updated: new Date('2024-01-15T14:45:00Z'),
        fetched_at: new Date(),
        kol_buyers: [
          {
            name: 'CryptoWhale',
            wallet_address: 'wallet_1',
            twitter: 'cryptowhale',
            profile_image: 'https://via.placeholder.com/32x32/3B82F6/FFFFFF?text=CW',
            avg_buy_price: 0.000001,
            avg_sell_price: 0.0000015,
            avg_hold_time_seconds: 3600,
            first_buy_at: new Date('2024-01-15T10:30:00Z'),
            last_action: 'buy',
            position_status: 'holding',
            realized_pnl_percent: 50.0,
            realized_pnl_sol: 0.5,
            total_buys: 1,
            total_sells: 0,
            total_volume_sol: 1.0,
            win_rate: 100.0,
            last_updated: new Date()
          },
          {
            name: 'MoonTrader',
            wallet_address: 'wallet_2',
            twitter: 'moontrader',
            profile_image: 'https://via.placeholder.com/32x32/8B5CF6/FFFFFF?text=MT',
            avg_buy_price: 0.0000012,
            avg_sell_price: 0.0000018,
            avg_hold_time_seconds: 7200,
            first_buy_at: new Date('2024-01-15T12:15:00Z'),
            last_action: 'sell',
            position_status: 'fully_sold',
            realized_pnl_percent: 50.0,
            realized_pnl_sol: 0.6,
            total_buys: 1,
            total_sells: 1,
            total_volume_sol: 1.2,
            win_rate: 100.0,
            last_updated: new Date()
          }
        ],
        total_volume: 2.2,
        avg_kol_pnl: 50.0,
        momentum_score: 75
      },
      {
        _id: 'sample_token_2',
        name: 'DOGE Killer',
        symbol: 'DOGEK',
        decimals: 9,
        image_url: 'https://via.placeholder.com/64x64/F59E0B/FFFFFF?text=DOGEK',
        uri: 'https://example.com/dogek',
        supply: 10000000000,
        on_chain: {
          mint: 'So11111111111111111111111111111111111111112',
          name: 'DOGE Killer',
          symbol: 'DOGEK',
          updateAuthority: 'Authority456',
          uri: 'https://example.com/dogek'
        },
        off_chain: {
          attributes: [],
          description: 'The ultimate DOGE killer',
          image: 'https://via.placeholder.com/64x64/F59E0B/FFFFFF?text=DOGEK',
          name: 'DOGE Killer',
          symbol: 'DOGEK'
        },
        kols_count: 2,
        first_kol_buy: new Date('2024-01-14T08:20:00Z'),
        last_kol_buy: new Date('2024-01-14T16:30:00Z'),
        token_address: 'So11111111111111111111111111111111111111112',
        created: new Date('2024-01-14T08:00:00Z'),
        updated: new Date('2024-01-14T16:30:00Z'),
        fetched_at: new Date(),
        kol_buyers: [
          {
            name: 'DiamondHands',
            wallet_address: 'wallet_3',
            twitter: 'diamondhands',
            profile_image: 'https://via.placeholder.com/32x32/10B981/FFFFFF?text=DH',
            avg_buy_price: 0.0000005,
            avg_sell_price: 0.0000008,
            avg_hold_time_seconds: 14400,
            first_buy_at: new Date('2024-01-14T08:20:00Z'),
            last_action: 'sell',
            position_status: 'fully_sold',
            realized_pnl_percent: 60.0,
            realized_pnl_sol: 0.3,
            total_buys: 1,
            total_sells: 1,
            total_volume_sol: 0.5,
            win_rate: 100.0,
            last_updated: new Date()
          }
        ],
        total_volume: 0.5,
        avg_kol_pnl: 60.0,
        momentum_score: 65
      }
    ];

    // Sample KOL data
    const sampleKOLs = [
      {
        name: 'CryptoWhale',
        wallet_address: 'wallet_1',
        twitter: 'cryptowhale',
        profile_image: 'https://via.placeholder.com/32x32/3B82F6/FFFFFF?text=CW',
        total_tokens_traded: 15,
        avg_pnl_percent: 85.5,
        win_rate: 89.2,
        total_realized_pnl_sol: 125.5,
        momentum_score: 92,
        last_active: new Date('2024-01-15T14:45:00Z'),
        total_volume_sol: 150.0,
        avg_hold_time_hours: 2.5,
        best_trade_pnl: 245.6,
        worst_trade_pnl: -15.2,
        current_positions: 3,
        total_trades: 47
      },
      {
        name: 'MoonTrader',
        wallet_address: 'wallet_2',
        twitter: 'moontrader',
        profile_image: 'https://via.placeholder.com/32x32/8B5CF6/FFFFFF?text=MT',
        total_tokens_traded: 12,
        avg_pnl_percent: 72.3,
        win_rate: 76.8,
        total_realized_pnl_sol: 89.2,
        momentum_score: 78,
        last_active: new Date('2024-01-15T12:15:00Z'),
        total_volume_sol: 120.0,
        avg_hold_time_hours: 1.8,
        best_trade_pnl: 189.2,
        worst_trade_pnl: -8.5,
        current_positions: 2,
        total_trades: 34
      },
      {
        name: 'DiamondHands',
        wallet_address: 'wallet_3',
        twitter: 'diamondhands',
        profile_image: 'https://via.placeholder.com/32x32/10B981/FFFFFF?text=DH',
        total_tokens_traded: 8,
        avg_pnl_percent: 95.1,
        win_rate: 87.5,
        total_realized_pnl_sol: 156.7,
        momentum_score: 88,
        last_active: new Date('2024-01-14T16:30:00Z'),
        total_volume_sol: 95.0,
        avg_hold_time_hours: 4.2,
        best_trade_pnl: 312.4,
        worst_trade_pnl: -5.1,
        current_positions: 1,
        total_trades: 22
      }
    ];

    // Clear existing data
    await Token.deleteMany({});
    await GlobalKOL.deleteMany({});
    console.log('🗑️ Cleared existing data');

    // Insert sample tokens
    for (const token of sampleTokens) {
      await Token.create(token);
    }
    console.log(`✅ Inserted ${sampleTokens.length} sample tokens`);

    // Insert sample KOLs
    for (const kol of sampleKOLs) {
      await GlobalKOL.create(kol);
    }
    console.log(`✅ Inserted ${sampleKOLs.length} sample KOLs`);

    return NextResponse.json({
      success: true,
      message: 'Data seeded successfully',
      data: {
        tokensInserted: sampleTokens.length,
        kolsInserted: sampleKOLs.length
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Data seeding error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to seed data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
