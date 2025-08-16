/**
 * Jscbc: 批量演示数据种子 API（开发/演示环境使用）
 */
import { NextResponse } from "next/server";
import { run, get } from "@/lib/db";
import { v4 as uuid } from "uuid";
import fs from "fs";
import path from "path";

const DEMO_ITEMS: Array<{ title: string; alias?: string; era?: string; author?: string; tags: string[]; md: string }>= [
  { title: "打金枝", alias: "醉打金枝", era: "古代剧本", author: "佚名", tags: ["历史故事","古代剧本","正剧"], md: `# 打金枝\n【念白】唐德宗微服宴饮……` },
  { title: "白蛇传", alias: "许仙白娘子", era: "古代剧本", author: "佚名", tags: ["民间传说","古代剧本","爱情婚姻","悲剧"], md: `# 白蛇传\n【唱】二黄慢板……` },
  { title: "天仙配", alias: "七仙女下凡", era: "古代剧本", author: "佚名", tags: ["民间传说","古代剧本","喜剧"], md: `# 天仙配\n【念白】董永负薪……` },
  { title: "牡丹亭", alias: "还魂记", era: "明代剧本", author: "汤显祖", tags: ["爱情婚姻","古代剧本","悲剧"], md: `# 牡丹亭\n【唱】游园惊梦……` },
  { title: "昭君出塞", alias: "和亲记", era: "古代剧本", author: "佚名", tags: ["历史故事","古代剧本","正剧"], md: `# 昭君出塞\n【念白】胡地风寒……` },
  { title: "梁山伯与祝英台", alias: "梁祝", era: "古代剧本", author: "佚名", tags: ["民间传说","古代剧本","爱情婚姻","悲剧"], md: `# 梁祝\n【唱】草桥结义……` },
  { title: "屈原", alias: "离骚", era: "古代剧本", author: "佚名", tags: ["历史故事","古代剧本","正剧"], md: `# 屈原\n【念白】怀石投江……` },
  { title: "药圣李时珍", alias: "本草纲目", era: "明代剧本", author: "佚名", tags: ["历史故事","近代剧本","正剧"], md: `# 药圣李时珍\n【念白】采药踏山……` },
  { title: "楚汉争", alias: "鸿门宴", era: "古代剧本", author: "佚名", tags: ["历史故事","古代剧本","正剧"], md: `# 楚汉争\n【念白】帐前风急……` },
  { title: "闹花灯", alias: "花鼓情", era: "现代剧本", author: "集体", tags: ["现实生活","现代剧本","喜剧"], md: `# 闹花灯\n【唱】花鼓点子……` }
];

export async function POST() {
  const contentDir = path.join(process.cwd(), "content", "scripts");
  fs.mkdirSync(contentDir, { recursive: true });

  let inserted = 0;
  for (const it of DEMO_ITEMS) {
    const exists = get<{ id: string }>("SELECT id FROM scripts WHERE title=?", [it.title]);
    if (exists?.id) continue;
    const id = uuid();
    const mdPath = path.join(contentDir, `${id}.md`);
    fs.writeFileSync(mdPath, it.md, "utf-8");
    run(
      "INSERT INTO scripts(id,title,alias,era,author,cover_url,excerpt,markdown_path,created_at) VALUES(?,?,?,?,?,?,?,?,datetime('now'))",
      [id, it.title, it.alias || null, it.era || null, it.author || null, null, null, mdPath]
    );
    // 关联标签
    for (const tag of it.tags) {
      const t = get<{ id: string }>("SELECT id FROM tags WHERE name=?", [tag]);
      if (t?.id) run("INSERT OR IGNORE INTO script_tags(script_id, tag_id) VALUES(?,?)", [id, t.id]);
    }
    inserted++;
  }

  return NextResponse.json({ ok: true, inserted });
} 