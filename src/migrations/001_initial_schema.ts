import { Pool } from 'pg';

export async function up(pool: Pool): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 创建迁移表
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 创建存储表
    await client.query(`
      CREATE TABLE IF NOT EXISTS storage (
        key VARCHAR(255) PRIMARY KEY,
        value JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 创建分类表
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        icon VARCHAR(255),
        created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 创建链接表
    await client.query(`
      CREATE TABLE IF NOT EXISTS links (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        url TEXT NOT NULL,
        description TEXT,
        favicon_url TEXT,
        category_id VARCHAR(255) REFERENCES categories(id),
        category_name VARCHAR(255),
        image_url TEXT,
        ai_hint TEXT,
        created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 创建索引
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_links_category_id ON links(category_id);
      CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
    `);

    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

export async function down(pool: Pool): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 删除索引
    await client.query(`
      DROP INDEX IF EXISTS idx_links_category_id;
      DROP INDEX IF EXISTS idx_categories_slug;
    `);

    // 删除表
    await client.query(`
      DROP TABLE IF EXISTS links;
      DROP TABLE IF EXISTS categories;
      DROP TABLE IF EXISTS storage;
      DROP TABLE IF EXISTS migrations;
    `);

    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
} 