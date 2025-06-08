
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { testDatabaseConnectionAction } from './actions';

export default function DatabaseConfigPage() {
  const [dbUrl, setDbUrl] = useState('');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult('正在测试连接...');
    setIsSuccess(null);

    const result = await testDatabaseConnectionAction(dbUrl);

    setTestResult(result.message);
    setIsSuccess(result.success);
    setIsTesting(false);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-primary">数据库配置</h1>
      <div className="max-w-xl mx-auto bg-card p-6 rounded-lg shadow-md">
        <div className="mb-6">
          <Label htmlFor="dbUrl" className="block text-sm font-medium mb-1">
            数据库连接字符串 (PostgreSQL)
          </Label>
          <Input
            type="text"
            id="dbUrl"
            className="h-10"
            value={dbUrl}
            onChange={(e) => setDbUrl(e.target.value)}
            placeholder="postgresql://user:password@host:port/database"
          />
          <p className="text-xs text-muted-foreground mt-1">
            输入您的 PostgreSQL 数据库连接 URL。
          </p>
        </div>
        <Button
          onClick={handleTestConnection}
          disabled={isTesting || !dbUrl}
          className="w-full"
        >
          {isTesting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              测试中...
            </>
          ) : (
            '测试连接'
          )}
        </Button>
        {testResult && (
          <Alert className="mt-6" variant={isSuccess === null ? "default" : isSuccess ? "default" : "destructive"}>
            {isSuccess === true && <CheckCircle className="h-4 w-4" />}
            {isSuccess === false && <AlertCircle className="h-4 w-4" />}
            <AlertTitle>{isSuccess === null ? "测试结果" : isSuccess ? "成功" : "失败"}</AlertTitle>
            <AlertDescription className="whitespace-pre-wrap break-all">
              {testResult}
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
