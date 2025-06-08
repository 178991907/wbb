import { Client } from 'pg';

async function testDatabaseConnection() {
  const databaseUrl = process.env.NEXT_PUBLIC_DATABASE_URL;

  console.log('Testing database connection...');
  console.log('Database URL obtained from environment:', databaseUrl);

  if (!databaseUrl) {
    console.error('Error: NEXT_PUBLIC_DATABASE_URL environment variable is not set.');
    return;
  }

  const client = new Client({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false, // Allow self-signed certificates or untrusted CAs
    },
  });

  try {
    console.log('Attempting to connect to database...');
    await client.connect();
    console.log('Database connection successful!');
    // You can optionally perform a simple query here to further verify the connection
    // const res = await client.query('SELECT 1');
    // console.log('Simple query result:', res.rows[0]);
  } catch (error) {
    console.error('Database connection failed:', error);
  } finally {
    try {
      await client.end();
      console.log('Database connection closed.');
    } catch (closeError) {
      console.error('Error closing database connection:', closeError);
    }
  }
}

testDatabaseConnection();