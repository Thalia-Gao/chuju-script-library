/**
 * 生成征妇认尸剧本剧照
 */
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

async function generateZhengfuImage() {
  const apiKey = "sk-YiJHitdHKY0XamTuA18Rv3QyFKcZ1DHxcvnKuBwTLXhuNGF9";
  const apiUrl = "https://www.dmxapi.cn/v1/images/generations";

  // 基于剧本分析生成的精确提示词
  const prompt = `以中国楚剧风格创作高质量舞台剧照示意图。剧目：《征妇认尸》。主要人物：程保(老生)、王氏(老旦)、程詩(小生)、丁氏(青衣)。画面要求：写实舞台光位与布景，行当服化准确，呈现唱念做打与程式身段，高清，画面中不要出现任何文字、字幕、印章、水印、签名。场景：白骨塔前认尸场景，程保、王氏、丁氏围在程詩尸体旁痛哭，背景是古代战场和荒凉的白骨塔，舞台灯光营造悲凉氛围，人物表情悲痛欲绝，服装为传统楚剧戏服，画面构图要突出人物情感表达。`;

  console.log(`🎭 生成征妇认尸剧本剧照`);
  console.log(`🔑 API Key: ${apiKey.substring(0, 10)}...`);
  console.log(`🌐 API地址: ${apiUrl}`);
  console.log(`⏰ 生成时间: ${new Date().toLocaleString('zh-CN')}`);
  console.log(`─`.repeat(70));
  console.log(`📝 提示词: ${prompt.substring(0, 100)}...`);
  console.log(`─`.repeat(70));
  
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
      console.log(`✅ 图像生成成功！`);
      console.log(`📊 响应数据:`, JSON.stringify(data, null, 2));
      
      if (data.data && data.data[0] && data.data[0].url) {
        const imageUrl = data.data[0].url;
        console.log(`🖼️ 图片URL: ${imageUrl}`);
        
        // 保存图片信息到文件
        const imageInfo = {
          scriptName: "征妇认尸",
          imageUrl: imageUrl,
          prompt: prompt,
          generatedAt: new Date().toISOString(),
          model: "qwen-image",
          size: "1024x1024"
        };
        
        const infoPath = path.join(__dirname, 'zhengfu-image-info.json');
        fs.writeFileSync(infoPath, JSON.stringify(imageInfo, null, 2));
        console.log(`💾 图片信息已保存到: ${infoPath}`);
        
        // 下载图片
        await downloadImage(imageUrl, 'zhengfu-recognition.jpg');
        
        console.log(`🎉 征妇认尸剧照生成完成！`);
        
      } else {
        console.log(`❌ 未获取到图片URL`);
        console.log(`📊 完整响应:`, JSON.stringify(data, null, 2));
      }
      
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.log(`❌ 图像生成失败: ${response.status}`);
      console.log(`📊 错误信息:`, JSON.stringify(errorData, null, 2));
    }
    
  } catch (error) {
    console.error(`❌ 生成失败:`, error.message);
  }
}

// 下载图片函数
async function downloadImage(url, filename) {
  try {
    console.log(`📥 开始下载图片...`);
    const response = await fetch(url);
    
    if (response.ok) {
      const buffer = await response.buffer();
      const filePath = path.join(__dirname, filename);
      fs.writeFileSync(filePath, buffer);
      console.log(`💾 图片已保存到: ${filePath}`);
    } else {
      console.log(`❌ 图片下载失败: ${response.status}`);
    }
  } catch (error) {
    console.error(`❌ 下载失败:`, error.message);
  }
}

generateZhengfuImage(); 