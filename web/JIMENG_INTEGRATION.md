# 即梦 AI 集成说明

## 🎯 当前状态

项目已完成即梦 AI 的完整集成代码，目前处于**演示模式**。要切换到真实 API 模式，请按照以下步骤操作。

## 🔧 启用即梦 AI 真实 API

### 1. 获取 API 密钥

前往 [火山引擎控制台](https://console.volcengine.com/) 获取：

- `AccessKeyID`
- `SecretAccessKey`

### 2. 配置环境变量

在 `.env` 文件中更新以下配置：

```bash
# 启用真实API模式
USE_REAL_JIMENG_API=true

# 火山引擎API密钥
ACCESS_KEY_ID=你的AccessKeyID
SECRET_ACCESS_KEY=你的SecretAccessKey
```

### 3. 重启开发服务器

```bash
npm run dev
```

### 4. 验证集成

访问 http://localhost:3000/admin 进行配置检查和 API 测试。

## 📋 API 集成架构

### 核心文件

- `src/lib/volcengine-auth.ts` - 火山引擎 API 认证
- `src/lib/jimeng-client.ts` - 即梦 AI 客户端
- `src/app/api/generate-emoticons/route.ts` - 表情包生成 API
- `src/app/api/test-jimeng/route.ts` - API 测试工具

### 请求流程

1. **前端** → 发送生成请求到 `/api/generate-emoticons`
2. **后端** → 检查 `USE_REAL_JIMENG_API` 环境变量
3. **即梦 AI** → 如果启用，调用即梦 AI API 生成图片
4. **回退机制** → API 失败时自动切换到演示模式
5. **前端** → 处理返回的图片数据

### 错误处理

- ✅ API 调用失败自动回退
- ✅ 网络错误处理
- ✅ 认证失败提示
- ✅ 详细错误日志

## 🧪 测试功能

### 1. 配置检查

```bash
curl http://localhost:3000/api/test-jimeng
```

### 2. API 测试

```bash
curl -X POST http://localhost:3000/api/test-jimeng \
  -H "Content-Type: application/json" \
  -d '{"prompt": "一只可爱的柴犬，开心表情"}'
```

### 3. 管理界面

访问 http://localhost:3000/admin 查看：

- 配置状态
- API 测试工具
- 环境变量说明

## 🎨 Prompt 优化

系统自动为每个关键词构建优化的 Prompt：

```
{主体描述}, {关键词}表情, 简洁表情包风格, 卡通风格, 可爱风格, 清晰背景, 高质量, 高清, 精细, 专业, 无文字, 纯图像, 表情包专用
```

## 🔒 安全考虑

- ✅ API 密钥 Base64 编码存储
- ✅ 密钥不在前端暴露
- ✅ 签名认证机制
- ✅ 请求频率控制

## 📊 性能优化

- ✅ 批量处理 16 个关键词
- ✅ API 调用间隔 500ms 避免限流
- ✅ 失败重试机制
- ✅ 缓存机制（可扩展）

## 🚀 部署注意事项

### 生产环境

1. 确保环境变量正确配置
2. 监控 API 调用频率和成本
3. 设置适当的超时时间
4. 配置日志收集

### 环境变量

```bash
# 生产环境配置
USE_REAL_JIMENG_API=true
ACCESS_KEY_ID=生产环境密钥
SECRET_ACCESS_KEY=生产环境密钥
NODE_ENV=production
```

## 🔄 切换模式

| 模式     | 配置                        | 说明                          |
| -------- | --------------------------- | ----------------------------- |
| 演示模式 | `USE_REAL_JIMENG_API=false` | 使用占位符图片                |
| 真实模式 | `USE_REAL_JIMENG_API=true`  | 调用即梦 AI 生成图片          |
| 混合模式 | 自动回退                    | 真实 API 失败时回退到演示模式 |

## 🆘 故障排除

### 常见问题

1. **API 密钥错误**

   - 检查密钥格式和权限
   - 确认 Base64 编码正确

2. **网络连接问题**

   - 检查网络连接
   - 确认火山引擎服务可访问

3. **权限不足**

   - 确认 API 密钥有即梦 AI 权限
   - 检查账户余额

4. **请求频率限制**
   - 调整请求间隔
   - 检查 API 配额

### 调试步骤

1. 检查环境变量配置
2. 访问管理页面进行测试
3. 查看控制台日志输出
4. 使用测试 API 验证连接

---

即梦 AI 集成已完全准备就绪，只需要启用真实 API 模式即可开始使用！
