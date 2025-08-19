/**
 * 批量生成楚剧剧本剧照脚本
 * 调用现有的API为指定剧本生成高质量的楚剧风格舞台剧照
 */

const fs = require('fs');
const path = require('path');

// 剧本列表
const scripts = [
  "告堤壩",
  "骂囚犯", 
  "雷雨",
  "闹严府",
  "送友",
  "赶杀记",
  "福禄救主（下集）",
  "甲午海战",
  "渔舟配",
  "海英",
  "桂武招亲",
  "打瓜招亲",
  "戏窦仪",
  "律师害民记",
  "当铺认母",
  "引弟女自叹",
  "尼姑思凡",
  "四海棠",
  "南方来信",
  "十恨小脚",
  "三世仇"
];

// 自定义提示词映射
const customPrompts = {
  "告堤壩": "以中国楚剧风格创作高质量舞台剧照示意图。剧目：《告堤壩》。主要人物：徐学富（生）、雷明武（粉威胁）、县官（老生）、冯氏（正旦）。舞台场景/地点：黄梅县官棚、县衙大堂。时代/时间：清代。核心道具：官棚、公案、官印、银两。剧情要点：黄梅县遭水灾，县官请得专教重修堤坝。乡绅雷明武总督堤工，贪污舞弊，偷工减料。监生徐学富为人正直，遭雷明武妒恨，借故殴打其侄儿白虎。徐学富与雷明武面礼争执，一个要上告，一个倚势自持。画面要求：1) 写实舞台光位与布景；2) 行当服化准确（水袖/靠甲/盔帽按需）；3) 呈现唱念做打与程式身段；4) 16:9 高清；5) 画面中不要出现任何文字、字幕、印章、水印、签名。",
  
  "骂囚犯": "以中国楚剧风格创作高质量舞台剧照示意图。剧目：《骂囚犯》。主要人物：囚犯（丑）、狱卒（丑）、官员（老生）。舞台场景/地点：监狱牢房、公堂。时代/时间：古代。核心道具：枷锁、刑具、牢门、公案。剧情要点：囚犯在狱中遭受不公待遇，狱卒虐待囚犯，囚犯愤怒反抗，痛骂狱卒和官员的腐败行为。画面要求：1) 写实舞台光位与布景；2) 行当服化准确（水袖/靠甲/盔帽按需）；3) 呈现唱念做打与程式身段；4) 16:9 高清；5) 画面中不要出现任何文字、字幕、印章、水印、签名。",
  
  "雷雨": "以中国楚剧风格创作高质量舞台剧照示意图。剧目：《雷雨》。主要人物：周朴园（老生）、繁漪（正旦）、周萍（小生）、四凤（花旦）、鲁贵（丑）、鲁妈（老旦）、周冲（小生）、鲁大海（小生）。舞台场景/地点：周公馆客厅、书房。时代/时间：民国时期。核心道具：药罐、沙发、书桌、雨伞。剧情要点：四凤是周家女佣，周萍、周冲乃同父异母兄弟，同样爱上四凤。周萍本与繁漪有染，自与四凤偷偷相恋，便不再理会繁漪。繁漪伤心欲绝，邀请四凤的母亲鲁妈到访，希望鲁妈立即带四凤离开。画面要求：1) 写实舞台光位与布景；2) 行当服化准确（水袖/靠甲/盔帽按需）；3) 呈现唱念做打与程式身段；4) 16:9 高清；5) 画面中不要出现任何文字、字幕、印章、水印、签名。",
  
  "闹严府": "以中国楚剧风格创作高质量舞台剧照示意图。剧目：《闹严府》。主要人物：严嵩（老生）、严世蕃（小生）、曾荣（小生）、严兰贞（花旦）、海瑞（老生）、邹应龙（小生）。舞台场景/地点：严府、书房、沉香阁。时代/时间：明代。核心道具：书案、香炉、屏风、官服。剧情要点：曹家遭奸贼严嵩父子诛杀，独曾荣得以逃脱，常思报仇。严嵩父子欣赏荣的文彩，将严兰贞许配于荣。婚后，荣对贞冷淡，终日留守书斋。荣自叹不幸，被贞从门外听到，大为震惊，决意向荣表白，夫妻和谐。画面要求：1) 写实舞台光位与布景；2) 行当服化准确（水袖/靠甲/盔帽按需）；3) 呈现唱念做打与程式身段；4) 16:9 高清；5) 画面中不要出现任何文字、字幕、印章、水印、签名。",
  
  "甲午海战": "以中国楚剧风格创作高质量舞台剧照示意图。剧目：《甲午海战》。主要人物：邓世昌（老生）、丁汝昌（老生）、方仁启（小生）、水兵（武生）、渔民（丑）。舞台场景/地点：北洋水师提督府、战舰甲板、刘公岛。时代/时间：1894年清代。核心道具：战舰、大炮、军旗、渔网、银锁。剧情要点：北洋水师致远舰管带邓世昌鼓励水兵的爱国热情，带刘公岛百姓的抗日请愿书上呈朝廷。1894年9月17日，丁汝昌率水师舰队护送陆军登陆，发现敌舰悬挂美国国旗向我方袭来。邓世昌率致远舰誓死杀敌，最终全舰将士壮烈牺牲。画面要求：1) 写实舞台光位与布景；2) 行当服化准确（水袖/靠甲/盔帽按需）；3) 呈现唱念做打与程式身段；4) 16:9 高清；5) 画面中不要出现任何文字、字幕、印章、水印、签名。",
  
  "渔舟配": "以中国楚剧风格创作高质量舞台剧照示意图。剧目：《渔舟配》。主要人物：陈春生（小生）、周玉姐（小旦）、周渔婆（老旦）。舞台场景/地点：江边、渔舟、渔村。时代/时间：古代。核心道具：渔舟、渔网、桨、鱼篓。剧情要点：陈春生姿态元和番后，归途遇到强人打劫，走投无路，跳水自尽，幸遇周渔婆母女相救。问明情由，渔婆将女儿玉姐醉配陈生为妻。画面要求：1) 写实舞台光位与布景；2) 行当服化准确（水袖/靠甲/盔帽按需）；3) 呈现唱念做打与程式身段；4) 16:9 高清；5) 画面中不要出现任何文字、字幕、印章、水印、签名。",
  
  "桂武招亲": "以中国楚剧风格创作高质量舞台剧照示意图。剧目：《桂武招亲》。主要人物：桂武（小生）、甘联珠（花旦）、甘瘤子（老生）、甘二奶（老旦）。舞台场景/地点：甘府、大街、练武场。时代/时间：古代。核心道具：刀剑、锣鼓、练武器具、婚服。剧情要点：青年桂武投亲不遇，流落街头卖艺求乞。崆峒派甘瘤子见桂本领不弱，携归厚待。甘母见喜，将孙女甘联珠许与桂武，招为赘婿。桂以武艺高超，新婚之夜与甘联珠比武，一交手即败北，只好服输认罚。画面要求：1) 写实舞台光位与布景；2) 行当服化准确（水袖/靠甲/盔帽按需）；3) 呈现唱念做打与程式身段；4) 16:9 高清；5) 画面中不要出现任何文字、字幕、印章、水印、签名。"
};

