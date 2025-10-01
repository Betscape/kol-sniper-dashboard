import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import GlobalKOL from '@/models/GlobalKOL';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sortBy = searchParams.get('sortBy') || 'momentum_score';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const minWinRate = parseFloat(searchParams.get('minWinRate') || '0');
    const minPnl = parseFloat(searchParams.get('minPnl') || '0');
    const search = searchParams.get('search');
    
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter: Record<string, unknown> = {};
    if (minWinRate > 0) {
      filter.win_rate = { $gte: minWinRate };
    }
    if (minPnl > 0) {
      filter.avg_pnl_percent = { $gte: minPnl };
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { twitter: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Build sort object
    const sort: Record<string, 1 | -1> = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Execute query
    const kols = await GlobalKOL.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    const total = await GlobalKOL.countDocuments(filter);
    
    return NextResponse.json({
      success: true,
      data: kols,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Error fetching KOLs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch KOLs' },
      { status: 500 }
    );
  }
}
