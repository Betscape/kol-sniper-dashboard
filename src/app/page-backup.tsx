export default function HomePageBackup() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">
            🚀 KOL Sniper Dashboard
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            The Ultimate Copytrading Hub for Solana Meme Coins
          </p>
        </header>

        <div className="text-center">
          <div className="bg-gray-800 p-8 rounded-lg max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">🎯 Features</h2>
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div>
                <h3 className="text-xl font-semibold mb-2">⚡ Real-time Tracking</h3>
                <p className="text-gray-300">Live KOL activity monitoring</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">📊 Analytics</h3>
                <p className="text-gray-300">Advanced performance metrics</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">🎮 Simulator</h3>
                <p className="text-gray-300">Backtest trading strategies</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">👑 KOL Leaderboard</h3>
                <p className="text-gray-300">Top performing traders</p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 space-x-4">
            <a 
              href="/test" 
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-colors"
            >
              Test Page
            </a>
            <a 
              href="/simple" 
              className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg transition-colors"
            >
              Simple Page
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

