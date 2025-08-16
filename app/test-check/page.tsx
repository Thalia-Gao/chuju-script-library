/**
 * Jscbc: 测试虚拟剧本检查API
 */
"use client";

import { useEffect } from "react";

export default function TestCheckPage() {
  useEffect(() => {
    // 页面加载时自动调用API
    fetch("/api/check-virtual")
      .then(res => res.json())
      .then(data => {
        console.log("虚拟剧本检查结果:", data);
        if (data.success) {
          console.log(`总剧本数: ${data.summary.totalScripts}`);
          console.log(`有效剧本: ${data.summary.validScripts}`);
          console.log(`虚拟剧本: ${data.summary.virtualScripts}`);
          
          if (data.virtualScripts.length > 0) {
            console.log("虚拟剧本列表:");
            data.virtualScripts.forEach((script: any, index: number) => {
              console.log(`${index + 1}. ${script.title} (ID: ${script.id})`);
              console.log(`   路径: ${script.path}`);
            });
          }
        }
      })
      .catch(err => console.error("检查失败:", err));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">虚拟剧本检查测试</h1>
        <p className="text-gray-600 mb-4">请查看浏览器控制台查看检查结果</p>
        <p className="text-sm text-gray-500">API调用已完成，结果已输出到控制台</p>
      </div>
    </div>
  );
} 