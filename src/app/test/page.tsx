import Link from 'next/link';

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">🚀 KOL Sniper Dashboard</h1>
        <p className="text-xl mb-8">Test page is working!</p>
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Environment Check</h2>
          <div className="space-y-2 text-left">
            <p>MONGODB_URI: {process.env.MONGODB_URI ? '✅ Set' : '❌ Not set'}</p>
            <p>NEXTAUTH_URL: {process.env.NEXTAUTH_URL || 'Not set'}</p>
            <p>NEXTAUTH_SECRET: {process.env.NEXTAUTH_SECRET ? '✅ Set' : '❌ Not set'}</p>
          </div>
        </div>
        <Link 
          href="/" 
          className="inline-block mt-6 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-colors"
        >
          Go to Homepage
        </Link>
      </div>
    </div>
  );
}
