'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Lightbulb, Eye, Sparkles, Download, Crown, Settings, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { processEmoticon, ProcessedEmoticon } from '@/lib/image-processing';
import { downloadWatermarkedPackage, downloadPremiumPackageProcessed } from '@/lib/download';
import { downloadSimplePackage } from '@/lib/download-simple';
import KeywordSelector from '@/components/KeywordSelector';
import Link from 'next/link';

interface GeneratedEmoticon {
  id: number; // 表情包 ID
  keyword: string; // 关键词
  imageUrl: string; // 图片 URL
}

// 用户自定义配置接口
interface UserAPIConfig {
  accessKeyId: string; // 火山引擎 Access Key ID
  secretAccessKey: string; // 火山引擎 Secret Access Key
  useRealAPI: boolean; // 是否使用真实 API
}

// localStorage 存储的 key
const CONFIG_STORAGE_KEY = 'jimeng_api_config';

// 从 localStorage 获取用户配置
function getUserAPIConfig(): UserAPIConfig | null {
  if (typeof window === 'undefined') return null; // SSR 环境下返回 null
  
  try {
    const savedConfig = localStorage.getItem(CONFIG_STORAGE_KEY); // 读取存储的配置
    if (savedConfig) {
      return JSON.parse(savedConfig) as UserAPIConfig; // 解析 JSON
    }
  } catch (error) {
    console.error('读取用户配置失败:', error); // 记录错误日志
  }
  return null;
}

