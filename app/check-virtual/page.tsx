/**
 * Jscbc: 虚拟剧本检查页面
 */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type ScriptInfo = {
  id: string;
  title: string;
  path: string;
};

type CheckResult = {
  success: boolean;
  summary: {
    totalScripts: number;
    validScripts: number;
    virtualScripts: number;
  };
  virtualScripts: ScriptInfo[];
  validScripts: ScriptInfo[];
};

export default function CheckVirtualPage() {
  const [result, setResult] = useState<CheckResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const checkVirtualScripts = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/check-virtual");
      const data = await response.json();
      
      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || "检查失败");
      }
    } catch (err) {
      setError("请求失败: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkVirtualScripts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-red-600">楚剧荟・剧本数字典藏馆</span>
            </Link>
            <div className="flex items-center space-x-6">
              <Link href="/" className="text-gray-700 hover:text-red-600 font-medium">首页</Link>
              <Link href="/admin" className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900">管理后台</Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">虚拟剧本检查结果</h1>
            <div className="flex space-x-3">
              <button
                onClick={checkVirtualScripts}
                disabled={loading}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  loading 
                    ? "bg-gray-400 text-gray-200 cursor-not-allowed" 
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {loading ? "检查中..." : "重新检查"}
              </button>
              {result && result.virtualScripts.length > 0 && (
                <div className="flex space-x-3">
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
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
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
                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    清理虚拟剧本
                  </button>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">错误: {error}</p>
            </div>
          )}

          {result && (
            <div className="space-y-6">
              {/* 统计摘要 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                  <div className="text-3xl font-bold text-blue-600">{result.summary.totalScripts}</div>
                  <div className="text-blue-800">总剧本数</div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                  <div className="text-3xl font-bold text-green-600">{result.summary.validScripts}</div>
                  <div className="text-green-800">有效剧本</div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                  <div className="text-3xl font-bold text-red-600">{result.summary.virtualScripts}</div>
                  <div className="text-red-800">虚拟剧本</div>
                </div>
              </div>

              {/* 虚拟剧本列表 */}
              {result.virtualScripts.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-red-800 mb-4">
                    虚拟剧本列表 ({result.virtualScripts.length} 个)
                  </h2>
                  <div className="space-y-3">
                    {result.virtualScripts.map((script) => (
                      <div key={script.id} className="bg-white p-4 rounded border">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-gray-800">{script.title}</h3>
                            <p className="text-sm text-gray-600 mt-1">ID: {script.id}</p>
                            <p className="text-sm text-red-600 mt-1">路径: {script.path}</p>
                          </div>
                          <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                            虚拟剧本
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 有效剧本示例 */}
              {result.validScripts.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-green-800 mb-4">
                    有效剧本示例 (前10个)
                  </h2>
                  <div className="space-y-3">
                    {result.validScripts.map((script) => (
                      <div key={script.id} className="bg-white p-4 rounded border">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-gray-800">{script.title}</h3>
                            <p className="text-sm text-gray-600 mt-1">ID: {script.id}</p>
                            <p className="text-sm text-green-600 mt-1">路径: {script.path}</p>
                          </div>
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                            有效
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 说明 */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 mb-2">说明</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• 虚拟剧本：数据库中存在记录但对应的markdown文件不存在</li>
                  <li>• 有效剧本：数据库记录与markdown文件匹配</li>
                  <li>• 虚拟剧本会导致详情页面无法访问和API错误</li>
                  <li>• 建议清理虚拟剧本以保持数据一致性</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 