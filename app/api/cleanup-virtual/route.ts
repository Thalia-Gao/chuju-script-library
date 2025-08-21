/**
 * Jscbc: 清理虚拟剧本API
 * - Endpoint: POST /api/cleanup-virtual
 * - 删除数据库中指向不存在文件的剧本记录
 */
import { NextResponse } from "next/server";
import { all, run } from "@/lib/db";
import fs from "fs";

export async function POST() {
  try {
    console.log('开始清理虚拟剧本记录...');

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
          path: script.path || '无路径'
        });
      }
    });

    console.log(`有效剧本: ${validScripts.length} 个`);
    console.log(`虚拟剧本: ${virtualScripts.length} 个`);

    if (virtualScripts.length === 0) {
      return NextResponse.json({ 
        success: true,
        message: '没有发现虚拟剧本，无需清理',
        deletedCount: 0,
        remainingCount: validScripts.length
      });
    }

    console.log('发现虚拟剧本，开始清理...');
    
    // 删除虚拟剧本记录
    let deletedCount = 0;
    virtualScripts.forEach((script: any) => {
      try {
        // 先删除关联的标签
        run('DELETE FROM script_tags WHERE script_id = ?', [script.id]);
        // 再删除剧本记录
        run('DELETE FROM scripts WHERE id = ?', [script.id]);
        console.log(`已删除: ${script.title} (ID: ${script.id})`);
        deletedCount++;
      } catch (deleteError) {
        console.error(`删除剧本 ${script.title} 失败:`, deleteError);
      }
    });
    
    console.log(`清理完成！删除了 ${deletedCount} 个虚拟剧本记录`);
    
    // 重新统计
    const remainingScripts = all<any>('SELECT COUNT(*) as count FROM scripts');
    const remainingCount = remainingScripts[0]?.count || 0;
    
    return NextResponse.json({ 
      success: true,
      message: `清理完成！删除了 ${deletedCount} 个虚拟剧本记录`,
      deletedCount: deletedCount,
      remainingCount: remainingCount,
      deletedScripts: virtualScripts.map(s => ({ id: s.id, title: s.title, path: s.path }))
    });
  } catch (e: any) {
    console.error('清理虚拟剧本失败:', e);
    return NextResponse.json({ 
      success: false, 
      error: e.message || '清理失败' 
    }, { status: 500 });
  }
} 

 