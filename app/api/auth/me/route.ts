/**
 * Jscbc: 当前会话信息 API
 */
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET() {
  const s = getSession();
  return NextResponse.json({ user: s ? { username: s.username, role: s.role } : null });
} 