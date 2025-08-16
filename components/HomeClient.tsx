"use client";
/**
 * Jscbc: 首页客户端组件，处理搜索与标签筛选 + 分页 + URL 同步 + 剧照图片显示
 */
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type ScriptItem = {
  id: string;
  title: string;
  alias?: string;
  era?: string;
  author?: string;
  coverUrl?: string;
  tags: string[];
  excerpt?: string;
};

// Jscbc: 封面图片组件
function CoverImage({ script }: { script: ScriptItem }) {
  const [imageSrc, setImageSrc] = useState<string>("");

  useEffect(() => {
    if (!script.coverUrl) {
      // 没有封面，使用默认的SVG封面
      setImageSrc(`/api/cover?title=${encodeURIComponent(script.title)}`);
      return;
    }

    // 处理图片URL
    if (script.coverUrl.startsWith("/")) {
      // 本地图片
      setImageSrc(script.coverUrl);
    } else if (script.coverUrl.startsWith("http")) {
      // 外部图片
      setImageSrc(script.coverUrl);
    } else {
      // 其他情况，使用默认封面
      setImageSrc(`/api/cover?title=${encodeURIComponent(script.title)}`);
    }
  }, [script.coverUrl, script.title]);

  return (
    <div className="aspect-[16/9] bg-gray-100 relative">
      <img 
        className="w-full h-full object-cover" 
        alt={script.title} 
        src={imageSrc} 
        onError={() => setImageSrc(`/api/cover?title=${encodeURIComponent(script.title)}`)}
      />
    </div>
  );
}

const TAGS = [
  "历史故事","民间传说","现实生活","爱情婚姻",
  "古代剧本","近代剧本","现代剧本",
  "悲剧","喜剧","正剧",
  "全本","折子戏",
  "完整版","简缩版","片段",
  "忠孝节义","社会批判",
  "武戏","文戏","综合性"
];

// Jscbc: 每页数量改为 9（3x3）
const PAGE_SIZE = 9;

export default function HomeClient() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const initedRef = useRef(false);

  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [data, setData] = useState<ScriptItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchData = async () => {
    setLoading(true);
    const u = new URL("/api/scripts", window.location.origin);
    if (query.trim()) u.searchParams.set("q", query.trim());
    if (activeTag) u.searchParams.set("tags", activeTag);
    u.searchParams.set("page", String(page));
    u.searchParams.set("pageSize", String(PAGE_SIZE));
    const res = await fetch(u.toString(), { cache: "no-store" });
    const json = await res.json();
    setData(json.items || []);
    setTotal(json.total || 0);
    setLoading(false);
  };

  // 初始化：从 URL 读取 q/tags/page
  useEffect(() => {
    if (initedRef.current) return;
    const qp = sp?.get("q") || "";
    const tp = sp?.get("tags");
    const pp = parseInt(sp?.get("page") || "1", 10) || 1;
    if (qp) setQuery(qp);
    if (tp) setActiveTag(tp);
    if (pp !== 1) setPage(pp);
    initedRef.current = true;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 数据加载
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // 搜索/切换标签时跳回第1页并刷新
  useEffect(() => {
    if (!initedRef.current) return;
    const handler = setTimeout(() => { setPage(1); fetchData(); }, 250);
    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, activeTag]);

  // 将分页与筛选同步到 URL（无刷新）
  useEffect(() => {
    if (!initedRef.current) return;
    const u = new URL(window.location.href);
    if (query.trim()) u.searchParams.set("q", query.trim()); else u.searchParams.delete("q");
    if (activeTag) u.searchParams.set("tags", activeTag); else u.searchParams.delete("tags");
    u.searchParams.set("page", String(page));
    router.replace(`${pathname}${u.search}`, { scroll: false });
  }, [query, activeTag, page, pathname, router]);

  const chips = useMemo(() => ["全部", ...TAGS], []);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-gradient-to-r from-red-800 via-red-600 to-red-800 text-white py-20">
        <div className="traditional-pattern absolute inset-0 opacity-30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">传承千年戏韵，典藏文化瑰宝</h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto">探索楚剧艺术的精髓，感受传统文化的魅力</p>
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") fetchData(); }}
                type="text"
                placeholder="搜索剧目、作者、年代..."
                className="w-full px-6 py-4 text-gray-800 rounded-full shadow-lg focus:outline-none focus:ring-4 focus:ring-red-300"
              />
              <button onClick={fetchData} className="absolute right-2 top-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700">
                搜索
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Filter */}
      <section className="py-8 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3 justify-center">
            {chips.map((t) => (
              <button
                key={t}
                onClick={() => setActiveTag(t === "全部" ? null : t)}
                className={`px-4 py-2 rounded-full border border-red-200 hover:bg-red-50 transition-colors text-sm ${
                  (t === "全部" && !activeTag) || activeTag === t ? "bg-red-600 text-white border-red-600" : ""
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </section>



      {/* Grid 3x3 */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center text-gray-500">加载中…</div>
          ) : (
            <>

              
              {/* Jscbc: 桌面端 3 列 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.map((s) => (
                  <Link href={`/scripts/${s.id}`} key={s.id} className="block card-hover bg-white rounded-xl shadow overflow-hidden">
                    <CoverImage script={s} />
                    <div className="p-4">
                      <h3 className="text-xl font-semibold mb-2">{s.title}{s.alias ? <span className="ml-2 text-gray-500">（{s.alias}）</span> : null}</h3>
                      <p className="text-gray-600 text-sm mb-2">{[s.era, s.author].filter(Boolean).join(" · ")}</p>
                      <div className="flex flex-wrap gap-2">
                        {s.tags?.slice(0, 4).map((t) => (
                          <span key={t} className="text-xs px-2 py-1 rounded-full bg-red-50 text-red-600 border border-red-200">{t}</span>
                        ))}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              {/* Pagination */}
              <div className="flex items-center justify-center gap-3 mt-8">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(1)}
                  className="px-3 py-1 rounded border disabled:opacity-50"
                >首页</button>
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1 rounded border disabled:opacity-50"
                >上一页</button>
                <span className="text-sm text-gray-600">第 {page} / {totalPages} 页</span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1 rounded border disabled:opacity-50"
                >下一页</button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(totalPages)}
                  className="px-3 py-1 rounded border disabled:opacity-50"
                >尾页</button>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}