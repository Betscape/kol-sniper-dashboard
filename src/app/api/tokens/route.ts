import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Token from '@/models/Token';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sortBy = searchParams.get('sortBy') || 'last_kol_buy';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const minKols = parseInt(searchParams.get('minKols') || '0');
    const minPnl = parseFloat(searchParams.get('minPnl') || '0');
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter: Record<string, unknown> = {};
    if (minKols > 0) {
      filter.kols_count = { $gte: minKols };
    }
    if (minPnl > 0) {
      filter.avg_kol_pnl = { $gte: minPnl };
    }
    
    // Build sort object
    const sort: Record<string, 1 | -1> = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Execute query
    const tokens = await Token.find(filter)
      .populate('kol_buyers')
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    const total = await Token.countDocuments(filter);
    
    return NextResponse.json({
      success: true,
      data: tokens,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Error fetching tokens:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tokens' },
      { status: 500 }
    );
  }
}
