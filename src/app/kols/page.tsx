'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  MagnifyingGlassIcon,
  TrophyIcon,
  StarIcon
} from '@heroicons/react/24/outline';

interface KOL {
  _id: string;
  name: string;
  twitter: string;
  profile_image: string;
  momentum_score: number;
  win_rate: number;
  total_realized_pnl_sol: number;
  total_tokens_traded: number;
  avg_pnl_percent: number;
  last_active: string;
  total_volume_sol: number;
  avg_hold_time_hours: number;
  best_trade_pnl: number;
  worst_trade_pnl: number;
  current_positions: number;
  total_trades: number;
}

export default function KOLsPage() {
  const [kols, setKols] = useState<KOL[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('momentum_score');
  const [sortOrder, setSortOrder] = useState('desc');
  const [minWinRate, setMinWinRate] = useState(0);
  const [minPnl, setMinPnl] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchKOLs = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        sortBy,
        sortOrder,
        minWinRate: minWinRate.toString(),
        minPnl: minPnl.toString(),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`/api/kols?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setKols(data.data);
        setTotalPages(data.pagination.pages);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching KOLs:', error);
      setLoading(false);
    }
  }, [currentPage, sortBy, sortOrder, minWinRate, minPnl, searchTerm]);

  useEffect(() => {
    fetchKOLs();
  }, [fetchKOLs]);

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

  const getRankIcon = (index: number) => {
    if (index === 0) return <TrophyIcon className="h-6 w-6 text-yellow-500" />;
    if (index === 1) return <TrophyIcon className="h-6 w-6 text-gray-400" />;
    if (index === 2) return <TrophyIcon className="h-6 w-6 text-orange-600" />;
    return <span className="text-gray-400 font-bold">{index + 1}</span>;
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
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
              <Link href="/" className="text-blue-400 hover:text-blue-300">
                ← Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold">KOL Leaderboard</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Search KOLs
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or Twitter..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Min Win Rate (%)
              </label>
              <input
                type="number"
                placeholder="0"
                value={minWinRate}
                onChange={(e) => setMinWinRate(Number(e.target.value))}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Min PNL (%)
              </label>
              <input
                type="number"
                placeholder="0"
                value={minPnl}
                onChange={(e) => setMinPnl(Number(e.target.value))}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setMinWinRate(0);
                  setMinPnl(0);
                }}
                className="w-full bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* KOLs Table */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    KOL
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white"
                    onClick={() => handleSort('momentum_score')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Momentum Score</span>
                      {sortBy === 'momentum_score' && (
                        <span className="text-blue-400">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white"
                    onClick={() => handleSort('win_rate')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Win Rate</span>
                      {sortBy === 'win_rate' && (
                        <span className="text-blue-400">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white"
                    onClick={() => handleSort('total_realized_pnl_sol')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Total PNL</span>
                      {sortBy === 'total_realized_pnl_sol' && (
                        <span className="text-blue-400">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white"
                    onClick={() => handleSort('total_tokens_traded')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Tokens Traded</span>
                      {sortBy === 'total_tokens_traded' && (
                        <span className="text-blue-400">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {kols.map((kol, index) => (
                  <tr key={kol._id} className="hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getRankIcon(index)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <Image
                          src={kol.profile_image}
                          alt={kol.name}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                        <div>
                          <div className="text-sm font-medium text-white">{kol.name}</div>
                          <div className="text-sm text-gray-400">@{kol.twitter}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="bg-orange-500 text-white px-2 py-1 rounded text-xs font-bold">
                          {kol.momentum_score}
                        </span>
                        <StarIcon className="h-4 w-4 text-orange-500" />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${getPnlColor(kol.win_rate)}`}>
                        {kol.win_rate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className={`font-medium ${getPnlColor(kol.total_realized_pnl_sol)}`}>
                          {formatPnl(kol.total_realized_pnl_sol)}
                        </div>
                        <div className="text-gray-400">
                          {formatNumber(kol.total_realized_pnl_sol)} SOL
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {kol.total_tokens_traded}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        <button className="text-blue-400 hover:text-blue-300">
                          Follow
                        </button>
                        <Link
                          href={`/kols/${kol._id}`}
                          className="text-green-400 hover:text-green-300"
                        >
                          View Details
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
              >
                Previous
              </button>
              <span className="px-4 py-2 bg-gray-700 text-white rounded-lg">
                {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
