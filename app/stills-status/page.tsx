/**
 * Jscbc: 剧照生成状态页面
 */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type TaskStatus = {
  status: string;
  message: string;
  taskId: string;
  imageUrl?: string;
};

export default function StillsStatusPage() {
  const [taskStatus, setTaskStatus] = useState<TaskStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState<string>("");

  const checkTaskStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/stills-qwen-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          taskId: "f6a41234-8dbb-400b-86ec-2df78ef9974d",
          apiKey: "sk-74ef0003c3834d77962e3ad4dc5e7f95"
        })
      });
      
      const data = await response.json();
      setTaskStatus(data);
      setLastChecked(new Date().toLocaleString("zh-CN"));
      
      if (data.status === "SUCCEEDED" && data.imageUrl) {
        // 任务完成，更新数据库
        await fetch("/api/scripts/DC3EA5177690180A71C03FDFB2B2E91D", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cover_url: data.imageUrl })
        });
      }
    } catch (error) {
      console.error("检查任务状态失败:", error);
      setTaskStatus({ 
        status: "ERROR", 
        message: "检查失败: " + (error as Error).message, 
        taskId: "f6a41234-8dbb-400b-86ec-2df78ef9974d" 
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkTaskStatus();
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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">剧照生成状态监控</h1>
          
          <div className="space-y-6">
            {/* 任务信息 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-blue-800 mb-4">征妇认尸 - 剧照生成任务</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">任务ID:</p>
                  <p className="font-mono text-sm bg-white p-2 rounded border">f6a41234-8dbb-400b-86ec-2df78ef9974d</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">创建时间:</p>
                  <p className="text-sm">2025-08-16 01:54:56</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">模型:</p>
                  <p className="text-sm">阿里云百炼 qwen-image</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">尺寸:</p>
                  <p className="text-sm">1328x1328</p>
                </div>
              </div>
            </div>

            {/* 状态显示 */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">当前状态</h3>
              {taskStatus ? (
                <div className="space-y-4">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 mr-3">状态:</span>
                    <span className={`px-3 py-1 text-sm rounded-full ${
                      taskStatus.status === "SUCCEEDED" 
                        ? "bg-green-100 text-green-800" 
                        : taskStatus.status === "FAILED"
                        ? "bg-red-100 text-red-800"
                        : "bg-blue-100 text-blue-800"
                    }`}>
                      {taskStatus.status === "SUCCEEDED" ? "已完成" : 
                       taskStatus.status === "FAILED" ? "失败" : 
                       taskStatus.status === "PENDING" ? "处理中" : taskStatus.status}
                    </span>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600 mb-1">消息:</p>
                    <p className="text-sm bg-white p-2 rounded border">{taskStatus.message}</p>
                  </div>
                  
                  {taskStatus.imageUrl && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">生成的剧照:</p>
                      <img 
                        src={taskStatus.imageUrl} 
                        alt="征妇认尸剧照" 
                        className="w-full max-w-md rounded-lg shadow-md"
                      />
                    </div>
                  )}
                  
                  {lastChecked && (
                    <div className="text-sm text-gray-500">
                      最后检查时间: {lastChecked}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  {loading ? "检查中..." : "暂无状态信息"}
                </div>
              )}
            </div>

            {/* 操作按钮 */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={checkTaskStatus}
                disabled={loading}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  loading 
                    ? "bg-gray-400 text-gray-200 cursor-not-allowed" 
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {loading ? "检查中..." : "检查状态"}
              </button>
              
              <Link
                href="/"
                className="px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                返回首页
              </Link>
            </div>

            {/* 说明 */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 mb-2">说明</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• 由于API不支持同步调用，任务状态需要手动检查</li>
                <li>• 建议每5-10分钟检查一次状态</li>
                <li>• 任务完成后，剧照将自动更新到数据库中</li>
                <li>• 如果任务失败，请检查API配置或重新生成</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 