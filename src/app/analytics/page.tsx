'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import useSWR from 'swr';
import { 
  ChartBarIcon, 
  FireIcon, 
  UserGroupIcon, 
  CurrencyDollarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  BellIcon,
  Cog6ToothIcon,
  TrendingUpIcon,
  TrendingDownIcon
} from '@heroicons/react/24/outline';

interface AnalyticsData {
  totalTokens: number;
  totalKOLs: number;
  totalVolume: number;
  averageWinRate: number;
  topPerformingKOL: {
    name: string;
    winRate: number;
    totalPnl: number;
  };
  recentActivity: Array<{
    type: 'token' | 'kol';
    name: string;
    action: string;
    timestamp: string;
    value?: number;
  }>;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | 'all'>('7d');
  const [selectedMetric, setSelectedMetric] = useState<'volume' | 'kols' | 'tokens'>('volume');

  // Mock data for now - will be replaced with real API calls
  const mockData: AnalyticsData = {
    totalTokens: 1247,
    totalKOLs: 89,
    totalVolume: 2450000,
    averageWinRate: 73.2,
    topPerformingKOL: {
      name: 'CryptoWhale',
      winRate: 89.5,
      totalPnl: 125000
    },
    recentActivity: [
      { type: 'token', name: 'PEPE', action: 'New KOL buy', timestamp: '2 minutes ago', value: 15.2 },
      { type: 'kol', name: 'CryptoWhale', action: 'High PNL trade', timestamp: '5 minutes ago', value: 89.5 },
      { type: 'token', name: 'DOGE', action: 'Multiple KOLs active', timestamp: '8 minutes ago', value: 3 },
      { type: 'kol', name: 'MoonTrader', action: 'New position', timestamp: '12 minutes ago', value: 45.3 },
    ]
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Professional Header */}
      <header className="bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <ChartBarIcon className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  KOL Sniper
                </h1>
              </Link>
              <nav className="hidden md:flex space-x-6">
                <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                  Dashboard
                </Link>
                <Link href="/kols" className="text-gray-300 hover:text-white transition-colors">
                  KOLs
                </Link>
                <Link href="/simulator" className="text-gray-300 hover:text-white transition-colors">
                  Simulator
                </Link>
                <Link href="/analytics" className="text-blue-400 font-medium">
                  Analytics
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-green-900/20 border border-green-500/30 rounded-lg px-3 py-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm font-medium">LIVE</span>
              </div>
              <button className="p-2 text-gray-400 hover:text-white transition-colors">
                <BellIcon className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-white transition-colors">
                <Cog6ToothIcon className="w-5 h-5" />
              </button>
              <Link
                href="/auth/signin"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
          <p className="text-gray-400">Comprehensive insights into KOL performance and market trends</p>
        </div>

        {/* Time Range Selector */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-2 mb-8">
          <div className="flex space-x-2">
            {(['24h', '7d', '30d', 'all'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  timeRange === range
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                {range === '24h' ? '24 Hours' : 
                 range === '7d' ? '7 Days' : 
                 range === '30d' ? '30 Days' : 'All Time'}
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-6 hover:border-blue-500/50 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">Total Tokens</p>
                <p className="text-3xl font-bold text-white mt-2">{mockData.totalTokens.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  <ArrowUpIcon className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-500 font-medium">+12.5%</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <FireIcon className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">Active KOLs</p>
                <p className="text-3xl font-bold text-white mt-2">{mockData.totalKOLs}</p>
                <div className="flex items-center mt-2">
                  <ArrowUpIcon className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-500 font-medium">+8.2%</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <UserGroupIcon className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-6 hover:border-green-500/50 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">Total Volume</p>
                <p className="text-3xl font-bold text-white mt-2">${(mockData.totalVolume / 1000000).toFixed(1)}M</p>
                <div className="flex items-center mt-2">
                  <ArrowUpIcon className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-500 font-medium">+24.1%</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                <CurrencyDollarIcon className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-6 hover:border-yellow-500/50 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">Avg Win Rate</p>
                <p className="text-3xl font-bold text-white mt-2">{mockData.averageWinRate}%</p>
                <div className="flex items-center mt-2">
                  <ArrowUpIcon className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-500 font-medium">+5.2%</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                <ChartBarIcon className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Volume Chart */}
          <div className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Volume Trends</h3>
              <div className="flex space-x-2">
                {(['volume', 'kols', 'tokens'] as const).map((metric) => (
                  <button
                    key={metric}
                    onClick={() => setSelectedMetric(metric)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      selectedMetric === metric
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {metric.charAt(0).toUpperCase() + metric.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-64 bg-gray-800/50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <ChartBarIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Chart visualization coming soon</p>
                <p className="text-sm text-gray-500">Recharts integration in progress</p>
              </div>
            </div>
          </div>

          {/* KOL Performance */}
          <div className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-6">Top Performing KOL</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                    1
                  </div>
                  <div>
                    <p className="font-semibold text-white">{mockData.topPerformingKOL.name}</p>
                    <p className="text-sm text-gray-400">Top Performer</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-400">{mockData.topPerformingKOL.winRate}%</p>
                  <p className="text-sm text-gray-400">Win Rate</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-800/30 rounded-lg">
                  <p className="text-sm text-gray-400">Total PNL</p>
                  <p className="text-xl font-bold text-green-400">${mockData.topPerformingKOL.totalPnl.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-gray-800/30 rounded-lg">
                  <p className="text-sm text-gray-400">Trades</p>
                  <p className="text-xl font-bold text-white">247</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-6">Recent Activity</h3>
          <div className="space-y-4">
            {mockData.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    activity.type === 'token' ? 'bg-blue-500/20' : 'bg-purple-500/20'
                  }`}>
                    {activity.type === 'token' ? (
                      <FireIcon className="w-4 h-4 text-blue-400" />
                    ) : (
                      <UserGroupIcon className="w-4 h-4 text-purple-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-white">{activity.name}</p>
                    <p className="text-sm text-gray-400">{activity.action}</p>
                  </div>
                </div>
                <div className="text-right">
                  {activity.value && (
                    <p className={`text-lg font-bold ${
                      activity.value > 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {activity.value > 0 ? '+' : ''}{activity.value}%
                    </p>
                  )}
                  <p className="text-sm text-gray-400">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
