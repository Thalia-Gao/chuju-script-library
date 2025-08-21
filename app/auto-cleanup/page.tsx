/**
 * Jscbc: 自动清理虚拟剧本页面
 */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type CleanupResult = {
  success: boolean;
  message: string;
  deletedCount: number;
  remainingCount: number;
  deletedScripts: Array<{id: string, title: string, path: string}>;
  autoCleanup: boolean;
};

export default function AutoCleanupPage() {
  const [result, setResult] = useState<CleanupResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    // 页面加载时自动执行清理
    const autoCleanup = async () => {
      try {
        console.log('🚨 开始自动清理虚拟剧本...');
        const response = await fetch("/api/auto-cleanup", { method: "POST" });
        const data = await response.json();
        
        if (data.success) {
          setResult(data);
          console.log('✅ 自动清理完成:', data);
        } else {
          setError(data.error || "自动清理失败");
          console.error('❌ 自动清理失败:', data);
        }
      } catch (error) {
        const errorMessage = "请求失败: " + (error as Error).message;
        setError(errorMessage);
        console.error('❌ 自动清理请求失败:', error);
      } finally {
        setLoading(false);
      }
    };

    // 延迟1秒执行，让页面先渲染
    const timer = setTimeout(autoCleanup, 1000);
    return () => clearTimeout(timer);
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
              <Link href="/check-virtual" className="text-gray-700 hover:text-red-600 font-medium">检查虚拟剧本</Link>
              <Link href="/cleanup" className="text-gray-700 hover:text-red-600 font-medium">清理工具</Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">🚨 自动清理虚拟剧本</h1>
          
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">正在自动清理虚拟剧本...</h2>
              <p className="text-gray-500">请稍候，系统正在执行清理操作</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-red-800 mb-4">❌ 清理失败</h2>
              <p className="text-red-700">{error}</p>
              <div className="mt-4">
                <Link 
                  href="/cleanup" 
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  手动清理
                </Link>
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-6">
              {/* 清理结果 */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-green-800 mb-4">✅ 自动清理完成</h2>
                <div className="space-y-3">
                  <p className="text-green-700">
                    <strong>删除数量:</strong> {result.deletedCount} 个虚拟剧本
                  </p>
                  <p className="text-green-700">
                    <strong>剩余剧本:</strong> {result.remainingCount} 个
                  </p>
                  <p className="text-green-700">
                    <strong>清理方式:</strong> 自动清理
                  </p>
                </div>
              </div>

              {/* 已删除的虚拟剧本列表 */}
              {result.deletedScripts.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-800 mb-4">
                    已删除的虚拟剧本 ({result.deletedScripts.length} 个)
                  </h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {result.deletedScripts.map((script) => (
                      <div key={script.id} className="bg-white p-3 rounded border text-sm">
                        <div className="font-medium text-gray-800">{script.title}</div>
                        <div className="text-gray-600 text-xs mt-1">ID: {script.id}</div>
                        <div className="text-gray-600 text-xs mt-1">路径: {script.path}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 操作按钮 */}
              <div className="flex justify-center space-x-4">
                <Link 
                  href="/" 
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  返回首页
                </Link>
                <Link 
                  href="/check-virtual" 
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  重新检查
                </Link>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  刷新页面
                </button>
              </div>

              {/* 说明 */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 mb-2">说明</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• 页面加载时自动执行了虚拟剧本清理</li>
                  <li>• 所有虚拟剧本记录已被永久删除</li>
                  <li>• 系统现在只包含有效的剧本记录</li>
                  <li>• 建议返回首页查看清理后的效果</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 
 
 