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
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!script.coverUrl) {
      // 没有封面，使用默认的SVG封面
      setImageSrc(`/api/cover?title=${encodeURIComponent(script.title)}`);
      return;
    }

    try {
      // 尝试解析coverUrl，看是否是任务状态信息
      const parsed = JSON.parse(script.coverUrl);
      if (parsed.taskId && parsed.status === "PENDING") {
        // 正在生成中
        setIsGenerating(true);
        setImageSrc(`/api/cover?title=${encodeURIComponent(script.title)}&status=generating`);
        return;
      }
    } catch {
      // 不是JSON，说明是正常的图片URL
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
    }
  }, [script.coverUrl, script.title]);

  // 检查任务状态
  const checkTaskStatus = async (taskId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/stills-qwen-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId })
      });
      const data = await response.json();
      
      if (data.status === "SUCCEEDED" && data.imageUrl) {
        // 任务完成，显示生成的图片
        setImageSrc(data.imageUrl);
        setIsGenerating(false);
        // 更新数据库中的cover_url
        await fetch(`/api/scripts/${script.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cover_url: data.imageUrl })
        });
      } else if (data.status === "FAILED") {
        // 任务失败，显示默认封面
        setImageSrc(`/api/cover?title=${encodeURIComponent(script.title)}&status=failed`);
        setIsGenerating(false);
      }
    } catch (error) {
      console.error("检查任务状态失败:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 如果正在生成中，定期检查状态
  useEffect(() => {
    if (!isGenerating) return;
    
    try {
      const parsed = JSON.parse(script.coverUrl || "{}");
      if (parsed.taskId) {
        // 每30秒检查一次状态
        const interval = setInterval(() => {
          checkTaskStatus(parsed.taskId);
        }, 30000);
        
        return () => clearInterval(interval);
      }
    } catch {
      // 忽略JSON解析错误
    }
  }, [isGenerating, script.coverUrl]);

  return (
    <div className="aspect-[16/9] bg-gray-100 relative">
      {isGenerating && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <div className="text-sm">生成剧照中...</div>
          </div>
        </div>
      )}
      {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center z-10">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto"></div>
          </div>
        </div>
      )}
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

      {/* Jscbc: 特殊剧本状态显示 */}
      <section className="py-6 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">剧照生成状态</h2>
              <div className="flex space-x-3">
                <Link 
                  href="/stills-status" 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  详细监控
                </Link>
                <Link 
                  href="/check-virtual" 
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
                >
                  检查虚拟剧本
                </Link>
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch("/api/generate-report", { method: "POST" });
                      const data = await response.json();
                      if (data.success) {
                        alert(`Markdown报告已生成！\n文件保存为: ${data.reportPath}\n虚拟剧本数量: ${data.summary.virtualScripts}`);
                      } else {
                        alert(data.message || "生成报告失败");
                      }
                    } catch (err) {
                      alert("生成报告失败: " + (err as Error).message);
                    }
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  生成MD报告
                </button>
                <button
                  onClick={async () => {
                    if (confirm('确定要删除所有虚拟剧本吗？此操作不可恢复！')) {
                      try {
                        const response = await fetch("/api/cleanup-virtual", { method: "POST" });
                        const data = await response.json();
                        if (data.success) {
                          alert(`清理完成！\n删除了 ${data.deletedCount} 个虚拟剧本\n剩余剧本: ${data.remainingCount} 个\n\n页面将在3秒后自动刷新...`);
                          setTimeout(() => {
                            window.location.reload();
                          }, 3000);
                        } else {
                          alert(data.message || "清理失败");
                        }
                      } catch (err) {
                        alert("清理失败: " + (err as Error).message);
                      }
                    }
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  清理虚拟剧本
                </button>
                <Link 
                  href="/cleanup" 
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                >
                  清理工具
                </Link>
                <Link 
                  href="/auto-cleanup" 
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
                >
                  🚨 自动清理
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">征妇认尸</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 mr-2">状态:</span>
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">生成中</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    任务ID: f6a41234-8dbb-400b-86ec-2df78ef9974d
                  </div>
                  <div className="text-sm text-gray-600">
                    创建时间: 2025-08-16 01:54:56
                  </div>
                  <button
                    onClick={() => {
                      fetch("/api/stills-qwen-status", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ 
                          taskId: "f6a41234-8dbb-400b-86ec-2df78ef9974d",
                          apiKey: "sk-74ef0003c3834d77962e3ad4dc5e7f95"
                        })
                      })
                      .then(res => res.json())
                      .then(data => {
                        if (data.status === "SUCCEEDED") {
                          alert("剧照生成完成！");
                          fetchData(); // 刷新数据
                        } else {
                          alert(`当前状态: ${data.status}`);
                        }
                      })
                      .catch(err => alert("查询失败: " + err.message));
                    }}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                  >
                    检查状态
                  </button>
                </div>
              </div>
            </div>
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
              {/* Jscbc: 手动刷新按钮 */}
              <div className="text-center mb-6">
                <button
                  onClick={fetchData}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  刷新剧照状态
                </button>
              </div>
              
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