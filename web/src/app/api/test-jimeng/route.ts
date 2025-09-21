import { NextRequest, NextResponse } from 'next/server';
import { createJimengClient } from '@/lib/jimeng-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt = '一只可爱的柴犬，开心表情' } = body;

    console.log('🧪 测试即梦AI API...');
    console.log('测试prompt:', prompt);

    // 尝试创建客户端
    const client = createJimengClient();
    console.log('✅ 即梦AI客户端创建成功');

    // 尝试生成单张图片
    const result = await client.generateImage({
      prompt,
      width: 512,
      height: 512,
      style: 'cartoon'
    });

    console.log('✅ API调用成功');
    console.log('完整响应数据:', JSON.stringify(result, null, 2));
    console.log('响应数据摘要:', {
      requestId: result.request_id,
      imageCount: result.data?.image_urls?.length || 0,
      hasData: !!result.data,
      responseKeys: Object.keys(result)
    });

    return NextResponse.json({
      success: true,
      message: '即梦AI API测试成功',
      data: {
        requestId: result.request_id,
        imageCount: result.data?.image_urls?.length || 0,
        hasImage: !!(result.data?.image_urls && result.data.image_urls.length > 0),
        prompt
      }
    });

  } catch (error) {
    console.error('❌ 即梦AI API测试失败:', error);

    return NextResponse.json({
      success: false,
      message: '即梦AI API测试失败',
      error: error instanceof Error ? error.message : '未知错误',
      details: {
        errorType: error instanceof Error ? error.constructor.name : 'Unknown',
        stack: error instanceof Error ? error.stack : undefined
      }
    }, { status: 500 });
  }
}

export async function GET() {
  const accessKeyId = process.env.ACCESS_KEY_ID;
  const secretAccessKey = process.env.SECRET_ACCESS_KEY;
  const useRealAPI = process.env.USE_REAL_JIMENG_API === 'true';

  console.log('🔍 Environment variables check:');
  console.log('  ACCESS_KEY_ID length:', accessKeyId?.length || 0);
  console.log('  SECRET_ACCESS_KEY length:', secretAccessKey?.length || 0);
  console.log('  ACCESS_KEY_ID starts with:', accessKeyId?.substring(0, 4) || 'undefined');
  console.log('  SECRET_ACCESS_KEY starts with:', secretAccessKey?.substring(0, 4) || 'undefined');

  return NextResponse.json({
    status: 'ready',
    config: {
      hasAccessKey: !!accessKeyId,
      hasSecretKey: !!secretAccessKey,
      useRealAPI,
      configComplete: !!accessKeyId && !!secretAccessKey
    },
    message: useRealAPI ? '当前使用真实API模式' : '当前使用演示模式',
    testEndpoint: '/api/test-jimeng (POST)',
    debug: {
      accessKeyLength: accessKeyId?.length || 0,
      secretKeyLength: secretAccessKey?.length || 0,
      accessKeyPrefix: accessKeyId?.substring(0, 4) || 'undefined',
      secretKeyPrefix: secretAccessKey?.substring(0, 4) || 'undefined'
    }
  });
}