/**
 * Jscbc: 测试虚拟剧本清理
 */
"use client";

import { useState } from "react";

export default function TestCleanupPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const cleanupVirtualScripts = async () => {
    if (!confirm('⚠️ 确定要删除所有虚拟剧本吗？此操作不可恢复！')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/cleanup-virtual", { method: "POST" });
      const data = await response.json();
      
      if (data.success) {
        setResult(data);
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
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">虚拟剧本清理测试</h1>
        
        <button
          onClick={cleanupVirtualScripts}
          disabled={loading}
          className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${
            loading 
              ? "bg-gray-400 text-gray-200 cursor-not-allowed" 
              : "bg-red-600 text-white hover:bg-red-700"
          }`}
        >
          {loading ? "清理中..." : "🚨 清理所有虚拟剧本"}
        </button>

        {result && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg text-left">
            <h3 className="font-medium text-green-800 mb-2">清理结果:</h3>
            <p className="text-green-700 text-sm">
              删除了 {result.deletedCount} 个虚拟剧本<br/>
              剩余剧本: {result.remainingCount} 个
            </p>
          </div>
        )}

        <div className="mt-6 text-sm text-gray-500">
          清理完成后页面将自动刷新
        </div>
      </div>
    </div>
  );
} 
 
 * Jscbc: 测试虚拟剧本清理
 */
"use client";

import { useState } from "react";

export default function TestCleanupPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const cleanupVirtualScripts = async () => {
    if (!confirm('⚠️ 确定要删除所有虚拟剧本吗？此操作不可恢复！')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/cleanup-virtual", { method: "POST" });
      const data = await response.json();
      
      if (data.success) {
        setResult(data);
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
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">虚拟剧本清理测试</h1>
        
        <button
          onClick={cleanupVirtualScripts}
          disabled={loading}
          className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${
            loading 
              ? "bg-gray-400 text-gray-200 cursor-not-allowed" 
              : "bg-red-600 text-white hover:bg-red-700"
          }`}
        >
          {loading ? "清理中..." : "🚨 清理所有虚拟剧本"}
        </button>

        {result && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg text-left">
            <h3 className="font-medium text-green-800 mb-2">清理结果:</h3>
            <p className="text-green-700 text-sm">
              删除了 {result.deletedCount} 个虚拟剧本<br/>
              剩余剧本: {result.remainingCount} 个
            </p>
          </div>
        )}

        <div className="mt-6 text-sm text-gray-500">
          清理完成后页面将自动刷新
        </div>
      </div>
    </div>
  );
} 
 
 