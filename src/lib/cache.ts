import NodeCache from 'node-cache';

// 创建一个缓存实例，默认 TTL 为 5 分钟
const cache = new NodeCache({
  stdTTL: 300,
  checkperiod: 60,
  useClones: false
});

// 缓存键常量
export const CACHE_KEYS = {
  CATEGORIES: 'categories',
  LINKS: 'links',
  USER: 'user',
  SETTINGS: 'settings'
};

// 使用缓存包装异步函数
export async function withCache<T>(
  key: string,
  fn: () => Promise<T>,
  ttl: number = 300
): Promise<T> {
  const cached = cache.get<T>(key);
  if (cached !== undefined) {
    return cached;
  }

  const result = await fn();
  cache.set(key, result, ttl);
  return result;
}

// 使缓存失效
export function invalidateCache(key: string): void {
  cache.del(key);
}

// 清除所有缓存
export function clearCache(): void {
  cache.flushAll();
}

// 获取缓存统计信息
export function getCacheStats() {
  return cache.getStats();
}

// 获取缓存键列表
export function getCacheKeys(): string[] {
  return cache.keys();
}

// 检查键是否存在
export function hasKey(key: string): boolean {
  return cache.has(key);
}

// 获取缓存值
export function getCache<T>(key: string): T | undefined {
  return cache.get<T>(key);
}

// 设置缓存值
export function setCache<T>(key: string, value: T, ttl: number = 300): boolean {
  return cache.set(key, value, ttl);
}

// 删除缓存值
export function deleteCache(key: string): number {
  return cache.del(key);
} 