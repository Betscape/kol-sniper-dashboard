import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User already exists with this email' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = new User({
      name,
      email,
      passwordHash,
      followed_kols: [],
      alert_settings: {
        emailAlerts: false,
        pushAlerts: true,
        kolBuyAlerts: true,
        highPnlAlerts: false,
        minPnlThreshold: 100
      },
      simulation_history: [],
      preferences: {
        theme: 'dark',
        default_timeframe: '1d',
        auto_refresh: true,
        refresh_interval: 30
      },
      subscription: {
        plan: 'free',
        features: ['basic_simulations', 'basic_alerts']
      }
    });

    await user.save();

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
