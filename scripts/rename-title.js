/*
 * Jscbc: 重命名剧本标题
 * 用法: node scripts/rename-title.js <SCRIPT_ID> <NEW_TITLE>
 */
const Database = require('better-sqlite3');
const path = require('path');

const id = process.argv[2];
const newTitle = process.argv[3];
if (!id || !newTitle) {
  console.error('用法: node scripts/rename-title.js <SCRIPT_ID> <NEW_TITLE>');
  process.exit(1);
}

const dbPath = path.join(process.cwd(), 'data', 'chuju.db');
const db = new Database(dbPath);

const row = db.prepare('SELECT id, title FROM scripts WHERE id=?').get(id);
if (!row) {
  console.error('未找到剧本:', id);
  process.exit(2);
}

db.prepare('UPDATE scripts SET title=? WHERE id=?').run(newTitle, id);
console.log(`已更新标题: ${row.title} -> ${newTitle}`); 