/**
 * Jscbc: 用户列表 API
 */
import { NextResponse } from "next/server";
import { all } from "@/lib/db";

export async function GET() {
  const rows = all<{ id: string; username: string; role: string; created_at: string }>(
    "SELECT id, username, role, created_at FROM users ORDER BY created_at DESC"
  );
  return NextResponse.json({ items: rows });
} 