import { NextRequest, NextResponse } from 'next/server';
import { createJimengClient } from '@/lib/jimeng-client';

interface GenerateRequest {
  subjectDescription: string;
  keywords: string[];
  options?: {
    style?: 'cartoon' | 'realistic' | 'anime' | 'cute';
    size?: 'small' | 'medium' | 'large';
    quantity?: number; // 允许自定义数量，不强制16个
    quality?: 'draft' | 'standard' | 'high';
  };
}

interface EmoticonResult {
  id: number;
  keyword: string;
  imageUrl: string;
  imageData: string | null;
  seed: number;
  status: 'success' | 'failed' | 'placeholder';
  errorMessage?: string;
}

// 环境变量控制是否使用真实API
const USE_REAL_API = process.env.USE_REAL_JIMENG_API === 'true';

// 预设的安全关键词集合
const PRESET_KEYWORDS = {
  basic: ['开心', '难过', '惊讶', '思考', '疑惑', '加油', '休息', '吃东西'],
  extended: ['开心', '难过', '惊讶', '思考', '疑惑', '加油', '休息', '吃东西', '玩耍', '生气', '害羞', '委屈', '兴奋', '无聊', '感动', '搞笑'],
  safe: ['微笑', '快乐', '惊喜', '思考', '疑惑', '加油', '休息', '吃东西', '玩耍', '开心', '害羞', '委屈', '兴奋', '无聊', '感动', '搞笑']
};

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();
    const { subjectDescription, keywords, options = {} } = body;

    // 更灵活的验证逻辑
    if (!subjectDescription) {
      return NextResponse.json(
        { error: '请提供主体描述', example: '例如：一只可爱的小猫咪' },
        { status: 400 }
      );
    }

    if (!keywords || keywords.length === 0) {
      return NextResponse.json(
        {
          error: '请提供关键词',
          suggestion: '可以使用预设关键词',
          presets: PRESET_KEYWORDS
        },
        { status: 400 }
      );
    }

    // 限制关键词数量在合理范围内
    const maxKeywords = 24;
    const minKeywords = 1;
    if (keywords.length > maxKeywords) {
      return NextResponse.json(
        { error: `关键词数量不能超过${maxKeywords}个，当前：${keywords.length}个` },
        { status: 400 }
      );
    }

    if (keywords.length < minKeywords) {
      return NextResponse.json(
        { error: `至少需要${minKeywords}个关键词` },
        { status: 400 }
      );
    }

    // 解析选项
    const {
      style = 'cartoon',
      size = 'medium',
      quantity = keywords.length,
      quality = 'standard'
    } = options;

    console.log('开始生成表情包:', {
      subjectDescription,
      keywordsCount: keywords.length,
      quantity,
      style,
      size,
      quality
    });

    let emoticons: EmoticonResult[] = [];
    let successCount = 0;
    let failedCount = 0;

    if (USE_REAL_API) {
      // 使用真实的即梦AI API
      try {
        console.log('调用即梦AI API...');
        const jimengClient = createJimengClient();

        // 取前quantity个关键词进行生成
        const targetKeywords = keywords.slice(0, quantity);
        const results = await jimengClient.generateEmoticonBatch(subjectDescription, targetKeywords);

        emoticons = results.map((result, index) => {
          const isSuccess = result.imageBase64 && result.imageBase64.length > 0;

          if (isSuccess) {
            successCount++;
            return {
              id: index + 1,
              keyword: result.keyword,
              imageUrl: result.imageBase64,
              imageData: result.imageBase64,
              seed: result.seed,
              status: 'success' as const
            };
          } else {
            failedCount++;
            return {
              id: index + 1,
              keyword: result.keyword,
              imageUrl: `https://via.placeholder.com/512x512/ff6b6b/white?text=${encodeURIComponent(result.keyword)}`,
              imageData: null,
              seed: 0,
              status: 'failed' as const,
              errorMessage: '图片生成失败'
            };
          }
        });

        console.log(`即梦AI生成完成 - 成功：${successCount}张，失败：${failedCount}张`);
      } catch (apiError) {
        console.error('即梦AI API调用失败:', apiError);

        // API调用失败时使用占位符
        emoticons = keywords.slice(0, quantity).map((keyword, index) => ({
          id: index + 1,
          keyword,
          imageUrl: `https://via.placeholder.com/512x512/ff6b6b/white?text=${encodeURIComponent(keyword)}`,
          imageData: null,
          seed: 0,
          status: 'failed' as const,
          errorMessage: 'API服务暂时不可用'
        }));

        return NextResponse.json({
          success: false,
          emoticons,
          error: '即梦AI服务暂时不可用',
          details: apiError instanceof Error ? apiError.message : '未知错误',
          suggestion: '请稍后重试或检查网络连接'
        }, { status: 503 });
      }
    } else {
      // 使用模拟数据进行开发和测试
      console.log('使用模拟数据...');
      await new Promise(resolve => setTimeout(resolve, Math.min(quantity * 200, 3000))); // 模拟API延迟

      emoticons = keywords.slice(0, quantity).map((keyword, index) => ({
        id: index + 1,
        keyword,
        imageUrl: `https://via.placeholder.com/512x512/667eea/white?text=${encodeURIComponent(keyword)}`,
        imageData: null,
        seed: Math.floor(Math.random() * 1000000),
        status: 'placeholder' as const
      }));

      successCount = quantity;
      console.log('模拟数据生成完成');
    }

    // 计算生成统计
    const statistics = {
      total: quantity,
      success: successCount,
      failed: failedCount,
      successRate: Math.round((successCount / quantity) * 100)
    };

    return NextResponse.json({
      success: true,
      emoticons,
      statistics,
      metadata: {
        subjectDescription,
        totalKeywords: keywords.length,
        generated: quantity,
        apiMode: USE_REAL_API ? 'real' : 'mock',
        options: { style, size, quality },
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('生成表情包时发生错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: '生成表情包失败',
        details: error instanceof Error ? error.message : '未知错误',
        suggestion: '请检查请求参数是否正确'
      },
      { status: 500 }
    );
  }
}

// 获取预设关键词和配置信息
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (action === 'presets') {
    return NextResponse.json({
      presets: PRESET_KEYWORDS,
      recommendations: {
        basic: '适合快速测试，8个基础表情',
        extended: '完整表情包，16个丰富表情',
        safe: '内容安全优化，通过率更高'
      }
    });
  }

  if (action === 'config') {
    return NextResponse.json({
      limits: {
        maxKeywords: 24,
        minKeywords: 1,
        recommendedCount: 16
      },
      styles: ['cartoon', 'realistic', 'anime', 'cute'],
      sizes: ['small', 'medium', 'large'],
      qualities: ['draft', 'standard', 'high']
    });
  }

  // 默认健康检查
  return NextResponse.json({
    status: 'ok',
    apiMode: USE_REAL_API ? 'real' : 'mock',
    version: '1.1.0',
    endpoints: {
      'POST /': '生成表情包',
      'GET /?action=presets': '获取预设关键词',
      'GET /?action=config': '获取配置信息'
    },
    timestamp: new Date().toISOString()
  });
}