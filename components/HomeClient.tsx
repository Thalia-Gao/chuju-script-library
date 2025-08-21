"use client";
/**
 * Jscbc: 首页客户端组件，处理搜索与标签筛选 + 分页 + URL 同步 + 剧照图片显示
 */
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

// 访问统计：页面首次渲染计数（防抖）
function useCountViewOnce() {
	const countedRef = useRef(false);
	useEffect(() => {
		if (countedRef.current) return;
		countedRef.current = true;
		fetch("/api/admin/stats", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: "total_views", delta: 1 }) })
			.catch(() => {});
	}, []);
}

type ScriptItem = {
  id: string;
  title: string;
  alias?: string;
  era?: string;
  author?: string;
  cover_url?: string;
  tags: string[];
  excerpt?: string;
};

// Jscbc: 封面图片组件（已修复）
function CoverImage({ script }: { script: ScriptItem }) {
  // 优先使用封面URL，如果无效或加载失败，则回退到API生成的封面
  const fallbackUrl = `/api/cover?title=${encodeURIComponent(script.title)}`;

  const getInitialSrc = () => {
    if (script.cover_url && (script.cover_url.startsWith('/') || script.cover_url.startsWith('http'))) {
      return script.cover_url;
    }
    return fallbackUrl;
  };

  const [imageSrc, setImageSrc] = useState(getInitialSrc());

  // 当剧本数据变化时，更新图片URL
  useEffect(() => {
    setImageSrc(getInitialSrc());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [script.cover_url, script.title]);

  const handleImageError = () => {
    // 如果尝试加载的图片失败，立即切换到后备URL
    if (imageSrc !== fallbackUrl) {
      setImageSrc(fallbackUrl);
    }
  };

  return (
    <div className="aspect-[16/9] bg-gray-100 relative">
      <img 
        className="w-full h-full object-cover" 
        alt={script.title} 
        src={imageSrc} 
        onError={handleImageError}
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

  useCountViewOnce();

  // Jscbc: URL is the single source of truth.
  const query = sp.get("q") || "";
  const activeTag = sp.get("tags") || null;
  const page = parseInt(sp.get("page") || "1", 10);

  const [data, setData] = useState<ScriptItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  
  // Jscbc: Local state for controlled input, which triggers URL change on debounce.
  const [localQuery, setLocalQuery] = useState(query);

  // Jscbc: Single useEffect for data fetching, triggered by URL change.
  useEffect(() => {
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
    fetchData();
  }, [sp, query, activeTag, page]);

  // Jscbc: Debounce search input to avoid excessive URL updates.
  useEffect(() => {
    const handler = setTimeout(() => {
      if (localQuery !== query) {
        updateUrl({ q: localQuery, page: 1 });
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [localQuery, query]);

  // Jscbc: Helper function to update URL search params.
  const updateUrl = (params: Record<string, string | number | null>) => {
    const u = new URL(window.location.href);
    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === undefined) {
        u.searchParams.delete(key);
      } else {
        u.searchParams.set(key, String(value));
      }
    });
    router.push(u.pathname + u.search, { scroll: false });
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const chips = useMemo(() => ["全部", ...TAGS], []);

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
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                type="text"
                placeholder="搜索剧目、作者、年代..."
                className="w-full px-6 py-4 text-gray-800 rounded-full shadow-lg focus:outline-none focus:ring-4 focus:ring-red-300"
              />
              <button onClick={() => updateUrl({ q: localQuery, page: 1 })} className="absolute right-2 top-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700">
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
                onClick={() => updateUrl({ tags: t === "全部" ? null : t, page: 1 })}
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
                  onClick={() => updateUrl({ page: 1 })}
                  className="px-3 py-1 rounded border disabled:opacity-50"
                >首页</button>
                <button
                  disabled={page <= 1}
                  onClick={() => updateUrl({ page: page - 1 })}
                  className="px-3 py-1 rounded border disabled:opacity-50"
                >上一页</button>
                <span className="text-sm text-gray-600">第 {page} / {totalPages} 页</span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => updateUrl({ page: page + 1 })}
                  className="px-3 py-1 rounded border disabled:opacity-50"
                >下一页</button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => updateUrl({ page: totalPages })}
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