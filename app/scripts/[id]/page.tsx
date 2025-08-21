/**
 * Jscbc: 剧本详情页
 */
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { headers } from "next/headers";
import Link from "next/link";

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

type SummaryData = {
  summary: string;
  source: 'existing' | 'generated';
};

async function fetchDetail(id: string): Promise<ScriptData | null> {
  const h = headers();
  const host = h.get("x-forwarded-host") || h.get("host") || "localhost:3000";
  const proto = h.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  const base = `${proto}://${host}`;
  const res = await fetch(`${base}/api/scripts/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

async function generateSummary(content: string, title: string): Promise<SummaryData | null> {
  try {
    const h = headers();
    const host = h.get("x-forwarded-host") || h.get("host") || "localhost:3000";
    const proto = h.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
    const base = `${proto}://${host}`;
    
    const res = await fetch(`${base}/api/generate-summary`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, title })
    });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error("生成剧情简介失败:", error);
    return null;
  }
}

export default async function ScriptPage({ params }: { params: { id: string } }) {
  const data = await fetchDetail(params.id);
  
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

  // 生成剧情简介
  const summaryData = await generateSummary(data.content, data.title);
  const summary = summaryData?.summary || "";

  // 处理作者信息
  const author = data.author || "佚名";

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8 sm:py-12">
        {/* Jscbc: 统一的页面内容容器 */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 第一部分：剧照和基本信息 */}
          <section className="bg-white shadow-xl rounded-lg overflow-hidden mb-8">
            <div className="p-6 sm:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 剧照区域 */}
                <div className="lg:col-span-1">
                  <div className="aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden shadow-md">
                    {data.cover_url ? (
                      <img 
                        src={data.cover_url} 
                        alt={data.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-500 to-red-700">
                        <div className="text-center text-white p-4">
                          <div className="text-2xl font-bold mb-2">{data.title}</div>
                          <div className="text-sm opacity-80">楚剧荟・剧本数字典藏馆</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 基本信息区域 */}
                <div className="lg:col-span-2">
                  {/* 标题和别名 */}
                  <div className="mb-6">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                      {data.title}
                    </h1>
                    {data.alias && (
                      <p className="text-lg text-gray-600">
                        别名：{data.alias}
                      </p>
                    )}
                  </div>

                  {/* 作者信息 */}
                  <div className="mb-6 space-y-3">
                    <div className="flex items-center text-gray-700">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-700" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" /></svg>
                      <span className="font-medium">作者：{author}</span>
                    </div>
                    {data.era && (
                      <div className="flex items-center text-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-700" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>
                        <span className="font-medium">创作年代：{data.era}</span>
                      </div>
                    )}
                  </div>

                  {/* 标签信息 */}
                  <div className="mb-6">
                    <div className="flex items-center mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-red-700" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V4zm3 2a1 1 0 000 2h.01a1 1 0 100-2H8z" /></svg>
                      <h3 className="text-lg font-semibold text-gray-800">标签</h3>
                    </div>
                    <div className="flex flex-wrap gap-2 pl-8">
                      {data.tags.length > 0 ? (
                        data.tags.map((tag) => (
                          <span 
                            key={tag} 
                            className="px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full text-sm font-medium"
                          >
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500 text-sm">暂无标签</span>
                      )}
                    </div>
                  </div>

                  {/* 剧情简介 */}
                  <div>
                    <div className="flex items-center mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-red-700" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" /></svg>
                      <h3 className="text-lg font-semibold text-gray-800">剧情简介</h3>
                    </div>
                    <div className="pl-8">
                      {summary ? (
                        <p className="text-gray-700 leading-relaxed">{summary}</p>
                      ) : (
                        <p className="text-gray-500">暂无剧情简介</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 第二部分：剧本全文 */}
          <section className="bg-white rounded-lg shadow-xl">
            {/* 标签页标题 */}
            <div className="border-b border-gray-200 px-6 py-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-red-700" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
              <h2 className="text-xl font-semibold text-gray-800">剧本全文</h2>
            </div>

            {/* 剧本内容 */}
            <div className="p-6 sm:p-8">
              <article className="prose prose-lg max-w-none">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    // 保持原始格式，包括空行
                    p: ({ children }: any) => <p className="mb-4">{children}</p>,
                    // 保持标题样式
                    h1: ({ children }: any) => <h1 className="text-2xl font-bold text-gray-900 mb-4 mt-6">{children}</h1>,
                    h2: ({ children }: any) => <h2 className="text-xl font-bold text-gray-800 mb-3 mt-5">{children}</h2>,
                    h3: ({ children }: any) => <h3 className="text-lg font-semibold text-gray-800 mb-2 mt-4">{children}</h3>,
                  }}
                >
                  {data.content}
                </ReactMarkdown>
              </article>
            </div>
          </section>
        </div>
      </div>
    </>
  );
} 