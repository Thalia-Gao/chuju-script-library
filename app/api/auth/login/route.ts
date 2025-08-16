/**
 * Jscbc: 登录 API
 */
import { NextResponse } from "next/server";
import { findUser, hashPassword, signSession, setAuthCookie } from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json();
  const { username, password } = body || {};
  if (!username || !password) return NextResponse.json({ error: "缺少参数" }, { status: 400 });
  const u = findUser(username);
  if (!u || u.password_hash !== hashPassword(password)) return NextResponse.json({ error: "用户名或密码错误" }, { status: 401 });
  const token = signSession({ id: u.id, username: u.username, role: u.role });
  setAuthCookie(token);
  return NextResponse.json({ user: { id: u.id, username: u.username, role: u.role } });
} 