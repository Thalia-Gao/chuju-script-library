# 楚剧荟・剧本数字典藏馆

- 技术栈：Next.js 14 + App Router、TailwindCSS、SQLite(better-sqlite3)、MiniSearch、OpenAI
- 运行
  1. `npm i`
  2. 复制 `.env.local.example` 为 `.env.local` 并填写 `OPENAI_API_KEY`（可选）
  3. `npm run dev`

- 主要页面
  - `/` 首页：搜索、筛选、剧本网格
  - `/scripts/[id]` 剧本详情（Markdown 渲染）
  - `/login`、`/register` 用户鉴权
  - `/admin` 管理后台：新增/删除、备份
  - `/assistant` 楚剧剧本创作 AI 助手

- API 说明（主要）
  - `POST /api/scripts` 新增剧本（title、markdown、tags[]）
  - `GET /api/scripts` 列表（q、tags）
  - `GET|PATCH|DELETE /api/scripts/[id]`
  - `POST /api/auth/{login|register|logout}`
  - `GET /api/backup` 下载备份 zip
  - `POST /api/assistant` 生成创意/片段/建议 