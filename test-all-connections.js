const mongoose = require('mongoose');

// Test all connections
async function testAllConnections() {
  console.log('🚀 Testing All Connections...\n');
  
  // Test MongoDB Connection
  try {
    console.log('🔗 Testing MongoDB connection...');
    const MONGODB_URI = 'mongodb+srv://jgero961_db_user:EuiabpUVUqJ67sz7@main.en214w1.mongodb.net/?retryWrites=true&w=majority&appName=main';
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected successfully!');
    
    // Test database operations
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('📊 Available collections:', collections.map(c => c.name));
    
    await mongoose.disconnect();
    console.log('🔌 MongoDB disconnected');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
  }
  
  // Test API endpoint
  try {
    console.log('\n🌐 Testing API endpoint...');
    const response = await fetch('https://api.dexscreener.com/latest/dex/tokens/So11111111111111111111111111111111111111112');
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API endpoint accessible');
      console.log('📈 Sample data received:', Object.keys(data));
    } else {
      console.error('❌ API endpoint failed:', response.status);
    }
  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
  
  console.log('\n🎉 All connection tests completed!');
}

testAllConnections();
