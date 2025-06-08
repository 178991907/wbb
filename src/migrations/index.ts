import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import { up as initialSchemaUp, down as initialSchemaDown } from './001_initial_schema';

interface Migration {
  name: string;
  up: (pool: Pool) => Promise<void>;
  down: (pool: Pool) => Promise<void>;
}

const migrations: Migration[] = [
  {
    name: '001_initial_schema',
    up: initialSchemaUp,
    down: initialSchemaDown,
  },
];

export async function runMigrations(pool: Pool): Promise<void> {
  const client = await pool.connect();
  try {
    // 创建迁移表（如果不存在）
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 获取已应用的迁移
    const result = await client.query('SELECT name FROM migrations ORDER BY id');
    const appliedMigrations = new Set(result.rows.map(row => row.name));

    // 运行未应用的迁移
    for (const migration of migrations) {
      if (!appliedMigrations.has(migration.name)) {
        console.log(`Running migration: ${migration.name}`);
        await client.query('BEGIN');
        try {
          await migration.up(pool);
          await client.query('INSERT INTO migrations (name) VALUES ($1)', [migration.name]);
          await client.query('COMMIT');
          console.log(`Migration ${migration.name} completed successfully`);
        } catch (e) {
          await client.query('ROLLBACK');
          console.error(`Migration ${migration.name} failed:`, e);
          throw e;
        }
      }
    }
  } finally {
    client.release();
  }
}

export async function rollbackMigration(pool: Pool, migrationName: string): Promise<void> {
  const client = await pool.connect();
  try {
    const migration = migrations.find(m => m.name === migrationName);
    if (!migration) {
      throw new Error(`Migration ${migrationName} not found`);
    }

    await client.query('BEGIN');
    try {
      await migration.down(pool);
      await client.query('DELETE FROM migrations WHERE name = $1', [migrationName]);
      await client.query('COMMIT');
      console.log(`Rollback of migration ${migrationName} completed successfully`);
    } catch (e) {
      await client.query('ROLLBACK');
      console.error(`Rollback of migration ${migrationName} failed:`, e);
      throw e;
    }
  } finally {
    client.release();
  }
} 