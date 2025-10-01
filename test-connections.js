const mongoose = require('mongoose');

// Test MongoDB Connection
async function testMongoDB() {
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
    
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    return false;
  }
}

// Test API endpoint
async function testAPI() {
  try {
    console.log('🌐 Testing API endpoint...');
    
    const response = await fetch('https://api.dexscreener.com/latest/dex/tokens/So11111111111111111111111111111111111111112');
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API endpoint accessible');
      console.log('📈 Sample data received:', Object.keys(data));
      return true;
    } else {
      console.error('❌ API endpoint failed:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting connection tests...\n');
  
  const mongoResult = await testMongoDB();
  console.log('');
  const apiResult = await testAPI();
  
  console.log('\n📋 Test Results:');
  console.log(`MongoDB: ${mongoResult ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`API: ${apiResult ? '✅ PASS' : '❌ FAIL'}`);
  
  if (mongoResult && apiResult) {
    console.log('\n🎉 All tests passed! Your connections are working.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.');
  }
}

runTests();
