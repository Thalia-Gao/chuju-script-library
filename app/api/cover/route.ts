/**
 * Jscbc: 主题封面占位图（SVG）
 */
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = (searchParams.get("title") || "楚剧剧本").slice(0, 20);
  
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
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
  
  return new NextResponse(svg, { headers: { "Content-Type": "image/svg+xml" } });
} 