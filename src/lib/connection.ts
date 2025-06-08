import { Pool, PoolConfig } from 'pg';
import { DatabaseMonitor } from './monitor';
import { DatabaseBackup } from './backup';

export class DatabaseConnection {
  private static instance: DatabaseConnection;
  private pool: Pool;
  private monitor: DatabaseMonitor;
  private backup: DatabaseBackup;
  private isInitialized: boolean = false;

  private constructor() {
    const config: PoolConfig = {
      connectionString: process.env.NEXT_PUBLIC_DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    };

    this.pool = new Pool(config);
    this.monitor = new DatabaseMonitor(this.pool);
    this.backup = new DatabaseBackup(this.pool);

    // 监听连接错误
    this.pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
      this.handleConnectionError(err);
    });
  }

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // 测试连接
      const client = await this.pool.connect();
      client.release();
      
      this.isInitialized = true;
      console.log('Database connection initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database connection:', error);
      throw error;
    }
  }

  public getPool(): Pool {
    return this.pool;
  }

  public getMonitor(): DatabaseMonitor {
    return this.monitor;
  }

  public getBackup(): DatabaseBackup {
    return this.backup;
  }

  private async handleConnectionError(error: Error): Promise<void> {
    console.error('Database connection error:', error);

    // 尝试重新连接
    try {
      await this.pool.end();
      this.pool = new Pool({
        connectionString: process.env.NEXT_PUBLIC_DATABASE_URL,
        ssl: {
          rejectUnauthorized: false,
        },
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });

      // 重新初始化监控
      this.monitor = new DatabaseMonitor(this.pool);
      this.backup = new DatabaseBackup(this.pool);

      console.log('Database connection reestablished');
    } catch (reconnectError) {
      console.error('Failed to reconnect to database:', reconnectError);
      throw reconnectError;
    }
  }

  public async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      console.log('Database connection pool closed');
    }
  }

  public async executeQuery<T>(query: string, params?: any[]): Promise<T> {
    await this.initialize();
    const client = await this.pool.connect();
    
    try {
      const result = await client.query(query, params);
      return result.rows as T;
    } finally {
      client.release();
    }
  }

  public async executeTransaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
    await this.initialize();
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

let pool: Pool | null = null;

export function getConnectionPool(): Pool {
  if (!pool) {
    const connectionString = process.env.NEXT_PUBLIC_DATABASE_URL;
    if (!connectionString) {
      throw new Error('Database connection string is not defined');
    }

    pool = new Pool({
      connectionString,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // 添加错误处理
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
      process.exit(-1);
    });
  }

  return pool;
}

export async function closeConnectionPool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
} 