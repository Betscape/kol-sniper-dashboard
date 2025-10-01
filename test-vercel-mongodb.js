const mongoose = require('mongoose');

// Test Vercel MongoDB Connection
async function testVercelMongoDB() {
  try {
    console.log('🔗 Testing Vercel MongoDB connection...');
    
    const MONGODB_URI = 'mongodb+srv://Vercel-Admin-main:bzT1e1l78pfhIkrR@main.wq3ft92.mongodb.net/?retryWrites=true&w=majority';
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Vercel MongoDB connected successfully!');
    
    // Test database operations
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('📊 Available collections:', collections.map(c => c.name));
    
    // Test creating a test document
    const testCollection = db.collection('test');
    await testCollection.insertOne({ 
      test: true, 
      timestamp: new Date(),
      message: 'Vercel MongoDB connection test successful!' 
    });
    console.log('✅ Test document created successfully!');
    
    // Clean up test document
    await testCollection.deleteOne({ test: true });
    console.log('🧹 Test document cleaned up');
    
    await mongoose.disconnect();
    console.log('🔌 Vercel MongoDB disconnected');
    
    return true;
  } catch (error) {
    console.error('❌ Vercel MongoDB connection failed:', error.message);
    return false;
  }
}

// Run test
async function runTest() {
  console.log('🚀 Testing Vercel MongoDB Connection...\n');
  
  const result = await testVercelMongoDB();
  
  console.log('\n📋 Test Result:');
  console.log(`Vercel MongoDB: ${result ? '✅ PASS' : '❌ FAIL'}`);
  
  if (result) {
    console.log('\n🎉 Vercel MongoDB is ready for deployment!');
  } else {
    console.log('\n⚠️  Vercel MongoDB connection failed. Please check credentials.');
  }
}

runTest();
