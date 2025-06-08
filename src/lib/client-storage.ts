import { withCache, invalidateCache } from './cache';

// 定义存储接口
interface Storage {
  getData(key: string): Promise<any>;
  saveData(key: string, data: any): Promise<void>;
  deleteData(key: string): Promise<void>;
}

// 客户端存储实现
class ClientStorage implements Storage {
  async getData(key: string): Promise<any> {
    return withCache(key, async () => {
      const response = await fetch(`/api/storage?key=${encodeURIComponent(key)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      return response.json();
    });
  }

  async saveData(key: string, data: any): Promise<void> {
    const response = await fetch('/api/storage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ key, value: data }),
    });

    if (!response.ok) {
      throw new Error('Failed to save data');
    }

    invalidateCache(key);
  }

  async deleteData(key: string): Promise<void> {
    const response = await fetch(`/api/storage?key=${encodeURIComponent(key)}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete data');
    }

    invalidateCache(key);
  }
}

// 存储实例单例
let storageInstance: Storage | null = null;

// 获取存储实例的函数
export function getStorage(): Storage {
  if (storageInstance) {
    return storageInstance;
  }

  storageInstance = new ClientStorage();
  return storageInstance;
} 