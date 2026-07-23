require('dotenv').config();
const { MongoClient } = require('mongodb');

// We use process.env.DATABASE_URL if MONGODB_URI is not set, since the app relies on DATABASE_URL
const uri = process.env.MONGODB_URI || process.env.DATABASE_URL;
const client = new MongoClient(uri);

// Test the connection
client.connect()
  .then(() => console.log("Connected:", client.db().databaseName))
  .catch(err => console.error("Connection error:", err));

module.exports = client;
