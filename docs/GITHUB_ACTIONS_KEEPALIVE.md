# GitHub Actions 防止 Render 网站休眠配置指南

## 概述

本配置使用 GitHub Actions 定时任务来防止 Render 免费服务的 15 分钟休眠机制，确保网站始终保持活跃状态。

## 配置说明

### 1. 基础保活配置 (`.github/workflows/keepalive.yml`)

**触发条件：**
- 定时触发：每 10 分钟执行一次
- 手动触发：支持自定义网站URL

**功能特点：**
- 访问网站首页
- 访问API端点
- 访问特定剧本页面
- 健康检查和重试机制
- 失败通知

### 2. 高级保活配置 (`.github/workflows/advanced-keepalive.yml`)

**触发条件：**
- 定时触发：每 8 分钟执行一次
- 手动触发：支持更多配置选项

**功能特点：**
- 基础健康检查
- 性能监控
- 多端点测试
- 响应时间统计
- 详细的日志记录

### 3. 本地保活脚本 (`scripts/keepalive.js`)

**使用方法：**
```bash
# 使用默认URL
npm run keepalive

# 使用自定义URL
SITE_URL=https://your-site.onrender.com npm run keepalive
```

## 部署步骤

### 步骤 1: 启用 GitHub Actions

1. 确保代码已推送到 GitHub 仓库
2. 进入仓库的 "Actions" 标签页
3. 确认 GitHub Actions 已启用

### 步骤 2: 配置定时任务

1. 进入 "Actions" 页面
2. 选择 "Keep Render Site Alive" 工作流
3. 点击 "Enable workflow" 启用

### 步骤 3: 手动测试

1. 在 Actions 页面找到 "Keep Render Site Alive"
2. 点击 "Run workflow"
3. 输入您的 Render 网站 URL
4. 点击 "Run workflow" 执行测试

### 步骤 4: 监控执行状态

1. 在 Actions 页面查看执行历史
2. 点击具体的执行记录查看详细日志
3. 确认所有步骤都显示绿色 ✅

## 配置选项

### 定时频率调整

修改 `.github/workflows/keepalive.yml` 中的 cron 表达式：

```yaml
schedule:
  - cron: '*/10 * * * *'  # 每10分钟
  - cron: '*/5 * * * *'   # 每5分钟
  - cron: '*/15 * * * *'  # 每15分钟
```

### 自定义网站URL

在手动触发时，可以指定不同的网站URL：

```
https://your-custom-site.onrender.com
```

### 环境变量配置

可以在仓库设置中添加环境变量：

1. 进入仓库 "Settings" → "Secrets and variables" → "Actions"
2. 添加以下变量：
   - `RENDER_SITE_URL`: 您的 Render 网站 URL
   - `KEEPALIVE_INTERVAL`: 保活间隔（分钟）

## 监控和维护

### 查看执行日志

1. 进入 GitHub Actions 页面
2. 选择 "Keep Render Site Alive" 工作流
3. 点击具体的执行记录
4. 查看 "Keep Render site alive" 步骤的详细日志

### 常见问题

**Q: 工作流执行失败怎么办？**
A: 检查网络连接和网站URL是否正确，查看详细错误日志。

**Q: 如何调整保活频率？**
A: 修改 cron 表达式，建议不要过于频繁（最少5分钟间隔）。

**Q: 如何添加更多测试端点？**
A: 在 `ENDPOINTS` 数组中添加新的URL路径。

### 性能优化

1. **避免过于频繁的请求**：建议间隔不少于5分钟
2. **使用轻量级请求**：只访问必要的端点
3. **监控响应时间**：确保网站响应正常

## 高级配置

### 多环境支持

为不同环境配置不同的保活策略：

```yaml
- name: Environment-specific keepalive
  run: |
    if [ "${{ github.ref }}" == "refs/heads/main" ]; then
      SITE_URL="https://production-site.onrender.com"
    else
      SITE_URL="https://staging-site.onrender.com"
    fi
```

### 通知集成

添加失败通知（需要配置 webhook 或邮件服务）：

```yaml
- name: Notify on failure
  if: failure()
  uses: actions/github-script@v6
  with:
    script: |
      github.rest.issues.create({
        owner: context.repo.owner,
        repo: context.repo.repo,
        title: 'Render 网站保活失败',
        body: '请检查网站状态和部署配置'
      })
```

## 注意事项

1. **GitHub Actions 免费额度**：每月有 2000 分钟免费额度
2. **Render 免费服务限制**：仍然受到 Render 免费服务的其他限制
3. **网络延迟**：考虑网络延迟，建议设置合理的重试机制
4. **安全性**：不要在日志中暴露敏感信息

## 故障排除

### 检查清单

- [ ] GitHub Actions 已启用
- [ ] 工作流文件语法正确
- [ ] 网站URL可访问
- [ ] 定时任务已激活
- [ ] 执行权限正确

### 调试步骤

1. 手动执行工作流
2. 检查执行日志
3. 验证网站可访问性
4. 调整配置参数
5. 重新部署

通过以上配置，您的 Render 网站将保持活跃状态，避免 15 分钟休眠问题。
