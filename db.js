const { MongoClient } = require('mongodb');

async function DB(selectedDB, dbName) {
  try {
    const client = new MongoClient(selectedDB);
    await client.connect().catch(console.error);
    console.log('Connected successfully to DB');
    const db = client.db(dbName);
    return { db, client, error: false };
  } catch (error) {
    return { db: '', client: '', error: true };
  }
}

module.exports = DB;
