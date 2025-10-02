/**
 * Jscbc: 生成静态剧本封面映射数据
 * 从数据库中导出所有剧本和封面的映射关系，生成静态配置文件
 */

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

function main() {
  const projectRoot = process.cwd();
  const dbPath = path.join(projectRoot, 'data', 'chuju.db');
  const mappingFilePath = path.join(projectRoot, 'lib', 'script-covers-mapping.ts');

  if (!fs.existsSync(dbPath)) {
    console.error('未找到数据库文件:', dbPath);
    process.exit(1);
  }

  const db = new Database(dbPath);
  
  // 查询所有有封面的剧本
  const rows = db.prepare(`
    SELECT id, title, cover_url 
    FROM scripts 
    WHERE cover_url IS NOT NULL AND cover_url != '' 
    ORDER BY title
  `).all();

  console.log(`找到 ${rows.length} 个有封面的剧本`);

  // 生成映射数据的TypeScript代码
  const mappingData = rows.map(row => {
    // 转义标题中的特殊字符
    const escapedTitle = row.title.replace(/"/g, '\\"').replace(/'/g, "\\'");
    return `  { id: "${row.id}", title: "${escapedTitle}", cover_url: "${row.cover_url}" }`;
  }).join(',\n');

  // 生成完整的TypeScript文件内容
  const fileContent = `/**
 * Jscbc: 剧本封面静态映射配置
 * 这个文件包含所有剧本ID与对应剧照URL的静态映射关系
 * 用于部署时确保剧本和剧照的正确匹配
 * 
 * 自动生成于: ${new Date().toISOString()}
 * 总计剧本数: ${rows.length}
 */

export interface ScriptCoverMapping {
  id: string;
  title: string;
  cover_url: string;
}

// 静态映射数据 - 从数据库导出生成
export const SCRIPT_COVERS_MAPPING: ScriptCoverMapping[] = [
${mappingData}
];

/**
 * 根据剧本ID获取封面URL
 */
export function getCoverUrlById(scriptId: string): string | null {
  const mapping = SCRIPT_COVERS_MAPPING.find(item => item.id === scriptId);
  return mapping?.cover_url || null;
}

/**
 * 根据剧本标题获取封面URL
 */
export function getCoverUrlByTitle(title: string): string | null {
  const mapping = SCRIPT_COVERS_MAPPING.find(item => item.title === title);
  return mapping?.cover_url || null;
}

/**
 * 获取所有有封面的剧本ID列表
 */
export function getAllScriptIdsWithCovers(): string[] {
  return SCRIPT_COVERS_MAPPING.map(item => item.id);
}

/**
 * 检查剧本是否有封面
 */
export function hasScriptCover(scriptId: string): boolean {
  return SCRIPT_COVERS_MAPPING.some(item => item.id === scriptId);
}

/**
 * 获取映射统计信息
 */
export function getMappingStats() {
  const dmxCount = SCRIPT_COVERS_MAPPING.filter(item => item.cover_url.includes('/stills-dmx/')).length;
  const qwenCount = SCRIPT_COVERS_MAPPING.filter(item => item.cover_url.includes('/stills-qwen/')).length;
  const sfCount = SCRIPT_COVERS_MAPPING.filter(item => item.cover_url.includes('/stills-sf/')).length;
  
  return {
    total: SCRIPT_COVERS_MAPPING.length,
    dmx: dmxCount,
    qwen: qwenCount,
    sf: sfCount
  };
}`;

  // 写入文件
  fs.writeFileSync(mappingFilePath, fileContent, 'utf8');
  
  console.log(`✅ 静态映射文件已生成: ${mappingFilePath}`);
  console.log(`📊 统计信息:`);
  
  const dmxCount = rows.filter(row => row.cover_url.includes('/stills-dmx/')).length;
  const qwenCount = rows.filter(row => row.cover_url.includes('/stills-qwen/')).length;
  const sfCount = rows.filter(row => row.cover_url.includes('/stills-sf/')).length;
  
  console.log(`   - 总计: ${rows.length} 个剧本`);
  console.log(`   - DMX 剧照: ${dmxCount} 个`);
  console.log(`   - Qwen 剧照: ${qwenCount} 个`);
  console.log(`   - SF 剧照: ${sfCount} 个`);

  db.close();
}

if (require.main === module) {
  main();
}

module.exports = { main }; 