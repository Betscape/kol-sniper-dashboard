'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ChartBarIcon, 
  BellIcon, 
  Cog6ToothIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface Alert {
  id: string;
  name: string;
  kolNames: string[];
  minKolsCount: number;
  minPnlPercent: number;
  positionStatus: 'all' | 'holding' | 'fully_sold';
  alertTypes: ('email' | 'push' | 'browser')[];
  isActive: boolean;
  createdAt: string;
  lastTriggered?: string;
}

export default function AlertsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      name: 'High PNL KOLs',
      kolNames: ['CryptoWhale', 'MoonTrader'],
      minKolsCount: 2,
      minPnlPercent: 100,
      positionStatus: 'holding',
      alertTypes: ['email', 'push'],
      isActive: true,
      createdAt: '2024-01-15',
      lastTriggered: '2 hours ago'
    },
    {
      id: '2',
      name: 'New Token Activity',
      kolNames: ['CryptoWhale'],
      minKolsCount: 1,
      minPnlPercent: 0,
      positionStatus: 'all',
      alertTypes: ['browser'],
      isActive: true,
      createdAt: '2024-01-14',
      lastTriggered: '1 day ago'
    },
    {
      id: '3',
      name: 'Mega Pumps',
      kolNames: ['MoonTrader', 'CryptoWhale', 'DiamondHands'],
      minKolsCount: 3,
      minPnlPercent: 500,
      positionStatus: 'all',
      alertTypes: ['email', 'push', 'browser'],
      isActive: false,
      createdAt: '2024-01-10'
    }
  ]);

  const [newAlert, setNewAlert] = useState({
    name: '',
    kolNames: [] as string[],
    minKolsCount: 1,
    minPnlPercent: 0,
    positionStatus: 'all' as 'all' | 'holding' | 'fully_sold',
    alertTypes: [] as ('email' | 'push' | 'browser')[],
    isActive: true
  });

  const availableKOLs = ['CryptoWhale', 'MoonTrader', 'DiamondHands', 'PumpKing', 'SolanaSniper', 'MemeMaster'];

  const handleCreateAlert = () => {
    if (!newAlert.name || newAlert.kolNames.length === 0) return;
    
    const alert: Alert = {
      id: Date.now().toString(),
      ...newAlert,
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    setAlerts([...alerts, alert]);
    setNewAlert({
      name: '',
      kolNames: [],
      minKolsCount: 1,
      minPnlPercent: 0,
      positionStatus: 'all',
      alertTypes: [],
      isActive: true
    });
    setShowCreateModal(false);
  };

  const handleEditAlert = (alert: Alert) => {
    setEditingAlert(alert);
    setNewAlert({
      name: alert.name,
      kolNames: alert.kolNames,
      minKolsCount: alert.minKolsCount,
      minPnlPercent: alert.minPnlPercent,
      positionStatus: alert.positionStatus,
      alertTypes: alert.alertTypes,
      isActive: alert.isActive
    });
    setShowCreateModal(true);
  };

  const handleUpdateAlert = () => {
    if (!editingAlert || !newAlert.name || newAlert.kolNames.length === 0) return;
    
    setAlerts(alerts.map(alert => 
      alert.id === editingAlert.id 
        ? { ...alert, ...newAlert }
        : alert
    ));
    
    setEditingAlert(null);
    setNewAlert({
      name: '',
      kolNames: [],
      minKolsCount: 1,
      minPnlPercent: 0,
      positionStatus: 'all',
      alertTypes: [],
      isActive: true
    });
    setShowCreateModal(false);
  };

  const handleDeleteAlert = (id: string) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };

  const toggleAlertStatus = (id: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === id 
        ? { ...alert, isActive: !alert.isActive }
        : alert
    ));
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
                <Link href="/alerts" className="text-blue-400 font-medium">
                  Alerts
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Alert Management</h1>
            <p className="text-gray-400">Configure real-time notifications for KOL activity</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Create Alert</span>
          </button>
        </div>

        {/* Alerts Grid */}
        <div className="grid gap-6">
          {alerts.map((alert) => (
            <div key={alert.id} className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-blue-500/50 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${alert.isActive ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                  <h3 className="text-xl font-bold text-white">{alert.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    alert.isActive 
                      ? 'bg-green-900/30 text-green-400 border border-green-500/30'
                      : 'bg-gray-700/50 text-gray-400 border border-gray-600/30'
                  }`}>
                    {alert.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleAlertStatus(alert.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      alert.isActive 
                        ? 'text-green-400 hover:bg-green-900/20' 
                        : 'text-gray-400 hover:bg-gray-800/50'
                    }`}
                  >
                    {alert.isActive ? <CheckIcon className="w-5 h-5" /> : <XMarkIcon className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => handleEditAlert(alert)}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
                  >
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteAlert(alert.id)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">KOLs to Track</h4>
                  <div className="flex flex-wrap gap-2">
                    {alert.kolNames.map((kol, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                        {kol}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Conditions</h4>
                  <div className="space-y-1 text-sm">
                    <p className="text-gray-300">Min KOLs: {alert.minKolsCount}</p>
                    <p className="text-gray-300">Min PNL: {alert.minPnlPercent}%</p>
                    <p className="text-gray-300">Status: {alert.positionStatus}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Notifications</h4>
                  <div className="flex flex-wrap gap-2">
                    {alert.alertTypes.map((type, index) => (
                      <span key={index} className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                        {type}
                      </span>
                    ))}
                  </div>
                  {alert.lastTriggered && (
                    <p className="text-xs text-gray-500 mt-2">Last triggered: {alert.lastTriggered}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Create/Edit Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-2xl mx-4">
              <h2 className="text-2xl font-bold text-white mb-6">
                {editingAlert ? 'Edit Alert' : 'Create New Alert'}
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Alert Name</label>
                  <input
                    type="text"
                    value={newAlert.name}
                    onChange={(e) => setNewAlert({...newAlert, name: e.target.value})}
                    className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    placeholder="Enter alert name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">KOLs to Track</label>
                  <div className="grid grid-cols-2 gap-2">
                    {availableKOLs.map((kol) => (
                      <label key={kol} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newAlert.kolNames.includes(kol)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewAlert({...newAlert, kolNames: [...newAlert.kolNames, kol]});
                            } else {
                              setNewAlert({...newAlert, kolNames: newAlert.kolNames.filter(k => k !== kol)});
                            }
                          }}
                          className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-gray-300">{kol}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Min KOLs Count</label>
                    <input
                      type="number"
                      value={newAlert.minKolsCount}
                      onChange={(e) => setNewAlert({...newAlert, minKolsCount: parseInt(e.target.value) || 0})}
                      className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Min PNL %</label>
                    <input
                      type="number"
                      value={newAlert.minPnlPercent}
                      onChange={(e) => setNewAlert({...newAlert, minPnlPercent: parseInt(e.target.value) || 0})}
                      className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Position Status</label>
                  <select
                    value={newAlert.positionStatus}
                    onChange={(e) => setNewAlert({...newAlert, positionStatus: e.target.value as 'holding' | 'fully_sold' | 'partial_sold'})}
                    className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  >
                    <option value="all">All Positions</option>
                    <option value="holding">Holding Only</option>
                    <option value="fully_sold">Fully Sold Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Notification Types</label>
                  <div className="flex space-x-4">
                    {(['email', 'push', 'browser'] as const).map((type) => (
                      <label key={type} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newAlert.alertTypes.includes(type)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewAlert({...newAlert, alertTypes: [...newAlert.alertTypes, type]});
                            } else {
                              setNewAlert({...newAlert, alertTypes: newAlert.alertTypes.filter(t => t !== type)});
                            }
                          }}
                          className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-gray-300 capitalize">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-8">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingAlert(null);
                    setNewAlert({
                      name: '',
                      kolNames: [],
                      minKolsCount: 1,
                      minPnlPercent: 0,
                      positionStatus: 'all',
                      alertTypes: [],
                      isActive: true
                    });
                  }}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={editingAlert ? handleUpdateAlert : handleCreateAlert}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all duration-200"
                >
                  {editingAlert ? 'Update Alert' : 'Create Alert'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

