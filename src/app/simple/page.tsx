export default function SimplePage() {
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
          <div className="flex justify-center space-x-4">
            <a 
              href="/kols" 
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-colors"
            >
              👑 KOL Leaderboard
            </a>
            <a 
              href="/simulator" 
              className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg transition-colors"
            >
              🎯 Simulator
            </a>
          </div>
        </header>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-2xl font-semibold mb-4">⚡ Real-time Tracking</h3>
            <p className="text-gray-300">
              Live updates on KOL buying/selling activities with instant notifications.
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-2xl font-semibold mb-4">📊 Advanced Analytics</h3>
            <p className="text-gray-300">
              Deep insights into token performance and KOL momentum scores.
            </p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-2xl font-semibold mb-4">🎮 Copytrade Simulator</h3>
            <p className="text-gray-300">
              Backtest strategies before investing with our advanced simulator.
            </p>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold mb-8">🚀 Ready to Start Sniper Trading?</h2>
          <div className="space-x-4">
            <a 
              href="/auth/signup" 
              className="bg-yellow-600 hover:bg-yellow-700 px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
            >
              Get Started
            </a>
            <a 
              href="/auth/signin" 
              className="bg-gray-700 hover:bg-gray-600 px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
            >
              Sign In
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
