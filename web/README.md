# AI表情包生成器 V3.0

基于 Next.js + TailwindCSS + shadcn/ui 实现的智能表情包生成网站。

## ✨ 功能特性

### 🎯 核心功能
- **智能图片识别**: 上传图片自动识别主体并生成描述
- **灵感推荐**: AI推荐25种不同类型的角色形象
- **16个关键词**: 快速填充主题关键词（日常聊天、职场吐槽、搞笑幽默、情感表达）
- **随机填充**: 智能生成96种精选情感动作词汇
- **表情包生成**: 调用即梦AI生成16张表情包
- **水印预览**: 带水印的预览效果
- **双模式下载**: 免费水印版 + 付费高清无水印版

### 🛠 技术栈
- **前端**: Next.js 15 + TypeScript + TailwindCSS + shadcn/ui
- **图片处理**: Canvas API + JSZip
- **图标**: Lucide React
- **AI集成**: 即梦AI (API集成准备就绪)
- **支付**: z-pay 集成准备就绪

## 🚀 快速开始

### 环境要求
- Node.js 18+
- npm 或 yarn

### 安装依赖
```bash
npm install
```

### 环境变量配置
在 `.env` 文件中配置即梦AI的密钥：
```
AccessKeyID=your_access_key_id
SecretAccessKey=your_secret_access_key
```

### 启动开发服务器
```bash
npm run dev
```

访问 http://localhost:3000 查看应用。

## 📁 项目结构

```
src/
├── app/
│   ├── api/
│   │   ├── generate-emoticons/   # 表情包生成API
│   │   └── recognize-image/      # 图片识别API
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                  # 主页面
├── components/
│   └── ui/                       # shadcn/ui组件
├── lib/
│   ├── utils.ts
│   ├── image-processing.ts       # 图片处理工具
│   └── download.ts               # 下载打包工具
└── ...
```

## 🎨 主要功能模块

### 1. 表情包主体描述
- 支持手动输入或AI图片识别
- "需要灵感?"按钮提供25种角色推荐
- 字符限制50字，实时计数

### 2. 关键词输入
- 16个独立输入框，网格布局
- 快速填充预设主题
- 随机填充功能
- 每个关键词限制10字符

### 3. 图片处理
- 自动添加水印
- 多尺寸生成 (240x240, 120x120, 50x50)
- 文字叠加
- 横幅图生成

### 4. 下载功能
- ZIP打包下载
- 符合微信表情包规范
- 文件夹分类 (main/, thumb/, icon/, banner/)
- 包含使用说明

## 🔧 API接口

### POST /api/generate-emoticons
生成表情包接口
```json
{
  "subjectDescription": "主体描述",
  "keywords": ["关键词1", "关键词2", ...]
}
```

### POST /api/recognize-image
图片识别接口
- 支持文件上传
- 返回识别描述

## 📦 生产部署

### 构建应用
```bash
npm run build
```

### 启动生产服务器
```bash
npm start
```

## 🔮 待实现功能

### AI集成
- [ ] 接入即梦AI实际API
- [ ] 图片识别服务集成
- [ ] 优化Prompt工程

### 支付功能
- [ ] z-pay支付集成
- [ ] 订单管理
- [ ] 用户认证

### 优化功能
- [ ] 图片质量优化
- [ ] 批量生成
- [ ] 自定义水印
- [ ] 更多表情包尺寸

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**注意**: 当前版本中AI功能为模拟实现，实际生产环境需要配置真实的AI服务。
