/*
 * Jscbc: 扫描 public/stills-dmx/ 下的图片文件，
 * 依据文件名（去扩展名，去可选 _sf 后缀，不区分大小写）匹配 scripts.id，
 * 批量更新 scripts.cover_url = `/stills-dmx/<实际文件名>`。
 */

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

(function main() {
  const projectRoot = process.cwd();
  const dbPath = path.join(projectRoot, 'data', 'chuju.db');
  const stillsDir = path.join(projectRoot, 'public', 'stills-dmx');

  if (!fs.existsSync(dbPath)) {
    console.error('未找到数据库文件:', dbPath);
    process.exit(1);
  }
  if (!fs.existsSync(stillsDir)) {
    console.error('未找到剧照目录:', stillsDir);
    process.exit(1);
  }

  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');

  const files = fs.readdirSync(stillsDir).filter(f => f.toLowerCase().endsWith('.png'));

  // 建立文件名到实际文件的映射：标准化键为 小写去扩展名再去掉可选的 _sf 后缀
  const nameKeyToRealFile = new Map();
  for (const f of files) {
    const base = f.replace(/\.png$/i, '');
    const normalized = base.replace(/_sf$/i, '').toLowerCase();
    if (!nameKeyToRealFile.has(normalized)) {
      nameKeyToRealFile.set(normalized, f);
    }
  }

  const rows = db.prepare('SELECT id, title, cover_url FROM scripts').all();

  let matched = 0;
  let unchanged = 0;

  const updateStmt = db.prepare('UPDATE scripts SET cover_url=? WHERE id=?');

  for (const row of rows) {
    const idKey = String(row.id).toLowerCase();
    const foundFile = nameKeyToRealFile.get(idKey);
    if (foundFile) {
      const newUrl = `/stills-dmx/${foundFile}`;
      if (row.cover_url !== newUrl) {
        updateStmt.run(newUrl, row.id);
        matched++;
        // eslint-disable-next-line no-console
        console.log(`更新封面: ${row.title} (${row.id}) -> ${newUrl}`);
      } else {
        unchanged++;
      }
    }
  }

  console.log(`匹配成功并更新: ${matched} 条`);
  console.log(`已是最新/未变更: ${unchanged} 条`);

  db.close();
})(); 