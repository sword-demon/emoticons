import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // 使用 remotePatterns 替代已弃用的 domains
    remotePatterns: [
      // 占位符图片服务
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      // 字节跳动/火山引擎/即梦AI相关域名
      {
        protocol: 'https',
        hostname: '*.byteimg.com',
      },
      {
        protocol: 'https',
        hostname: 'aiop-sign.byteimg.com',
      },
      // 允许所有 HTTPS 协议的图片（开发阶段临时方案）
      {
        protocol: 'https',
        hostname: '**',
      }
    ],
    // 其他配置
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
  },
};

export default nextConfig;
