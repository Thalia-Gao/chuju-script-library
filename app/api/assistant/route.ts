/**
 * Jscbc: 楚剧剧本创作 AI 助手 API
 */
import { NextResponse } from "next/server";
import MiniSearch from "minisearch";
import { all, get, run } from "@/lib/db";
import fs from "fs";
import OpenAI from "openai";

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY || process.env.SILICONFLOW_API_KEY;
  const baseURL = process.env.OPENAI_BASE_URL || process.env.SILICONFLOW_BASE_URL || "https://api.siliconflow.cn/v1";
  const model = process.env.OPENAI_MODEL || process.env.SILICONFLOW_MODEL || "deepseek-ai/DeepSeek-V3";
  if (!apiKey) {
    return NextResponse.json({ error: "缺少 LLM_API_KEY" }, { status: 500 });
  }
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
  const userPrompt = (() => {
    if (mode === "idea") {
      if (isFirstTurn) {
        const filtered: any = {};
        if (params?.theme) filtered.theme = params.theme;
        if (params?.genre) filtered.genre = params.genre;
        if (params?.era) filtered.era = params.era;
        if (params?.roles) filtered.roles = params.roles;
        return `请基于主题/题材/背景/角色信息，给出3个不同方向的楚剧故事创意与剧情大纲：\n参数: ${JSON.stringify(filtered)}\n---参考片段---\n${context}`;
      }
      return `延续以上对话语境，请继续创作并细化：${params?.theme || "(无显式主题)"}\n---参考片段---\n${context}`;
    }
    if (mode === "segment") {
      if (isFirstTurn) {
        return `请根据以下场景与情节要求，生成一个楚剧片段（含人物表、念白、唱词、舞台调度与打击点提示）：\n参数: ${JSON.stringify(params || {})}\n---参考片段---\n${context}`;
      }
      return `延续以上剧情，请生成新的楚剧片段：${params?.theme || "(无显式主题)"}\n---参考片段---\n${context}`;
    }
    if (mode === "review") {
      if (isFirstTurn) {
        return `请对用户提供的剧本文本给出修改建议（剧情逻辑、语言、角色塑造、舞台性）：\n用户稿件: ${params?.draft || "(未提供)"}\n---参考片段---\n${context}`;
      }
      return `请继续就上述文本给出进一步修改建议：${params?.theme || "(无显式主题)"}\n---参考片段---\n${context}`;
    }
    return String(query || "");
  })();

  // 将历史对话（最近8条）插入到系统提示之后
  const safeHistory: Array<{ role: "user"|"assistant"; content: string }> = Array.isArray(history)
    ? history
        .slice(-8)
        .filter((m: any) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
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
  const rows = all<any>("SELECT id, title, alias, era, author, markdown_path FROM scripts ORDER BY created_at DESC");
  const docs = rows.slice(0, limit).map((r) => ({
    id: r.id,
    title: r.title,
    era: r.era,
    author: r.author,
    text: fs.readFileSync(r.markdown_path, "utf-8").slice(0, 5000)
  }));
  const mini = new MiniSearch({ fields: ["title", "text", "era", "author"], storeFields: ["title", "text"] });
  mini.addAll(docs);
  return { mini, docs };
} 