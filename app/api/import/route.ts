/**
 * Jscbc: 批量导入本地 Markdown 剧本
 */
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { get, run } from "@/lib/db";

function pickTitle(filePath: string) {
  try {
    const text = fs.readFileSync(filePath, "utf-8");
    const firstLine = text.split(/\r?\n/)[0]?.trim() || "";
    if (firstLine.startsWith("# ")) return firstLine.replace(/^#\s+/, "").trim();
  } catch {}
  return path.basename(filePath, ".md");
}

export async function POST() {
  const dir = path.join(process.cwd(), "content", "scripts");
  if (!fs.existsSync(dir)) return NextResponse.json({ ok: false, error: "目录不存在", dir }, { status: 400 });
  const files = fs.readdirSync(dir).filter((f) => f.toLowerCase().endsWith(".md"));
  let inserted = 0, skipped = 0;
  for (const f of files) {
    const full = path.join(dir, f);
    const exist = get<{ id: string }>("SELECT id FROM scripts WHERE markdown_path=?", [full]);
    if (exist?.id) { skipped++; continue; }
    const title = pickTitle(full);
    run(
      "INSERT INTO scripts(id,title,alias,era,author,cover_url,excerpt,markdown_path,created_at) VALUES(hex(randomblob(16)),?,?,?,?,?,?,?,datetime('now'))",
      [title, null, null, null, null, null, full]
    );
    inserted++;
  }
  return NextResponse.json({ ok: true, total: files.length, inserted, skipped });
} 