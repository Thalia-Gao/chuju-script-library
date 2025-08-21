/**
 * Jscbc: 验证邮箱验证码 API
 */
import { NextResponse } from "next/server";
import { get, run } from "@/lib/db";

export async function POST(req: Request) {
  const { email, code, purpose = "register" } = await req.json().catch(() => ({}));
  if (!email || !code) return NextResponse.json({ error: "缺少参数" }, { status: 400 });
  const row = get<any>("SELECT * FROM verification_codes WHERE email=? AND code=? AND purpose=? AND used=0 ORDER BY id DESC LIMIT 1", [email, code, purpose]);
  if (!row) return NextResponse.json({ ok: false, error: "验证码无效" }, { status: 400 });
  const now = Math.floor(Date.now() / 1000);
  if (now > Number(row.expires_at)) return NextResponse.json({ ok: false, error: "验证码已过期" }, { status: 400 });
  run("UPDATE verification_codes SET used=1 WHERE id=?", [row.id]);
  return NextResponse.json({ ok: true });
} 