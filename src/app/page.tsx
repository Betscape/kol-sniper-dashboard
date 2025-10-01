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
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

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
    <div className="min-h-screen bg-black text-white">
      {/* Professional Header */}
      <header className="bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <ChartBarIcon className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  KOL Sniper
                </h1>
              </div>
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
                <Link href="/analytics" className="text-gray-300 hover:text-white transition-colors">
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
        {/* Professional Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-6 hover:border-blue-500/50 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">Active Tokens</p>
                <p className="text-3xl font-bold text-white mt-2">{tokens.length}</p>
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
                <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">Top KOLs</p>
                <p className="text-3xl font-bold text-white mt-2">{kols.length}</p>
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
                <p className="text-3xl font-bold text-white mt-2">$2.4M</p>
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
                <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">Win Rate</p>
                <p className="text-3xl font-bold text-white mt-2">87.3%</p>
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

        {/* Professional Tab Navigation */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-2 mb-8">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('tokens')}
              className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'tokens' 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <FireIcon className="w-5 h-5" />
              <span>Live Tokens</span>
            </button>
            <button
              onClick={() => setActiveTab('kols')}
              className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'kols' 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <UserGroupIcon className="w-5 h-5" />
              <span>Top KOLs</span>
            </button>
          </div>
        </div>

        {/* Professional Filters */}
        <div className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Advanced Filters</h3>
            <button
              onClick={() => setFilters({minKolsCount: 1, minPnl: 0, positionStatus: 'all'})}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Reset All
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Minimum KOLs</label>
              <input
                type="number"
                value={filters.minKolsCount}
                onChange={(e) => setFilters({...filters, minKolsCount: parseInt(e.target.value) || 0})}
                className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Min PNL %</label>
              <input
                type="number"
                value={filters.minPnl}
                onChange={(e) => setFilters({...filters, minPnl: parseInt(e.target.value) || 0})}
                className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Position Status</label>
              <select
                value={filters.positionStatus}
                onChange={(e) => setFilters({...filters, positionStatus: e.target.value})}
                className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              >
                <option value="all">All Positions</option>
                <option value="holding">Holding</option>
                <option value="fully_sold">Fully Sold</option>
              </select>
            </div>
            <div className="flex items-end">
              <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-4 py-3 rounded-lg font-medium transition-all duration-200">
                Apply Filters
              </button>
            </div>
          </div>
        </div>

        {/* Professional Content */}
        {activeTab === 'tokens' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Live Token Activity</h2>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Real-time updates</span>
              </div>
            </div>
            
            {tokensError && (
              <div className="bg-red-900/20 border border-red-500/30 text-red-200 px-6 py-4 rounded-xl">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="font-medium">Error loading tokens: {tokensError.message}</span>
                </div>
              </div>
            )}
            
            {filteredTokens.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FireIcon className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-xl text-gray-300 mb-2">No tokens match your filters</p>
                <p className="text-sm text-gray-500">Try adjusting your filter settings</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredTokens.map((token) => (
                  <div key={token._id} className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-blue-500/50 transition-all duration-300 group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <Image
                            src={token.image_url || '/placeholder-token.png'}
                            alt={token.symbol}
                            width={56}
                            height={56}
                            className="w-14 h-14 rounded-xl border-2 border-gray-700 group-hover:border-blue-500/50 transition-colors"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder-token.png';
                            }}
                          />
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900"></div>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="text-xl font-bold text-white">{token.symbol}</h3>
                            <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded-full font-medium">
                              {token.kols_count} KOLs
                            </span>
                          </div>
                          <p className="text-gray-400 text-sm">{token.name}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Last activity: {new Date(token.last_kol_buy).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-8">
                        <div className="text-center">
                          <p className="text-xs text-gray-400 uppercase tracking-wide">Momentum Score</p>
                          <p className="text-2xl font-bold text-yellow-400">{token.momentum_score}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-400 uppercase tracking-wide">Best PNL</p>
                          <p className="text-2xl font-bold text-green-400">
                            +{Math.max(...token.kol_buyers.map(kol => kol.realized_pnl_percent)).toFixed(1)}%
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button className="p-2 text-gray-400 hover:text-white transition-colors">
                            <EyeIcon className="w-5 h-5" />
                          </button>
                          <Link
                            href={`/tokens/${token.token_address}`}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                          >
                            Analyze
                          </Link>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <div className="flex flex-wrap gap-2">
                        {token.kol_buyers.slice(0, 6).map((kol, index) => (
                          <span
                            key={index}
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              kol.position_status === 'holding'
                                ? 'bg-green-900/30 text-green-400 border border-green-500/30'
                                : 'bg-gray-700/50 text-gray-300 border border-gray-600/30'
                            }`}
                          >
                            {kol.name}: {kol.realized_pnl_percent > 0 ? '+' : ''}{kol.realized_pnl_percent.toFixed(1)}%
                          </span>
                        ))}
                        {token.kol_buyers.length > 6 && (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-700/50 text-gray-300 border border-gray-600/30">
                            +{token.kol_buyers.length - 6} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'kols' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Top Performing KOLs</h2>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live rankings</span>
              </div>
            </div>
            
            {kolsError && (
              <div className="bg-red-900/20 border border-red-500/30 text-red-200 px-6 py-4 rounded-xl">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="font-medium">Error loading KOLs: {kolsError.message}</span>
                </div>
              </div>
            )}
            
            <div className="grid gap-4">
              {kols.map((kol, index) => (
                <div key={kol._id} className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300 group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl text-white font-bold text-lg">
                        #{index + 1}
                      </div>
                      <Image
                        src={kol.profile_image || '/placeholder-kol.png'}
                        alt={kol.name}
                        width={56}
                        height={56}
                        className="w-14 h-14 rounded-xl border-2 border-gray-700 group-hover:border-purple-500/50 transition-colors"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-kol.png';
                        }}
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-xl font-bold text-white">{kol.name}</h3>
                          <span className="bg-purple-500/20 text-purple-400 text-xs px-2 py-1 rounded-full font-medium">
                            @{kol.twitter}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm">Last active: {new Date(kol.last_active).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-8">
                      <div className="text-center">
                        <p className="text-xs text-gray-400 uppercase tracking-wide">Momentum</p>
                        <p className="text-2xl font-bold text-yellow-400">{kol.momentum_score}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-400 uppercase tracking-wide">Win Rate</p>
                        <p className="text-2xl font-bold text-green-400">{kol.win_rate.toFixed(1)}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-400 uppercase tracking-wide">Total PNL</p>
                        <p className="text-2xl font-bold text-blue-400">{kol.total_realized_pnl_sol.toFixed(2)} SOL</p>
                      </div>
                      <Link
                        href={`/kols?search=${kol.name}`}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                      >
                        View Trades
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Professional Call to Action */}
        <div className="mt-16 bg-gradient-to-r from-blue-900/20 to-purple-900/20 backdrop-blur-sm border border-gray-700 rounded-2xl p-12 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Ready to Start Professional Trading?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of professional traders using our advanced KOL tracking and analysis system. 
              Never miss a profitable opportunity again.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Link
                href="/auth/signup"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Start Free Trial
              </Link>
              <Link
                href="/simulator"
                className="bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600 hover:border-gray-500 px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-200"
              >
                Try Simulator
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Footer */}
      <footer className="bg-gray-900/95 backdrop-blur-sm border-t border-gray-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <ChartBarIcon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  KOL Sniper
                </h3>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                The ultimate professional trading platform for Solana meme coins. 
                Track KOL activity, analyze performance, and execute profitable trades.
              </p>
              <div className="flex space-x-4">
                <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                  <span className="sr-only">Twitter</span>
                  <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </button>
                <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                  <span className="sr-only">Discord</span>
                  <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M16.942 4.556a16.3 16.3 0 0 0-4.126-1.3 12.04 12.04 0 0 0-.529 1.1 15.175 15.175 0 0 0-4.573 0 11.585 11.585 0 0 0-.535-1.1 16.274 16.274 0 0 0-4.129 1.3A17.392 17.392 0 0 0 .182 13.218a15.785 15.785 0 0 0 4.963 2.521c.41-.564.773-1.16 1.084-1.785a10.63 10.63 0 0 1-1.706-.83c.143-.106.283-.217.418-.33a11.664 11.664 0 0 0 10.118 0c.137.113.272.224.418.33-.544.328-1.116.606-1.71.832a12.52 12.52 0 0 0 1.084 1.785 16.46 16.46 0 0 0 5.064-2.595 17.286 17.286 0 0 0-2.973-8.662zM6.678 10.813a1.941 1.941 0 0 1-1.8-2.045 1.93 1.93 0 0 1 1.8-2.047 1.919 1.919 0 0 1 1.8 2.047 1.93 1.93 0 0 1-1.8 2.045zm6.644 0a1.94 1.94 0 0 1-1.8-2.045 1.93 1.93 0 0 1 1.8-2.047 1.918 1.918 0 0 1 1.8 2.047 1.93 1.93 0 0 1-1.8 2.045z"/>
                  </svg>
                </button>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Platform</h4>
              <ul className="space-y-3">
                <li><Link href="/kols" className="text-gray-400 hover:text-white transition-colors">KOL Leaderboard</Link></li>
                <li><Link href="/simulator" className="text-gray-400 hover:text-white transition-colors">Trading Simulator</Link></li>
                <li><Link href="/analytics" className="text-gray-400 hover:text-white transition-colors">Analytics</Link></li>
                <li><Link href="/alerts" className="text-gray-400 hover:text-white transition-colors">Alerts</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-3">
                <li><Link href="/docs" className="text-gray-400 hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="/api" className="text-gray-400 hover:text-white transition-colors">API Reference</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/status" className="text-gray-400 hover:text-white transition-colors">Status</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                © 2024 KOL Sniper. All rights reserved.
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <Link href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy</Link>
                <Link href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">Terms</Link>
                <Link href="/cookies" className="text-gray-400 hover:text-white text-sm transition-colors">Cookies</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
