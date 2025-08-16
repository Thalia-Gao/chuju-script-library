/**
 * Jscbc: DMX(https://www.dmxapi.cn) 文生图（全文解析 -> 出图 -> 更新封面）
 * - Endpoint: POST /api/stills-dmx-one
 * - Body: { title?: string, id?: string, size?: string, apiKey?: string, overridePrompt?: string }
 */
import { NextResponse } from "next/server";
import { get, run } from "@/lib/db";
import fs from "fs";
import path from "path";

const DMX_BASE = "https://www.dmxapi.cn/v1/images/generations";
const DMX_MODEL = "seedream-3.0";

function extract(text: string, label: string): string[] {
  const regs = [new RegExp(`【${label}】([^【\n]+)`, "g"), new RegExp(`${label}[：:】]([^【\n]+)`, "g")];
  const set = new Set<string>();
  for (const r of regs) {
    let m: RegExpExecArray | null;
    while ((m = r.exec(text))) {
      (m[1] || "")
        .replace(/\s+/g, " ")
        .split(/[、，,\s]/)
        .map((s) => s.trim())
        .filter(Boolean)
        .forEach((s) => set.add(s));
    }
  }
  return Array.from(set);
}

function summarize(t: string, n = 1200) {
  return t.replace(/\r/g, "").replace(/\n+/g, " ").slice(0, n).trim();
}

function buildPrompt(title: string, full: string) {
  const roles = extract(full, "人物").concat(extract(full, "角色"));
  const scenes = extract(full, "场景").concat(extract(full, "地点"));
  const time = extract(full, "时间").join("、");
  const props = extract(full, "道具");
  const abstract = summarize(full, 1200);
  return (
    "以中国楚剧风格创作高质量舞台剧照示意图。" +
    `\n剧目：《${title}》。` +
    (roles.length ? `\n主要人物：${roles.slice(0, 8).join("、")}。` : "") +
    (scenes.length ? `\n舞台场景/地点：${scenes.slice(0, 4).join("、")}。` : "") +
    (time ? `\n时代/时间：${time}。` : "") +
    (props.length ? `\n核心道具：${props.slice(0, 6).join("、")}。` : "") +
    `\n剧情要点（摘要）：${abstract}` +
    "\n画面要求：1) 写实舞台光位与布景；2) 行当服化准确（水袖/靠甲/盔帽按需）；3) 呈现唱念做打与程式身段；4) 16:9 高清；5) 画面中不要出现任何文字、字幕、印章、水印、签名。"
  );
}

