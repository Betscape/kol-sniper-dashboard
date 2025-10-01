'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ChartBarIcon, 
  BellIcon, 
  Cog6ToothIcon,
  UserIcon,
  HeartIcon,
  BookmarkIcon,
  ChartPieIcon,
  ClockIcon,
  TrophyIcon,
  XMarkIcon,
  UserGroupIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  joinedDate: string;
  totalSimulations: number;
  followedKOLs: string[];
  savedSimulations: Array<{
    id: string;
    name: string;
    kols: string[];
    pnl: number;
    createdAt: string;
  }>;
  recentActivity: Array<{
    type: 'simulation' | 'alert' | 'follow';
    description: string;
    timestamp: string;
  }>;
  preferences: {
    theme: 'dark' | 'light';
    notifications: boolean;
    emailAlerts: boolean;
    pushAlerts: boolean;
  };
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'simulations' | 'settings'>('overview');
  const [, setShowEditModal] = useState(false);

  const mockProfile: UserProfile = {
    name: 'Crypto Trader',
    email: 'trader@example.com',
    avatar: '/placeholder-avatar.png',
    joinedDate: '2024-01-01',
    totalSimulations: 47,
    followedKOLs: ['CryptoWhale', 'MoonTrader', 'DiamondHands', 'PumpKing'],
    savedSimulations: [
      {
        id: '1',
        name: 'High PNL Strategy',
        kols: ['CryptoWhale', 'MoonTrader'],
        pnl: 245.6,
        createdAt: '2024-01-15'
      },
      {
        id: '2',
        name: 'Conservative Approach',
        kols: ['DiamondHands'],
        pnl: 89.3,
        createdAt: '2024-01-10'
      },
      {
        id: '3',
        name: 'Aggressive Trading',
        kols: ['PumpKing', 'CryptoWhale', 'MoonTrader'],
        pnl: 567.8,
        createdAt: '2024-01-05'
      }
    ],
    recentActivity: [
      { type: 'simulation', description: 'Created new simulation: High PNL Strategy', timestamp: '2 hours ago' },
      { type: 'follow', description: 'Started following PumpKing', timestamp: '1 day ago' },
      { type: 'alert', description: 'Alert triggered: CryptoWhale bought PEPE', timestamp: '2 days ago' },
      { type: 'simulation', description: 'Completed simulation: Conservative Approach', timestamp: '3 days ago' }
    ],
    preferences: {
      theme: 'dark',
      notifications: true,
      emailAlerts: true,
      pushAlerts: false
    }
  };

  const [profile, setProfile] = useState(mockProfile);

  const handleUnfollowKOL = (kolName: string) => {
    setProfile({
      ...profile,
      followedKOLs: profile.followedKOLs.filter(kol => kol !== kolName)
    });
  };

  const handleDeleteSimulation = (simulationId: string) => {
    setProfile({
      ...profile,
      savedSimulations: profile.savedSimulations.filter(sim => sim.id !== simulationId)
    });
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
                <Link href="/analytics" className="text-gray-300 hover:text-white transition-colors">
                  Analytics
                </Link>
                <Link href="/alerts" className="text-gray-300 hover:text-white transition-colors">
                  Alerts
                </Link>
                <Link href="/profile" className="text-blue-400 font-medium">
                  Profile
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
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-xl p-8 mb-8">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <Image
                src={profile.avatar}
                alt={profile.name}
                width={80}
                height={80}
                className="w-20 h-20 rounded-full border-2 border-gray-700"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder-avatar.png';
                }}
              />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-gray-900"></div>
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">{profile.name}</h1>
              <p className="text-gray-400 mb-2">{profile.email}</p>
              <p className="text-sm text-gray-500">Member since {new Date(profile.joinedDate).toLocaleDateString()}</p>
            </div>
            <button
              onClick={() => setShowEditModal(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-6 py-3 rounded-lg font-medium transition-all duration-200"
            >
              Edit Profile
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-2 mb-8">
          <div className="flex space-x-2">
            {(['overview', 'simulations', 'settings'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                {tab === 'overview' && <UserIcon className="w-5 h-5" />}
                {tab === 'simulations' && <ChartPieIcon className="w-5 h-5" />}
                {tab === 'settings' && <Cog6ToothIcon className="w-5 h-5" />}
                <span className="capitalize">{tab}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">Simulations</p>
                    <p className="text-3xl font-bold text-white mt-2">{profile.totalSimulations}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <ChartPieIcon className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">Followed KOLs</p>
                    <p className="text-3xl font-bold text-white mt-2">{profile.followedKOLs.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                    <HeartIcon className="w-6 h-6 text-purple-400" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">Best PNL</p>
                    <p className="text-3xl font-bold text-white mt-2">
                      +{Math.max(...profile.savedSimulations.map(s => s.pnl)).toFixed(1)}%
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <TrophyIcon className="w-6 h-6 text-green-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Followed KOLs */}
            <div className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">Followed KOLs</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {profile.followedKOLs.map((kol, index) => (
                  <div key={index} className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800/70 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-white">{kol}</p>
                        <p className="text-sm text-gray-400">Active KOL</p>
                      </div>
                      <button
                        onClick={() => handleUnfollowKOL(kol)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <XMarkIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">Recent Activity</h3>
              <div className="space-y-4">
                {profile.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 bg-gray-800/30 rounded-lg">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activity.type === 'simulation' ? 'bg-blue-500/20' :
                      activity.type === 'alert' ? 'bg-yellow-500/20' : 'bg-green-500/20'
                    }`}>
                      {activity.type === 'simulation' && <ChartPieIcon className="w-4 h-4 text-blue-400" />}
                      {activity.type === 'alert' && <BellIcon className="w-4 h-4 text-yellow-400" />}
                      {activity.type === 'follow' && <HeartIcon className="w-4 h-4 text-green-400" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-white">{activity.description}</p>
                      <p className="text-sm text-gray-400">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Simulations Tab */}
        {activeTab === 'simulations' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-white">Saved Simulations</h3>
              <Link
                href="/simulator"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-6 py-3 rounded-lg font-medium transition-all duration-200"
              >
                Create New
              </Link>
            </div>

            <div className="grid gap-6">
              {profile.savedSimulations.map((simulation) => (
                <div key={simulation.id} className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-blue-500/50 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-white mb-2">{simulation.name}</h4>
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="flex items-center space-x-2">
                          <UserGroupIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-300">{simulation.kols.join(', ')}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <ClockIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-300">{simulation.createdAt}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div>
                          <p className="text-sm text-gray-400">PNL</p>
                          <p className={`text-2xl font-bold ${simulation.pnl > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {simulation.pnl > 0 ? '+' : ''}{simulation.pnl.toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">KOLs</p>
                          <p className="text-xl font-bold text-white">{simulation.kols.length}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-white transition-colors">
                        <BookmarkIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteSimulation(simulation.id)}
                        className="p-2 text-red-400 hover:text-red-300 transition-colors"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-8">
            <h3 className="text-2xl font-bold text-white">Account Settings</h3>
            
            <div className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-white mb-4">Notification Preferences</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">Push Notifications</p>
                    <p className="text-sm text-gray-400">Receive browser notifications</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profile.preferences.notifications}
                      onChange={(e) => setProfile({
                        ...profile,
                        preferences: { ...profile.preferences, notifications: e.target.checked }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">Email Alerts</p>
                    <p className="text-sm text-gray-400">Receive alerts via email</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profile.preferences.emailAlerts}
                      onChange={(e) => setProfile({
                        ...profile,
                        preferences: { ...profile.preferences, emailAlerts: e.target.checked }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">Push Alerts</p>
                    <p className="text-sm text-gray-400">Receive push notifications</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profile.preferences.pushAlerts}
                      onChange={(e) => setProfile({
                        ...profile,
                        preferences: { ...profile.preferences, pushAlerts: e.target.checked }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