export default function Home() {
  const [subjectDescription, setSubjectDescription] = useState('');
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [generatedEmoticons, setGeneratedEmoticons] = useState<GeneratedEmoticon[]>([]);
  const [processedEmoticons, setProcessedEmoticons] = useState<ProcessedEmoticon[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Character inspirations for subject description
  const characterInspirations = [
    '一只戴着眼镜的黄色柴犬',
    '穿着白衬衫的可爱橘猫',
    '戴帽子的小熊猫',
    '穿西装的企鹅先生',
    '戴口罩的小白兔',
    '穿校服的二次元少女',
    '戴眼镜的程序员',
    '穿围裙的家庭主妇',
    '戴帽子的小男孩',
    '长发飘飘的古装美女',
    '肌肉发达的健身教练',
    '戴领带的商务人士',
    '穿医生白大褂的专业人士',
    '戴贝雷帽的艺术家',
    '穿厨师服的美食家',
    '戴安全帽的建筑工人',
    '穿消防服的英雄',
    '戴皇冠的小公主',
    '穿和服的日本女性',
    '戴牛仔帽的西部牛仔',
    '穿太空服的宇航员',
    '戴魔法帽的小巫师',
    '穿护士服的天使',
    '戴船长帽的航海家',
    '穿超级英雄服装的正义使者'
  ];

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('文件大小不能超过5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageDataUrl = e.target?.result as string;
      setPreviewImage(imageDataUrl);

      // Call image recognition API
      setIsRecognizing(true);
      try {
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch('/api/recognize-image', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (result.success) {
          setSubjectDescription(result.description);
        } else {
          throw new Error(result.error || '识别失败');
        }
      } catch (error) {
        console.error('Image recognition failed:', error);
        alert('图片识别失败，请重试');
      } finally {
        setIsRecognizing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGetInspiration = () => {
    const randomInspiration = characterInspirations[Math.floor(Math.random() * characterInspirations.length)];
    setSubjectDescription(randomInspiration);
  };

  // 图片轮播相关函数
  const handleImageClick = (index: number) => {
    setCurrentImageIndex(index);
    setShowImageModal(true);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? generatedEmoticons.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === generatedEmoticons.length - 1 ? 0 : prev + 1
    );
  };

  const handleCloseModal = () => {
    setShowImageModal(false);
  };

  // 键盘事件处理
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showImageModal) return;

      if (e.key === 'ArrowLeft') {
        setCurrentImageIndex((prev) =>
          prev === 0 ? generatedEmoticons.length - 1 : prev - 1
        );
      } else if (e.key === 'ArrowRight') {
        setCurrentImageIndex((prev) =>
          prev === generatedEmoticons.length - 1 ? 0 : prev + 1
        );
      } else if (e.key === 'Escape') {
        setShowImageModal(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showImageModal, generatedEmoticons.length]);

  const handleGenerate = async () => {
    if (!subjectDescription.trim()) {
      alert('请输入表情包主体描述');
      return;
    }

    if (selectedKeywords.length === 0) {
      alert('请至少选择1个关键词');
      return;
    }

    setIsGenerating(true);
    try {
      // 获取用户配置
      const userConfig = getUserAPIConfig();
      
      // 构建请求头
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // 如果用户配置了自定义 API 密钥，添加到请求头
      if (userConfig?.accessKeyId && userConfig?.secretAccessKey && userConfig?.useRealAPI) {
        headers['X-Access-Key-Id'] = userConfig.accessKeyId; // 添加用户自定义 Access Key
        headers['X-Secret-Access-Key'] = userConfig.secretAccessKey; // 添加用户自定义 Secret Key
        console.log('🔑 使用用户自定义 API 密钥');
      }

      // Call generate emoticons API
      const response = await fetch('/api/generate-emoticons', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          subjectDescription,
          keywords: selectedKeywords,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setGeneratedEmoticons(result.emoticons);

        // 显示API模式和警告信息
        if (result.warning) {
          alert(`⚠️ ${result.warning}`);
        } else if (result.metadata?.apiMode) {
          const modeText = result.metadata.apiMode === 'real' ? '真实即梦AI' : '演示模式';
          const keySource = result.metadata.usingCustomKeys ? '(自定义密钥)' : '(服务器密钥)';
          console.log(`🤖 API模式: ${modeText} ${result.metadata.usingCustomKeys ? keySource : ''}`);
        }

        // Process emoticons for download
        const processed = await Promise.all(
          result.emoticons.map(async (emoticon: GeneratedEmoticon) => {
            return await processEmoticon(emoticon.imageUrl, emoticon.keyword, true);
          })
        );
        setProcessedEmoticons(processed);
        setShowPreview(true);
      } else {
        throw new Error(result.error || '生成失败');
      }
    } catch (error) {
      console.error('Generation failed:', error);
      alert('生成失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadWatermarked = async () => {
    if (processedEmoticons.length === 0) {
      alert('请先生成表情包');
      return;
    }

    setIsDownloading(true);
    try {
      if (processedEmoticons.length === 16) {
        // 16张按微信表情包规范下载
        await downloadWatermarkedPackage(processedEmoticons, subjectDescription || 'AI表情包');
        alert('下载成功！已按微信表情包规范打包。');
      } else {
        // 其他数量按普通方式下载
        await downloadSimplePackage(processedEmoticons, subjectDescription || 'AI表情包');
        alert(`下载成功！已下载 ${processedEmoticons.length} 张表情包。`);
      }
    } catch (error) {
      console.error('Download failed:', error);
      alert('下载失败，请重试');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadPremium = async () => {
    if (generatedEmoticons.length === 0) {
      alert('请先生成表情包');
      return;
    }

    let confirmMessage = '';
    if (generatedEmoticons.length === 16) {
      confirmMessage = '这将跳转到支付页面，确认购买高级版（￥9.9）？\n16张表情包将按微信规范打包';
    } else {
      confirmMessage = `这将跳转到支付页面，确认购买无水印版（￥6.6）？\n${generatedEmoticons.length}张表情包无水印下载`;
    }

    const confirmed = confirm(confirmMessage);
    if (!confirmed) return;

    setIsDownloading(true);
    try {
      // Mock payment success - in production this would be handled by payment gateway
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 重新处理原始图片，生成无水印版本
      console.log('开始处理无水印版本...');
      const premiumEmoticons = await Promise.all(
        generatedEmoticons.map(async (emoticon) => {
          // 使用原始图片URL生成无水印版本
          return await processEmoticon(emoticon.imageUrl, emoticon.keyword, false); // false = 不加水印
        })
      );

      if (generatedEmoticons.length === 16) {
        // 16张按微信规范下载
        await downloadPremiumPackageProcessed(premiumEmoticons, subjectDescription || 'AI表情包');
        alert('支付成功！高级版下载完成！');
      } else {
        // 非16张按普通方式下载无水印版本
        await downloadSimplePackage(premiumEmoticons, subjectDescription || 'AI表情包');
        alert(`支付成功！已下载 ${premiumEmoticons.length} 张无水印表情包！`);
      }
    } catch (error) {
      console.error('Premium download failed:', error);
      alert('下载失败，请重试');
    } finally {
      setIsDownloading(false);
    }
  };

  const isFormValid = subjectDescription.trim() && selectedKeywords.length >= 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-8 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-3">
                <Sparkles className="w-8 h-8" />
                AI表情包生成器
              </h1>
              <p className="text-lg opacity-90">V3.0 - 智能图片识别，一键生成专属表情包</p>
            </div>
            <Link href="/admin">
              <Button variant="outline" className="bg-white/10 hover:bg-white/20 border-white/30 text-white flex items-center gap-2">
                <Settings className="w-4 h-4" />
                API管理
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Input Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-800 flex items-center gap-2">
                <Eye className="w-6 h-6 text-indigo-600" />
                创建你的表情包
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Subject Description Section */}
              <div className="mb-8">
                <label className="block text-lg font-semibold text-gray-700 mb-3">
                  表情包主体描述
                </label>
                <p className="text-sm text-gray-600 mb-4">
                  请尽可能具体地描述表情包主角的及其主要特征，例如&apos;一只戴着眼镜的黄色柴犬&apos;，这将影响AI生成的基础形象
                </p>

                {/* Image Upload and Inspiration */}
                <div className="mb-4">
                  <div className="flex flex-col sm:flex-row gap-3 items-start">
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      上传图片识别主体
                    </Button>
                    <Button
                      onClick={handleGetInspiration}
                      variant="outline"
                      className="flex items-center gap-2 bg-orange-500 text-white hover:bg-orange-600"
                    >
                      <Lightbulb className="w-4 h-4" />
                      需要灵感?
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileUpload}
                    />
                    {previewImage && (
                      <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-gray-300">
                        <Image src={previewImage} className="w-full h-full object-cover" alt="预览图" width={64} height={64} />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    支持JPG/PNG格式，文件大小不超过5MB，或点击&quot;需要灵感?&quot;让AI为您推荐有趣的角色
                  </p>
                </div>

                {/* Text Input */}
                <div className="relative">
                  <Textarea
                    value={subjectDescription}
                    onChange={(e) => setSubjectDescription(e.target.value)}
                    className="resize-none"
                    rows={3}
                    maxLength={50}
                    placeholder="例如：简单背景，穿着黑色短袖的男人 (或上传图片试试)"
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                    {subjectDescription.length}/50
                  </div>
                  {isRecognizing && (
                    <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center rounded-lg">
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mr-3"></div>
                        <span className="text-gray-600">AI正在识别图片...</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Keywords Section */}
              <div className="mb-8">
                <KeywordSelector
                  selectedKeywords={selectedKeywords}
                  onKeywordsChange={setSelectedKeywords}
                  maxSelection={16}
                />
              </div>

              {/* Generate Button */}
              <div className="text-center">
                <Button
                  onClick={handleGenerate}
                  disabled={!isFormValid || isGenerating}
                  size="lg"
                  className="px-8 py-3 text-lg font-semibold"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      生成中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      生成预览图
                    </>
                  )}
                </Button>
                {isGenerating && (
                  <p className="mt-4 text-gray-600">AI正在生成表情包，请稍候...</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Loading Section */}
          {isGenerating && (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-gray-800 flex items-center gap-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                  AI正在生成表情包...
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <p className="text-gray-600 mb-4">请稍候，AI正在为您创作专属表情包</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                  </div>
                </div>

                {/* Skeleton Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {Array.from({length: selectedKeywords.length}).map((_, index) => (
                    <div key={index} className="text-center">
                      <div className="animate-pulse">
                        <div className="w-full aspect-square bg-gray-300 rounded-lg mb-2"></div>
                        <div className="h-4 bg-gray-300 rounded w-16 mx-auto"></div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-center text-sm text-gray-500">
                  <p>⏳ 正在生成 {selectedKeywords.length} 张表情包，预计需要 {Math.ceil(selectedKeywords.length * 8 / 60)} 分钟，请耐心等待...</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Preview Section */}
          {showPreview && !isGenerating && (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-gray-800 flex items-center gap-2">
                  <Eye className="w-6 h-6 text-indigo-600" />
                  预览效果
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Preview Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {generatedEmoticons.map((emoticon, index) => (
                    <div key={emoticon.id} className="text-center">
                      <div
                        className="relative mb-2 watermark cursor-pointer transform transition-transform hover:scale-105"
                        onClick={() => handleImageClick(index)}
                      >
                        <Image
                          src={emoticon.imageUrl}
                          alt={emoticon.keyword}
                          className="w-full aspect-square object-cover rounded-lg border"
                          width={200}
                          height={200}
                          style={{ width: 'auto', height: 'auto' }}
                          unoptimized
                          onError={(e) => {
                            console.error(`Image failed to load: ${emoticon.imageUrl}`);
                            e.currentTarget.style.backgroundColor = '#f3f4f6';
                            e.currentTarget.style.display = 'flex';
                            e.currentTarget.style.alignItems = 'center';
                            e.currentTarget.style.justifyContent = 'center';
                            e.currentTarget.innerHTML = `<span style="color: #6b7280; font-size: 14px;">图片加载失败</span>`;
                          }}
                          onLoad={() => {
                            console.log(`Image loaded successfully: ${emoticon.imageUrl}`);
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <span className="text-white text-lg font-bold opacity-30 transform rotate-45 select-none drop-shadow-lg">
                            无解
                          </span>
                        </div>
                        <div className="absolute inset-0 rounded-lg transition-all duration-200 flex items-center justify-center">{/* 移除所有背景色，只保留eye图标显示 */}
                          <Eye className="w-6 h-6 text-white opacity-0 hover:opacity-100 transition-opacity duration-200" />
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{emoticon.keyword}</p>
                    </div>
                  ))}
                </div>

                <div className="text-center text-sm text-gray-500 mb-6">
                  <span className="inline-flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    以上为带水印预览图，下载时可选择免费版或付费无水印版
                  </span>
                  {generatedEmoticons.length === 16 && (
                    <p className="mt-2 text-blue-600">
                      🎯 16张表情包可按微信表情包规范下载，支持直接上传微信
                    </p>
                  )}
                  {generatedEmoticons.length !== 16 && (
                    <p className="mt-2 text-orange-600">
                      📦 {generatedEmoticons.length}张表情包将按普通格式下载，适用于各种聊天软件
                    </p>
                  )}
                </div>

                {/* Download Options */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleDownloadWatermarked}
                    disabled={isDownloading}
                    className="flex items-center gap-2"
                  >
                    {isDownloading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    {generatedEmoticons.length === 16
                      ? '免费下载（微信规范）'
                      : `免费下载（${generatedEmoticons.length}张）`
                    }
                  </Button>

                  {generatedEmoticons.length === 16 && (
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 flex items-center gap-2"
                      onClick={handleDownloadPremium}
                      disabled={isDownloading}
                    >
                      {isDownloading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      ) : (
                        <Crown className="w-4 h-4" />
                      )}
                      ￥9.9 解锁高清无水印版
                    </Button>
                  )}

                  {generatedEmoticons.length !== 16 && (
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 flex items-center gap-2"
                      onClick={handleDownloadPremium}
                      disabled={isDownloading}
                    >
                      {isDownloading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      ) : (
                        <Crown className="w-4 h-4" />
                      )}
                      ￥6.6 解锁无水印版
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Image Modal */}
      {showImageModal && generatedEmoticons.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full bg-white rounded-lg overflow-hidden">
            {/* Close button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75 transition-all"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Previous button */}
            {generatedEmoticons.length > 1 && (
              <button
                onClick={handlePrevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75 transition-all"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Next button */}
            {generatedEmoticons.length > 1 && (
              <button
                onClick={handleNextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75 transition-all"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}

            {/* Image content */}
            <div className="flex flex-col items-center p-6">
              <div className="relative mb-4">
                <Image
                  src={generatedEmoticons[currentImageIndex].imageUrl}
                  alt={generatedEmoticons[currentImageIndex].keyword}
                  className="max-w-full max-h-96 object-contain rounded-lg"
                  width={400}
                  height={400}
                  style={{ width: 'auto', height: 'auto' }}
                  unoptimized
                  onError={() => {
                    console.error(`Modal image failed to load: ${generatedEmoticons[currentImageIndex].imageUrl}`);
                  }}
                />
                {/* Watermark overlay for modal view */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-white text-2xl font-bold opacity-60 transform rotate-45 select-none">
                    无解
                  </span>
                </div>
              </div>

              {/* Image info */}
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {generatedEmoticons[currentImageIndex].keyword}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  第 {currentImageIndex + 1} 张，共 {generatedEmoticons.length} 张
                </p>

                {/* Navigation dots */}
                {generatedEmoticons.length > 1 && (
                  <div className="flex justify-center space-x-2">
                    {generatedEmoticons.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentImageIndex
                            ? 'bg-blue-500'
                            : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Keyboard hints */}
              <div className="text-xs text-gray-500 mt-4 text-center">
                使用 ← → 键切换图片，ESC 键关闭
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Buy me a coffee section */}
      <section className="bg-gradient-to-r from-amber-50 to-orange-50 py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center">
            <h3 className="text-2xl font-bold text-amber-800 mb-4">
              ☕ 如果觉得可以，buy me a coffee!
            </h3>
            <p className="text-amber-700 mb-6">
              您的支持是我继续优化产品的动力 ❤️
            </p>
            <div className="bg-white rounded-lg shadow-lg p-6 inline-block">
              <Image
                src="/images/wechat_pay.jpg"
                alt="微信收款码"
                width={200}
                height={200}
                className="rounded-lg mx-auto"
              />
              <p className="text-sm text-gray-600 mt-4">
                微信扫码支持开发者
              </p>
            </div>
            <p className="text-xs text-amber-600 mt-4">
              🙏 感谢每一份支持，让AI表情包生成器变得更好
            </p>
          </div>
        </div>
      </section>

      <style jsx>{`
        .watermark {
          position: relative;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
