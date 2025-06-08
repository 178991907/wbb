import NodeCache from 'node-cache';

// 创建缓存实例，默认缓存时间为5分钟
const cache = new NodeCache({ 
  stdTTL: 300,
  checkperiod: 60,
  useClones: false
});

// 缓存键前缀
const CACHE_KEYS = {
  CATEGORIES: 'categories',
  LINKS: 'links',
  CATEGORY: (id: string) => `category:${id}`,
  LINK: (id: string) => `link:${id}`,
} as const;

// 带缓存的函数包装器
export async function withCache<T>(
  key: string,
  fn: () => Promise<T>,
  ttl: number = 300
): Promise<T> {
  const cached = cache.get<T>(key);
  if (cached) {
    console.log(`Cache hit for key: ${key}`);
    return cached;
  }

  console.log(`Cache miss for key: ${key}`);
  const result = await fn();
  cache.set(key, result, ttl);
  return result;
}

// 清除指定键的缓存
export function invalidateCache(key: string): void {
  cache.del(key);
}

// 清除所有缓存
export function clearCache(): void {
  cache.flushAll();
}

// 获取缓存统计信息
export function getCacheStats(): NodeCache.Stats {
  return cache.getStats();
}

// 导出缓存键常量
export { CACHE_KEYS }; 