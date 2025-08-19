/**
 * Jscbc: 剧本详情/编辑/删除 API
 */
import { NextResponse } from "next/server";
import { all, get, run } from "@/lib/db";
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
    cover_url: s.cover_url,
    tags: s.tags ? (s.tags as string).split("|") : [],
    content
  });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const { title, alias, era, author, tags, markdown, cover_url } = body || {};
  const s = get<any>("SELECT * FROM scripts WHERE id=?", [params.id]);
  if (!s) return NextResponse.json({ error: "未找到" }, { status: 404 });
  run(
    "UPDATE scripts SET title=COALESCE(?,title), alias=COALESCE(?,alias), era=COALESCE(?,era), author=COALESCE(?,author), cover_url=COALESCE(?,cover_url) WHERE id=?",
    [title, alias, era, author, cover_url, params.id]
  );
  if (Array.isArray(tags)) {
    run("DELETE FROM script_tags WHERE script_id=?", [params.id]);
    for (const t of tags) {
      const row = get<{ id: string }>("SELECT id FROM tags WHERE name=?", [t]);
      if (row?.id) run("INSERT OR IGNORE INTO script_tags(script_id, tag_id) VALUES(?,?)", [params.id, row.id]);
    }
  }
  if (typeof markdown === "string") {
    fs.writeFileSync(s.markdown_path, markdown, "utf-8");
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const s = get<any>("SELECT * FROM scripts WHERE id=?", [params.id]);
  if (!s) return NextResponse.json({ error: "未找到" }, { status: 404 });
  run("DELETE FROM scripts WHERE id=?", [params.id]);
  try { fs.unlinkSync(s.markdown_path); } catch {}
  return NextResponse.json({ ok: true });
} 