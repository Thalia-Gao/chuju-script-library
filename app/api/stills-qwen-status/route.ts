/**
 * Jscbc: 阿里云百炼平台 Qwen-Image 任务状态查询
 * - Endpoint: POST /api/stills-qwen-status
 * - Body: { taskId: string, apiKey?: string }
 */
import { NextResponse } from "next/server";
import { get, run } from "@/lib/db";
import fs from "fs";
import path from "path";

// 根据Qwen Image API文档，任务状态查询应该使用不同的端点
const QWEN_STATUS_BASE = "https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const apiKey = body?.apiKey || process.env.QWEN_API_KEY || "sk-74ef0003c3834d77962e3ad4dc5e7f95";
    if (!apiKey) return NextResponse.json({ error: "缺少 Qwen API Key" }, { status: 400 });

    const { taskId } = body;
    if (!taskId) return NextResponse.json({ error: "缺少任务ID" }, { status: 400 });

    // 查询任务状态 - 使用正确的API路径
    // 根据错误信息，正确的路径应该是：/api/v1/services/aigc/text2image/image-synthesis/tasks/{taskId}
    const statusResp = await fetch(`${QWEN_STATUS_BASE}/tasks/${taskId}`, {
      method: "GET",
      headers: { 
        Authorization: `Bearer ${apiKey}`, 
        "Content-Type": "application/json"
      }
    });
    
    const statusData = await statusResp.json();
    if (!statusResp.ok) return NextResponse.json({ error: `查询任务状态失败: ${statusResp.status}`, data: statusData }, { status: 500 });

    const taskStatus = statusData.output?.task_status;
    if (!taskStatus) return NextResponse.json({ error: "未获取到任务状态", data: statusData }, { status: 500 });

    // 如果任务完成，下载图片并更新数据库
    if (taskStatus === "SUCCEEDED") {
      const imageUrl = statusData.output?.urls?.[0];
      if (!imageUrl) return NextResponse.json({ error: "未获取到图片URL", data: statusData }, { status: 500 });

      // 下载图片
      const imageResp = await fetch(imageUrl);
      if (!imageResp.ok) return NextResponse.json({ error: "下载图片失败", data: statusData }, { status: 500 });

      const imageBuffer = await imageResp.arrayBuffer();
      const buf = Buffer.from(imageBuffer);

      // 保存图片到本地
      const outDir = path.join(process.cwd(), "public", "stills-qwen");
      fs.mkdirSync(outDir, { recursive: true });
      
      // 生成文件名
      const fileName = `${taskId}.png`;
      const filePath = path.join(outDir, fileName);
      fs.writeFileSync(filePath, buf);
      
      const url = `/stills-qwen/${fileName}`;

      // 更新数据库中的cover_url
      run("UPDATE scripts SET cover_url=? WHERE cover_url LIKE ?", [url, `%${taskId}%`]);

      return NextResponse.json({ 
        ok: true, 
        taskId, 
        status: taskStatus,
        url,
        message: "任务完成，图片已生成"
      });
    } else if (taskStatus === "FAILED") {
      return NextResponse.json({ 
        ok: false, 
        taskId, 
        status: taskStatus,
        error: statusData.output?.message || "任务执行失败",
        message: "任务执行失败"
      });
    } else {
      return NextResponse.json({ 
        ok: true, 
        taskId, 
        status: taskStatus,
        message: "任务正在执行中"
      });
    }
  } catch (e: any) {
    console.error("Qwen Status API Error:", e);
    return NextResponse.json({ error: e.message || "服务器错误" }, { status: 500 });
  }
} 