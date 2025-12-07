// 即梦AI客户端
import { VolcengineAuth } from './volcengine-auth';
import { emotionKeywords } from './emotion-keywords';

export interface JimengImageRequest {
  prompt: string;
  width?: number;
  height?: number;
  style?: string;
  quality?: string;
  num_inference_steps?: number;
}

export interface JimengImageResponse {
  code: number;
  data: {
    algorithm_base_resp: {
      status_code: number;
      status_message: string;
    };
    binary_data_base64: string[];
    image_urls: string[];
    llm_result: string;
    rephraser_result: string;
    request_id: string;
  };
  message: string;
  request_id: string;
  status: number;
  time_elapsed: string;
}

export class JimengAIClient {
  private auth: VolcengineAuth;
  private baseUrl: string;

  constructor(accessKeyId: string, secretAccessKey: string) {
    this.auth = new VolcengineAuth({
      accessKeyId,
      secretAccessKey,
      region: 'cn-north-1',
      service: 'cv' // 计算机视觉服务
    });

    // 使用文档中的正确域名
    this.baseUrl = 'https://visual.volcengineapi.com';
  }

  async generateImage(request: JimengImageRequest): Promise<JimengImageResponse> {
    // 按照即梦AI官方文档格式构建请求体
    const requestBody = {
      req_key: "jimeng_high_aes_general_v21_L", // 服务标识，固定值
      prompt: request.prompt, // 用于生成图像的提示词，中英文均可输入
      seed: 1244122, // 固定种子值，确保生成结果的一致性
      width: request.width || 512, // 生成图像的宽
      height: request.height || 512, // 生成图像的高
      use_pre_llm: true, // 开启大语言，会对输入的prompt进行优化
      use_sr: true, // 文生图+AIGC超分
      return_url: true, // 输出资源图的链接
      logo_info: {
        add_logo: false, // 是否添加水印
        position: 0, // 水印位置，0=右下角
        language: 0, // 水印语言，0=中文(AI生成)
        opacity: 1, // 水印不透明度
        logo_text_content: "AI生成" // 明水印自定义内容
      },
      aigc_meta: {
        content_producer: "emoticon-generator", // 内容生成服务ID
        producer_id: "emoticon-app", // 内容生成服务商给出的数据的唯一ID
        content_propagator: "web-app", // 内容传播服务商ID
        propagate_id: "web-emoticon-generator" // 传播服务商给出的数据的唯一ID
      }
    };

    const apiRequest = {
      method: 'POST',
      url: `${this.baseUrl}/?Action=CVProcess&Version=2022-08-31`,
      body: JSON.stringify(requestBody)
    };

    try {
      const response = await this.auth.makeRequest(apiRequest);
      return response as JimengImageResponse;
    } catch (error) {
      console.error('即梦AI图像生成失败:', error);
      throw new Error(`图像生成失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  async generateEmoticonBatch(
    subjectDescription: string,
    keywords: string[]
  ): Promise<{ keyword: string; imageBase64: string; imageUrl: string; seed: number; errorMessage?: string }[]> {
    const results = [];

    for (const keyword of keywords) {
      try {
        const prompt = this.buildEmoticonPrompt(subjectDescription, keyword);
        const response = await this.generateImage({
          prompt,
          width: 512,
          height: 512,
          style: 'cartoon',
          num_inference_steps: 25
        });

        if (response.data?.image_urls && response.data.image_urls.length > 0) {
          // 直接使用即梦AI返回的图片URL，不再下载转base64
          const imageUrl = response.data.image_urls[0];
          results.push({
            keyword,
            imageBase64: '', // 保持兼容性，但优先使用URL
            imageUrl, // 直接使用即梦AI的URL
            seed: 1244122 // 固定种子值，确保生成结果的一致性
          });
        } else {
          console.warn(`关键词 "${keyword}" 生成失败，使用占位符`);
          results.push({
            keyword,
            imageBase64: '',
            imageUrl: `https://placehold.co/512x512/ff6b6b/white?text=${encodeURIComponent(keyword)}&font=source-han-sans`,
            seed: 0,
            errorMessage: response.message || '图片生成失败'
          });
        }

