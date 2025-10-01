import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4">🚀</h1>
          <h2 className="text-5xl font-bold mb-4">KOL Sniper Dashboard</h2>
          <p className="text-xl text-gray-300 mb-8">
            The Ultimate Copytrading Hub for Solana Meme Coins
          </p>
        </header>

        <div className="text-center">
          <div className="bg-gray-800 p-8 rounded-lg max-w-2xl mx-auto mb-8">
            <h3 className="text-3xl font-bold mb-6">🎯 Features</h3>
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div>
                <h4 className="text-xl font-semibold mb-2">⚡ Real-time Tracking</h4>
                <p className="text-gray-300">Live KOL activity monitoring</p>
              </div>
              <div>
                <h4 className="text-xl font-semibold mb-2">📊 Analytics</h4>
                <p className="text-gray-300">Advanced performance metrics</p>
              </div>
              <div>
                <h4 className="text-xl font-semibold mb-2">🎮 Simulator</h4>
                <p className="text-gray-300">Backtest trading strategies</p>
              </div>
              <div>
                <h4 className="text-xl font-semibold mb-2">👑 KOL Leaderboard</h4>
                <p className="text-gray-300">Top performing traders</p>
              </div>
            </div>
          </div>
          
          <div className="space-x-4">
            <Link 
              href="/test" 
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-colors inline-block"
            >
              Test Page
            </Link>
            <Link 
              href="/simple" 
              className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg transition-colors inline-block"
            >
              Simple Page
            </Link>
            <Link 
              href="/kols" 
              className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg transition-colors inline-block"
            >
              KOL Leaderboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
