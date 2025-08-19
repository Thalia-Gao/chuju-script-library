/**
 * 查询Qwen Image API任务状态并下载完成的图片
 */

const fs = require('fs');
const path = require('path');

// 从数据库查询任务信息
async function getTaskInfo() {
  try {
    const response = await fetch('http://localhost:3000/api/scripts?showAll=true', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      console.log('获取剧本列表失败');
      return [];
    }
    
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.log('获取剧本列表出错:', error.message);
    return [];
  }
}

// 查询单个任务状态
async function checkTaskStatus(taskId) {
  try {
    const response = await fetch('http://localhost:3000/api/stills-qwen-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return { error: errorText };
    }
    
    return await response.json();
  } catch (error) {
    return { error: error.message };
  }
}

// 主函数
async function main() {
  console.log('查询Qwen Image API任务状态...\n');
  
  // 获取剧本列表
  const scripts = await getTaskInfo();
  console.log(`找到 ${scripts.length} 个剧本\n`);
  
  let completedCount = 0;
  let pendingCount = 0;
  let failedCount = 0;
  let qwenTaskCount = 0;
  
  for (let i = 0; i < scripts.length; i++) {
    const script = scripts[i];
    
    // 检查是否有Qwen任务
    if (!script.cover_url || !script.cover_url.includes('taskId')) {
      continue;
    }
    
    qwenTaskCount++;
    
    try {
      const taskInfo = JSON.parse(script.cover_url);
      const { taskId, status } = taskInfo;
      
      if (status === 'PENDING') {
        console.log(`[${qwenTaskCount}] ${script.title} - 查询任务状态...`);
        
        const result = await checkTaskStatus(taskId);
        
        if (result.ok) {
          if (result.status === 'SUCCEEDED') {
            console.log(`  ✓ 任务完成: ${result.url}`);
            completedCount++;
          } else if (result.status === 'FAILED') {
            console.log(`  ✗ 任务失败: ${result.error}`);
            failedCount++;
          } else {
            console.log(`  - 任务状态: ${result.status}`);
            pendingCount++;
          }
        } else {
          console.log(`  ✗ 查询失败: ${result.error}`);
          failedCount++;
        }
      }
    } catch (error) {
      console.log(`  ✗ 解析任务信息失败: ${error.message}`);
    }
    
    // 添加延迟避免API限制
    if (i < scripts.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log(`\n任务状态统计:`);
  console.log(`Qwen任务总数: ${qwenTaskCount} 个`);
  console.log(`已完成: ${completedCount} 个`);
  console.log(`执行中: ${pendingCount} 个`);
  console.log(`失败: ${failedCount} 个`);
}

// 运行脚本
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { getTaskInfo, checkTaskStatus }; 