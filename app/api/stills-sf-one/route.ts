/**
 * Jscbc: 更精准的文生图 API（全文解析 -> 生成提示 -> 文生图 -> 更新封面）
 * - Endpoint: POST /api/stills-sf-one
 * - Body: { title?: string, id?: string, overridePrompt?: string, size?: string }
 */
import { NextResponse } from "next/server";
import { get, run } from "@/lib/db";
import fs from "fs";
import path from "path";

const API_BASE = "https://api.siliconflow.cn/v1/images/generations";
const MODEL = "Kwai-Kolors/Kolors";

function extractWithRegex(text: string, label: string): string[] {
  const patterns = [
    new RegExp(`【${label}】([^【\n]+)`, "g"),
    new RegExp(`${label}[：:】]([^【\n]+)`, "g")
  ];
  const set = new Set<string>();
  for (const p of patterns) {
    let m: RegExpExecArray | null;
    while ((m = p.exec(text))) {
      const raw = (m[1] || "").replace(/\s+/g, " ").trim();
      raw
        .split(/[、，,\s]/)
        .map((s) => s.trim())
        .filter(Boolean)
        .forEach((s) => set.add(s));
    }
  }
  return Array.from(set);
}

function summarize(text: string, max = 800): string {
  return text.replace(/\r/g, "").replace(/\n+/g, " ").slice(0, max).trim();
}

function buildPromptFromFull(title: string, full: string) {
  const roles = extractWithRegex(full, "人物").concat(extractWithRegex(full, "角色"));
  const scenes = extractWithRegex(full, "场景").concat(extractWithRegex(full, "地点"));
  const time = extractWithRegex(full, "时间").join("、");
  const props = extractWithRegex(full, "道具");
  const abstract = summarize(full, 1200);
  return (
    "以中国楚剧风格创作高质量舞台剧照示意图。" +
    `\n剧目：《${title}》。` +
    (roles.length ? `\n主要人物：${roles.slice(0, 8).join("、")}。` : "") +
    (scenes.length ? `\n舞台场景/地点：${scenes.slice(0, 4).join("、")}。` : "") +
    (time ? `\n时代/时间：${time}。` : "") +
    (props.length ? `\n核心道具：${props.slice(0, 6).join("、")}。` : "") +
    `\n剧情要点（摘要）：${abstract}` +
    "\n画面要求：" +
    "1) 舞台打击灯位与布景真实，写实摄影；" +
    "2) 服饰妆容遵循楚剧（生旦净丑等行当），水袖/靠甲/盔帽按角色匹配；" +
    "3) 体现唱念做打与程式身段（手眼身法步）；" +
    "4) 16:9 构图，高清，无文字水印。"
  );
}

const allowedSizes = new Set([
  "256x256",
  "512x512",
  "1024x1024",
  "1024x1792",
  "1792x1024",
  "1536x1024",
  "1024x1536"
]);

export async function POST(req: Request) {
  try {
    const key = process.env.SILICONFLOW_API_KEY;
    if (!key) return NextResponse.json({ error: "缺少 SILICONFLOW_API_KEY" }, { status: 500 });
    const body = await req.json().catch(() => ({}));
    const id: string | undefined = body?.id;
    const title: string | undefined = body?.title;
    const overridePrompt: string | undefined = body?.overridePrompt;
    const wantSize: string = body?.size || "1792x1024";
    const size = allowedSizes.has(wantSize) ? wantSize : "1792x1024";

    const row = id
      ? get<any>("SELECT id,title,markdown_path FROM scripts WHERE id=?", [id])
      : get<any>("SELECT id,title,markdown_path FROM scripts WHERE title=?", [title]);
    if (!row?.id || !row?.markdown_path || !fs.existsSync(row.markdown_path)) {
      return NextResponse.json({ error: "未找到剧本" }, { status: 404 });
    }

    const full = fs.readFileSync(row.markdown_path, "utf-8");
    const prompt = (overridePrompt?.trim() || buildPromptFromFull(row.title, full)).slice(0, 4000);

    const resp = await fetch(API_BASE, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ model: MODEL, prompt, size, response_format: "b64_json", n: 1 })
    });
    const rawText = await resp.text();
    let data: any = {};
    try {
      data = JSON.parse(rawText);
    } catch {
      data = { rawText };
    }
    if (!resp.ok) return NextResponse.json({ error: `API错误: ${resp.status}`, data }, { status: 500 });

    const imgObj = data?.data?.[0] || {};
    let buf: Buffer | null = null;
    if (imgObj.b64_json) buf = Buffer.from(imgObj.b64_json, "base64");
    else if (imgObj.url) {
      const r2 = await fetch(imgObj.url);
      const ab = await r2.arrayBuffer();
      buf = Buffer.from(new Uint8Array(ab));
    }
    if (!buf) return NextResponse.json({ error: "无图像数据", data }, { status: 500 });

    const outDir = path.join(process.cwd(), "public", "stills-sf");
    fs.mkdirSync(outDir, { recursive: true });
    const file = `${row.id}.png`;
    fs.writeFileSync(path.join(outDir, file), buf);
    const url = `/stills-sf/${file}`;

    run("UPDATE scripts SET cover_url=? WHERE id=?", [url, row.id]);

    return NextResponse.json({ ok: true, id: row.id, title: row.title, url, prompt });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 });
  }
} 