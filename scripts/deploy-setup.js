/**
 * Jscbc: Render部署初始化脚本
 * 确保数据库、静态资源和映射关系在部署时正确设置
 */

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

async function setupDeployment() {
  console.log('🚀 开始Render部署初始化...');
  
  const projectRoot = process.cwd();
  const dataDir = path.join(projectRoot, 'data');
  const dbPath = path.join(dataDir, 'chuju.db');
  
  // 1. 确保数据目录存在
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log('✅ 创建数据目录:', dataDir);
  }
  
  // 2. 检查数据库文件
  if (!fs.existsSync(dbPath)) {
    console.log('❌ 数据库文件不存在，需要从备份恢复或重新初始化');
    // 这里可以添加从备份恢复数据库的逻辑
    process.exit(1);
  }
  
  // 3. 验证数据库连接
  try {
    const db = new Database(dbPath);
    const scriptCount = db.prepare('SELECT COUNT(*) as count FROM scripts').get();
    console.log(`✅ 数据库连接成功，共有 ${scriptCount.count} 个剧本`);
    
    const tagCount = db.prepare('SELECT COUNT(*) as count FROM tags').get();
    console.log(`✅ 标签数据正常，共有 ${tagCount.count} 个标签`);
    
    db.close();
  } catch (error) {
    console.error('❌ 数据库验证失败:', error.message);
    process.exit(1);
  }
  
  // 4. 检查静态资源目录
  const publicDir = path.join(projectRoot, 'public');
  const stillsDirs = ['stills-dmx', 'stills-qwen', 'stills-sf'];
  
  for (const dir of stillsDirs) {
    const stillsPath = path.join(publicDir, dir);
    if (fs.existsSync(stillsPath)) {
      const files = fs.readdirSync(stillsPath).filter(f => f.endsWith('.png'));
      console.log(`✅ ${dir} 目录存在，包含 ${files.length} 个剧照文件`);
    } else {
      console.log(`⚠️  ${dir} 目录不存在`);
    }
  }
  
  // 5. 验证静态映射文件
  const mappingFile = path.join(projectRoot, 'lib', 'script-covers-mapping.ts');
  if (fs.existsSync(mappingFile)) {
    const mappingContent = fs.readFileSync(mappingFile, 'utf8');
    const mappingCount = (mappingContent.match(/{ id:/g) || []).length;
    console.log(`✅ 静态映射文件存在，包含 ${mappingCount} 个映射关系`);
  } else {
    console.log('❌ 静态映射文件不存在');
    process.exit(1);
  }
  
  // 6. 检查内容目录
  const contentDir = path.join(projectRoot, 'content', 'scripts');
  if (fs.existsSync(contentDir)) {
    const mdFiles = fs.readdirSync(contentDir).filter(f => f.endsWith('.md'));
    console.log(`✅ 剧本内容目录存在，包含 ${mdFiles.length} 个Markdown文件`);
  } else {
    console.log('⚠️  剧本内容目录不存在');
  }
  
  console.log('🎉 Render部署初始化完成！');
}

// 如果直接运行此脚本
if (require.main === module) {
  setupDeployment().catch(error => {
    console.error('❌ 部署初始化失败:', error);
    process.exit(1);
  });
}

module.exports = { setupDeployment }; 