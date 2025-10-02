/**
 * Jscbc: 剧本列表/新增 API
 */
import { NextResponse } from "next/server";
import { all, run, get } from "@/lib/db";
import { getCoverUrlById } from "@/lib/script-covers-mapping";
import { v4 as uuid } from "uuid";
import path from "path";
import fs from "fs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  const tag = (searchParams.get("tags") || "").trim();
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const pageSize = Math.max(1, parseInt(searchParams.get("pageSize") || "50", 10));
  const showAll = searchParams.get("showAll") === "true";

  let rows: any[];
  
  if (showAll) {
    // 显示所有记录，包括重复标题
    rows = all<any>(
      `SELECT s.*, GROUP_CONCAT(t.name,'|') as tags
       FROM scripts s
       LEFT JOIN script_tags st ON s.id=st.script_id
       LEFT JOIN tags t ON t.id=st.tag_id
       GROUP BY s.id
       ORDER BY s.created_at DESC`
    );
  } else {
    // 默认行为：去重显示
    rows = all<any>(
      `SELECT s.*, GROUP_CONCAT(t.name,'|') as tags
       FROM scripts s
       LEFT JOIN script_tags st ON s.id=st.script_id
       LEFT JOIN tags t ON t.id=st.tag_id
       GROUP BY s.title
       ORDER BY s.created_at DESC`
    );
  }
  
  let items = rows.map((r) => ({
    id: r.id,
    title: r.title,
    alias: r.alias,
    era: r.era,
    author: r.author,
    excerpt: r.excerpt,
    // 使用静态映射获取封面URL，确保部署时的稳定性
    cover_url: getCoverUrlById(r.id) || null,
    tags: r.tags ? (r.tags as string).split("|") : []
  }));
  
  if (q) {
    const Q = q.toLowerCase();
    items = items.filter((it) =>
      [it.title, it.alias, it.era, it.author].filter(Boolean).some((v) => String(v).toLowerCase().includes(Q))
    );
  }
  if (tag) {
    items = items.filter((it) => it.tags?.includes(tag));
  }

  const total = items.length;
  const start = (page - 1) * pageSize;
  const pageItems = items.slice(start, start + pageSize);

  return NextResponse.json({ items: pageItems, total, page, pageSize });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { title, alias, era, author, tags = [], markdown } = body || {};
  if (!title || !markdown) return NextResponse.json({ error: "缺少参数" }, { status: 400 });
  const id = uuid();
  const contentDir = path.join(process.cwd(), "content", "scripts");
  fs.mkdirSync(contentDir, { recursive: true });
  const mdPath = path.join(contentDir, `${id}.md`);
  fs.writeFileSync(mdPath, markdown, "utf-8");
  run(
    "INSERT INTO scripts(id,title,alias,era,author,cover_url,excerpt,markdown_path,created_at) VALUES(?,?,?,?,?,?,?,?,datetime('now'))",
    [id, title, alias || null, era || null, author || null, null, null, mdPath]
  );
  if (Array.isArray(tags) && tags.length) {
    for (const t of tags) {
      const row = get<{ id: string }>("SELECT id FROM tags WHERE name=?", [t]);
      if (row?.id) run("INSERT OR IGNORE INTO script_tags(script_id, tag_id) VALUES(?,?)", [id, row.id]);
    }
  }
  return NextResponse.json({ id });
} 