/**
 * 简单测试DMX API连通性
 */
const fetch = require('node-fetch');

async function testDMXSimple() {
  const apiKey = "sk-YiJHitdHKY0XamTuA18Rv3QyFKcZ1DHxcvnKuBwTLXhuNGF9";
  const apiUrl = "https://www.dmxapi.cn/v1/images/generations";

  console.log(`🔍 测试DMX API连通性`);
  console.log(`🔑 API Key: ${apiKey.substring(0, 10)}...`);
  console.log(`🌐 API地址: ${apiUrl}`);
  console.log(`⏰ 测试时间: ${new Date().toLocaleString('zh-CN')}`);
  console.log(`─`.repeat(60));
  
  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "qwen-image",
        prompt: "simple test",
        size: "1024x1024",
        n: 1
      })
    });

    console.log(`📊 响应状态: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ API连通性正常！`);
      console.log(`📊 响应数据:`, JSON.stringify(data, null, 2));
      
      if (data.id || data.task_id) {
        console.log(`🎉 任务创建成功！`);
        console.log(`🆔 任务ID: ${data.id || data.task_id}`);
      }
      
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.log(`❌ API连通性测试失败: ${response.status}`);
      console.log(`📊 错误信息:`, JSON.stringify(errorData, null, 2));
    }
    
  } catch (error) {
    console.error(`❌ 网络连接失败:`, error.message);
  }
}

testDMXSimple(); 