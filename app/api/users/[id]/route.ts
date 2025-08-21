/**
 * Jscbc: 用户详情/管理 API（仅管理员）
 */
import { NextResponse } from "next/server";
import { get, run } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    requireAdmin();
  } catch {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }
  const { id } = params;
  const body = await req.json().catch(() => ({}));
  const { role, username } = body || {};

  const existed = get<any>("SELECT * FROM users WHERE id=?", [id]);
  if (!existed) return NextResponse.json({ error: "用户不存在" }, { status: 404 });

  if (username && username !== existed.username) {
    const dup = get<any>("SELECT id FROM users WHERE username=?", [username]);
    if (dup) return NextResponse.json({ error: "用户名已存在" }, { status: 409 });
  }
  if (role && role !== "user" && role !== "admin") {
    return NextResponse.json({ error: "角色非法" }, { status: 400 });
  }

  const fields: string[] = [];
  const paramsArr: any[] = [];
  if (typeof username === "string" && username.length > 0) { fields.push("username=?"); paramsArr.push(username); }
  if (typeof role === "string") { fields.push("role=?"); paramsArr.push(role); }
  if (fields.length === 0) return NextResponse.json({ error: "无可更新字段" }, { status: 400 });

  paramsArr.push(id);
  run(`UPDATE users SET ${fields.join(", ")} WHERE id=?`, paramsArr);
  const row = get<any>("SELECT id, username, role, created_at FROM users WHERE id=?", [id]);
  return NextResponse.json({ item: row });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  let admin;
  try { admin = requireAdmin(); } catch { return NextResponse.json({ error: "未授权" }, { status: 401 }); }
  const { id } = params;
  const row = get<any>("SELECT id, username, role FROM users WHERE id=?", [id]);
  if (!row) return NextResponse.json({ error: "用户不存在" }, { status: 404 });
  if (row.id === admin.id) return NextResponse.json({ error: "不可删除当前登录账号" }, { status: 400 });
  if (row.role === "admin") {
    const cnt = get<{ c: number }>("SELECT COUNT(1) as c FROM users WHERE role='admin'");
    if ((cnt?.c || 0) <= 1) return NextResponse.json({ error: "至少保留一名管理员" }, { status: 400 });
  }
  run("DELETE FROM users WHERE id=?", [id]);
  return NextResponse.json({ ok: true });
} 