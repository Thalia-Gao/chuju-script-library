/**
 * Jscbc: 基于 DMX(https://www.dmxapi.cn) 的文生图 API
 * - Endpoint: POST /api/stills-dmx
 * - Body: { prompt?: string, title?: string, id?: string, size?: string, apiKey?: string }
 * - 默认模型: seedream-3.0
 */
import { NextResponse } from "next/server";
import { get } from "@/lib/db";
import fs from "fs";
import path from "path";

const DMX_BASE = "https://www.dmxapi.cn/v1/images/generations";
const DMX_MODEL = "seedream-3.0";

function buildPrompt(title: string, content: string) {
  const abstract = content.replace(/\r/g, "").replace(/\n+/g, " ").slice(0, 1200).trim();
  return (
    `以中国楚剧风格创作高质量舞台剧照示意图。` +
    `\n剧目：《${title}》。` +
    `\n剧情摘要：${abstract}` +
    `\n画面要求：写实舞台光位与布景；行当服化准确；呈现唱念做打；16:9；高清；无文字水印。`
  );
}

const allowedSizes = new Set([
  "256x256","512x512","1024x1024","1024x1792","1792x1024","1536x1024","1024x1536"
]);

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const reqKey: string | undefined = body?.apiKey;
    const apiKey = process.env.DMX_API_KEY || reqKey;
    if (!apiKey) return NextResponse.json({ error: "缺少 DMX API Key" }, { status: 400 });

    const wantSize: string = body?.size || "1792x1024";
    const size = (allowedSizes.has(wantSize) ? wantSize : "1792x1024");

    let prompt: string | undefined = body?.prompt;
    if (!prompt) {
      const id: string | undefined = body?.id;
      const title: string | undefined = body?.title;
      const row = id
        ? get<any>("SELECT id,title,markdown_path FROM scripts WHERE id=?", [id])
        : get<any>("SELECT id,title,markdown_path FROM scripts WHERE title=?", [title]);
      if (!row?.id || !row?.markdown_path || !fs.existsSync(row.markdown_path)) {
        return NextResponse.json({ error: "未找到剧本，或需提供 prompt" }, { status: 400 });
      }
      const full = fs.readFileSync(row.markdown_path, "utf-8");
      prompt = buildPrompt(row.title, full);
    }

    const resp = await fetch(DMX_BASE, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: DMX_MODEL, prompt, size, response_format: "b64_json", n: 1 })
    });
    const rawText = await resp.text();
    let data: any = {}; try { data = JSON.parse(rawText); } catch { data = { rawText }; }
    if (!resp.ok) return NextResponse.json({ error: `API错误: ${resp.status}`, data }, { status: 500 });

    const img = data?.data?.[0] || {};
    let buf: Buffer | null = null;
    if (img.b64_json) buf = Buffer.from(img.b64_json, "base64");
    else if (img.url) {
      const r2 = await fetch(img.url);
      const ab = await r2.arrayBuffer();
      buf = Buffer.from(new Uint8Array(ab));
    }
    if (!buf) return NextResponse.json({ error: "无图像数据", data }, { status: 500 });

    const outDir = path.join(process.cwd(), "public", "stills-dmx");
    fs.mkdirSync(outDir, { recursive: true });
    const name = `${Date.now()}.png`;
    fs.writeFileSync(path.join(outDir, name), buf);
    const url = `/stills-dmx/${name}`;

    return NextResponse.json({ ok: true, url, prompt, provider: "dmx", model: DMX_MODEL });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 });
  }
} 