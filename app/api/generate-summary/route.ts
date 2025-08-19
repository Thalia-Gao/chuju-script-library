/**
 * Jscbc: 生成剧情简介API
 */
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { content, title } = await req.json();
    
    if (!content || !title) {
      return NextResponse.json({ error: "缺少必要参数" }, { status: 400 });
    }

    // 检查剧本内容中是否已有剧情简介
    const lines = content.split('\n');
    let existingSummary = '';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('剧情:') || line.startsWith('剧情：')) {
        // 找到剧情简介，提取内容
        existingSummary = line.replace(/^剧情[:：]/, '').trim();
        break;
      }
    }

    if (existingSummary) {
      return NextResponse.json({ 
        summary: existingSummary,
        source: 'existing'
      });
    }

    // 如果没有现有剧情简介，使用LLM生成
    const prompt = `请为楚剧《${title}》生成一段简洁的剧情简介，要求：
1. 字数控制在100-200字之间
2. 突出主要人物和核心情节
3. 语言简洁明了，适合普通读者理解
4. 体现楚剧的艺术特色

剧本内容：
${content.substring(0, 2000)}...`;

    // 这里可以调用OpenAI或其他LLM API
    // 暂时返回一个示例简介
    const generatedSummary = `《${title}》是一部经典的楚剧作品，讲述了${title}的精彩故事。剧中人物形象鲜明，情节跌宕起伏，充分展现了楚剧艺术的独特魅力。`;

    return NextResponse.json({ 
      summary: generatedSummary,
      source: 'generated'
    });

  } catch (error) {
    console.error("生成剧情简介失败:", error);
    return NextResponse.json({ error: "生成失败" }, { status: 500 });
  }
} 