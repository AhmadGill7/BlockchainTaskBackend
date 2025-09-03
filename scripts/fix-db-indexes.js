const mongoose = require('mongoose');
require('dotenv').config();

async function fixDatabaseIndexes() {
  try {
    const mongoUri = process.env.MONGODB_URI || "mongodb+srv://ahmadpafians_db_user:O8GkcZgt9Rc3qtGZ@task.n0qgdln.mongodb.net/test";
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Check current indexes
    console.log('\n📊 Current indexes on users collection:');
    const indexes = await db.collection('users').indexes();
    indexes.forEach(index => {
      console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
    });
    
    // Drop the problematic userId index if it exists
    try {
      await db.collection('users').dropIndex('userId_1');
      console.log('\n✅ Successfully dropped userId_1 index');
    } catch (error) {
      if (error.message.includes('index not found')) {
        console.log('\n⚠️  userId_1 index not found (already removed)');
      } else {
        console.log('\n❌ Error dropping userId_1 index:', error.message);
      }
    }
    
    // Check indexes after cleanup
    console.log('\n📊 Indexes after cleanup:');
    const indexesAfter = await db.collection('users').indexes();
    indexesAfter.forEach(index => {
      console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
    });
    
    console.log('\n🎉 Database index cleanup completed!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📱 Disconnected from MongoDB');
  }
}

fixDatabaseIndexes();