async function generateStill(title, customPrompt = null) {
  try {
    console.log(`正在为《${title}》生成剧照...`);
    
    const response = await fetch('http://localhost:3000/api/stills-dmx-one', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: title,
        size: '1792x1024',
        overridePrompt: customPrompt
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`[ERR] ${title} -> status=${response.status} msg=${errorText}`);
      return false;
    }

    const result = await response.json();
    if (result.ok) {
      console.log(`[OK] ${title} -> ${result.url}`);
      return true;
    } else {
      console.log(`[ERR] ${title} -> ${result.error}`);
      return false;
    }
  } catch (error) {
    console.log(`[ERR] ${title} -> ${error.message}`);
    return false;
  }
}

async function batchGenerate() {
  console.log(`开始批量生成 ${scripts.length} 个剧本的剧照...\n`);
  
  let successCount = 0;
  let failCount = 0;
  
  for (let i = 0; i < scripts.length; i++) {
    const title = scripts[i];
    const customPrompt = customPrompts[title];
    
    console.log(`[${i + 1}/${scripts.length}] 处理：${title}`);
    
    const success = await generateStill(title, customPrompt);
    
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
    
    // 添加延迟避免API限制
    if (i < scripts.length - 1) {
      console.log('等待3秒...\n');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  console.log(`\n批量生成完成！`);
  console.log(`成功：${successCount} 个`);
  console.log(`失败：${failCount} 个`);
}

// 检查服务器是否运行
async function checkServer() {
  try {
    const response = await fetch('http://localhost:3000/api/stills-dmx-one', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'test' })
    });
    return true;
  } catch (error) {
    return false;
  }
}

// 主函数
async function main() {
  console.log('楚剧剧本剧照批量生成工具');
  console.log('========================\n');
  
  const serverRunning = await checkServer();
  if (!serverRunning) {
    console.log('错误：无法连接到本地服务器 (http://localhost:3000)');
    console.log('请确保项目正在运行：npm run dev');
    return;
  }
  
  console.log('服务器连接正常，开始批量生成...\n');
  await batchGenerate();
}

// 运行脚本
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { scripts, customPrompts, generateStill, batchGenerate }; 