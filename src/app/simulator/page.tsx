'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeftIcon,
  PlayIcon,
  ChartBarIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  UserGroupIcon
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
}

interface SimulationResult {
  kol: string;
  startDate: string;
  endDate: string;
  hypothetical_pnl: number;
  total_trades: number;
  win_rate: number;
  best_trade: number;
  worst_trade: number;
  avg_hold_time: number;
  trades: Array<{
    token: string;
    action: 'buy' | 'sell';
    price: number;
    pnl: number;
    timestamp: string;
  }>;
}

export default function SimulatorPage() {
  const [kols, setKols] = useState<KOL[]>([]);
  const [selectedKOLs, setSelectedKOLs] = useState<string[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [initialCapital, setInitialCapital] = useState(1000);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [kolsLoading, setKolsLoading] = useState(true);

  useEffect(() => {
    fetchKOLs();
    // Set default date range (last 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    setEndDate(today.toISOString().split('T')[0]);
    setStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
  }, []);

  const fetchKOLs = async () => {
    try {
      setKolsLoading(true);
      const response = await fetch('/api/kols?limit=50&sortBy=momentum_score&sortOrder=desc');
      const data = await response.json();
      
      if (data.success) {
        setKols(data.data);
      }
      setKolsLoading(false);
    } catch (error) {
      console.error('Error fetching KOLs:', error);
      setKolsLoading(false);
    }
  };

  const handleKOLToggle = (kolId: string) => {
    setSelectedKOLs(prev => 
      prev.includes(kolId) 
        ? prev.filter(id => id !== kolId)
        : [...prev, kolId]
    );
  };

  const runSimulation = async () => {
    if (selectedKOLs.length === 0) {
      alert('Please select at least one KOL to simulate');
      return;
    }

    try {
      setLoading(true);
      
      // This would normally call a simulation API endpoint
      // For now, we'll create a mock simulation result
      const mockResult: SimulationResult = {
        kol: selectedKOLs.join(', '),
        startDate,
        endDate,
        hypothetical_pnl: Math.random() * 200 - 50, // Random PNL between -50% and +150%
        total_trades: Math.floor(Math.random() * 50) + 10,
        win_rate: Math.random() * 100,
        best_trade: Math.random() * 500,
        worst_trade: Math.random() * -100,
        avg_hold_time: Math.random() * 24 * 7, // Random hold time in hours
        trades: []
      };

      // Generate mock trades
      for (let i = 0; i < mockResult.total_trades; i++) {
        mockResult.trades.push({
          token: `Token ${i + 1}`,
          action: Math.random() > 0.5 ? 'buy' : 'sell',
          price: Math.random() * 1000,
          pnl: Math.random() * 200 - 100,
          timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
        });
      }

      setSimulationResult(mockResult);
      setLoading(false);
    } catch (error) {
      console.error('Error running simulation:', error);
      setLoading(false);
    }
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

  if (kolsLoading) {
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
          <div className="flex items-center py-4">
            <Link href="/" className="text-blue-400 hover:text-blue-300 mr-4">
              <ArrowLeftIcon className="h-6 w-6" />
            </Link>
            <h1 className="text-2xl font-bold">Copytrade Simulator</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Simulation Controls */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-6">Simulation Settings</h2>
            
            <div className="space-y-6">
              {/* KOL Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Select KOLs to Follow
                </label>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {kols.map((kol) => (
                    <label key={kol._id} className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg hover:bg-gray-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedKOLs.includes(kol._id)}
                        onChange={() => handleKOLToggle(kol._id)}
                        className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                      />
                      <Image
                        src={kol.profile_image}
                        alt={kol.name}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{kol.name}</p>
                        <p className="text-sm text-gray-400">
                          {kol.win_rate.toFixed(1)}% win rate • {formatPnl(kol.avg_pnl_percent)} avg PNL
                        </p>
                      </div>
                      <span className="bg-orange-500 text-white px-2 py-1 rounded text-xs">
                        {kol.momentum_score}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Initial Capital */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Initial Capital (SOL)
                </label>
                <input
                  type="number"
                  value={initialCapital}
                  onChange={(e) => setInitialCapital(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Run Simulation Button */}
              <button
                onClick={runSimulation}
                disabled={loading || selectedKOLs.length === 0}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 rounded-lg flex items-center justify-center space-x-2"
              >
                <PlayIcon className="h-5 w-5" />
                <span>{loading ? 'Running Simulation...' : 'Run Simulation'}</span>
              </button>
            </div>
          </div>

          {/* Simulation Results */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-6">Simulation Results</h2>
            
            {simulationResult ? (
              <div className="space-y-6">
                {/* Summary Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center">
                      <ArrowTrendingUpIcon className="h-8 w-8 text-green-500" />
                      <div className="ml-4">
                        <p className="text-sm text-gray-400">Total PNL</p>
                        <p className={`text-2xl font-bold ${getPnlColor(simulationResult.hypothetical_pnl)}`}>
                          {formatPnl(simulationResult.hypothetical_pnl)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center">
                      <ChartBarIcon className="h-8 w-8 text-blue-500" />
                      <div className="ml-4">
                        <p className="text-sm text-gray-400">Total Trades</p>
                        <p className="text-2xl font-bold">{simulationResult.total_trades}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center">
                      <UserGroupIcon className="h-8 w-8 text-purple-500" />
                      <div className="ml-4">
                        <p className="text-sm text-gray-400">Win Rate</p>
                        <p className="text-2xl font-bold">{simulationResult.win_rate.toFixed(1)}%</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center">
                      <ClockIcon className="h-8 w-8 text-orange-500" />
                      <div className="ml-4">
                        <p className="text-sm text-gray-400">Avg Hold Time</p>
                        <p className="text-2xl font-bold">{simulationResult.avg_hold_time.toFixed(1)}h</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Best/Worst Trades */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h3 className="font-semibold text-green-500 mb-2">Best Trade</h3>
                    <p className="text-2xl font-bold text-green-500">
                      {formatPnl(simulationResult.best_trade)}
                    </p>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h3 className="font-semibold text-red-500 mb-2">Worst Trade</h3>
                    <p className="text-2xl font-bold text-red-500">
                      {formatPnl(simulationResult.worst_trade)}
                    </p>
                  </div>
                </div>

                {/* Trade History */}
                <div>
                  <h3 className="font-semibold mb-4">Recent Trades</h3>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {simulationResult.trades.slice(0, 10).map((trade, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className={`px-2 py-1 rounded text-xs ${
                            trade.action === 'buy' ? 'bg-green-500' : 'bg-red-500'
                          }`}>
                            {trade.action.toUpperCase()}
                          </span>
                          <span className="font-medium">{trade.token}</span>
                        </div>
                        <div className="text-right">
                          <p className={`font-medium ${getPnlColor(trade.pnl)}`}>
                            {formatPnl(trade.pnl)}
                          </p>
                          <p className="text-sm text-gray-400">
                            {new Date(trade.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Save Simulation Button */}
                <button className="w-full bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg">
                  Save Simulation
                </button>
              </div>
            ) : (
              <div className="text-center py-12">
                <ChartBarIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Run a simulation to see results</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
