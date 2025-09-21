'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Lightbulb, Eye, Dice6, Sparkles, Download, Crown, Settings } from 'lucide-react';
import { processEmoticon, ProcessedEmoticon } from '@/lib/image-processing';
import { downloadWatermarkedPackage, downloadPremiumPackageProcessed } from '@/lib/download';
import Link from 'next/link';

interface GeneratedEmoticon {
  id: number;
  keyword: string;
  imageUrl: string;
}

export default function Home() {
  const [subjectDescription, setSubjectDescription] = useState('');
  const [keywords, setKeywords] = useState<string[]>(Array(16).fill(''));
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [generatedEmoticons, setGeneratedEmoticons] = useState<GeneratedEmoticon[]>([]);
  const [processedEmoticons, setProcessedEmoticons] = useState<ProcessedEmoticon[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Predefined themes for quick fill
  const quickFillThemes = {
    daily: ['开心', '难过', '愤怒', '惊讶', '尴尬', '无语', '思考', '疑问', '点赞', '比心', '拜托', '谢谢', '晚安', '早安', '加油', '崩溃'],
    work: ['摸鱼', '加班', '开会', '划水', '下班', '周一', '周五', '老板', '汇报', 'KPI', '绩效', '年终', '升职', '跳槽', '裁员', '社畜'],
    funny: ['哈哈', '憋笑', '笑哭', '翻白眼', '吐槽', '搞笑', '逗比', '沙雕', '抓狂', '无奈', '佛系', '咸鱼', '躺平', '摆烂', '内卷', '打工人'],
    emotion: ['开心', '伤心', '生气', '委屈', '感动', '害羞', '紧张', '兴奋', '失望', '后悔', '担心', '放心', '想你', '爱你', '抱抱', '亲亲']
  };

  // Character inspirations
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

  const handleQuickFill = (theme: keyof typeof quickFillThemes) => {
    const themeKeywords = quickFillThemes[theme];
    setKeywords([...themeKeywords]);
  };

  const handleRandomFill = () => {
    const allKeywords = Object.values(quickFillThemes).flat();
    const shuffled = [...allKeywords].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 16);
    setKeywords(selected);
  };

  const handleGetInspiration = () => {
    const randomInspiration = characterInspirations[Math.floor(Math.random() * characterInspirations.length)];
    setSubjectDescription(randomInspiration);
  };

  const handleKeywordChange = (index: number, value: string) => {
    if (value.length <= 10) {
      const newKeywords = [...keywords];
      newKeywords[index] = value;
      setKeywords(newKeywords);
    }
  };

  const handleGenerate = async () => {
    if (!subjectDescription.trim()) {
      alert('请输入表情包主体描述');
      return;
    }

    const filledKeywords = keywords.filter(k => k.trim());
    if (filledKeywords.length < 16) {
      alert('请填写完整的16个关键词');
      return;
    }

    setIsGenerating(true);
    try {
      // Call generate emoticons API
      const response = await fetch('/api/generate-emoticons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subjectDescription,
          keywords: filledKeywords,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setGeneratedEmoticons(result.emoticons);

        // 显示API模式和警告信息
        if (result.warning) {
          alert(`⚠️ ${result.warning}`);
        } else if (result.apiMode) {
          console.log(`🤖 API模式: ${result.apiMode === 'real' ? '真实即梦AI' : '演示模式'}`);
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
      await downloadWatermarkedPackage(processedEmoticons, subjectDescription || 'AI表情包');
      alert('下载成功！');
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

    // In a real implementation, this would trigger payment flow
    const confirmed = confirm('这将跳转到支付页面，确认购买高级版（￥9.9）？');
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

      // 使用处理好的无水印图片创建下载包
      await downloadPremiumPackageProcessed(premiumEmoticons, subjectDescription || 'AI表情包');
      alert('支付成功！高级版下载完成！');
    } catch (error) {
      console.error('Premium download failed:', error);
      alert('下载失败，请重试');
    } finally {
      setIsDownloading(false);
    }
  };

  const isFormValid = subjectDescription.trim() && keywords.filter(k => k.trim()).length === 16;

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
                <label className="block text-lg font-semibold text-gray-700 mb-3">
                  16个关键词描述
                </label>
                <p className="text-sm text-gray-600 mb-4">
                  请填写与表情包情感或动作相关的词语，例如&apos;开心大笑&apos;、&apos;思考人生&apos;、&apos;震惊的说不出话&apos;。请避免使用过于抽象或复杂的词语，确保每个词语都能清晰表达一种情绪或动作。
                </p>

                {/* Keywords Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  {keywords.map((keyword, index) => (
                    <div key={index} className="relative">
                      <Input
                        value={keyword}
                        onChange={(e) => handleKeywordChange(index, e.target.value)}
                        placeholder={`关键词${index + 1}`}
                        maxLength={10}
                        className="pr-8"
                      />
                      <div className="absolute bottom-1 right-1 text-xs text-gray-400">
                        {keyword.length}/10
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick Fill Options */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-sm text-gray-600 mr-2">快速填充：</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleQuickFill('daily')}
                  >
                    日常聊天
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleQuickFill('work')}
                  >
                    职场吐槽
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleQuickFill('funny')}
                  >
                    搞笑幽默
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleQuickFill('emotion')}
                  >
                    情感表达
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleRandomFill}
                    className="bg-purple-500 hover:bg-purple-600 text-white"
                  >
                    <Dice6 className="w-4 h-4 mr-1" />
                    随机填充关键词
                  </Button>
                </div>
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
                  {Array.from({length: 16}).map((_, index) => (
                    <div key={index} className="text-center">
                      <div className="animate-pulse">
                        <div className="w-full aspect-square bg-gray-300 rounded-lg mb-2"></div>
                        <div className="h-4 bg-gray-300 rounded w-16 mx-auto"></div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-center text-sm text-gray-500">
                  <p>⏳ 生成时间约需1-2分钟，请耐心等待...</p>
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
                  {generatedEmoticons.map((emoticon) => (
                    <div key={emoticon.id} className="text-center">
                      <div className="relative mb-2 watermark">
                        <Image
                          src={emoticon.imageUrl}
                          alt={emoticon.keyword}
                          className="w-full aspect-square object-cover rounded-lg border"
                          width={200}
                          height={200}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-white text-lg font-bold opacity-80 transform rotate-45 select-none">
                            无解
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{emoticon.keyword}</p>
                    </div>
                  ))}
                </div>

                <div className="text-center text-sm text-gray-500 mb-6">
                  <span className="inline-flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    以上为带水印预览图，下载时可选择免费水印版或付费无水印版
                  </span>
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
                    免费下载水印版
                  </Button>
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
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <style jsx>{`
        .watermark {
          position: relative;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
