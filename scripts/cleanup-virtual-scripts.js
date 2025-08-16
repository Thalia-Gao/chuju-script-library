/**
 * 清理数据库中的虚拟剧本记录
 * 这些记录指向不存在的markdown文件
 */
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../data/chuju.db');
const db = new Database(dbPath);

console.log('开始清理虚拟剧本记录...');

// 获取所有剧本记录
const scripts = db.prepare('SELECT id, title, markdown_path FROM scripts').all();

console.log(`数据库中共有 ${scripts.length} 个剧本记录`);

// 检查每个剧本的文件是否存在
const virtualScripts = [];
const validScripts = [];

scripts.forEach(script => {
  if (script.markdown_path && fs.existsSync(script.markdown_path)) {
    validScripts.push(script);
  } else {
    virtualScripts.push(script);
  }
});

console.log(`\n有效剧本: ${validScripts.length} 个`);
console.log(`虚拟剧本: ${virtualScripts.length} 个`);

if (virtualScripts.length > 0) {
  console.log('\n虚拟剧本列表:');
  virtualScripts.forEach(script => {
    console.log(`- ${script.title} (ID: ${script.id})`);
    console.log(`  路径: ${script.markdown_path}`);
  });
  
  // 询问是否删除虚拟剧本
  console.log('\n是否删除这些虚拟剧本记录? (y/N)');
  process.stdin.once('data', (data) => {
    const answer = data.toString().trim().toLowerCase();
    
    if (answer === 'y' || answer === 'yes') {
      console.log('\n开始删除虚拟剧本记录...');
      
      // 删除虚拟剧本记录
      const deleteStmt = db.prepare('DELETE FROM scripts WHERE id = ?');
      const deleteTagsStmt = db.prepare('DELETE FROM script_tags WHERE script_id = ?');
      
      virtualScripts.forEach(script => {
        // 先删除关联的标签
        deleteTagsStmt.run(script.id);
        // 再删除剧本记录
        deleteStmt.run(script.id);
        console.log(`已删除: ${script.title}`);
      });
      
      console.log(`\n清理完成！删除了 ${virtualScripts.length} 个虚拟剧本记录`);
      
      // 重新统计
      const remainingScripts = db.prepare('SELECT COUNT(*) as count FROM scripts').get();
      console.log(`剩余有效剧本: ${remainingScripts.count} 个`);
    } else {
      console.log('取消删除操作');
    }
    
    db.close();
    process.exit(0);
  });
} else {
  console.log('没有发现虚拟剧本，数据库状态正常');
  db.close();
} 