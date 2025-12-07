'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Settings, CheckCircle, XCircle, Home, Eye, EyeOff, Save, Trash2, TestTube, Loader2 } from 'lucide-react';
import Link from 'next/link';

// 用户自定义配置接口
interface UserAPIConfig {
  accessKeyId: string; // 火山引擎 Access Key ID
  secretAccessKey: string; // 火山引擎 Secret Access Key
  useRealAPI: boolean; // 是否使用真实 API
}

// localStorage 存储的 key
const CONFIG_STORAGE_KEY = 'jimeng_api_config';

export default function AdminPage() {
  // 客户端挂载状态，用于避免 hydration mismatch
  const [mounted, setMounted] = useState(false);
  // 表单状态
  const [accessKeyId, setAccessKeyId] = useState(''); // Access Key ID 输入值
  const [secretAccessKey, setSecretAccessKey] = useState(''); // Secret Access Key 输入值
  const [useRealAPI, setUseRealAPI] = useState(true); // 是否启用真实 API
  // UI 状态
  const [showAccessKey, setShowAccessKey] = useState(false); // 是否显示 Access Key
  const [showSecretKey, setShowSecretKey] = useState(false); // 是否显示 Secret Key
  const [isSaving, setIsSaving] = useState(false); // 是否正在保存
  const [isTesting, setIsTesting] = useState(false); // 是否正在测试
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null); // 测试结果
  const [saveMessage, setSaveMessage] = useState<string | null>(null); // 保存消息

  // 页面加载时设置挂载状态并从 localStorage 读取配置
  useEffect(() => {
    setMounted(true); // 标记客户端已挂载
    loadConfig(); // 加载配置
  }, []);

  // 从 localStorage 加载配置
  const loadConfig = () => {
    try {
      const savedConfig = localStorage.getItem(CONFIG_STORAGE_KEY); // 读取存储的配置
      if (savedConfig) {
        const config: UserAPIConfig = JSON.parse(savedConfig); // 解析 JSON
        setAccessKeyId(config.accessKeyId || ''); // 设置 Access Key ID
        setSecretAccessKey(config.secretAccessKey || ''); // 设置 Secret Access Key
        setUseRealAPI(config.useRealAPI ?? true); // 设置是否使用真实 API
      }
    } catch (error) {
      console.error('加载配置失败:', error); // 记录错误日志
    }
  };

  // 保存配置到 localStorage
  const saveConfig = () => {
    setIsSaving(true); // 开始保存
    setSaveMessage(null); // 清空保存消息

    try {
      const config: UserAPIConfig = {
        accessKeyId: accessKeyId.trim(), // 去除首尾空格
        secretAccessKey: secretAccessKey.trim(), // 去除首尾空格
        useRealAPI // 是否使用真实 API
      };

      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config)); // 保存到 localStorage
      setSaveMessage('配置保存成功！'); // 显示成功消息

      // 3秒后清除消息
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('保存配置失败:', error); // 记录错误日志
      setSaveMessage('配置保存失败，请重试'); // 显示失败消息
    } finally {
      setIsSaving(false); // 结束保存
    }
  };

  // 清空配置
  const clearConfig = () => {
    if (confirm('确定要清空所有配置吗？')) { // 确认对话框
      localStorage.removeItem(CONFIG_STORAGE_KEY); // 移除存储的配置
      setAccessKeyId(''); // 清空 Access Key ID
      setSecretAccessKey(''); // 清空 Secret Access Key
      setUseRealAPI(true); // 重置为默认值
      setTestResult(null); // 清空测试结果
      setSaveMessage('配置已清空'); // 显示清空消息
      setTimeout(() => setSaveMessage(null), 3000); // 3秒后清除消息
    }
  };

  // 测试 API 连接
  const testConnection = async () => {
    if (!accessKeyId || !secretAccessKey) { // 检查必填项
      setTestResult({ success: false, message: '请先填写 Access Key ID 和 Secret Access Key' });
      return;
    }

    setIsTesting(true); // 开始测试
    setTestResult(null); // 清空之前的测试结果

    try {
      const response = await fetch('/api/test-jimeng', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Access-Key-Id': accessKeyId.trim(), // 传递 Access Key ID
          'X-Secret-Access-Key': secretAccessKey.trim() // 传递 Secret Access Key
        },
        body: JSON.stringify({ prompt: '一只可爱的柴犬，开心表情' }) // 测试用的 prompt
      });

      const data = await response.json(); // 解析响应

      if (data.success) {
        setTestResult({ success: true, message: `API 连接成功！已生成 ${data.data?.imageCount || 0} 张图片` });
      } else {
        setTestResult({ success: false, message: data.error || 'API 连接失败' });
      }
    } catch (error) {
      console.error('测试连接失败:', error); // 记录错误日志
      setTestResult({ success: false, message: error instanceof Error ? error.message : '测试连接失败' });
    } finally {
      setIsTesting(false); // 结束测试
    }
  };

  // 检查配置是否完整
  const isConfigComplete = accessKeyId.trim() !== '' && secretAccessKey.trim() !== '';

  // 客户端未挂载时显示加载骨架屏，避免 hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header skeleton */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
                <div className="h-9 w-48 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="h-5 w-80 bg-gray-200 rounded mt-2 animate-pulse" />
          </div>
          {/* Card skeleton */}
          <div className="bg-white rounded-xl border p-6 mb-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
          {/* Loading indicator */}
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
            <span className="ml-2 text-gray-600">加载配置中...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <Settings className="w-8 h-8 text-indigo-600" />
              即梦AI API配置
            </h1>
            <Link href="/">
              <Button variant="outline" className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                返回主页
              </Button>
            </Link>
          </div>
          <p className="text-gray-600 mt-2">配置您自己的火山引擎 API 密钥以使用即梦AI生成表情包</p>
        </div>

        {/* API Configuration Form */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              API 密钥配置
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Access Key ID 输入框 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Access Key ID <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    type={showAccessKey ? 'text' : 'password'}
                    value={accessKeyId}
                    onChange={(e) => setAccessKeyId(e.target.value)}
                    placeholder="请输入火山引擎 Access Key ID"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAccessKey(!showAccessKey)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showAccessKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500">在火山引擎控制台获取您的 Access Key ID</p>
              </div>

              {/* Secret Access Key 输入框 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Secret Access Key <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    type={showSecretKey ? 'text' : 'password'}
                    value={secretAccessKey}
                    onChange={(e) => setSecretAccessKey(e.target.value)}
                    placeholder="请输入火山引擎 Secret Access Key"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecretKey(!showSecretKey)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showSecretKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500">在火山引擎控制台获取您的 Secret Access Key</p>
              </div>

              {/* 启用真实 API 开关 */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-medium text-gray-700">启用真实 API 模式</span>
                  <p className="text-xs text-gray-500 mt-1">
                    开启后将调用即梦AI生成真实图片，关闭则使用演示占位图
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useRealAPI}
                    onChange={(e) => setUseRealAPI(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {/* 配置状态指示器 */}
              <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50">
                {isConfigComplete ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-green-700 font-medium">配置完整</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-red-500" />
                    <span className="text-red-600 font-medium">配置不完整，请填写所有必填项</span>
                  </>
                )}
              </div>

              {/* 保存/测试消息 */}
              {saveMessage && (
                <div className={`p-3 rounded-lg ${saveMessage.includes('成功') || saveMessage.includes('清空') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {saveMessage}
                </div>
              )}

              {/* 测试结果 */}
              {testResult && (
                <div className={`p-4 rounded-lg border ${testResult.success ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                  <div className="flex items-center gap-2">
                    {testResult.success ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                    <span className="font-medium">{testResult.success ? '测试成功' : '测试失败'}</span>
                  </div>
                  <p className="mt-1 text-sm">{testResult.message}</p>
                </div>
              )}

              {/* 操作按钮 */}
              <div className="flex flex-wrap gap-3 pt-4">
                <Button
                  onClick={saveConfig}
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? '保存中...' : '保存配置'}
                </Button>

                <Button
                  onClick={testConnection}
                  disabled={isTesting || !isConfigComplete}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <TestTube className="w-4 h-4" />
                  {isTesting ? '测试中...' : '测试连接'}
                </Button>

                <Button
                  onClick={clearConfig}
                  variant="outline"
                  className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                  清空配置
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 获取密钥指南 */}
        <Card>
          <CardHeader>
            <CardTitle>如何获取 API 密钥</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-800 mb-2">步骤说明</h4>
                <ol className="space-y-3 text-sm text-gray-600 list-decimal list-inside">
                  <li>登录 <a href="https://console.volcengine.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">火山引擎控制台</a></li>
                  <li>进入「访问控制」-「访问密钥」页面</li>
                  <li>点击「创建访问密钥」生成新的密钥对</li>
                  <li>复制 Access Key ID 和 Secret Access Key 到上方表单</li>
                  <li>确保已开通「即梦AI」服务并有足够的使用额度</li>
                </ol>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <h4 className="font-medium text-amber-800 mb-2">⚠️ 安全提示</h4>
                <ul className="space-y-1 text-sm text-amber-700">
                  <li>• API 密钥仅存储在您的浏览器本地，不会上传到服务器</li>
                  <li>• 请勿在公共设备上保存您的 API 密钥</li>
                  <li>• 如怀疑密钥泄露，请立即在火山引擎控制台重新生成</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-gray-800 mb-2">API 模式说明</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• <strong>真实模式</strong>: 调用即梦AI生成真实图片，会消耗您的 API 额度</li>
                  <li>• <strong>演示模式</strong>: 使用占位符图片，不消耗 API 额度，适合测试功能</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}