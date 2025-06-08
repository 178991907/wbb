// test-db.js
const { Client } = require('pg');

async function testDbConnection() {
  const databaseUrl = process.env.NEXT_PUBLIC_DATABASE_URL;

  console.log('Test: Checking NEXT_PUBLIC_DATABASE_URL...');
  if (!databaseUrl) {
    console.error('Test Error: NEXT_PUBLIC_DATABASE_URL is not set.');
    return;
  }
  console.log('Test: NEXT_PUBLIC_DATABASE_URL obtained.'); // Avoid logging the actual URL for security

  console.log('Test: Attempting to connect to database...');
  const client = new Client({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    await client.connect();
    console.log('Test Success: Database connected successfully!');
    await client.end(); // Close the connection after successful test
    console.log('Test: Database connection closed.');
  } catch (err) {
    console.error('Test Error: Failed to connect to database.', err);
  }
}

testDbConnection();