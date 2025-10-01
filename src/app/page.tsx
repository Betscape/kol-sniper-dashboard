'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import useSWR from 'swr';

interface Token {
  _id: string;
  name: string;
  symbol: string;
  image_url: string;
  token_address: string;
  kols_count: number;
  last_kol_buy: string;
  kol_buyers: Array<{
    name: string;
    realized_pnl_percent: number;
    position_status: string;
    avg_buy_price: number;
  }>;
  momentum_score: number;
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

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'tokens' | 'kols'>('tokens');
  const [filters, setFilters] = useState({
    minKolsCount: 1,
    minPnl: 0,
    positionStatus: 'all'
  });

  // Fetch latest tokens
  const { data: tokensData, error: tokensError } = useSWR(
    `/api/tokens?limit=20&sort=-last_kol_buy`,
    fetcher,
    { refreshInterval: 30000 } // Refresh every 30 seconds
  );

  // Fetch top KOLs
  const { data: kolsData, error: kolsError } = useSWR(
    `/api/kols?limit=10&sort=-momentum_score`,
    fetcher,
    { refreshInterval: 60000 } // Refresh every minute
  );

  const tokens: Token[] = tokensData?.tokens || [];
  const kols: KOL[] = kolsData?.kols || [];

  const filteredTokens = tokens.filter(token => {
    if (filters.minKolsCount && token.kols_count < filters.minKolsCount) return false;
    if (filters.minPnl) {
      const maxPnl = Math.max(...token.kol_buyers.map(kol => kol.realized_pnl_percent));
      if (maxPnl < filters.minPnl) return false;
    }
    if (filters.positionStatus !== 'all') {
      const hasMatchingPosition = token.kol_buyers.some(kol => kol.position_status === filters.positionStatus);
      if (!hasMatchingPosition) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-3xl font-bold">🚀 KOL Sniper Dashboard</h1>
              <span className="bg-green-600 text-xs px-2 py-1 rounded-full">LIVE</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/simulator" 
                className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded-lg transition-colors"
              >
                🎮 Simulator
              </Link>
              <Link 
                href="/auth/signin" 
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-sm text-gray-400 mb-2">Active Tokens</h3>
            <p className="text-3xl font-bold text-green-400">{tokens.length}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-sm text-gray-400 mb-2">Top KOLs</h3>
            <p className="text-3xl font-bold text-blue-400">{kols.length}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-sm text-gray-400 mb-2">Live Updates</h3>
            <p className="text-3xl font-bold text-purple-400">24/7</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-sm text-gray-400 mb-2">Success Rate</h3>
            <p className="text-3xl font-bold text-yellow-400">85%</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('tokens')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'tokens' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            🔥 Latest Tokens
          </button>
          <button
            onClick={() => setActiveTab('kols')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'kols' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            👑 Top KOLs
          </button>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 p-4 rounded-lg mb-6">
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Min KOLs</label>
              <input
                type="number"
                value={filters.minKolsCount}
                onChange={(e) => setFilters({...filters, minKolsCount: parseInt(e.target.value) || 0})}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                placeholder="1"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Min PNL %</label>
              <input
                type="number"
                value={filters.minPnl}
                onChange={(e) => setFilters({...filters, minPnl: parseInt(e.target.value) || 0})}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Position Status</label>
              <select
                value={filters.positionStatus}
                onChange={(e) => setFilters({...filters, positionStatus: e.target.value})}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              >
                <option value="all">All</option>
                <option value="holding">Holding</option>
                <option value="fully_sold">Fully Sold</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({minKolsCount: 1, minPnl: 0, positionStatus: 'all'})}
                className="w-full bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'tokens' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">🔥 Latest KOL Activity</h2>
            {tokensError && (
              <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded">
                Error loading tokens: {tokensError.message}
              </div>
            )}
            {filteredTokens.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p className="text-xl">No tokens match your filters</p>
                <p className="text-sm mt-2">Try adjusting your filter settings</p>
              </div>
            ) : (
              filteredTokens.map((token) => (
                <div key={token._id} className="bg-gray-800 p-6 rounded-lg hover:bg-gray-750 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Image 
                        src={token.image_url || '/placeholder-token.png'} 
                        alt={token.symbol}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-full"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-token.png';
                        }}
                      />
                      <div>
                        <h3 className="text-xl font-semibold">{token.symbol}</h3>
                        <p className="text-gray-400">{token.name}</p>
                        <p className="text-sm text-gray-500">{token.kols_count} KOLs active</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <p className="text-sm text-gray-400">Momentum</p>
                          <p className="text-lg font-bold text-yellow-400">{token.momentum_score}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-400">Best PNL</p>
                          <p className="text-lg font-bold text-green-400">
                            {Math.max(...token.kol_buyers.map(kol => kol.realized_pnl_percent)).toFixed(1)}%
                          </p>
                        </div>
                        <Link 
                          href={`/tokens/${token.token_address}`}
                          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition-colors"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {token.kol_buyers.slice(0, 5).map((kol, index) => (
                      <span 
                        key={index}
                        className={`px-3 py-1 rounded-full text-sm ${
                          kol.position_status === 'holding' 
                            ? 'bg-green-900 text-green-300' 
                            : 'bg-gray-700 text-gray-300'
                        }`}
                      >
                        {kol.name}: {kol.realized_pnl_percent.toFixed(1)}%
                      </span>
                    ))}
                    {token.kol_buyers.length > 5 && (
                      <span className="px-3 py-1 rounded-full text-sm bg-gray-700 text-gray-300">
                        +{token.kol_buyers.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'kols' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">👑 Top Performing KOLs</h2>
            {kolsError && (
              <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded">
                Error loading KOLs: {kolsError.message}
              </div>
            )}
            {kols.map((kol, index) => (
              <div key={kol._id} className="bg-gray-800 p-6 rounded-lg hover:bg-gray-750 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-gray-700 rounded-full text-xl font-bold">
                      #{index + 1}
                    </div>
                    <Image 
                      src={kol.profile_image || '/placeholder-kol.png'} 
                      alt={kol.name}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-full"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-kol.png';
                      }}
                    />
                    <div>
                      <h3 className="text-xl font-semibold">{kol.name}</h3>
                      <p className="text-gray-400">@{kol.twitter}</p>
                      <p className="text-sm text-gray-500">
                        Last active: {new Date(kol.last_active).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <p className="text-sm text-gray-400">Momentum Score</p>
                      <p className="text-2xl font-bold text-yellow-400">{kol.momentum_score}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-400">Win Rate</p>
                      <p className="text-2xl font-bold text-green-400">{kol.win_rate.toFixed(1)}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-400">Total PNL</p>
                      <p className="text-2xl font-bold text-blue-400">{kol.total_realized_pnl_sol.toFixed(2)} SOL</p>
                    </div>
                    <Link 
                      href={`/kols?search=${kol.name}`}
                      className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded transition-colors"
                    >
                      View Trades
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-12 bg-gradient-to-r from-blue-900 to-purple-900 p-8 rounded-lg text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Sniper Trading?</h2>
          <p className="text-xl text-gray-300 mb-6">
            Join thousands of traders using our advanced KOL tracking system
          </p>
          <div className="flex justify-center space-x-4">
            <Link 
              href="/auth/signup" 
              className="bg-yellow-600 hover:bg-yellow-700 px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
            >
              Get Started Free
            </Link>
            <Link 
              href="/simulator" 
              className="bg-gray-700 hover:bg-gray-600 px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
            >
              Try Simulator
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
