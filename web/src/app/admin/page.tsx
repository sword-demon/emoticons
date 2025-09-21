'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, CheckCircle, XCircle, AlertTriangle, Home } from 'lucide-react';
import Link from 'next/link';

interface APIConfig {
  hasAccessKey: boolean;
  hasSecretKey: boolean;
  useRealAPI: boolean;
  configComplete: boolean;
}

export default function AdminPage() {
  const [config, setConfig] = useState<APIConfig | null>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/test-jimeng');
      const data = await response.json();
      setConfig(data.config);
    } catch (error) {
      console.error('获取配置失败:', error);
    }
  };

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="w-5 h-5 text-green-600" />
    ) : (
      <XCircle className="w-5 h-5 text-red-600" />
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <Settings className="w-8 h-8 text-indigo-600" />
              即梦AI集成管理
            </h1>
            <Link href="/">
              <Button variant="outline" className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                返回主页
              </Button>
            </Link>
          </div>
          <p className="text-gray-600 mt-2">管理即梦AI API集成状态和测试功能</p>
        </div>

        {/* Configuration Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              配置状态
            </CardTitle>
          </CardHeader>
          <CardContent>
            {config ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span>ACCESS_KEY_ID 配置</span>
                  {getStatusIcon(config.hasAccessKey)}
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span>SECRET_ACCESS_KEY 配置</span>
                  {getStatusIcon(config.hasSecretKey)}
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span>即梦AI真实API模式</span>
                  {config.useRealAPI ? (
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  )}
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span>整体配置状态</span>
                  {getStatusIcon(config.configComplete)}
                </div>

                {!config.useRealAPI && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2 text-yellow-800">
                      <AlertTriangle className="w-5 h-5" />
                      <span className="font-medium">当前使用演示模式</span>
                    </div>
                    <p className="text-yellow-700 mt-1">
                      要启用真实即梦AI，请在 .env 文件中设置 USE_REAL_JIMENG_API=true
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">加载配置中...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Environment Variables Guide */}
        <Card>
          <CardHeader>
            <CardTitle>环境变量配置说明</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-800 mb-2">必需的环境变量</h4>
                <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm">
                  <div>ACCESS_KEY_ID=你的火山引擎AccessKey</div>
                  <div>SECRET_ACCESS_KEY=你的火山引擎SecretKey</div>
                  <div>USE_REAL_JIMENG_API=true  # 启用真实API</div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-800 mb-2">API模式说明</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• <strong>演示模式</strong>: USE_REAL_JIMENG_API=false，使用占位符图片</li>
                  <li>• <strong>真实模式</strong>: USE_REAL_JIMENG_API=true，调用即梦AI生成真实图片</li>
                  <li>• <strong>回退机制</strong>: 即使在真实模式下，API失败时会自动回退到演示模式</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}