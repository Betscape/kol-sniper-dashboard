import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import GlobalKOL from '@/models/GlobalKOL';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const sort = searchParams.get('sort') || '-momentum_score';
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    // Parse sort parameter
    let sortObj: any = {};
    if (sort.startsWith('-')) {
      sortObj[sort.substring(1)] = -1;
    } else {
      sortObj[sort] = 1;
    }

    const kols = await GlobalKOL.find()
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await GlobalKOL.countDocuments();

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
      { 
        success: false, 
        error: 'Failed to fetch KOLs',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}