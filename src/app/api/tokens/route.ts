import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Token from '@/models/Token';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const sort = searchParams.get('sort') || '-last_kol_buy';
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    // Parse sort parameter
    let sortObj: any = {};
    if (sort.startsWith('-')) {
      sortObj[sort.substring(1)] = -1;
    } else {
      sortObj[sort] = 1;
    }

    const tokens = await Token.find()
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Token.countDocuments();

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
      { 
        success: false, 
        error: 'Failed to fetch tokens',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}