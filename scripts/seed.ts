/**
 * Jscbc: 可选数据种子脚本（node scripts/seed.ts）
 */
import fs from "fs";
import path from "path";
import { run, get } from "@/lib/db";
import { v4 as uuid } from "uuid";

const mdPath = path.join(process.cwd(), "content", "scripts", "sample.md");
const id = uuid();

if (fs.existsSync(mdPath)) {
  run(
    "INSERT OR IGNORE INTO scripts(id,title,alias,era,author,markdown_path,created_at) VALUES(?,?,?,?,?,?,datetime('now'))",
    [id, "楚弦初响", "初响", "古代剧本", "无名", mdPath]
  );
  const tagId = get<{ id: string }>("SELECT id FROM tags WHERE name=?", ["古代剧本"])?.id;
  if (tagId) run("INSERT OR IGNORE INTO script_tags(script_id, tag_id) VALUES(?,?)", [id, tagId]);
} 