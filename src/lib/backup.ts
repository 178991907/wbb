import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { exec } from 'child_process';

const execAsync = promisify(exec);

export class DatabaseBackup {
  private pool: Pool;
  private backupDir: string;

  constructor(pool: Pool, backupDir: string = 'backups') {
    this.pool = pool;
    this.backupDir = backupDir;
    this.ensureBackupDir();
  }

  private ensureBackupDir(): void {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  async createBackup(): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(this.backupDir, `backup-${timestamp}.sql`);

    try {
      // 获取数据库连接信息
      const dbUrl = process.env.NEXT_PUBLIC_DATABASE_URL;
      if (!dbUrl) {
        throw new Error('Database URL not found in environment variables');
      }

      // 从连接字符串中提取数据库信息
      const dbInfo = this.parseDatabaseUrl(dbUrl);
      
      // 使用 pg_dump 创建备份
      const dumpCommand = `PGPASSWORD=${dbInfo.password} pg_dump -h ${dbInfo.host} -p ${dbInfo.port} -U ${dbInfo.user} -d ${dbInfo.database} -F c -f ${backupPath}`;
      
      await execAsync(dumpCommand);
      console.log(`Backup created successfully at ${backupPath}`);
      
      return backupPath;
    } catch (error) {
      console.error('Error creating backup:', error);
      throw error;
    }
  }

  async restoreBackup(backupPath: string): Promise<void> {
    try {
      const dbUrl = process.env.NEXT_PUBLIC_DATABASE_URL;
      if (!dbUrl) {
        throw new Error('Database URL not found in environment variables');
      }

      const dbInfo = this.parseDatabaseUrl(dbUrl);
      
      // 使用 pg_restore 恢复备份
      const restoreCommand = `PGPASSWORD=${dbInfo.password} pg_restore -h ${dbInfo.host} -p ${dbInfo.port} -U ${dbInfo.user} -d ${dbInfo.database} -c ${backupPath}`;
      
      await execAsync(restoreCommand);
      console.log(`Backup restored successfully from ${backupPath}`);
    } catch (error) {
      console.error('Error restoring backup:', error);
      throw error;
    }
  }

  async listBackups(): Promise<string[]> {
    try {
      const files = await fs.promises.readdir(this.backupDir);
      return files
        .filter(file => file.startsWith('backup-') && file.endsWith('.sql'))
        .map(file => path.join(this.backupDir, file))
        .sort()
        .reverse();
    } catch (error) {
      console.error('Error listing backups:', error);
      throw error;
    }
  }

  async deleteOldBackups(maxAgeDays: number = 30): Promise<void> {
    try {
      const files = await this.listBackups();
      const now = new Date();
      
      for (const file of files) {
        const stats = await fs.promises.stat(file);
        const fileAge = (now.getTime() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);
        
        if (fileAge > maxAgeDays) {
          await fs.promises.unlink(file);
          console.log(`Deleted old backup: ${file}`);
        }
      }
    } catch (error) {
      console.error('Error deleting old backups:', error);
      throw error;
    }
  }

  private parseDatabaseUrl(url: string): {
    host: string;
    port: string;
    database: string;
    user: string;
    password: string;
  } {
    const regex = /postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/;
    const match = url.match(regex);
    
    if (!match) {
      throw new Error('Invalid database URL format');
    }

    return {
      user: match[1],
      password: match[2],
      host: match[3],
      port: match[4],
      database: match[5],
    };
  }
} 