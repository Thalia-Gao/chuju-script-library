/**
 * Jscbc: 楚剧剧本创作 AI 助手 API
 */
import { NextResponse } from "next/server";
import MiniSearch from "minisearch";
import { all, get, run } from "@/lib/db";
import fs from "fs";
import OpenAI from "openai";

export async function POST(req: Request) {
  // 使用 ModelScope 配置
  const apiKey = "ms-e2b930dd-c68d-4e88-bfdc-b2796e8cd6a9";
  const baseURL = "https://api-inference.modelscope.cn/v1";
  const model = "Qwen/Qwen3-VL-235B-A22B-Instruct";
  
  const client = new OpenAI({ apiKey, baseURL });
  const body = await req.json();
  const { mode, query, params, history } = body || {};
  if (!mode) return NextResponse.json({ error: "缺少 mode" }, { status: 400 });

  const isFirstTurn = !(Array.isArray(history) && history.length > 0);

  const { mini } = loadCorpus(120);
  const q = [query, params?.theme, isFirstTurn ? params?.genre : null, isFirstTurn ? params?.era : null, params?.roles?.join(" ")]
    .filter(Boolean)
    .join(" ")
    .slice(0, 500);
  const hits = q ? mini.search(q, { prefix: true, fuzzy: 0.2 }).slice(0, 8) : [];
  const context = hits.map((h) => `《${h.title}》片段：\n${(h as any).text?.slice(0, 800)}`).join("\n\n");

  const sys = `你是资深楚剧编剧 AI 助手，熟悉楚剧唱念做打、行当与程式。请结合提供的典藏文献片段进行创作与建议，语言符合舞台文本规范。`;

  // 仅首轮带标签；后续轮次仅带本轮主题（theme）
  const userPrompt = (
    isFirstTurn
      ? `【创作模式】${mode}
【主题】${params?.theme || query || ""}
${params?.genre ? `【体裁】${params.genre}` : ""}
${params?.era ? `【时代】${params.era}` : ""}
${params?.structure ? `【结构】${params.structure}` : ""}
${params?.roles?.length ? `【角色】${params.roles.join("、")}` : ""}
${params?.draft ? `【草稿】${params.draft}` : ""}

【典藏文献参考】
${context || "（无相关文献）"}

请根据以上信息进行楚剧创作或建议。`
      : `【主题】${params?.theme || query || ""}
${params?.draft ? `【草稿】${params.draft}` : ""}

【典藏文献参考】
${context || "（无相关文献）"}

请继续创作或提供建议。`
  );

  // 将历史对话（最近8条）插入到系统提示之后
  const safeHistory: Array<{ role: "user"|"assistant"; content: string }> = 
    Array.isArray(history) 
      ? history.filter((m: any) => m?.role && typeof m.content === "string").slice(-8).map((m: any) => ({ role: m.role, content: m.content })).filter((m: any) =>  typeof m.content === "string")
      : [];

  try {
    const resp = await client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: sys },
        ...safeHistory,
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7
    });
    const text = resp.choices?.[0]?.message?.content || "";
    try {
      run("INSERT INTO metrics(key, value) VALUES('total_creations', 1) ON CONFLICT(key) DO UPDATE SET value = value + 1");
    } catch {}
    return NextResponse.json({ text });
  } catch (e: any) {
    const msg = e?.message || "LLM 调用失败";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

function loadCorpus(limit = 50) {
  const rows = all<any>("SELECT id, title, markdown_path FROM scripts ORDER BY RANDOM() LIMIT ?", [limit]);
  const docs = rows.map((r) => {
    const md = fs.existsSync(r.markdown_path) ? fs.readFileSync(r.markdown_path, "utf-8") : "";
    return { id: r.id, title: r.title, text: md.slice(0, 2000) };
  });
  const mini = new MiniSearch({ fields: ["title", "text"], storeFields: ["title", "text"] });
  mini.addAll(docs);
  return { mini, docs };
} 