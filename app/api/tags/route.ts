/**
 * Jscbc: 标签列表 API
 */
import { NextResponse } from "next/server";
import { all } from "@/lib/db";

export async function GET() {
  const rows = all<{ id: string; name: string }>("SELECT id, name FROM tags ORDER BY name ASC");
  return NextResponse.json({ items: rows });
} 