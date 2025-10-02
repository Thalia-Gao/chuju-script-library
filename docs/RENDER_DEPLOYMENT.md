# Render 部署指南

## 项目已成功上传到GitHub

✅ **GitHub仓库**: https://github.com/Thalia-Gao/chuju-script-library
✅ **包含完整数据**: 196个剧本，196个剧照，完整数据库
✅ **静态映射系统**: 确保剧本和剧照正确匹配
✅ **ModelScope AI集成**: 使用指定的API配置

## Render自动部署配置

### 1. 创建Render服务

1. 访问 [Render Dashboard](https://dashboard.render.com/)
2. 点击 **"New"** → **"Web Service"**
3. 连接GitHub账户并选择仓库：`Thalia-Gao/chuju-script-library`

### 2. 基本配置

```yaml
Name: chuju-archive
Environment: Node
Region: Oregon (US West) 或 Frankfurt (Europe)
Branch: main
Build Command: npm ci && npm run build
Start Command: npm start
```

### 3. 环境变量配置

在Render服务设置中添加以下环境变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `NODE_ENV` | `production` | 生产环境标识 |
| `MODELSCOPE_API_KEY` | `ms-e2b930dd-c68d-4e88-bfdc-b2796e8cd6a9` | ModelScope API密钥 |
| `MODELSCOPE_BASE_URL` | `https://api-inference.modelscope.cn/v1` | ModelScope API地址 |
| `MODELSCOPE_MODEL` | `Qwen/Qwen3-VL-235B-A22B-Instruct` | 使用的AI模型 |
| `JWT_SECRET` | (自动生成) | JWT签名密钥 |

### 4. 持久化存储配置

⚠️ **重要**: 配置磁盘存储以保持数据持久化

1. 在服务设置中点击 **"Disks"**
2. 添加新磁盘：
   - **Name**: `chuju-data`
   - **Mount Path**: `/app/data`
   - **Size**: `1 GB` (免费计划最大)

### 5. 高级配置

#### 自动部署
- ✅ **Auto-Deploy**: 启用（Git推送时自动部署）
- ✅ **Pull Request Previews**: 可选启用

#### 健康检查
```yaml
Health Check Path: /api/scripts?page=1&pageSize=1
```

## 部署验证清单

部署完成后，请验证以下功能：

### ✅ 基础功能
- [ ] 首页正常加载
- [ ] 剧本列表显示正确（应显示196个剧本）
- [ ] 剧照正确显示（DMX和Qwen剧照）
- [ ] 搜索功能正常
- [ ] 标签筛选正常

### ✅ AI功能
- [ ] AI助手页面可访问
- [ ] 能够生成剧本创意
- [ ] ModelScope API调用正常

### ✅ 数据完整性
- [ ] 剧本详情页正常显示
- [ ] 剧本内容完整
- [ ] 剧照与剧本正确匹配
- [ ] 标签系统正常

## 部署后的URL结构

部署成功后，您的应用将可通过以下URL访问：

- **主域名**: `https://chuju-archive.onrender.com` (或Render分配的域名)
- **API端点**: `https://your-app.onrender.com/api/scripts`
- **AI助手**: `https://your-app.onrender.com/assistant`

## 性能优化建议

### 1. 防止休眠
由于使用免费计划，服务会在15分钟无访问后休眠。建议：
- 使用外部监控服务（如UptimeRobot）定期访问
- 设置每10分钟访问一次主页

### 2. 数据备份
- 定期下载数据库备份
- 监控磁盘使用情况（1GB限制）

### 3. 流量管理
- 免费计划每月100GB流量
- 监控流量使用情况

## 故障排除

### 常见问题

1. **构建失败**
   ```bash
   # 检查构建日志中的错误信息
   # 通常是依赖安装或TypeScript编译问题
   ```

2. **数据库连接失败**
   ```bash
   # 确保data目录已正确挂载
   # 检查数据库文件是否存在
   ```

3. **静态资源404**
   ```bash
   # 确保public目录包含在构建中
   # 检查剧照文件路径
   ```

### 调试命令

在Render控制台中可以运行：

```bash
# 检查数据库
ls -la /app/data/

# 检查剧照文件
ls -la /app/public/stills-*/

# 检查进程
ps aux | grep node

# 检查日志
tail -f /app/logs/app.log
```

## 监控和维护

### 1. 日志监控
- 在Render控制台查看实时日志
- 关注错误和警告信息

### 2. 性能监控
- 监控响应时间
- 检查内存使用情况

### 3. 定期维护
- 每月检查磁盘使用情况
- 更新依赖包（如有安全更新）
- 备份重要数据

## 联系支持

如果遇到部署问题：

1. **检查Render文档**: https://render.com/docs
2. **查看项目README**: 包含详细的技术文档
3. **GitHub Issues**: 在项目仓库中报告问题

---

**部署成功后，您的楚剧数字典藏馆将24/7在线运行！** 🎭✨ 