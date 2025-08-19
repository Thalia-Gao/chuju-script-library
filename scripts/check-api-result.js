/**
 * 检查API调用结果
 */
const fs = require('fs');
const path = require('path');

function checkResults() {
  console.log(`🔍 检查API调用结果`);
  console.log(`⏰ 检查时间: ${new Date().toLocaleString('zh-CN')}`);
  console.log(`─`.repeat(60));
  
  // 检查scripts目录下的相关文件
  const scriptsDir = path.join(__dirname);
  const files = fs.readdirSync(scriptsDir);
  
  console.log(`📁 检查目录: ${scriptsDir}`);
  console.log(`📋 找到文件:`);
  
  files.forEach(file => {
    if (file.includes('zhengfu') || file.includes('image') || file.includes('dmx')) {
      const filePath = path.join(scriptsDir, file);
      const stats = fs.statSync(filePath);
      console.log(`   📄 ${file} (${stats.size} bytes, ${stats.mtime.toLocaleString()})`);
      
      // 如果是JSON文件，尝试读取内容
      if (file.endsWith('.json')) {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          const data = JSON.parse(content);
          console.log(`   📊 内容: ${JSON.stringify(data, null, 2)}`);
        } catch (e) {
          console.log(`   ❌ 无法解析JSON: ${e.message}`);
        }
      }
    }
  });
  
  // 检查是否有图片文件
  const imageFiles = files.filter(file => file.endsWith('.jpg') || file.endsWith('.png'));
  if (imageFiles.length > 0) {
    console.log(`\n🖼️ 找到图片文件:`);
    imageFiles.forEach(file => {
      const filePath = path.join(scriptsDir, file);
      const stats = fs.statSync(filePath);
      console.log(`   🖼️ ${file} (${stats.size} bytes, ${stats.mtime.toLocaleString()})`);
    });
  } else {
    console.log(`\n❌ 未找到图片文件`);
  }
  
  console.log(`\n─`.repeat(60));
  console.log(`✅ 检查完成`);
}

checkResults(); 