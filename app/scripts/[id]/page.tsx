/**
 * Jscbc: 剧本详情页（改为直接读 DB 与本地文件，避免 SSR 自身网络请求超时）
 */
import Link from "next/link";
import { get, run } from "@/lib/db";
import { getCoverUrlById } from "@/lib/script-covers-mapping";
import fs from "fs";
import path from "path";
import dynamic from "next/dynamic";

const CollapsibleMarkdown = dynamic(() => import("@/components/CollapsibleMarkdown"), { ssr: false });

type ScriptData = {
  id: string;
  title: string;
  alias?: string;
  era?: string;
  author?: string;
  cover_url?: string;
  tags: string[];
  content: string;
};

async function fetchDetailDirect(id: string): Promise<ScriptData | null> {
  const s = get<any>(
    `SELECT s.*, (
       SELECT GROUP_CONCAT(t.name,'|') FROM script_tags st
       LEFT JOIN tags t ON t.id=st.tag_id
       WHERE st.script_id=s.id
     ) as tags
     FROM scripts s
     WHERE s.id=?`,
    [id]
  );
  if (!s) return null;

  // 兼容旧路径：若存储的绝对路径失效，则回退到当前工程 content/scripts 下搜索同名文件
  let filePath: string | null = null;
  if (s.markdown_path && fs.existsSync(s.markdown_path)) {
    filePath = s.markdown_path as string;
  } else {
    const base = path.basename(String(s.markdown_path || "")) || `${s.id}.md`;
    const candidate = path.join(process.cwd(), "content", "scripts", base);
    if (fs.existsSync(candidate)) {
      filePath = candidate;
      try { run("UPDATE scripts SET markdown_path=? WHERE id=?", [candidate, id]); } catch {}
    }
  }

  const content = filePath ? fs.readFileSync(filePath, "utf-8") : "（提示）原始剧本文本文件缺失，可能已被移动或删除。";

  return {
    id: s.id,
    title: s.title,
    alias: s.alias || undefined,
    era: s.era || undefined,
    author: s.author || undefined,
    // 使用静态映射获取封面URL
    cover_url: getCoverUrlById(s.id) || undefined,
    tags: s.tags ? String(s.tags).split("|") : [],
    content
  };
}

export default async function ScriptPage({ params }: { params: { id: string } }) {
  const data = await fetchDetailDirect(params.id);
  
  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">未找到剧本</h1>
          <Link href="/" className="text-red-600 hover:text-red-700">
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  const author = data.author || "佚名";

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8 sm:py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <section className="bg-white shadow-xl rounded-lg overflow-hidden mb-8">
            <div className="p-6 sm:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <div className="mb-6">
                    <Link href="/" className="inline-flex items-center text-red-600 hover:text-red-700 mb-4">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      返回首页
                    </Link>
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">{data.title}</h1>
                    {data.alias && (
                      <p className="text-lg text-gray-600 mb-2">别名：{data.alias}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <span>作者：{author}</span>
                      {data.era && <span>时代：{data.era}</span>}
                    </div>
                  </div>

                  {data.tags.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">标签</h3>
                      <div className="flex flex-wrap gap-2">
                        {data.tags.map((tag, idx) => (
                          <span key={idx} className="px-3 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="lg:col-span-1">
                  {data.cover_url && (
                    <div className="bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={data.cover_url}
                        alt={`《${data.title}》剧照`}
                        className="w-full h-auto object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white shadow-xl rounded-lg overflow-hidden">
            <div className="p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">剧本正文</h2>
              <div className="prose prose-lg max-w-none">
                <CollapsibleMarkdown content={data.content} />
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
} 