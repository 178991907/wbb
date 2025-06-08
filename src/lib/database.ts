import { Pool, ClientConfig } from 'pg';

let pool: Pool | null = null;

export function getPool(): Pool {
  if (pool) {
    return pool;
  }

  const databaseUrl = process.env.NEXT_PUBLIC_DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('Database URL is not configured.');
  }

  const config: ClientConfig = {
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false, // Adjust based on your database provider's SSL requirements
    },
  };

  pool = new Pool(config);

  pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    // Consider terminating the process or attempting to re-establish the pool
  });

  console.log('Database connection pool created.');
  return pool;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  createdDate: string;
  icon?: string;
}

interface LinkItem {
  id: string;
  title: string;
  url: string;
  categoryId: string;
  categoryName?: string; // Optional, can be joined from categories table
  createdDate: string;
  imageUrl?: string;
  aiHint?: string;
  description?: string;
  faviconUrl?: string;
}

export async function getCategories(): Promise<Category[]> {
  const pool = getPool();
  try {
    const result = await pool.query<Category>('SELECT id, name, slug, "createdDate", icon FROM categories;');
    return result.rows;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
}

export async function getLinks(): Promise<LinkItem[]> {
  const pool = getPool();
  try {
    // Example join to get category name
    const result = await pool.query<LinkItem>(
      'SELECT l.id, l.title, l.url, l.categoryId, c.name AS "categoryName", l."createdDate", l."imageUrl", l."aiHint", l.description, l."faviconUrl" FROM links l JOIN categories c ON l.categoryId = c.id'
    );
    return result.rows;
  } catch (error) {
    console.error('Error fetching links:', error);
    throw error;
  }
}