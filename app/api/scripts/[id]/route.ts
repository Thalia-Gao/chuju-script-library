/**
 * Jscbc: 剧本详情/编辑/删除 API
 */
import { NextResponse } from "next/server";
import { all, get, run } from "@/lib/db";
import { getCoverUrlById } from "@/lib/script-covers-mapping";
import fs from "fs";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const s = get<any>(
    `SELECT s.*, GROUP_CONCAT(t.name,'|') as tags
     FROM scripts s
     LEFT JOIN script_tags st ON s.id=st.script_id
     LEFT JOIN tags t ON t.id=st.tag_id
     WHERE s.id=?
     GROUP BY s.id`,
    [params.id]
  );
  if (!s) return NextResponse.json({ error: "未找到" }, { status: 404 });
  const content = fs.readFileSync(s.markdown_path, "utf-8");
  return NextResponse.json({
    id: s.id,
    title: s.title,
    alias: s.alias,
    era: s.era,
    author: s.author,
    // 使用静态映射获取封面URL
    cover_url: getCoverUrlById(s.id) || null,
    tags: s.tags ? (s.tags as string).split("|") : [],
    content
  });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const { title, alias, era, author, tags = [], content } = body || {};
  if (!title) return NextResponse.json({ error: "缺少标题" }, { status: 400 });
  
  const s = get<any>("SELECT markdown_path FROM scripts WHERE id=?", [params.id]);
  if (!s) return NextResponse.json({ error: "未找到" }, { status: 404 });
  
  if (content) fs.writeFileSync(s.markdown_path, content, "utf-8");
  
  run("UPDATE scripts SET title=?, alias=?, era=?, author=? WHERE id=?", 
      [title, alias || null, era || null, author || null, params.id]);
  
  run("DELETE FROM script_tags WHERE script_id=?", [params.id]);
  if (Array.isArray(tags) && tags.length) {
    for (const t of tags) {
      const row = get<{ id: string }>("SELECT id FROM tags WHERE name=?", [t]);
      if (row?.id) run("INSERT OR IGNORE INTO script_tags(script_id, tag_id) VALUES(?,?)", [params.id, row.id]);
    }
  }
  
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const s = get<any>("SELECT markdown_path FROM scripts WHERE id=?", [params.id]);
  if (!s) return NextResponse.json({ error: "未找到" }, { status: 404 });
  
  try { fs.unlinkSync(s.markdown_path); } catch {}
  run("DELETE FROM script_tags WHERE script_id=?", [params.id]);
  run("DELETE FROM scripts WHERE id=?", [params.id]);
  
  return NextResponse.json({ ok: true });
} 