/**
 * Jscbc: 阿里云百炼平台 Qwen-Image 文生图（全文解析 -> 出图 -> 更新封面）
 * - Endpoint: POST /api/stills-qwen-one
 * - Body: { title?: string, id?: string, size?: string, apiKey?: string, overridePrompt?: string }
 * - 参考文档: https://help.aliyun.com/zh/model-studio/qwen-image-api
 */
import { NextResponse } from "next/server";
import { get, run } from "@/lib/db";
import fs from "fs";
import path from "path";

const QWEN_BASE = "https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis";
const QWEN_MODEL = "qwen-image";

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
    "\n画面要求：1) 写实舞台光位与布景；2) 行当服化准确（水袖/靠甲/盔帽按需）；3) 呈现唱念做打与程式身段；4) 高清；5) 画面中不要出现任何文字、字幕、印章、水印、签名。"
  );
}

// qwen-image支持的尺寸
const allowedSizes = new Set(["1024x1024","1024x1792","1792x1024","1328x1328"]);

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const apiKey = body?.apiKey || process.env.QWEN_API_KEY || "sk-74ef0003c3834d77962e3ad4dc5e7f95";
    if (!apiKey) return NextResponse.json({ error: "缺少 Qwen API Key" }, { status: 400 });

    const id: string | undefined = body?.id;
    const title: string | undefined = body?.title;
    const wantSize: string = body?.size || "1328x1328";
    const size = allowedSizes.has(wantSize) ? wantSize : "1328x1328";

    const row = id
      ? get<any>("SELECT id,title,markdown_path FROM scripts WHERE id=?", [id])
      : get<any>("SELECT id,title,markdown_path FROM scripts WHERE title=?", [title]);
    if (!row?.id || !row?.markdown_path || !fs.existsSync(row.markdown_path)) {
      return NextResponse.json({ error: "未找到剧本" }, { status: 404 });
    }

    const full = fs.readFileSync(row.markdown_path, "utf-8");
    const prompt: string = (body?.overridePrompt || buildPrompt(row.title, full)).slice(0, 4000);

    // 创建任务获取任务ID
    const createResp = await fetch(QWEN_BASE, {
      method: "POST",
      headers: { 
        "X-DashScope-Async": "enable",
        Authorization: `Bearer ${apiKey}`, 
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ 
        model: QWEN_MODEL, 
        input: { prompt }, 
        parameters: { 
          size: size,
          n: 1,
          prompt_extend: true,
          watermark: true
        }
      })
    });
    
    const createData = await createResp.json();
    if (!createResp.ok) return NextResponse.json({ error: `创建任务失败: ${createResp.status}`, data: createData }, { status: 500 });
    
    const taskId = createData.output?.task_id;
    if (!taskId) return NextResponse.json({ error: "未获取到任务ID", data: createData }, { status: 500 });

    // 将任务ID保存到数据库，供后续查询使用
    const taskInfo = JSON.stringify({ taskId, status: "PENDING", createdAt: new Date().toISOString() });
    run("UPDATE scripts SET cover_url=? WHERE id=?", [taskInfo, row.id]);

    return NextResponse.json({ 
      ok: true, 
      id: row.id, 
      title: row.title, 
      taskId: taskId,
      prompt, 
      provider: "qwen", 
      model: QWEN_MODEL,
      message: "任务已创建，请稍后查询结果"
    });
  } catch (e: any) {
    console.error("Qwen API Error:", e);
    return NextResponse.json({ error: e.message || "服务器错误" }, { status: 500 });
  }
} 