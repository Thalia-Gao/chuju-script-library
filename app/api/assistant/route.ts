/**
 * Jscbc: 楚剧剧本创作 AI 助手 API
 */
import { NextResponse } from "next/server";
import MiniSearch from "minisearch";
import { all, get } from "@/lib/db";
import fs from "fs";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

export async function POST(req: Request) {
  const body = await req.json();
  const { mode, query, params } = body || {};
  if (!mode) return NextResponse.json({ error: "缺少 mode" }, { status: 400 });
  const { mini, docs } = loadCorpus(120);
  const q = [query, params?.theme, params?.genre, params?.era, params?.roles?.join(" ")]
    .filter(Boolean)
    .join(" ")
    .slice(0, 500);
  const hits = q ? mini.search(q, { prefix: true, fuzzy: 0.2 }).slice(0, 8) : [];
  const context = hits.map((h) => `《${h.title}》片段：\n${(h as any).text?.slice(0, 800)}`).join("\n\n");

  const sys = `你是资深楚剧编剧 AI 助手，熟悉楚剧唱念做打、行当与程式。请结合提供的典藏文献片段进行创作与建议，语言符合舞台文本规范。`;

  const userPrompt = (() => {
    if (mode === "idea") {
      return `请基于主题/题材/背景/角色信息，给出3个不同方向的楚剧故事创意与剧情大纲：\n参数: ${JSON.stringify(params)}\n---参考片段---\n${context}`;
    }
    if (mode === "segment") {
      return `请根据以下场景与情节要求，生成一个楚剧片段（含人物表、念白、唱词、舞台调度与打击点提示）：\n参数: ${JSON.stringify(params)}\n---参考片段---\n${context}`;
    }
    if (mode === "review") {
      return `请对用户提供的剧本文本给出修改建议（剧情逻辑、语言、角色塑造、舞台性）：\n用户稿件: ${params?.draft || "(未提供)"}\n---参考片段---\n${context}`;
    }
    return String(query || "");
  })();

  const resp = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    messages: [
      { role: "system", content: sys },
      { role: "user", content: userPrompt }
    ],
    temperature: 0.7
  });
  const text = resp.choices?.[0]?.message?.content || "";
  return NextResponse.json({ text });
} 