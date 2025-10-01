'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowTrendingUpIcon, 
  UsersIcon, 
  ChartBarIcon,
  BellIcon,
  FireIcon,
  ArrowUpIcon
} from '@heroicons/react/24/outline';

interface Token {
  _id: string;
  name: string;
  symbol: string;
  image_url: string;
  kols_count: number;
  last_kol_buy: string;
  avg_kol_pnl: number;
  momentum_score: number;
  kol_buyers: Array<{
    name: string;
    profile_image: string;
    last_action: 'buy' | 'sell';
    realized_pnl_percent: number;
  }>;
}

interface KOL {
  _id: string;
  name: string;
  twitter: string;
  profile_image: string;
  momentum_score: number;
  win_rate: number;
  total_realized_pnl_sol: number;
  last_active: string;
}

export default function HomePage() {
  const { data: session } = useSession();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [topKOLs, setTopKOLs] = useState<KOL[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTokens: 0,
    activeKOLs: 0,
    totalVolume: 0,
    avgPnl: 0
  });

  useEffect(() => {
    fetchData();
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      // Fetch latest tokens
      const tokensResponse = await fetch('/api/tokens?limit=20&sortBy=last_kol_buy&sortOrder=desc');
      const tokensData = await tokensResponse.json();
      
      if (tokensData.success) {
        setTokens(tokensData.data);
      }

      // Fetch top KOLs
      const kolsResponse = await fetch('/api/kols?limit=10&sortBy=momentum_score&sortOrder=desc');
      const kolsData = await kolsResponse.json();
      
      if (kolsData.success) {
        setTopKOLs(kolsData.data);
      }

      // Calculate stats
      const totalVolume = tokensData.data?.reduce((sum: number, token: { total_volume?: number }) => 
        sum + (token.total_volume || 0), 0) || 0;
      const avgPnl = tokensData.data?.reduce((sum: number, token: { avg_kol_pnl?: number }) => 
        sum + (token.avg_kol_pnl || 0), 0) / (tokensData.data?.length || 1) || 0;

      setStats({
        totalTokens: tokensData.data?.length || 0,
        activeKOLs: kolsData.data?.length || 0,
        totalVolume,
        avgPnl
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toFixed(2);
  };

  const formatPnl = (pnl: number) => {
    const sign = pnl >= 0 ? '+' : '';
    return `${sign}${pnl.toFixed(2)}%`;
  };

  const getPnlColor = (pnl: number) => {
    if (pnl > 0) return 'text-green-500';
    if (pnl < 0) return 'text-red-500';
    return 'text-gray-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <FireIcon className="h-8 w-8 text-orange-500" />
              <h1 className="text-2xl font-bold">KOL Sniper Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-white">
                <BellIcon className="h-6 w-6" />
              </button>
              {session ? (
                <Link href="/profile" className="text-blue-400 hover:text-blue-300">
                  Profile
                </Link>
              ) : (
                <Link href="/auth/signin" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg">
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center">
              <ArrowTrendingUpIcon className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm text-gray-400">Total Tokens</p>
                <p className="text-2xl font-bold">{stats.totalTokens}</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center">
              <UsersIcon className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm text-gray-400">Active KOLs</p>
                <p className="text-2xl font-bold">{stats.activeKOLs}</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm text-gray-400">Total Volume</p>
                <p className="text-2xl font-bold">{formatNumber(stats.totalVolume)} SOL</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center">
              <ArrowUpIcon className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm text-gray-400">Avg PNL</p>
                <p className={`text-2xl font-bold ${getPnlColor(stats.avgPnl)}`}>
                  {formatPnl(stats.avgPnl)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Latest Tokens */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Latest KOL Activity</h2>
                <Link href="/tokens" className="text-blue-400 hover:text-blue-300 text-sm">
                  View All →
                </Link>
              </div>
              <div className="space-y-4">
                {tokens.map((token) => (
                  <div key={token._id} className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors">
                    <div className="flex items-center space-x-4">
                      <Image
                        src={token.image_url}
                        alt={token.name}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{token.name}</h3>
                          <span className="text-gray-400">({token.symbol})</span>
                          <span className="bg-orange-500 text-white px-2 py-1 rounded text-xs">
                            {token.momentum_score}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <span>{token.kols_count} KOLs</span>
                          <span className={getPnlColor(token.avg_kol_pnl)}>
                            {formatPnl(token.avg_kol_pnl)}
                          </span>
                          <span>{new Date(token.last_kol_buy).toLocaleTimeString()}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <Link
                          href={`https://pump.fun/${token._id}`}
                          target="_blank"
                          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm"
                        >
                          Trade Now
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top KOLs */}
          <div>
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Top KOLs</h2>
                <Link href="/kols" className="text-blue-400 hover:text-blue-300 text-sm">
                  View All →
                </Link>
              </div>
              <div className="space-y-4">
                {topKOLs.map((kol, index) => (
                  <div key={kol._id} className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                      </div>
                      <Image
                        src={kol.profile_image}
                        alt={kol.name}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold">{kol.name}</h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-400">
                          <span className={getPnlColor(kol.total_realized_pnl_sol)}>
                            {formatPnl(kol.total_realized_pnl_sol)}
                          </span>
                          <span>{kol.win_rate.toFixed(1)}% win rate</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="bg-orange-500 text-white px-2 py-1 rounded text-xs">
                          {kol.momentum_score}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}