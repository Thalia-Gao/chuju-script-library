# 楚剧荟・剧本数字典藏馆

[![Next.js](https://img.shields.io/badge/Next.js-14.2.31-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.3.1-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4.5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-38B2AC)](https://tailwindcss.com/)
[![SQLite](https://img.shields.io/badge/SQLite-better--sqlite3-green)](https://github.com/WiseLibs/better-sqlite3)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> 传承千年戏韵，典藏文化瑰宝

一个致力于保护、传承和发扬楚地戏曲文化的公益项目，提供楚剧剧本的数字化典藏、搜索、管理和AI辅助创作功能。

## 🌟 项目特色

- **🎭 丰富典藏**：收录196个经典楚剧剧本，涵盖古代、近代、现代各个时期
- **🔍 智能搜索**：支持关键词搜索、标签筛选、多维度分类
- **🤖 AI助手**：基于OpenAI的智能剧本创作助手，支持创意生成、片段创作、修改建议
- **📱 响应式设计**：现代化UI设计，支持多设备访问
- **🔐 用户管理**：完整的用户认证和权限管理系统
- **📊 管理后台**：强大的内容管理和数据维护功能

## 📊 数据统计

- **剧本数量**：196个
- **剧照图片**：198张
- **标签分类**：20+个分类标签
- **内容格式**：Markdown + 图片

## 🚀 快速开始

### 环境要求

- Node.js 18+ 
- npm 或 yarn
- SQLite 3

### 安装部署

1. **克隆项目**
```bash
git clone https://github.com/gaoshuping99/chuju-digital-library.git
cd chuju-digital-library
```

2. **安装依赖**
```bash
npm install
```

3. **环境配置**
```bash
# 复制环境变量模板
cp .env.local.example .env.local

# 编辑环境变量文件
# 可选：配置 OpenAI API Key 以启用 AI 助手功能
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
```

4. **启动开发服务器**
```bash
npm run dev
```

5. **访问应用**
打开浏览器访问 [http://localhost:3000](http://localhost:3000)

### 生产部署

```bash
# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

## 🏗️ 技术架构

### 前端技术栈

- **框架**：Next.js 14.2.31 (App Router)
- **UI库**：React 18.3.1
- **样式**：Tailwind CSS 3.4.17
- **语言**：TypeScript 5.4.5
- **Markdown渲染**：react-markdown + remark-gfm

### 后端技术栈

- **数据库**：SQLite (better-sqlite3 9.6.0)
- **搜索引擎**：MiniSearch 6.3.0
- **AI服务**：OpenAI API 4.104.0
- **认证**：JWT (jsonwebtoken 9.0.2)
- **文件处理**：archiver 5.3.2

### 项目结构

```
chuju-digital-library/
├── app/                    # Next.js App Router 页面
│   ├── api/               # API 路由
│   ├── admin/             # 管理后台
│   ├── assistant/         # AI 助手
│   ├── login/             # 登录页面
│   ├── register/          # 注册页面
│   └── scripts/           # 剧本详情页
├── components/            # React 组件
│   ├── AdminDashboard.tsx # 管理后台组件
│   ├── AIAssistant.tsx    # AI 助手组件
│   ├── AuthClient.tsx     # 认证组件
│   ├── HomeClient.tsx     # 首页组件
│   └── Navbar.tsx         # 导航栏组件
├── lib/                   # 工具库
│   └── db.ts             # 数据库配置
├── data/                  # 数据文件
│   └── chuju.db          # SQLite 数据库
├── content/               # 内容文件
│   └── scripts/          # 剧本 Markdown 文件
├── public/                # 静态资源
└── types/                 # TypeScript 类型定义
```

## 🎯 功能特性

### 📚 剧本典藏

- **多维度分类**：按年代、题材、类型、风格分类
- **智能搜索**：支持标题、作者、内容全文搜索
- **标签系统**：20+个专业标签，精确分类
- **详情展示**：完整的剧本内容、剧照、元数据

### 🔍 搜索筛选

- **关键词搜索**：支持模糊匹配和前缀搜索
- **标签筛选**：多标签组合筛选
- **分页浏览**：支持大量数据的分页显示
- **实时搜索**：输入即时搜索，响应迅速

### 🤖 AI 剧本助手

- **创意生成**：基于主题生成剧本创意和大纲
- **片段创作**：根据场景要求生成剧本片段
- **修改建议**：对现有剧本提供专业修改建议
- **智能标签**：自动为剧本添加合适的标签

### 👤 用户系统

- **用户注册**：邮箱注册，密码加密存储
- **用户登录**：JWT认证，会话管理
- **权限控制**：用户角色和权限管理
- **忘记密码**：密码重置功能

### 🛠️ 管理后台

- **剧本管理**：新增、编辑、删除剧本
- **用户管理**：用户列表、角色管理
- **数据备份**：数据库备份和恢复
- **系统设置**：网站配置和参数设置

## 📖 API 文档

### 剧本相关 API

#### 获取剧本列表
```http
GET /api/scripts?q=关键词&tags=标签&page=1&pageSize=20&showAll=true
```

#### 获取剧本详情
```http
GET /api/scripts/[id]
```

#### 新增剧本
```http
POST /api/scripts
Content-Type: application/json

{
  "title": "剧本标题",
  "alias": "别名",
  "era": "年代",
  "author": "作者",
  "tags": ["标签1", "标签2"],
  "markdown": "剧本内容"
}
```

#### 更新剧本
```http
PATCH /api/scripts/[id]
```

#### 删除剧本
```http
DELETE /api/scripts/[id]
```

### 用户认证 API

#### 用户登录
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "邮箱",
  "password": "密码"
}
```

#### 用户注册
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "邮箱",
  "password": "密码"
}
```

#### 用户登出
```http
POST /api/auth/logout
```

### AI 助手 API

#### 生成剧本内容
```http
POST /api/assistant
Content-Type: application/json

{
  "mode": "idea|segment|review",
  "params": {
    "theme": "主题",
    "genre": "题材",
    "era": "年代",
    "roles": ["角色1", "角色2"],
    "draft": "现有剧本内容"
  }
}
```

### 系统管理 API

#### 数据备份
```http
GET /api/backup
```

#### 虚拟剧本检查
```http
GET /api/check-virtual
```

#### 数据清理
```http
POST /api/cleanup
```

## 🎨 界面设计

### 设计理念

- **传统与现代结合**：融合楚剧传统文化元素和现代设计语言
- **用户体验优先**：简洁直观的界面，流畅的交互体验
- **响应式设计**：适配桌面、平板、手机等多种设备
- **无障碍访问**：支持键盘导航和屏幕阅读器

### 主要页面

- **首页** (`/`)：剧本搜索、筛选、网格展示
- **剧本详情** (`/scripts/[id]`)：完整剧本内容展示
- **登录注册** (`/login`, `/register`)：用户认证界面
- **管理后台** (`/admin`)：内容管理系统
- **AI助手** (`/assistant`)：智能创作助手

## 🔧 开发指南

### 开发环境设置

1. **代码规范**
   - 使用 TypeScript 进行类型检查
   - 遵循 ESLint 代码规范
   - 使用 Prettier 格式化代码

2. **组件开发**
   - 使用函数式组件和 Hooks
   - 遵循 React 最佳实践
   - 组件文档使用 JSDoc 注释

3. **数据库操作**
   - 使用 `lib/db.ts` 中的工具函数
   - 遵循 SQLite 最佳实践
   - 注意数据安全和性能优化

### 测试

```bash
# 运行类型检查
npm run type-check

# 运行代码检查
npm run lint

# 构建测试
npm run build
```

## 📦 部署

### Docker 部署

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

### 环境变量

| 变量名 | 说明 | 默认值 | 必需 |
|--------|------|--------|------|
| `OPENAI_API_KEY` | OpenAI API 密钥 | - | 可选 |
| `OPENAI_MODEL` | OpenAI 模型名称 | gpt-4o-mini | 可选 |
| `JWT_SECRET` | JWT 签名密钥 | 随机生成 | 可选 |
| `DATABASE_URL` | 数据库连接字符串 | data/chuju.db | 可选 |

## 🤝 贡献指南

我们欢迎所有形式的贡献！

### 贡献方式

1. **报告问题**：在 GitHub Issues 中报告 bug 或提出建议
2. **提交代码**：Fork 项目并提交 Pull Request
3. **改进文档**：完善文档和注释
4. **分享反馈**：提供使用反馈和建议

### 开发流程

1. Fork 项目到你的 GitHub 账户
2. 克隆你的 Fork 到本地
3. 创建功能分支：`git checkout -b feature/your-feature`
4. 提交更改：`git commit -m 'Add some feature'`
5. 推送到分支：`git push origin feature/your-feature`
6. 创建 Pull Request

## 📄 许可证

本项目采用 [MIT 许可证](LICENSE)。

## 🙏 致谢

- **楚剧艺术家**：感谢所有为楚剧艺术做出贡献的艺术家
- **开源社区**：感谢所有开源项目的贡献者
- **技术支持**：感谢 Next.js、React、Tailwind CSS 等优秀框架

## 📞 联系我们

- **项目地址**：https://github.com/gaoshuping99/chuju-digital-library
- **问题反馈**：https://github.com/gaoshuping99/chuju-digital-library/issues
- **邮箱联系**：请通过 GitHub Issues 联系我们

---

**楚剧荟・剧本数字典藏馆** - 传承千年戏韵，典藏文化瑰宝 🎭 