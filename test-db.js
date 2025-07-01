const { MongoClient } = require('mongodb');

async function testConnection() {
  const uri = 'mongodb+srv://canukguy1974:4fZJr8QG1KTu7z0L@cluster0.1ivjozr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
  
  try {
    console.log('Attempting to connect to MongoDB...');
    const client = new MongoClient(uri);
    await client.connect();
    
    console.log('✅ Successfully connected to MongoDB!');
    
    // Test database access
    const db = client.db('killmysub');
    const collections = await db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    // Test subscription collection
    const subscriptions = await db.collection('subscriptions').find({}).limit(5).toArray();
    console.log(`Found ${subscriptions.length} existing subscriptions`);
    
    await client.close();
    console.log('✅ Connection test completed successfully');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
  }
}

testConnection();
