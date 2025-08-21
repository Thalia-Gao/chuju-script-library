/**
 * Jscbc: 发送邮箱验证码 API
 */
import { NextResponse } from "next/server";
import { run } from "@/lib/db";

function generateCode(len = 6) {
  const s = "0123456789";
  let out = "";
  for (let i = 0; i < len; i++) out += s[Math.floor(Math.random() * s.length)];
  return out;
}

async function sendMailMock(email: string, code: string) {
  // TODO: 可接入真实 SMTP/邮件服务
  console.log(`[VERIF] send code to %s: %s`, email, code);
}

export async function POST(req: Request) {
  const { email, purpose = "register" } = await req.json().catch(() => ({}));
  if (!email) return NextResponse.json({ error: "缺少邮箱" }, { status: 400 });
  const code = generateCode();
  const now = Math.floor(Date.now() / 1000);
  const expires = now + 10 * 60;
  run("INSERT INTO verification_codes(email, code, purpose, created_at, expires_at, used) VALUES(?,?,?,?,?,0)", [email, code, purpose, now, expires]);
  await sendMailMock(email, code);
  return NextResponse.json({ ok: true, expires_in: 600 });
} 