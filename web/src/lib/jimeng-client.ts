// 即梦AI客户端
import { VolcengineAuth } from './volcengine-auth';

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
      seed: request.num_inference_steps ? Math.floor(Math.random() * 1000000) : -1, // 随机种子，-1表示随机
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
      return response;
    } catch (error) {
      console.error('即梦AI图像生成失败:', error);
      throw new Error(`图像生成失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  async generateEmoticonBatch(
    subjectDescription: string,
    keywords: string[]
  ): Promise<{ keyword: string; imageBase64: string; seed: number }[]> {
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
          // 下载图片并转换为base64
          const imageUrl = response.data.image_urls[0];
          try {
            const imageResponse = await fetch(imageUrl);
            const imageBuffer = await imageResponse.arrayBuffer();
            const imageBase64 = Buffer.from(imageBuffer).toString('base64');
            results.push({
              keyword,
              imageBase64: `data:image/png;base64,${imageBase64}`,
              seed: Math.floor(Math.random() * 1000000) // 生成随机种子
            });
          } catch (downloadError) {
            console.warn(`下载图片失败 "${keyword}":`, downloadError);
            results.push({
              keyword,
              imageBase64: '',
              seed: 0
            });
          }
        } else {
          console.warn(`关键词 "${keyword}" 生成失败，使用占位符`);
          results.push({
            keyword,
            imageBase64: '', // 空的base64，前端会显示占位符
            seed: 0
          });
        }

        // 添加延迟避免API限流
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`关键词 "${keyword}" 生成失败:`, error);
        results.push({
          keyword,
          imageBase64: '',
          seed: 0
        });
      }
    }

    return results;
  }

  private buildEmoticonPrompt(subjectDescription: string, keyword: string): string {
    // 构建优化的prompt，使用更友好的表达方式
    const basePrompt = `${subjectDescription}做出${keyword}的可爱表情`;
    const stylePrompt = '卡通动画风格, 萌系设计, 简洁背景';
    const qualityPrompt = '高品质插画, 色彩鲜明, 细节精美';
    const restrictionPrompt = '纯图像设计, 表情符号风格';

    return `${basePrompt}, ${stylePrompt}, ${qualityPrompt}, ${restrictionPrompt}`;
  }
}

// 工厂函数创建客户端实例
export function createJimengClient(): JimengAIClient {
  const accessKeyId = process.env.ACCESS_KEY_ID;
  const secretAccessKey = process.env.SECRET_ACCESS_KEY;

  if (!accessKeyId || !secretAccessKey) {
    throw new Error('缺少即梦AI认证信息，请检查环境变量 ACCESS_KEY_ID 和 SECRET_ACCESS_KEY');
  }

  // 去除可能的引号
  const cleanAccessKey = accessKeyId.replace(/^["']|["']$/g, '');
  const cleanSecretKey = secretAccessKey.replace(/^["']|["']$/g, '');

  console.log('🔑 直接使用API密钥字符串');
  console.log('  AccessKey 长度:', cleanAccessKey.length);
  console.log('  SecretKey 长度:', cleanSecretKey.length);

  return new JimengAIClient(cleanAccessKey, cleanSecretKey);
}