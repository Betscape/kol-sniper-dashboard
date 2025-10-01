'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeftIcon,
  ArrowTopRightOnSquareIcon,
  ChartBarIcon,
  UsersIcon,
  ClockIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

interface Token {
  _id: string;
  name: string;
  symbol: string;
  image_url: string;
  uri: string;
  supply: number;
  decimals: number;
  on_chain: {
    mint: string;
    name: string;
    symbol: string;
    updateAuthority: string;
    uri: string;
  };
  off_chain: {
    attributes: unknown[];
    description: string;
    image: string;
    name: string;
    symbol: string;
  };
  kols_count: number;
  first_kol_buy: string;
  last_kol_buy: string;
  token_address: string;
  created: string;
  updated: string;
  total_volume: number;
  avg_kol_pnl: number;
  momentum_score: number;
  kol_buyers: Array<{
    _id: string;
    name: string;
    wallet_address: string;
    twitter: string;
    profile_image: string;
    avg_buy_price: number;
    avg_sell_price: number;
    avg_hold_time_seconds: number;
    first_buy_at: string;
    last_action: 'buy' | 'sell';
    position_status: 'holding' | 'fully_sold';
    realized_pnl_percent: number;
    realized_pnl_sol: number;
    total_buys: number;
    total_sells: number;
    total_volume_sol: number;
    win_rate: number;
  }>;
}

export default function TokenDetailsPage() {
  const params = useParams();
  const tokenAddress = params.tokenAddress as string;
  const [token, setToken] = useState<Token | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchToken = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/tokens/${tokenAddress}`);
      const data = await response.json();
      
      if (data.success) {
        setToken(data.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching token:', error);
      setLoading(false);
    }
  }, [tokenAddress]);

  useEffect(() => {
    if (tokenAddress) {
      fetchToken();
    }
  }, [tokenAddress, fetchToken]);

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

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h`;
    return `${Math.floor(seconds / 60)}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Token Not Found</h1>
          <Link href="/" className="text-blue-400 hover:text-blue-300">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Link href="/" className="text-blue-400 hover:text-blue-300 mr-4">
              <ArrowLeftIcon className="h-6 w-6" />
            </Link>
            <div className="flex items-center space-x-4">
              <Image
                src={token.image_url}
                alt={token.name}
                width={48}
                height={48}
                className="rounded-full"
              />
              <div>
                <h1 className="text-2xl font-bold">{token.name}</h1>
                <p className="text-gray-400">{token.symbol}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Token Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center">
              <UsersIcon className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm text-gray-400">KOLs Count</p>
                <p className="text-2xl font-bold">{token.kols_count}</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm text-gray-400">Total Volume</p>
                <p className="text-2xl font-bold">{formatNumber(token.total_volume)} SOL</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center">
              <ArrowTrendingUpIcon className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm text-gray-400">Avg KOL PNL</p>
                <p className={`text-2xl font-bold ${getPnlColor(token.avg_kol_pnl)}`}>
                  {formatPnl(token.avg_kol_pnl)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm text-gray-400">Momentum Score</p>
                <p className="text-2xl font-bold">{token.momentum_score}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-gray-800 rounded-lg mb-8">
          <div className="border-b border-gray-700">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'kols', label: 'KOL Activity' },
                { id: 'details', label: 'Token Details' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Token Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Supply</p>
                      <p className="text-lg font-medium">{formatNumber(token.supply)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Decimals</p>
                      <p className="text-lg font-medium">{token.decimals}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">First KOL Buy</p>
                      <p className="text-lg font-medium">
                        {new Date(token.first_kol_buy).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Last KOL Buy</p>
                      <p className="text-lg font-medium">
                        {new Date(token.last_kol_buy).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Description</h3>
                  <p className="text-gray-300">{token.off_chain.description}</p>
                </div>

                <div className="flex space-x-4">
                  <a
                    href={`https://pump.fun/${token.token_address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg flex items-center space-x-2"
                  >
                    <ArrowTopRightOnSquareIcon className="h-5 w-5" />
                    <span>Trade on Pump.fun</span>
                  </a>
                  <button className="bg-gray-600 hover:bg-gray-500 px-6 py-3 rounded-lg">
                    Add to Watchlist
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'kols' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">KOL Activity</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                          KOL
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                          PNL
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                          Volume
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                          Hold Time
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                          Trades
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {token.kol_buyers.map((kol) => (
                        <tr key={kol._id} className="hover:bg-gray-700">
                          <td className="px-4 py-4">
                            <div className="flex items-center space-x-3">
                              <Image
                                src={kol.profile_image}
                                alt={kol.name}
                                width={32}
                                height={32}
                                className="rounded-full"
                              />
                              <div>
                                <p className="font-medium">{kol.name}</p>
                                <p className="text-sm text-gray-400">@{kol.twitter}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`px-2 py-1 rounded text-xs ${
                              kol.position_status === 'holding' 
                                ? 'bg-green-500 text-white' 
                                : 'bg-gray-500 text-white'
                            }`}>
                              {kol.position_status}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className={`font-medium ${getPnlColor(kol.realized_pnl_percent)}`}>
                              {formatPnl(kol.realized_pnl_percent)}
                            </div>
                            <div className="text-sm text-gray-400">
                              {formatNumber(kol.realized_pnl_sol)} SOL
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-300">
                            {formatNumber(kol.total_volume_sol)} SOL
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-300">
                            {formatTime(kol.avg_hold_time_seconds)}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-300">
                            {kol.total_buys}B / {kol.total_sells}S
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'details' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">On-Chain Details</h3>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-gray-400">Mint Address</p>
                        <p className="font-mono text-sm break-all">{token.on_chain.mint}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Update Authority</p>
                        <p className="font-mono text-sm break-all">{token.on_chain.updateAuthority}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Token Address</p>
                        <p className="font-mono text-sm break-all">{token.token_address}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Metadata</h3>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-gray-400">Name</p>
                        <p className="text-sm">{token.off_chain.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Symbol</p>
                        <p className="text-sm">{token.off_chain.symbol}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Image URI</p>
                        <p className="text-sm break-all">{token.off_chain.image}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
