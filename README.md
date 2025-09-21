# 🎭 AI表情包生成器

<div align="center">
  <img src="docs/images/image.png" alt="AI表情包生成器预览" width="800"/>

  **V3.0 - 智能图片识别，一键生成专属表情包**

  [![Next.js](https://img.shields.io/badge/Next.js-15.5.3-black?style=flat-square&logo=next.js)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-19.1.0-blue?style=flat-square&logo=react)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.0-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

</div>

## ✨ 特性亮点

- 🤖 **AI智能生成** - 基于即梦AI，一键生成16张专属表情包
- 📷 **图片识别** - 智能识别上传图片，自动生成主体描述
- 🎨 **灵感推荐** - 内置角色库与关键词模板，降低创作门槛
- 💎 **高清输出** - 支持多尺寸输出，完全符合微信表情包规范
- 📦 **一键打包** - 自动生成ZIP包，包含所有所需格式和尺寸
- 🏷️ **水印保护** - 预览版带水印，付费版提供无水印高清版本

## 🚀 在线体验

访问 [AI表情包生成器](your-domain.com) 立即开始创作！

## 📱 界面预览

### 主要功能界面
- **智能输入区域** - 支持图片上传识别和灵感推荐
- **关键词编辑** - 16个情感关键词，支持快速填充模板
- **实时预览** - 生成后即时预览效果，带骨架屏加载
- **双版本下载** - 免费水印版 + 付费高清版

### 技术特性
- **响应式设计** - 完美适配桌面端和移动端
- **加载体验** - 骨架屏 + 进度条，清晰的状态反馈
- **错误处理** - 完善的异常处理和用户提示

## 🛠️ 技术栈

### 前端技术
- **Next.js 15.5.3** - 全栈React框架，支持SSR和API路由
- **React 19.1.0** - 用户界面库，最新版本特性
- **TypeScript 5.0** - 类型安全的JavaScript超集
- **Tailwind CSS 4.0** - 原子化CSS框架，快速样式开发

### UI组件
- **Radix UI** - 无样式、可访问的UI基础组件
- **Lucide React** - 美观的SVG图标库
- **shadcn/ui** - 现代化的React组件库

### 核心功能
- **Canvas API** - 图片处理、水印添加、尺寸调整
- **JSZip** - 客户端ZIP文件生成和下载
- **即梦AI API** - 专业的AI图像生成服务

### 开发工具
- **ESLint** - 代码质量检查
- **Turbopack** - 高性能构建工具

## 📦 项目结构

```
emoticons/
├── docs/                    # 文档和截图
│   └── images/
│       └── image.png       # 项目展示图
├── web/                    # 主应用程序
│   ├── src/
│   │   ├── app/           # Next.js App Router
│   │   │   ├── api/       # API路由
│   │   │   ├── admin/     # 管理员界面
│   │   │   └── page.tsx   # 主页面
│   │   ├── components/    # React组件
│   │   │   └── ui/        # UI基础组件
│   │   └── lib/          # 工具函数
│   │       ├── image-processing.ts  # 图片处理
│   │       └── download.ts          # 下载功能
│   ├── public/           # 静态资源
│   └── package.json      # 项目配置
├── CLAUDE.md             # 项目需求文档
└── README.md            # 项目说明文档
```

## 🚦 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn 包管理器

### 安装步骤

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd emoticons
   ```

2. **安装依赖**
   ```bash
   cd web
   npm install
   ```

3. **环境配置**
   ```bash
   # 复制环境变量模板
   cp .env.example .env.local

   # 配置即梦AI API密钥
   # 编辑 .env.local 文件，填入您的API配置
   ```

4. **启动开发服务器**
   ```bash
   npm run dev
   ```

5. **访问应用**
   打开浏览器访问 `http://localhost:3000`

### 生产部署

```bash
# 构建生产版本
npm run build

# 启动生产服务器
npm run start
```

## ⚙️ API配置

### 即梦AI配置

1. 访问 [即梦AI官网](https://www.volcengine.com/docs/85621/1537648) 获取API密钥
2. 在 `.env.local` 中配置：
   ```env
   JIMENG_API_KEY=your_api_key
   JIMENG_SECRET_KEY=your_secret_key
   ```

### 管理员界面

访问 `/admin` 路径可以管理API配置和查看系统状态。

## 📋 使用指南

### 创建表情包

1. **描述主体** - 输入表情包主角描述，或上传图片让AI识别
2. **填写关键词** - 输入16个情感关键词，或使用快速填充模板
3. **生成预览** - 点击生成按钮，等待AI创作完成
4. **下载使用** - 选择免费水印版或付费高清版下载

### 微信表情包格式

生成的ZIP包包含完整的微信表情包格式：
- **主图** (240×240px) - 用于表情包展示
- **缩略图** (120×120px) - 用于选择界面
- **图标** (50×50px) - 用于聊天列表
- **横幅** (750×400px) - 用于详情页展示

## 🎨 设计理念

### 用户体验
- **降低门槛** - 提供灵感推荐和模板，消除"白屏恐惧症"
- **即时反馈** - 加载状态、进度提示、错误处理一应俱全
- **双重价值** - 免费体验 + 付费高级版本的商业模式

### 技术选型
- **现代化栈** - 采用最新的React生态系统技术
- **性能优先** - Turbopack构建、图片优化、懒加载等优化
- **类型安全** - 全面的TypeScript支持

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 开发规范
- 使用 TypeScript 进行开发
- 遵循 ESLint 规则
- 组件采用函数式写法
- 使用 Tailwind CSS 进行样式开发

### 提交规范
- feat: 新功能
- fix: 修复问题
- docs: 文档更新
- style: 样式调整
- refactor: 代码重构

## 📄 许可证

本项目采用 MIT 许可证。详见 [LICENSE](LICENSE) 文件。

## 🔗 相关链接

- [即梦AI文档](https://www.volcengine.com/docs/85621/1537648)
- [Next.js官方文档](https://nextjs.org/docs)
- [Tailwind CSS文档](https://tailwindcss.com/docs)
- [微信表情包平台](https://sticker.weixin.qq.com/)

---

<div align="center">

**⭐ 如果这个项目对你有帮助，请给个Star支持一下！**

由 ❤️ 和 AI 共同打造

</div>