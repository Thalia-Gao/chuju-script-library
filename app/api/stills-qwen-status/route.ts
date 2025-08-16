/**
 * Jscbc: 查询qwen-image任务状态
 * - Endpoint: POST /api/stills-qwen-status
 * - Body: { taskId: string, apiKey?: string }
 */
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  let body: any = {};
  
  try {
    body = await req.json().catch(() => ({}));
    const apiKey = body?.apiKey || process.env.QWEN_API_KEY || "sk-74ef0003c3834d77962e3ad4dc5e7f95";
    const taskId = body?.taskId;
    
    if (!taskId) return NextResponse.json({ error: "缺少任务ID" }, { status: 400 });
    if (!apiKey) return NextResponse.json({ error: "缺少 API Key" }, { status: 400 });

    console.log(`🔍 查询任务状态: ${taskId}`);

    // 使用GET请求查询任务状态
    const resp = await fetch(`https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis?task_id=${taskId}`, {
      method: "GET",
      headers: { 
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      }
    });
    
    const data = await resp.json();
    console.log(`📊 任务状态响应:`, JSON.stringify(data, null, 2));
    
    if (!resp.ok) {
      console.error(`❌ API请求失败: ${resp.status}`, data);
      return NextResponse.json({ 
        status: "ERROR", 
        message: `API请求失败: ${resp.status} - ${data.message || '未知错误'}`,
        taskId: taskId,
        error: data
      });
    }
    
    // 检查任务状态
    const taskStatus = data.output?.task_status;
    const taskMessage = data.output?.message || data.message || "无状态信息";
    
    if (taskStatus === "SUCCEEDED") {
      const imageUrl = data.output?.results?.[0]?.url;
      console.log(`✅ 任务完成，图片URL: ${imageUrl}`);
      return NextResponse.json({ 
        status: "SUCCEEDED", 
        taskId: taskId,
        imageUrl: imageUrl,
        message: "任务完成，图片生成成功",
        data: data.output
      });
    } else if (taskStatus === "FAILED") {
      console.error(`❌ 任务失败: ${taskMessage}`);
      return NextResponse.json({ 
        status: "FAILED", 
        taskId: taskId,
        message: `任务失败: ${taskMessage}`,
        error: data.output
      });
    } else if (taskStatus === "PENDING" || taskStatus === "RUNNING") {
      console.log(`⏳ 任务处理中: ${taskStatus}`);
      return NextResponse.json({ 
        status: "PENDING", 
        taskId: taskId,
        message: `任务处理中: ${taskStatus}`,
        progress: data.output?.progress || "未知进度"
      });
    } else {
      console.log(`❓ 未知状态: ${taskStatus}`);
      return NextResponse.json({ 
        status: "UNKNOWN", 
        taskId: taskId,
        message: `未知状态: ${taskStatus}`,
        data: data.output
      });
    }
  } catch (e: any) {
    console.error("❌ Qwen Status API Error:", e);
    return NextResponse.json({ 
      status: "ERROR",
      error: e.message || "服务器错误",
      taskId: body?.taskId || "未知"
    }, { status: 500 });
  }
} 