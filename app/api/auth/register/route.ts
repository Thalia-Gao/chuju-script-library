/**
 * Jscbc: 注册 API
 */
import { NextResponse } from "next/server";
import { createUser, findUser, signSession, setAuthCookie } from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json();
  const { username, password } = body || {};
  if (!username || !password) return NextResponse.json({ error: "缺少参数" }, { status: 400 });
  const existed = findUser(username);
  if (existed) return NextResponse.json({ error: "用户名已存在" }, { status: 409 });
  const u = createUser(username, password, "user");
  const token = signSession(u);
  setAuthCookie(token);
  return NextResponse.json({ user: u });
} 