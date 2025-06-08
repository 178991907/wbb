
'use server';

import { Client } from 'pg';

interface ConnectionResult {
  success: boolean;
  message: string;
}

export async function testDatabaseConnectionAction(dbUrl: string): Promise<ConnectionResult> {
  if (!dbUrl) {
    return { success: false, message: '数据库连接字符串不能为空。' };
  }

  let client: Client | null = null;
  try {
    client = new Client({
      connectionString: dbUrl,
      ssl: {
        rejectUnauthorized: false, // 根据您的数据库提供商的 SSL 要求进行调整
      },
      connectionTimeoutMillis: 5000, // 添加连接超时
    });

    await client.connect();
    // 可选：执行一个简单查询以进一步验证连接
    // await client.query('SELECT 1');
    return { success: true, message: '数据库连接成功！' };
  } catch (error: any) {
    console.error('数据库连接测试失败 (Server Action):', error);
    return { success: false, message: `连接失败: ${error.message}` };
  } finally {
    if (client) {
      try {
        await client.end();
      } catch (closeError) {
        console.error('关闭数据库连接时出错 (Server Action):', closeError);
      }
    }
  }
}
