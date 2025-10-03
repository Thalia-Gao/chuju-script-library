import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCoverUrlById } from "@/lib/script-covers-mapping";
import ScriptCoverImage from "@/components/ScriptCoverImage";
import CollapsibleMarkdown from "@/components/CollapsibleMarkdown";
import fs from "fs";
import path from "path";

// Jscbc: 直接查询数据库获取剧本详情
async function fetchDetailDirect(id: string) {
  const Database = require('better-sqlite3');
  const db = new Database('data/chuju.db');
  
  const stmt = db.prepare(`
    SELECT s.*, 
           GROUP_CONCAT(t.name) as tags
    FROM scripts s
    LEFT JOIN script_tags st ON s.id = st.script_id
    LEFT JOIN tags t ON st.tag_id = t.id
    WHERE s.id = ?
    GROUP BY s.id
  `);
  
  const result = stmt.get(id);
  db.close();
  
  if (!result) {
    return null;
  }
  
  // 读取剧本内容文件
  let content = '';
  if (result.markdown_path) {
    try {
      const contentPath = path.join(process.cwd(), result.markdown_path);
      if (fs.existsSync(contentPath)) {
        content = fs.readFileSync(contentPath, 'utf-8');
      }
    } catch (error) {
      console.error('读取剧本内容失败:', error);
    }
  }
  
  return {
    ...result,
    tags: result.tags ? result.tags.split(',') : [],
    cover_url: getCoverUrlById(result.id) || null,
    content: content
  };
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const data = await fetchDetailDirect(params.id);
  
  if (!data) {
    return {
      title: "剧本未找到",
    };
  }

  return {
    title: `${data.title} - 楚剧荟・剧本数字典藏馆`,
    description: data.excerpt || `《${data.title}》剧本详情`,
  };
}

export default async function ScriptPage({ params }: { params: { id: string } }) {
  const data = await fetchDetailDirect(params.id);
  
  if (!data) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 剧本基本信息卡片 */}
        <div className="bg-white shadow-xl rounded-lg overflow-hidden mb-8">
          <div className="p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{data.title}</h1>
                {data.alias && (
                  <p className="text-lg text-gray-600 mt-1">（{data.alias}）</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">剧本ID: {data.id}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-500">时代背景</span>
                      <p className="text-lg">{data.era || "未标注"}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">作者</span>
                      <p className="text-lg">{data.author || "未知"}</p>
                    </div>
                  </div>

                  {data.tags && data.tags.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">标签</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {data.tags.map((tag: string) => (
                          <span key={tag} className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-sm border border-red-200">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {data.excerpt && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">简介</span>
                      <p className="text-gray-700 mt-1 leading-relaxed">{data.excerpt}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Jscbc: 只显示一张剧照，与首页保持一致 */}
              <div className="lg:col-span-1">
                {data.cover_url && (
                  <div className="bg-gray-100 rounded-lg overflow-hidden">
                    <ScriptCoverImage
                      src={data.cover_url}
                      alt={`《${data.title}》剧照`}
                      className="w-full h-auto object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 剧本正文 */}
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">剧本正文</h2>
            <div className="prose prose-lg max-w-none">
              <CollapsibleMarkdown content={data.content} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}