/**
 * 简化版征妇认尸图片生成
 */
const fetch = require('node-fetch');

async function generateImage() {
  const apiKey = "sk-YiJHitdHKY0XamTuA18Rv3QyFKcZ1DHxcvnKuBwTLXhuNGF9";
  const apiUrl = "https://www.dmxapi.cn/v1/images/generations";

  const prompt = `以中国楚剧风格创作高质量舞台剧照示意图。剧目：《征妇认尸》。主要人物：程保(老生)、王氏(老旦)、程詩(小生)、丁氏(青衣)。场景：白骨塔前认尸场景，程保、王氏、丁氏围在程詩尸体旁痛哭，背景是古代战场和荒凉的白骨塔，舞台灯光营造悲凉氛围，人物表情悲痛欲绝，服装为传统楚剧戏服，画面构图要突出人物情感表达。`;

  console.log(`🎭 生成征妇认尸剧照`);
  console.log(`📝 提示词: ${prompt.substring(0, 80)}...`);
  
  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "qwen-image",
        prompt: prompt,
        size: "1024x1024",
        n: 1
      })
    });

    console.log(`📊 响应状态: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ 生成成功！`);
      console.log(`📊 响应数据:`, JSON.stringify(data, null, 2));
      
      if (data.data && data.data[0] && data.data[0].url) {
        console.log(`🖼️ 图片URL: ${data.data[0].url}`);
        console.log(`🎉 征妇认尸剧照生成完成！`);
      }
      
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.log(`❌ 生成失败: ${response.status}`);
      console.log(`📊 错误信息:`, JSON.stringify(errorData, null, 2));
    }
    
  } catch (error) {
    console.error(`❌ 失败:`, error.message);
  }
}

generateImage(); 