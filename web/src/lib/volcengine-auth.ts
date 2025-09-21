// 火山引擎API认证工具
import CryptoJS from 'crypto-js';

export interface VolcengineConfig {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  service: string;
}

export interface APIRequest {
  method: string;
  url: string;
  headers?: Record<string, string>;
  body?: string;
}

export class VolcengineAuth {
  private accessKeyId: string;
  private secretAccessKey: string;
  private region: string;
  private service: string;

  constructor(config: VolcengineConfig) {
    this.accessKeyId = config.accessKeyId;
    this.secretAccessKey = config.secretAccessKey;
    this.region = config.region;
    this.service = config.service;
  }

  private sha256(message: string): string {
    return CryptoJS.SHA256(message).toString(CryptoJS.enc.Hex);
  }

  private hmacSha256(key: string | Buffer, message: string): Buffer {
    try {
      // 处理key，如果是字符串就转为Buffer
      const keyBuffer = typeof key === 'string' ? Buffer.from(key, 'utf-8') : key;

      const hmac = CryptoJS.HmacSHA256(message, CryptoJS.lib.WordArray.create(keyBuffer));
      return Buffer.from(hmac.toString(CryptoJS.enc.Hex), 'hex');
    } catch (error) {
      console.error('❌ HMAC-SHA256 failed:', error);
      throw error;
    }
  }

  // 不参与签名的header keys (修正：content-type需要参与签名)
  private readonly HEADER_KEYS_TO_IGNORE = new Set([
    'authorization',
    'content-length',
    'user-agent',
    'presigned-expires',
    'expect'
  ]);

  private getSignHeaders(originHeaders: Record<string, string>, needSignHeaders: string[] = []): [string, string] {
    function trimHeaderValue(header: string): string {
      return header.toString?.().trim().replace(/\s+/g, ' ') ?? '';
    }

    let h = Object.keys(originHeaders);

    // 根据 needSignHeaders 过滤 (默认包含 x-date 和 host)
    if (Array.isArray(needSignHeaders) && needSignHeaders.length > 0) {
      const needSignSet = new Set(
        [...needSignHeaders, 'x-date', 'host'].map(k => k.toLowerCase())
      );
      h = h.filter(k => needSignSet.has(k.toLowerCase()));
    }

    // 根据 ignore headers 过滤
    h = h.filter(k => !this.HEADER_KEYS_TO_IGNORE.has(k.toLowerCase()));

    const signedHeaderKeys = h
      .slice()
      .map(k => k.toLowerCase())
      .sort()
      .join(';');

    const canonicalHeaders = h
      .sort((a, b) => (a.toLowerCase() < b.toLowerCase() ? -1 : 1))
      .map(k => `${k.toLowerCase()}:${trimHeaderValue(originHeaders[k])}`)
      .join('\n');

    return [signedHeaderKeys, canonicalHeaders];
  }

  private queryParamsToString(params: Record<string, string>): string {
    return Object.keys(params)
      .sort()
      .map(key => {
        const val = params[key];
        if (typeof val === 'undefined' || val === null) {
          return undefined;
        }
        const escapedKey = this.uriEscape(key);
        if (!escapedKey) {
          return undefined;
        }
        return `${escapedKey}=${this.uriEscape(val)}`;
      })
      .filter(v => v)
      .join('&');
  }

  private uriEscape(str: string): string {
    try {
      return encodeURIComponent(str)
        .replace(/[^A-Za-z0-9_.~\-%]+/g, escape)
        .replace(
          /[*]/g,
          (ch) => `%${ch.charCodeAt(0).toString(16).toUpperCase()}`
        );
    } catch (e) {
      return '';
    }
  }

  generateSignature(request: APIRequest): Record<string, string> {
    const now = new Date();
    // 按照官方SDK格式: yyyyMMddTHHmmssZ
    const xDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
    const date = xDate.substring(0, 8); // YYYYMMDD

    const url = new URL(request.url);
    const host = url.host;
    const pathName = url.pathname;

    // 计算body SHA256
    const bodySha = this.sha256(request.body || '');

    // 准备headers (包含所有必要的headers，按照第一个文档示例)
    const headers: Record<string, string> = {
      'Host': host,
      'X-Date': xDate,
      'X-Content-Sha256': bodySha,
      'Content-Type': 'application/json',
      ...request.headers
    };

    // 使用官方SDK的getSignHeaders方法，强制包含必要的headers
    const needSignHeaders = ['host', 'x-date', 'x-content-sha256', 'content-type'];
    const [signedHeaders, canonicalHeaders] = this.getSignHeaders(headers, needSignHeaders);

    // 构建query字符串 (使用官方SDK方法)
    const queryParams: Record<string, string> = {};
    url.searchParams.forEach((value, key) => {
      queryParams[key] = value;
    });
    const queryString = this.queryParamsToString(queryParams);

    // 按照官方SDK格式构建CanonicalRequest
    const canonicalRequest = [
      request.method.toUpperCase(),
      pathName,
      queryString || '',
      `${canonicalHeaders}\n`,
      signedHeaders,
      bodySha
    ].join('\n');

    // 构建StringToSign
    const credentialScope = [date, this.region, this.service, 'request'].join('/');
    const stringToSign = [
      'HMAC-SHA256',
      xDate,
      credentialScope,
      this.sha256(canonicalRequest)
    ].join('\n');

    console.log('🔐 官方SDK格式签名调试:');
    console.log('  xDate:', xDate);
    console.log('  credentialScope:', credentialScope);
    console.log('  signedHeaders:', signedHeaders);
    console.log('  CanonicalRequest length:', canonicalRequest.length);
    console.log('  StringToSign length:', stringToSign.length);

    // 按照官方SDK计算签名
    const kDate = this.hmacSha256(this.secretAccessKey, date);
    const kRegion = this.hmacSha256(kDate, this.region);
    const kService = this.hmacSha256(kRegion, this.service);
    const kSigning = this.hmacSha256(kService, 'request');
    const signatureBuffer = this.hmacSha256(kSigning, stringToSign);
    const signature = signatureBuffer.toString('hex');

    // 按照官方SDK格式构建Authorization
    const authorization = [
      'HMAC-SHA256',
      `Credential=${this.accessKeyId}/${credentialScope},`,
      `SignedHeaders=${signedHeaders},`,
      `Signature=${signature}`
    ].join(' ');

    return {
      ...headers,
      'Authorization': authorization
    };
  }

  async makeRequest(request: APIRequest): Promise<any> {
    const signedHeaders = this.generateSignature(request);

    // 调试信息：检查headers中是否有无效字符
    console.log('🔍 Checking headers for invalid characters...');
    for (const [key, value] of Object.entries(signedHeaders)) {
      if (typeof value === 'string') {
        const hasInvalidChars = /[^\x20-\x7E]/.test(value);
        if (hasInvalidChars) {
          console.warn(`❌ Header "${key}" contains invalid characters:`, value.substring(0, 50) + '...');
        } else {
          console.log(`✅ Header "${key}" is valid`);
        }
      }
    }

    try {
      console.log('🚀 Making fetch request to:', request.url);
      const response = await fetch(request.url, {
        method: request.method,
        headers: signedHeaders,
        body: request.body
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status} ${result.message || result.error || '未知错误'}`);
      }

      return result;
    } catch (error) {
      console.error('API请求错误:', error);
      throw error;
    }
  }
}