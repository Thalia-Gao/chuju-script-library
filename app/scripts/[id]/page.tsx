/**
 * Jscbc: 剧本详情页
 */
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { headers } from "next/headers";

async function fetchDetail(id: string) {
  const h = headers();
  const host = h.get("x-forwarded-host") || h.get("host") || "localhost:3000";
  const proto = h.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  const base = `${proto}://${host}`;
  const res = await fetch(`${base}/api/scripts/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export default async function ScriptPage({ params }: { params: { id: string } }) {
  const data = await fetchDetail(params.id);
  if (!data) return <div className="max-w-3xl mx-auto p-4">未找到</div>;
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-2">{data.title}{data.alias ? <span className="ml-2 text-gray-500">（{data.alias}）</span> : null}</h1>
      <div className="text-gray-600 mb-4">{[data.era, data.author].filter(Boolean).join(" · ")}</div>
      <div className="flex flex-wrap gap-2 mb-8">{data.tags?.map((t: string) => <span key={t} className="text-xs px-2 py-1 rounded-full bg-red-50 text-red-600 border border-red-200">{t}</span>)}</div>
      <article className="prose max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{data.content}</ReactMarkdown>
      </article>
    </div>
  );
} 