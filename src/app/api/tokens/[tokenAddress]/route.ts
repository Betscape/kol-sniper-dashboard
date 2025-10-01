import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Token from '@/models/Token';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tokenAddress: string }> }
) {
  try {
    await connectDB();
    
    const { tokenAddress } = await params;
    
    const token = await Token.findOne({ token_address: tokenAddress })
      .populate('kol_buyers');
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: token
    });
    
  } catch (error) {
    console.error('Error fetching token:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch token' },
      { status: 500 }
    );
  }
}
