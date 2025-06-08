import dotenv from 'dotenv';
import { Client, type ClientBase, Pool } from 'pg'; // Corrected import for ClientBase if needed, or just Client
import { withCache, invalidateCache, CACHE_KEYS } from './cache';
import { runMigrations } from '../migrations';
import { DatabaseConnection } from './connection';
import { db } from './connection';

dotenv.config(); // Load environment variables at the top

// Define the Storage interface
interface Storage {
  getData(key: string): Promise<any>;
  saveData(key: string, data: any): Promise<void>;
  deleteData(key: string): Promise<void>;
  disconnect(): Promise<void>;
  // Add other data operation methods as needed
}

// Local Storage implementation (in-memory map for server-side fallback)
class LocalStorage implements Storage {
  private data: Map<string, any>;

  constructor() {
    this.data = new Map();
    console.log("Storage System: Using local (in-memory map) storage mode.");
  }

  async getData(key: string): Promise<any> {
    return this.data.get(key);
  }

  async saveData(key: string, data: any): Promise<void> {
    this.data.set(key, data);
  }

  async deleteData(key: string): Promise<void> {
    this.data.delete(key);
  }

  async disconnect(): Promise<void> {
    this.data.clear();
  }
}

// Cloud Database Storage implementation
class CloudDatabaseStorage implements Storage {
  private isInitialized: boolean = false;

  constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await db.initialize();
      this.isInitialized = true;
      console.log('Database storage initialized successfully');
    } catch (e) {
      console.error('Failed to initialize database storage:', e);
      throw e;
    }
  }

  async getData(key: string): Promise<any> {
    await this.initialize();

    return withCache(key, async () => {
      const result = await db.executeQuery<any>(
        'SELECT value FROM storage WHERE key = $1',
        [key]
      );
      return result[0]?.value;
    });
  }

  async saveData(key: string, data: any): Promise<void> {
    await this.initialize();

    await db.executeQuery(
      'INSERT INTO storage (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP',
      [key, data]
    );
    invalidateCache(key);
  }

  async deleteData(key: string): Promise<void> {
    await this.initialize();

    await db.executeQuery(
      'DELETE FROM storage WHERE key = $1',
      [key]
    );
    invalidateCache(key);
  }

  async disconnect(): Promise<void> {
    await db.close();
  }
}

// Singleton instance of storage
let storageInstance: Storage | null = null;

// Function to get the appropriate storage instance
export function getStorage(): Storage {
  if (storageInstance) {
    return storageInstance;
  }

  console.log('Storage System: Initializing storage instance...');

  const pgUrl = process.env.NEXT_PUBLIC_DATABASE_URL;
  const mysqlUrl = process.env.NEXT_PUBLIC_MYSQL_URL;
  const mongoUrl = process.env.NEXT_PUBLIC_MONGODB_URL;

  if (pgUrl) {
    console.log("Storage System: PostgreSQL URL (NEXT_PUBLIC_DATABASE_URL) found.");
    try {
      storageInstance = new CloudDatabaseStorage();
      console.log("Storage System: CloudDatabaseStorage (PostgreSQL) initialized.");
      return storageInstance;
    } catch (error: any) {
      console.error("Storage System: Failed to initialize PostgreSQL storage. Falling back.", error.message);
    }
  }
  
  if (mysqlUrl) {
    console.log("Storage System: MySQL URL (NEXT_PUBLIC_MYSQL_URL) found, but MySQL is not yet implemented. Falling back.");
    // If MySQL implementation was ready:
    // try {
    //   storageInstance = new MySqlStorage(mysqlUrl); // Assuming MySqlStorage class exists
    //   console.log("Storage System: MySqlStorage initialized.");
    //   return storageInstance;
    // } catch (error: any) {
    //   console.error("Storage System: Failed to initialize MySQL storage. Falling back.", error.message);
    // }
  }

  if (mongoUrl) {
    console.log("Storage System: MongoDB URL (NEXT_PUBLIC_MONGODB_URL) found, but MongoDB is not yet implemented. Falling back.");
    // If MongoDB implementation was ready:
    // try {
    //   storageInstance = new MongoDbStorage(mongoUrl); // Assuming MongoDbStorage class exists
    //   console.log("Storage System: MongoDbStorage initialized.");
    //   return storageInstance;
    // } catch (error: any) {
    //   console.error("Storage System: Failed to initialize MongoDB storage. Falling back.", error.message);
    // }
  }

  console.log("Storage System: No supported cloud database URL configured or implementation missing. Using local (in-memory map) storage as fallback.");
  storageInstance = new LocalStorage();
  return storageInstance;
}
