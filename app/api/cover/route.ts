/**
 * Jscbc: 主题封面占位图（SVG）- 支持不同状态
 */
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = (searchParams.get("title") || "楚剧剧本").slice(0, 20);
  const status = searchParams.get("status") || "default";
  
  let svg: string;
  
  if (status === "generating") {
    // 生成中的状态封面
    svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675">
  <defs>
    <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="#1e40af"/>
      <stop offset="100%" stop-color="#3b82f6"/>
    </linearGradient>
    <pattern id="p" width="40" height="40" patternUnits="userSpaceOnUse">
      <circle cx="10" cy="10" r="2" fill="rgba(255,255,255,0.15)"/>
      <circle cx="30" cy="30" r="2" fill="rgba(255,255,255,0.15)"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <rect width="100%" height="100%" fill="url(#p)"/>
  <text x="600" y="300" font-size="48" text-anchor="middle" fill="#fff" font-family="Noto Serif SC, serif">${title}</text>
  <text x="600" y="380" font-size="32" text-anchor="middle" fill="#60a5fa" font-family="Noto Serif SC, serif">AI生成剧照中...</text>
  <text x="600" y="420" font-size="20" text-anchor="middle" fill="rgba(255,255,255,0.8)" font-family="Noto Serif SC, serif">请稍候</text>
  <text x="600" y="500" font-size="18" text-anchor="middle" fill="rgba(255,255,255,0.6)" font-family="Noto Serif SC, serif">楚剧荟・剧本数字典藏馆</text>
</svg>`;
  } else if (status === "failed") {
    // 生成失败的状态封面
    svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675">
  <defs>
    <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="#dc2626"/>
      <stop offset="100%" stop-color="#ef4444"/>
    </linearGradient>
    <pattern id="p" width="40" height="40" patternUnits="userSpaceOnUse">
      <circle cx="10" cy="10" r="2" fill="rgba(255,255,255,0.15)"/>
      <circle cx="30" cy="30" r="2" fill="rgba(255,255,255,0.15)"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <rect width="100%" height="100%" fill="url(#p)"/>
  <text x="600" y="300" font-size="48" text-anchor="middle" fill="#fff" font-family="Noto Serif SC, serif">${title}</text>
  <text x="600" y="380" font-size="32" text-anchor="middle" fill="#fca5a5" font-family="Noto Serif SC, serif">剧照生成失败</text>
  <text x="600" y="420" font-size="20" text-anchor="middle" fill="rgba(255,255,255,0.8)" font-family="Noto Serif SC, serif">使用默认封面</text>
  <text x="600" y="500" font-size="18" text-anchor="middle" fill="rgba(255,255,255,0.6)" font-family="Noto Serif SC, serif">楚剧荟・剧本数字典藏馆</text>
</svg>`;
  } else {
    // 默认封面
    svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675">
  <defs>
    <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="#7f1d1d"/>
      <stop offset="100%" stop-color="#b91c1c"/>
    </linearGradient>
    <pattern id="p" width="40" height="40" patternUnits="userSpaceOnUse">
      <circle cx="10" cy="10" r="2" fill="rgba(255,255,255,0.15)"/>
      <circle cx="30" cy="30" r="2" fill="rgba(255,255,255,0.15)"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <rect width="100%" height="100%" fill="url(#p)"/>
  <text x="600" y="360" font-size="64" text-anchor="middle" fill="#fff" font-family="Noto Serif SC, serif">${title}</text>
  <text x="600" y="440" font-size="26" text-anchor="middle" fill="rgba(255,255,255,0.9)" font-family="Noto Serif SC, serif">楚剧荟・剧本数字典藏馆</text>
</svg>`;
  }
  
  return new NextResponse(svg, { headers: { "Content-Type": "image/svg+xml" } });
} 