import { Pool } from 'pg';
import { EventEmitter } from 'events';

export interface QueryMetrics {
  query: string;
  duration: number;
  timestamp: Date;
  success: boolean;
  error?: string;
}

export interface PoolMetrics {
  totalConnections: number;
  idleConnections: number;
  waitingClients: number;
  timestamp: Date;
}

export class DatabaseMonitor extends EventEmitter {
  private pool: Pool;
  private metrics: {
    queries: QueryMetrics[];
    pool: PoolMetrics[];
  };
  private maxMetricsHistory: number;

  constructor(pool: Pool, maxMetricsHistory: number = 1000) {
    super();
    this.pool = pool;
    this.maxMetricsHistory = maxMetricsHistory;
    this.metrics = {
      queries: [],
      pool: [],
    };

    this.startMonitoring();
  }

  private startMonitoring(): void {
    // 监控查询性能
    const originalQuery = this.pool.query.bind(this.pool);
    this.pool.query = async (queryText: string | { text: string }, ...params: any[]) => {
      const startTime = Date.now();
      const query = typeof queryText === 'string' ? queryText : queryText.text;
      
      try {
        const result = await originalQuery(queryText, ...params);
        this.recordQueryMetrics({
          query,
          duration: Date.now() - startTime,
          timestamp: new Date(),
          success: true,
        });
        return result;
      } catch (error: any) {
        this.recordQueryMetrics({
          query,
          duration: Date.now() - startTime,
          timestamp: new Date(),
          success: false,
          error: error.message,
        });
        throw error;
      }
    };

    // 定期收集连接池指标
    setInterval(() => this.collectPoolMetrics(), 5000);
  }

  private recordQueryMetrics(metrics: QueryMetrics): void {
    this.metrics.queries.push(metrics);
    if (this.metrics.queries.length > this.maxMetricsHistory) {
      this.metrics.queries.shift();
    }
    this.emit('query', metrics);
  }

  private async collectPoolMetrics(): Promise<void> {
    const metrics: PoolMetrics = {
      totalConnections: this.pool.totalCount,
      idleConnections: this.pool.idleCount,
      waitingClients: this.pool.waitingCount,
      timestamp: new Date(),
    };

    this.metrics.pool.push(metrics);
    if (this.metrics.pool.length > this.maxMetricsHistory) {
      this.metrics.pool.shift();
    }
    this.emit('pool', metrics);
  }

  getQueryMetrics(timeWindow?: number): QueryMetrics[] {
    if (!timeWindow) {
      return [...this.metrics.queries];
    }

    const cutoff = Date.now() - timeWindow;
    return this.metrics.queries.filter(m => m.timestamp.getTime() > cutoff);
  }

  getPoolMetrics(timeWindow?: number): PoolMetrics[] {
    if (!timeWindow) {
      return [...this.metrics.pool];
    }

    const cutoff = Date.now() - timeWindow;
    return this.metrics.pool.filter(m => m.timestamp.getTime() > cutoff);
  }

  getSlowQueries(threshold: number = 1000): QueryMetrics[] {
    return this.metrics.queries.filter(m => m.duration > threshold);
  }

  getFailedQueries(): QueryMetrics[] {
    return this.metrics.queries.filter(m => !m.success);
  }

  getAverageQueryDuration(timeWindow?: number): number {
    const queries = this.getQueryMetrics(timeWindow);
    if (queries.length === 0) return 0;

    const totalDuration = queries.reduce((sum, m) => sum + m.duration, 0);
    return totalDuration / queries.length;
  }

  getQueryCount(timeWindow?: number): number {
    return this.getQueryMetrics(timeWindow).length;
  }

  getErrorRate(timeWindow?: number): number {
    const queries = this.getQueryMetrics(timeWindow);
    if (queries.length === 0) return 0;

    const failedQueries = queries.filter(m => !m.success).length;
    return failedQueries / queries.length;
  }

  clearMetrics(): void {
    this.metrics = {
      queries: [],
      pool: [],
    };
  }
} 