const allowedSizes = new Set(["256x256","512x512","1024x1024","1024x1792","1792x1024","1536x1024","1024x1536"]);

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const apiKey = body?.apiKey || process.env.DMX_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "缺少 DMX API Key" }, { status: 400 });

    const id: string | undefined = body?.id;
    const title: string | undefined = body?.title;
    const wantSize: string = body?.size || "1792x1024";
    const size = allowedSizes.has(wantSize) ? wantSize : "1792x1024";

    const row = id
      ? get<any>("SELECT id,title,markdown_path FROM scripts WHERE id=?", [id])
      : get<any>("SELECT id,title,markdown_path FROM scripts WHERE title=?", [title]);
    if (!row?.id || !row?.markdown_path || !fs.existsSync(row.markdown_path)) {
      return NextResponse.json({ error: "未找到剧本" }, { status: 404 });
    }

    const full = fs.readFileSync(row.markdown_path, "utf-8");
    const prompt: string = (body?.overridePrompt || buildPrompt(row.title, full)).slice(0, 4000);

    const resp = await fetch(DMX_BASE, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "seedream-3.0", prompt, size, response_format: "b64_json", n: 1 })
    });
    const raw = await resp.text();
    let data: any = {}; try { data = JSON.parse(raw); } catch { data = { raw }; }
    if (!resp.ok) return NextResponse.json({ error: `API错误: ${resp.status}`, data }, { status: 500 });

    const img = data?.data?.[0] || {};
    let buf: Buffer | null = null;
    if (img.b64_json) buf = Buffer.from(img.b64_json, "base64");
    else if (img.url) { const r2 = await fetch(img.url); const ab = await r2.arrayBuffer(); buf = Buffer.from(new Uint8Array(ab)); }
    if (!buf) return NextResponse.json({ error: "无图像数据", data }, { status: 500 });

    const outDir = path.join(process.cwd(), "public", "stills-dmx");
    fs.mkdirSync(outDir, { recursive: true });
    const file = `${row.id}.png`;
    fs.writeFileSync(path.join(outDir, file), buf);
    const url = `/stills-dmx/${file}`;

    run("UPDATE scripts SET cover_url=? WHERE id=?", [url, row.id]);

    return NextResponse.json({ ok: true, id: row.id, title: row.title, url, prompt, provider: "dmx", model: DMX_MODEL });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 });
  }
} 
 
 * Jscbc: DMX(https://www.dmxapi.cn) 文生图（全文解析 -> 出图 -> 更新封面）
 * - Endpoint: POST /api/stills-dmx-one
 * - Body: { title?: string, id?: string, size?: string, apiKey?: string, overridePrompt?: string }
 */
import { NextResponse } from "next/server";
import { get, run } from "@/lib/db";
import fs from "fs";
import path from "path";

const DMX_BASE = "https://www.dmxapi.cn/v1/images/generations";
const DMX_MODEL = "seedream-3.0";

function extract(text: string, label: string): string[] {
  const regs = [new RegExp(`【${label}】([^【\n]+)`, "g"), new RegExp(`${label}[：:】]([^【\n]+)`, "g")];
  const set = new Set<string>();
  for (const r of regs) {
    let m: RegExpExecArray | null;
    while ((m = r.exec(text))) {
      (m[1] || "")
        .replace(/\s+/g, " ")
        .split(/[、，,\s]/)
        .map((s) => s.trim())
        .filter(Boolean)
        .forEach((s) => set.add(s));
    }
  }
  return Array.from(set);
}

function summarize(t: string, n = 1200) {
  return t.replace(/\r/g, "").replace(/\n+/g, " ").slice(0, n).trim();
}

function buildPrompt(title: string, full: string) {
  const roles = extract(full, "人物").concat(extract(full, "角色"));
  const scenes = extract(full, "场景").concat(extract(full, "地点"));
  const time = extract(full, "时间").join("、");
  const props = extract(full, "道具");
  const abstract = summarize(full, 1200);
  return (
    "以中国楚剧风格创作高质量舞台剧照示意图。" +
    `\n剧目：《${title}》。` +
    (roles.length ? `\n主要人物：${roles.slice(0, 8).join("、")}。` : "") +
    (scenes.length ? `\n舞台场景/地点：${scenes.slice(0, 4).join("、")}。` : "") +
    (time ? `\n时代/时间：${time}。` : "") +
    (props.length ? `\n核心道具：${props.slice(0, 6).join("、")}。` : "") +
    `\n剧情要点（摘要）：${abstract}` +
    "\n画面要求：1) 写实舞台光位与布景；2) 行当服化准确（水袖/靠甲/盔帽按需）；3) 呈现唱念做打与程式身段；4) 16:9 高清；5) 画面中不要出现任何文字、字幕、印章、水印、签名。"
  );
}

const allowedSizes = new Set(["256x256","512x512","1024x1024","1024x1792","1792x1024","1536x1024","1024x1536"]);

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const apiKey = body?.apiKey || process.env.DMX_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "缺少 DMX API Key" }, { status: 400 });

    const id: string | undefined = body?.id;
    const title: string | undefined = body?.title;
    const wantSize: string = body?.size || "1792x1024";
    const size = allowedSizes.has(wantSize) ? wantSize : "1792x1024";

    const row = id
      ? get<any>("SELECT id,title,markdown_path FROM scripts WHERE id=?", [id])
      : get<any>("SELECT id,title,markdown_path FROM scripts WHERE title=?", [title]);
    if (!row?.id || !row?.markdown_path || !fs.existsSync(row.markdown_path)) {
      return NextResponse.json({ error: "未找到剧本" }, { status: 404 });
    }

    const full = fs.readFileSync(row.markdown_path, "utf-8");
    const prompt: string = (body?.overridePrompt || buildPrompt(row.title, full)).slice(0, 4000);

    const resp = await fetch(DMX_BASE, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "seedream-3.0", prompt, size, response_format: "b64_json", n: 1 })
    });
    const raw = await resp.text();
    let data: any = {}; try { data = JSON.parse(raw); } catch { data = { raw }; }
    if (!resp.ok) return NextResponse.json({ error: `API错误: ${resp.status}`, data }, { status: 500 });

    const img = data?.data?.[0] || {};
    let buf: Buffer | null = null;
    if (img.b64_json) buf = Buffer.from(img.b64_json, "base64");
    else if (img.url) { const r2 = await fetch(img.url); const ab = await r2.arrayBuffer(); buf = Buffer.from(new Uint8Array(ab)); }
    if (!buf) return NextResponse.json({ error: "无图像数据", data }, { status: 500 });

    const outDir = path.join(process.cwd(), "public", "stills-dmx");
    fs.mkdirSync(outDir, { recursive: true });
    const file = `${row.id}.png`;
    fs.writeFileSync(path.join(outDir, file), buf);
    const url = `/stills-dmx/${file}`;

    run("UPDATE scripts SET cover_url=? WHERE id=?", [url, row.id]);

    return NextResponse.json({ ok: true, id: row.id, title: row.title, url, prompt, provider: "dmx", model: DMX_MODEL });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 });
  }
} 
 
 