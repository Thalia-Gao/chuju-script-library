/**
 * Jscbc: 退出登录 API
 */
import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/auth";
 
export async function POST() {
  clearAuthCookie();
  return NextResponse.json({ ok: true });
} 