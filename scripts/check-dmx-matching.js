/*
 * Jscbc: 检查 public/stills-dmx 下的文件与 scripts.id 的匹配情况
 */
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

(function main() {
  const root = process.cwd();
  const db = new Database(path.join(root, 'data', 'chuju.db'));
  const stills = path.join(root, 'public', 'stills-dmx');
  if (!fs.existsSync(stills)) { console.error('缺少目录', stills); process.exit(1); }

  const files = fs.readdirSync(stills).filter(f => f.toLowerCase().endsWith('.png'));
  const key = (s) => s.replace(/\.png$/i, '').replace(/_sf$/i, '').toLowerCase();
  const fileKeys = new Set(files.map(key));

  const rows = db.prepare('SELECT id, title FROM scripts').all();
  let match = 0;
  let misses = [];
  for (const r of rows) {
    const idKey = String(r.id).toLowerCase();
    if (fileKeys.has(idKey)) {
      match++;
    } else {
      misses.push(r);
    }
  }

  console.log(`共 ${rows.length} 个剧本，匹配到剧照 ${match} 个，缺失 ${misses.length} 个`);
  if (misses.length) {
    console.log('缺失示例（前10条）：');
    for (const x of misses.slice(0, 10)) {
      console.log(`- ${x.title} (${x.id})`);
    }
  }
})(); 