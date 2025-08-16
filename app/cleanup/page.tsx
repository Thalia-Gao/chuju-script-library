/**
 * Jscbc: 虚拟剧本清理页面
 */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type ScriptInfo = {
  id: string;
  title: string;
  path: string;
};

type CleanupResult = {
  success: boolean;
  message: string;
  deletedCount: number;
  remainingCount: number;
  deletedScripts: ScriptInfo[];
};

export default function CleanupPage() {
  const [checkResult, setCheckResult] = useState<any>(null);
  const [cleanupResult, setCleanupResult] = useState<CleanupResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [cleaning, setCleaning] = useState(false);

  const checkVirtualScripts = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/check-virtual");
      const data = await response.json();
      
      if (data.success) {
        setCheckResult(data);
      } else {
        alert("检查失败: " + (data.error || "未知错误"));
      }
    } catch (error) {
      alert("请求失败: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const cleanupVirtualScripts = async () => {
    if (!confirm('⚠️ 警告：此操作将永久删除所有虚拟剧本记录！\n\n确定要继续吗？此操作不可恢复！')) {
      return;
    }

    setCleaning(true);
    try {
      const response = await fetch("/api/cleanup-virtual", { method: "POST" });
      const data = await response.json();
      
      if (data.success) {
        setCleanupResult(data);
        alert(`✅ 清理完成！\n\n删除了 ${data.deletedCount} 个虚拟剧本\n剩余剧本: ${data.remainingCount} 个\n\n页面将在5秒后自动刷新...`);
        
        // 5秒后自动刷新页面
        setTimeout(() => {
          window.location.reload();
        }, 5000);
      } else {
        alert("清理失败: " + (data.error || "未知错误"));
      }
    } catch (error) {
      alert("请求失败: " + (error as Error).message);
    } finally {
      setCleaning(false);
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
              <Link href="/check-virtual" className="text-gray-700 hover:text-red-600 font-medium">检查虚拟剧本</Link>
              <Link href="/auto-cleanup" className="text-gray-700 hover:text-red-600 font-medium">自动清理</Link>
              <Link href="/admin" className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900">管理后台</Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">🧹 虚拟剧本清理工具</h1>
          
          {/* 检查结果 */}
          {checkResult && (
            <div className="mb-8">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-blue-800 mb-4">📊 检查结果</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{checkResult.summary.totalScripts}</div>
                    <div className="text-sm text-blue-700">总剧本数</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{checkResult.summary.validScripts}</div>
                    <div className="text-sm text-green-700">有效剧本</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{checkResult.summary.virtualScripts}</div>
                    <div className="text-sm text-red-700">虚拟剧本</div>
                  </div>
                </div>
                
                {checkResult.virtualScripts.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold text-red-800 mb-3">🚨 发现的虚拟剧本 ({checkResult.virtualScripts.length} 个)</h3>
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {checkResult.virtualScripts.map((script: any, index: number) => (
                        <div key={script.id} className="bg-white p-3 rounded border text-sm">
                          <div className="font-medium text-gray-800">{index + 1}. {script.title}</div>
                          <div className="text-gray-600 text-xs mt-1">ID: {script.id}</div>
                          <div className="text-gray-600 text-xs mt-1">路径: {script.path}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex justify-center space-x-4 mb-8">
            <button
              onClick={checkVirtualScripts}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
            >
              {loading ? '检查中...' : '重新检查'}
            </button>
            
            {checkResult?.virtualScripts.length > 0 && (
              <button
                onClick={cleanupVirtualScripts}
                disabled={cleaning}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors font-medium"
              >
                {cleaning ? '清理中...' : '🚨 清理虚拟剧本'}
              </button>
            )}
          </div>

          {/* 清理结果 */}
          {cleanupResult && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-green-800 mb-4">✅ 清理完成</h2>
              <div className="space-y-3">
                <p className="text-green-700">
                  <strong>删除数量:</strong> {cleanupResult.deletedCount} 个虚拟剧本
                </p>
                <p className="text-green-700">
                  <strong>剩余剧本:</strong> {cleanupResult.remainingCount} 个
                </p>
              </div>
              
              {cleanupResult.deletedScripts.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-green-800 mb-3">已删除的虚拟剧本</h3>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {cleanupResult.deletedScripts.map((script: any, index: number) => (
                      <div key={script.id} className="bg-white p-3 rounded border text-sm">
                        <div className="font-medium text-gray-800">{index + 1}. {script.title}</div>
                        <div className="text-gray-600 text-xs mt-1">ID: {script.id}</div>
                        <div className="text-gray-600 text-xs mt-1">路径: {script.path}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 说明 */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
            <h4 className="font-medium text-yellow-800 mb-2">说明</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• 虚拟剧本是指数据库中存在但对应文件不存在的剧本记录</li>
              <li>• 清理操作将永久删除这些记录，不可恢复</li>
              <li>• 建议在清理前先备份数据库</li>
              <li>• 清理后建议重新检查确认问题已解决</li>
            </ul>
          </div>

          {/* 操作步骤 */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-6">
            <h4 className="font-medium text-gray-800 mb-2">操作步骤</h4>
            <ol className="text-sm text-gray-700 space-y-1">
              <li>1. 点击"重新检查"按钮检查虚拟剧本</li>
              <li>2. 查看检查结果，确认需要清理的剧本</li>
              <li>3. 点击"清理虚拟剧本"按钮执行清理</li>
              <li>4. 确认清理结果</li>
              <li>5. 刷新后再次检查确认问题已解决</li>
            </ol>
          </div>
        </div>
      </main>
    </div>
  );
} 