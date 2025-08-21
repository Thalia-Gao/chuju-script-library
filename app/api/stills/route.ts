/**
 * Jscbc: 根据剧本生成楚剧剧照示意图（调用 OpenAI 图像模型）
 */
import { NextResponse } from "next/server";
import { get } from "@/lib/db";
import fs from "fs";
import path from "path";
import OpenAI from "openai";

function buildImagePrompt(title: string, content: string) {
  const abstract = content
    .replace(/\r/g, "")
    .slice(0, 1600)
    .replace(/\n+/g, " ")
    .trim();
  return (
    `楚剧风格的舞台剧照示意图。主题：《${title}》。` +
    `依据剧本摘要营造舞台氛围、人物调度与服饰神韵：${abstract}。` +
    `画面要求：` +
    `1) 舞台戏曲布景与打击灯位，国风写实摄影；` +
    `2) 人物妆容与头饰体现楚剧特征，水袖/靠甲/盔帽等按角色需要；` +
    `3) 细节体现唱念做打与程式身段；` +
    `4) 16:9 构图，高清，无文字与水印。`
  );
}

const allowedSizes = new Set([
  "256x256","512x512","1024x1024","1024x1792","1792x1024","1536x1024","1024x1536"
]);

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "缺少 OPENAI_API_KEY" }, { status: 500 });
    }
    const client = new OpenAI({ apiKey });
    const body = await req.json().catch(() => ({}));
    const titles: string[] = body?.titles || [];
    const wantSize: string = body?.size || "1792x1024"; // 16:9
    const size = (allowedSizes.has(wantSize) ? (wantSize as any) : ("1024x1024" as const));
    if (!Array.isArray(titles) || titles.length === 0) {
      return NextResponse.json({ error: "请提供 titles 数组" }, { status: 400 });
    }

    const publicDir = path.join(process.cwd(), "public", "stills");
    fs.mkdirSync(publicDir, { recursive: true });

    const results: any[] = [];
    for (const t of titles) {
      const row = get<any>("SELECT id, title, markdown_path FROM scripts WHERE title=?", [t]);
      if (!row?.id || !row?.markdown_path || !fs.existsSync(row.markdown_path)) {
        results.push({ title: t, error: "未找到剧本" });
        continue;
      }
      const md = fs.readFileSync(row.markdown_path, "utf-8");
      const prompt = buildImagePrompt(row.title, md);

      const resp = await client.images.generate({
        model: process.env.OPENAI_IMAGE_MODEL || "gpt-image-1",
        prompt,
        size,
        response_format: "b64_json"
      });
      const b64 = resp.data?.[0]?.b64_json;
      if (!b64) {
        results.push({ title: t, error: "生成失败" });
        continue;
      }
      const buf = Buffer.from(b64, "base64");
      const file = `${row.id}.png`;
      const out = path.join(publicDir, file);
      fs.writeFileSync(out, buf);
      const url = `/stills/${file}`;
      results.push({ title: row.title, id: row.id, url });
    }

    return NextResponse.json({ ok: true, items: results });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 });
  }
} 