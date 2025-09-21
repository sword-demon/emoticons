# 即梦AI集成说明

## 🎯 当前状态

项目已完成即梦AI的完整集成代码，目前处于**演示模式**。要切换到真实API模式，请按照以下步骤操作。

## 🔧 启用即梦AI真实API

### 1. 获取API密钥

前往 [火山引擎控制台](https://console.volcengine.com/) 获取：
- `AccessKeyID`
- `SecretAccessKey`

### 2. 配置环境变量

在 `.env` 文件中更新以下配置：

```bash
# 启用真实API模式
USE_REAL_JIMENG_API=true

# 火山引擎API密钥（Base64编码格式）
ACCESS_KEY_ID=你的AccessKeyID
SECRET_ACCESS_KEY=你的SecretAccessKey
```

### 3. 重启开发服务器

```bash
npm run dev
```

### 4. 验证集成

访问 http://localhost:3000/admin 进行配置检查和API测试。

## 📋 API集成架构

### 核心文件

- `src/lib/volcengine-auth.ts` - 火山引擎API认证
- `src/lib/jimeng-client.ts` - 即梦AI客户端
- `src/app/api/generate-emoticons/route.ts` - 表情包生成API
- `src/app/api/test-jimeng/route.ts` - API测试工具

### 请求流程

1. **前端** → 发送生成请求到 `/api/generate-emoticons`
2. **后端** → 检查 `USE_REAL_JIMENG_API` 环境变量
3. **即梦AI** → 如果启用，调用即梦AI API生成图片
4. **回退机制** → API失败时自动切换到演示模式
5. **前端** → 处理返回的图片数据

### 错误处理

- ✅ API调用失败自动回退
- ✅ 网络错误处理
- ✅ 认证失败提示
- ✅ 详细错误日志

## 🧪 测试功能

### 1. 配置检查

```bash
curl http://localhost:3000/api/test-jimeng
```

### 2. API测试

```bash
curl -X POST http://localhost:3000/api/test-jimeng \
  -H "Content-Type: application/json" \
  -d '{"prompt": "一只可爱的柴犬，开心表情"}'
```

### 3. 管理界面

访问 http://localhost:3000/admin 查看：
- 配置状态
- API测试工具
- 环境变量说明

## 🎨 Prompt优化

系统自动为每个关键词构建优化的Prompt：

```
{主体描述}, {关键词}表情, 简洁表情包风格, 卡通风格, 可爱风格, 清晰背景, 高质量, 高清, 精细, 专业, 无文字, 纯图像, 表情包专用
```

## 🔒 安全考虑

- ✅ API密钥Base64编码存储
- ✅ 密钥不在前端暴露
- ✅ 签名认证机制
- ✅ 请求频率控制

## 📊 性能优化

- ✅ 批量处理16个关键词
- ✅ API调用间隔500ms避免限流
- ✅ 失败重试机制
- ✅ 缓存机制（可扩展）

## 🚀 部署注意事项

### 生产环境

1. 确保环境变量正确配置
2. 监控API调用频率和成本
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

| 模式 | 配置 | 说明 |
|------|------|------|
| 演示模式 | `USE_REAL_JIMENG_API=false` | 使用占位符图片 |
| 真实模式 | `USE_REAL_JIMENG_API=true` | 调用即梦AI生成图片 |
| 混合模式 | 自动回退 | 真实API失败时回退到演示模式 |

## 🆘 故障排除

### 常见问题

1. **API密钥错误**
   - 检查密钥格式和权限
   - 确认Base64编码正确

2. **网络连接问题**
   - 检查网络连接
   - 确认火山引擎服务可访问

3. **权限不足**
   - 确认API密钥有即梦AI权限
   - 检查账户余额

4. **请求频率限制**
   - 调整请求间隔
   - 检查API配额

### 调试步骤

1. 检查环境变量配置
2. 访问管理页面进行测试
3. 查看控制台日志输出
4. 使用测试API验证连接

---

即梦AI集成已完全准备就绪，只需要启用真实API模式即可开始使用！