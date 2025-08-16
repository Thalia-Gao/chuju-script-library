/**
 * Jscbc: 检查虚拟剧本API
 * - Endpoint: GET /api/check-virtual
 * - 检查数据库中指向不存在文件的剧本记录，但不删除
 * - 支持生成Markdown文档报告
 */
import { NextResponse } from "next/server";
import { all } from "@/lib/db";
import fs from "fs";
import path from "path";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const generateMd = searchParams.get("generateMd") === "true";
    
    console.log('开始检查虚拟剧本记录...');

    // 获取所有剧本记录
    const scripts = all<any>('SELECT id, title, markdown_path FROM scripts');
    
    console.log(`数据库中共有 ${scripts.length} 个剧本记录`);

    // 检查每个剧本的文件是否存在
    const virtualScripts: Array<{id: string, title: string, path: string}> = [];
    const validScripts: Array<{id: string, title: string, path: string}> = [];

    scripts.forEach((script: any) => {
      if (script.markdown_path && fs.existsSync(script.markdown_path)) {
        validScripts.push({
          id: script.id,
          title: script.title,
          path: script.markdown_path
        });
      } else {
        virtualScripts.push({
          id: script.id,
          title: script.title,
          path: script.markdown_path || '无路径'
        });
      }
    });

    console.log(`有效剧本: ${validScripts.length} 个`);
    console.log(`虚拟剧本: ${virtualScripts.length} 个`);

    // 在控制台详细输出虚拟剧本信息
    if (virtualScripts.length > 0) {
      console.log('\n=== 虚拟剧本详细信息 ===');
      virtualScripts.forEach((script, index) => {
        console.log(`${index + 1}. ${script.title}`);
        console.log(`   ID: ${script.id}`);
        console.log(`   路径: ${script.path}`);
        console.log('');
      });
      console.log('=== 虚拟剧本详细信息结束 ===\n');
    }

    // 如果需要生成Markdown文档
    if (generateMd && virtualScripts.length > 0) {
      const mdContent = generateMarkdownReport(scripts.length, validScripts.length, virtualScripts.length, virtualScripts, validScripts);
      const reportPath = path.join(process.cwd(), 'virtual-scripts-report.md');
      
      try {
        fs.writeFileSync(reportPath, mdContent, 'utf-8');
        console.log(`Markdown报告已生成: ${reportPath}`);
      } catch (writeError) {
        console.error('生成Markdown报告失败:', writeError);
      }
    }

    return NextResponse.json({ 
      success: true,
      summary: {
        totalScripts: scripts.length,
        validScripts: validScripts.length,
        virtualScripts: virtualScripts.length
      },
      virtualScripts: virtualScripts,
      validScripts: validScripts.slice(0, 10), // 只返回前10个有效剧本作为示例
      markdownGenerated: generateMd && virtualScripts.length > 0
    });
  } catch (e: any) {
    console.error('检查虚拟剧本失败:', e);
    return NextResponse.json({ 
      success: false, 
      error: e.message || '检查失败' 
    }, { status: 500 });
  }
}

function generateMarkdownReport(
  totalScripts: number, 
  validScripts: number, 
  virtualScripts: number, 
  virtualScriptsList: Array<{id: string, title: string, path: string}>,
  validScriptsList: Array<{id: string, title: string, path: string}>
): string {
  const now = new Date().toLocaleString('zh-CN');
  
  return `# 楚剧荟・剧本数字典藏馆 - 虚拟剧本检查报告

**生成时间**: ${now}  
**检查状态**: 完成

## 📊 统计摘要

| 项目 | 数量 |
|------|------|
| 总剧本数 | ${totalScripts} |
| 有效剧本 | ${validScripts} |
| 虚拟剧本 | ${virtualScripts} |
| 数据完整率 | ${((validScripts / totalScripts) * 100).toFixed(2)}% |

## ⚠️ 虚拟剧本列表 (${virtualScripts}个)

${virtualScriptsList.map((script, index) => `
### ${index + 1}. ${script.title}

- **ID**: \`${script.id}\`
- **路径**: \`${script.path}\`
- **状态**: ❌ 文件不存在
- **问题**: 数据库中存在记录但对应的markdown文件不存在

`).join('')}

## ✅ 有效剧本示例 (前10个)

${validScriptsList.map((script, index) => `
### ${index + 1}. ${script.title}

- **ID**: \`${script.id}\`
- **路径**: \`${script.path}\`
- **状态**: ✅ 文件存在

`).join('')}

## 🔍 问题分析

### 虚拟剧本产生的原因
1. **数据导入错误**: 在导入剧本数据时，可能创建了指向不存在文件的记录
2. **文件删除**: 剧本文件被手动删除，但数据库记录未同步更新
3. **路径错误**: 数据库中的文件路径与实际文件位置不匹配
4. **UUID不一致**: 生成的UUID与文件名不匹配

### 影响范围
- **用户体验**: 用户点击虚拟剧本时会出现404错误
- **API稳定性**: 相关API会返回500错误
- **数据一致性**: 数据库记录与实际文件不一致
- **系统可靠性**: 影响整个剧本系统的稳定性

## 🛠️ 解决方案

### 立即处理
1. **清理虚拟剧本**: 删除数据库中指向不存在文件的记录
2. **数据验证**: 建立定期检查机制，确保数据一致性
3. **错误处理**: 改进API错误处理，提供友好的错误信息

### 长期预防
1. **导入验证**: 在导入剧本时验证文件是否存在
2. **定期检查**: 建立自动化检查脚本，定期验证数据完整性
3. **备份策略**: 建立文件备份机制，防止意外删除

## 📝 操作建议

1. **备份数据库**: 在清理虚拟剧本前，先备份当前数据库
2. **分批处理**: 如果虚拟剧本数量较多，建议分批清理
3. **验证结果**: 清理完成后，重新运行检查确认问题已解决
4. **监控系统**: 建立监控机制，及时发现类似问题

## 📞 技术支持

如有问题，请联系系统管理员或查看相关日志文件。

---

*本报告由系统自动生成，仅供参考。*
`;
} 