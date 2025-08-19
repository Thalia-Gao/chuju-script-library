/*
 * Jscbc: 删除剧本工具
 * 用法: node scripts/delete-script.js <SCRIPT_ID>
 * 动作: 删除 scripts 记录、script_tags 关联、封面图片文件以及 markdown 文件
 */

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const SCRIPT_ID = process.argv[2];
if (!SCRIPT_ID) {
  console.error('缺少参数: SCRIPT_ID');
  process.exit(1);
}

function unlinkSafe(filePath) {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('已删除文件:', filePath);
    }
  } catch (e) {
    console.warn('删除文件失败:', filePath, e?.message || e);
  }
}

(function main() {
  const root = process.cwd();
  const dbPath = path.join(root, 'data', 'chuju.db');
  const publicDir = path.join(root, 'public');

  const db = new Database(dbPath);
  const getStmt = db.prepare('SELECT id, title, cover_url, markdown_path FROM scripts WHERE id=?');
  const row = getStmt.get(SCRIPT_ID);
  if (!row) {
    console.error('未找到剧本:', SCRIPT_ID);
    process.exit(2);
  }

  console.log('将删除剧本:', row.title, `(${row.id})`);

  // 删除封面图片
  if (row.cover_url && (row.cover_url.startsWith('/stills-qwen/') || row.cover_url.startsWith('/stills-dmx/'))) {
    const coverPath = path.join(publicDir, row.cover_url.replace(/^\/+/, ''));
    unlinkSafe(coverPath);
  }

  // 删除 markdown 文件
  if (row.markdown_path) {
    // 仅删除位于项目内的文件，避免误删
    const abs = path.isAbsolute(row.markdown_path) ? row.markdown_path : path.join(root, row.markdown_path);
    if (abs.startsWith(root)) {
      unlinkSafe(abs);
    } else {
      console.warn('跳过删除项目外的文件:', abs);
    }
  }

  // 删除数据库关联与记录
  const delTags = db.prepare('DELETE FROM script_tags WHERE script_id=?');
  const delScript = db.prepare('DELETE FROM scripts WHERE id=?');
  const txn = db.transaction((id) => {
    delTags.run(id);
    delScript.run(id);
  });
  txn(SCRIPT_ID);

  console.log('数据库记录与关联已删除。');
})(); 