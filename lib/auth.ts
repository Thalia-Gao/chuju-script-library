/**
 * Jscbc: 简易认证工具（JWT + Cookie）
 */
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { v4 as uuid } from "uuid";
import { run, get } from "./db";
import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change";

export type Session = { id: string; username: string; role: string };

export function hashPassword(pwd: string) {
  return crypto.createHash("sha256").update(pwd).digest("hex");
}

export function createUser(username: string, password: string, role: string = "user") {
  const id = uuid();
  run(
    "INSERT INTO users(id, username, password_hash, role, created_at) VALUES(?,?,?,?,datetime('now'))",
    [id, username, hashPassword(password), role]
  );
  return { id, username, role } as Session;
}

export function findUser(username: string) {
  return get<{ id: string; username: string; password_hash: string; role: string }>(
    "SELECT * FROM users WHERE username=?",
    [username]
  );
}

export function signSession(session: Session) {
  return jwt.sign(session, JWT_SECRET, { expiresIn: "7d" });
}

export function setAuthCookie(token: string) {
  cookies().set("auth", token, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 7 * 24 * 3600 });
}

export function clearAuthCookie() {
  cookies().set("auth", "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
}

export function getSession(): Session | null {
  const c = cookies().get("auth");
  if (!c?.value) return null;
  try {
    return jwt.verify(c.value, JWT_SECRET) as Session;
  } catch {
    return null;
  }
}

export function requireAdmin() {
  const s = getSession();
  if (!s || s.role !== "admin") throw new Error("unauthorized");
  return s;
} 