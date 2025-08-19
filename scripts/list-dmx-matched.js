/*
 * Jscbc: 列出与 public/stills-dmx 下文件名匹配到的剧本（按标题排序）
 */
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

(function main() {
  const root = process.cwd();
  const db = new Database(path.join(root, 'data', 'chuju.db'));
  const stillsDir = path.join(root, 'public', 'stills-dmx');
  if (!fs.existsSync(stillsDir)) { console.error('缺少目录', stillsDir); process.exit(1); }

  const files = fs.readdirSync(stillsDir).filter(f => f.toLowerCase().endsWith('.png'));
  const key = (s) => s.replace(/\.png$/i, '').replace(/_sf$/i, '').toLowerCase();
  const fileKeys = new Set(files.map(key));

  const rows = db.prepare('SELECT id, title FROM scripts').all();
  const matched = rows.filter(r => fileKeys.has(String(r.id).toLowerCase()));

  matched.sort((a, b) => a.title.localeCompare(b.title, 'zh-Hans-CN'));

  console.log(`匹配到 ${matched.length} 个剧本：`);
  for (const m of matched) {
    console.log(`- ${m.title} (${m.id})`);
  }
})(); 