        // 添加延迟避免API限流
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`关键词 "${keyword}" 生成失败:`, error);

        // 解析错误类型
        let errorMessage = '图片生成失败';
        if (error instanceof Error) {
          if (error.message.includes('Post Img Risk Not Pass')) {
            errorMessage = '内容风控未通过，请尝试更换关键词';
          } else if (error.message.includes('Rate Limit')) {
            errorMessage = 'API调用频率过高，请稍后重试';
          } else if (error.message.includes('401') || error.message.includes('403')) {
            errorMessage = 'API认证失败，请检查配置';
          } else {
            errorMessage = error.message;
          }
        }

        results.push({
          keyword,
          imageBase64: '',
          imageUrl: `https://placehold.co/512x512/ff6b6b/white?text=${encodeURIComponent(keyword)}&font=source-han-sans`,
          seed: 0,
          errorMessage
        });
      }
    }

    return results;
  }

  private buildEmoticonPrompt(subjectDescription: string, keyword: string): string {
    // 在关键词数据库中查找对应的详细描述
    const keywordData = emotionKeywords.find(k => k.keyword === keyword);

    if (keywordData) {
      // 如果找到了详细描述，使用它来构建更准确的prompt
      const detailedDescription = keywordData.description
        .replace(/\[主体\]/g, subjectDescription);

      const stylePrompt = '卡通动画风格, 萌系设计, 简洁背景';
      const qualityPrompt = '高品质插画, 色彩鲜明, 细节精美';
      const restrictionPrompt = '纯图像设计, 表情符号风格';

      return `${detailedDescription}, ${stylePrompt}, ${qualityPrompt}, ${restrictionPrompt}`;
    } else {
      // 如果没有找到详细描述，使用原来的简单方式
      const basePrompt = `${subjectDescription}做出${keyword}的可爱表情`;
      const stylePrompt = '卡通动画风格, 萌系设计, 简洁背景';
      const qualityPrompt = '高品质插画, 色彩鲜明, 细节精美';
      const restrictionPrompt = '纯图像设计, 表情符号风格';

      return `${basePrompt}, ${stylePrompt}, ${qualityPrompt}, ${restrictionPrompt}`;
    }
  }
}

// 客户端配置接口
export interface JimengClientConfig {
  accessKeyId?: string; // 用户自定义的 Access Key ID
  secretAccessKey?: string; // 用户自定义的 Secret Access Key
}

// 工厂函数创建客户端实例
// 优先使用传入的配置，其次使用环境变量
export function createJimengClient(config?: JimengClientConfig): JimengAIClient {
  // 优先使用传入的配置
  let accessKeyId = config?.accessKeyId;
  let secretAccessKey = config?.secretAccessKey;

  // 如果传入的配置为空，则使用环境变量
  if (!accessKeyId || !secretAccessKey) {
    accessKeyId = process.env.ACCESS_KEY_ID;
    secretAccessKey = process.env.SECRET_ACCESS_KEY;
  }

  // 检查是否有可用的密钥
  if (!accessKeyId || !secretAccessKey) {
    throw new Error('缺少即梦AI认证信息，请配置 API 密钥或设置环境变量 ACCESS_KEY_ID 和 SECRET_ACCESS_KEY');
  }

  // 去除可能的引号和首尾空格
  const cleanAccessKey = accessKeyId.trim().replace(/^["']|["']$/g, '');
  const cleanSecretKey = secretAccessKey.trim().replace(/^["']|["']$/g, '');

  console.log('🔑 创建即梦AI客户端');
  console.log('  AccessKey 长度:', cleanAccessKey.length);
  console.log('  SecretKey 长度:', cleanSecretKey.length);
  console.log('  配置来源:', config?.accessKeyId ? '用户自定义' : '环境变量');

  return new JimengAIClient(cleanAccessKey, cleanSecretKey);
}