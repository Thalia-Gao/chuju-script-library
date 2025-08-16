/**
 * Jscbc: 基于硅基流动(Kwai-Kolors/Kolors)的楚剧剧照生成 API
 * - Endpoint: POST /api/stills-sf
 * - Body: { titles: string[], size?: '1024x1024'|'1792x1024'|'1024x1792'|'1536x1024'|'1024x1536'|'512x512'|'256x256' }
 * - Rate limits: IPM=2（每分钟最多2张），IPD=400（每天最多400张）
 */
import { NextResponse } from "next/server";
import { get } from "@/lib/db";
import fs from "fs";
import path from "path";

const API_BASE = "https://api.siliconflow.cn/v1/images/generations";
const MODEL = "Kwai-Kolors/Kolors";

/**
 * Jscbc: 简易进程内限流（单实例生效）
 */
let minuteWindowStart = 0; // ms
let minuteCount = 0;
let dayWindowStart = 0; // ms（当天0点）
let dayCount = 0;
const IPM = 2; // per minute
const IPD = 400; // per day

function resetWindows(now: number) {
  const minute = 60 * 1000;
  if (now - minuteWindowStart >= minute) {
    minuteWindowStart = now;
    minuteCount = 0;
  }
  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  if (dayWindowStart !== dayStart.getTime()) {
    dayWindowStart = dayStart.getTime();
    dayCount = 0;
  }
}

function canConsume(n: number): boolean {
  const now = Date.now();
  resetWindows(now);
  return minuteCount + n <= IPM && dayCount + n <= IPD;
}
function consume(n: number) {
  const now = Date.now();
  resetWindows(now);
  minuteCount += n;
  dayCount += n;
}

function buildPrompt(title: string, content: string) {
  const abstract = content
    .replace(/\r/g, "")
    .slice(0, 1600)
    .replace(/\n+/g, " ")
    .trim();
  return (
    `以中国楚剧风格创作舞台剧照示意图。主题：《${title}》。` +
    `关键剧情概述：${abstract}。` +
    `画面要求：舞台光位真实、道具服化符合戏曲程式；角色妆容与头饰体现楚剧特征（水袖/靠甲/盔帽按需）；体态呈现唱念做打；摄影写实风格；无文字水印。`
  );
}

const allowedSizes = new Set([
  "256x256","512x512","1024x1024","1024x1792","1792x1024","1536x1024","1024x1536"
]);

export async function POST(req: Request) {
  try {
    const key = process.env.SILICONFLOW_API_KEY;
    if (!key) return NextResponse.json({ error: "缺少 SILICONFLOW_API_KEY" }, { status: 500 });

    const body = await req.json().catch(() => ({}));
    const titles: string[] = body?.titles || [];
    const wantSize: string = body?.size || "1792x1024";
    const size = (allowedSizes.has(wantSize) ? wantSize : "1792x1024");

    if (!Array.isArray(titles) || titles.length === 0) {
      return NextResponse.json({ error: "请提供 titles 数组" }, { status: 400 });
    }

    // 限流检查（以请求图片数计）
    const need = titles.length;
    if (!canConsume(need)) {
      return NextResponse.json({ error: `超出限流：每分钟最多 ${IPM} 张、每日最多 ${IPD} 张` }, { status: 429 });
    }

    const outDir = path.join(process.cwd(), "public", "stills-sf");
    fs.mkdirSync(outDir, { recursive: true });

    const results: any[] = [];
    for (const t of titles) {
      const row = get<any>("SELECT id, title, markdown_path FROM scripts WHERE title=?", [t]);
      if (!row?.id || !row?.markdown_path || !fs.existsSync(row.markdown_path)) {
        results.push({ title: t, error: "未找到剧本" });
        continue;
      }
      const md = fs.readFileSync(row.markdown_path, "utf-8");
      const prompt = buildPrompt(row.title, md);

      const resp = await fetch(API_BASE, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${key}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ model: MODEL, prompt, size, response_format: "b64_json", n: 1 })
      });
      const rawText = await resp.text();
      let data: any = {};
      try { data = JSON.parse(rawText); } catch { data = { rawText }; }
      if (!resp.ok) {
        results.push({ title: row.title, error: `API错误: ${resp.status}`, data });
        continue;
      }

      const imgObj = data?.data?.[0] || {};
      let buf: Buffer | null = null;
      if (imgObj.b64_json) {
        buf = Buffer.from(imgObj.b64_json, "base64");
      } else if (imgObj.url) {
        try {
          const r2 = await fetch(imgObj.url);
          const ab = await r2.arrayBuffer();
          buf = Buffer.from(new Uint8Array(ab));
        } catch (e: any) {
          results.push({ title: row.title, error: "下载URL失败", detail: String(e) });
          continue;
        }
      }
      if (!buf) {
        results.push({ title: row.title, error: "无图像数据", data });
        continue;
      }

      const file = `${row.id}.png`;
      fs.writeFileSync(path.join(outDir, file), buf);
      const url = `/stills-sf/${file}`;
      results.push({ title: row.title, id: row.id, url });
    }

    // 消耗额度
    consume(results.filter(r => r.url).length);

    return NextResponse.json({ ok: true, items: results, limits: { IPM, IPD } });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 });
  }
} 