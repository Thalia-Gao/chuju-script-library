/**
 * Jscbc: 特殊剧本查询API - 用于获取特定剧本的详细信息
 * - Endpoint: GET /api/scripts/special?title=剧本标题
 */
import { NextResponse } from "next/server";
import { all } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get("title");
    
    if (!title) {
      return NextResponse.json({ error: "缺少剧本标题参数" }, { status: 400 });
    }

    // 查询所有匹配标题的剧本
    const rows = all<any>(
      `SELECT s.*, GROUP_CONCAT(t.name,'|') as tags
       FROM scripts s
       LEFT JOIN script_tags st ON s.id=st.script_id
       LEFT JOIN tags t ON t.id=st.tag_id
       WHERE s.title = ?
       GROUP BY s.id
       ORDER BY s.created_at DESC`,
      [title]
    );

    const items = rows.map((r) => ({
      id: r.id,
      title: r.title,
      alias: r.alias,
      era: r.era,
      author: r.author,
      excerpt: r.excerpt,
      coverUrl: r.cover_url,
      markdownPath: r.markdown_path,
      tags: r.tags ? (r.tags as string).split("|") : [],
      createdAt: r.created_at
    }));

    return NextResponse.json({ 
      title,
      items,
      total: items.length,
      hasPendingTask: items.some(item => {
        try {
          const parsed = JSON.parse(item.coverUrl || "{}");
          return parsed.taskId && parsed.status === "PENDING";
        } catch {
          return false;
        }
      })
    });
  } catch (e: any) {
    console.error("Special Scripts API Error:", e);
    return NextResponse.json({ error: e.message || "服务器错误" }, { status: 500 });
  }
} 