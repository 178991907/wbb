import { Pool } from 'pg';
import { getConnectionPool } from './connection';
import fs from 'fs/promises';
import path from 'path';

interface TableRow {
  [key: string]: any;
}

export class DatabaseBackup {
  private pool: Pool;
  private backupDir: string;

  constructor() {
    this.pool = getConnectionPool();
    this.backupDir = path.join(process.cwd(), 'backups');
  }

  async createBackup(): Promise<string> {
    try {
      // 确保备份目录存在
      await fs.mkdir(this.backupDir, { recursive: true });

      // 获取所有表的数据
      const tables = ['storage', 'categories', 'links'];
      const backupData: Record<string, TableRow[]> = {};

      for (const table of tables) {
        const result = await this.pool.query(`SELECT * FROM ${table}`);
        backupData[table] = result.rows;
      }

      // 生成备份文件名
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = path.join(this.backupDir, `backup-${timestamp}.json`);

      // 保存备份数据
      await fs.writeFile(backupFile, JSON.stringify(backupData, null, 2));

      return backupFile;
    } catch (error) {
      console.error('Backup failed:', error);
      throw error;
    }
  }

  async restoreBackup(backupFile: string): Promise<void> {
    try {
      // 读取备份文件
      const backupData = JSON.parse(await fs.readFile(backupFile, 'utf-8')) as Record<string, TableRow[]>;

      // 开始事务
      const client = await this.pool.connect();
      try {
        await client.query('BEGIN');

        // 恢复每个表的数据
        for (const [table, rows] of Object.entries(backupData)) {
          // 清空表
          await client.query(`TRUNCATE TABLE ${table} CASCADE`);

          // 插入数据
          if (rows.length > 0) {
            const columns = Object.keys(rows[0]);
            const values = rows.map(row => columns.map(col => row[col]));
            const placeholders = values.map((_, i) => 
              `(${columns.map((_, j) => `$${i * columns.length + j + 1}`).join(', ')})`
            ).join(', ');

            await client.query(
              `INSERT INTO ${table} (${columns.join(', ')}) VALUES ${placeholders}`,
              values.flat()
            );
          }
        }

        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Restore failed:', error);
      throw error;
    }
  }

  async listBackups(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.backupDir);
      return files
        .filter(file => file.startsWith('backup-') && file.endsWith('.json'))
        .map(file => path.join(this.backupDir, file));
    } catch (error) {
      console.error('Failed to list backups:', error);
      throw error;
    }
  }

  async deleteBackup(backupFile: string): Promise<void> {
    try {
      await fs.unlink(backupFile);
    } catch (error) {
      console.error('Failed to delete backup:', error);
      throw error;
    }
  }
} 