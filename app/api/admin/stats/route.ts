/**
 * Jscbc: 管理后台统计 API
 */
import { NextResponse } from "next/server";
import { all, get, run } from "@/lib/db";

function ensureMetric(key: string) {
	const row = get<{ value: number }>("SELECT value FROM metrics WHERE key=?", [key]);
	if (row === undefined) {
		run("INSERT INTO metrics(key, value) VALUES(?, 0)", [key]);
		return 0;
	}
	return Number((row as any).value || 0);
}

	export async function GET() {
		// 统计总剧本数（按标题去重）
		const scripts = get<{ c: number }>("SELECT COUNT(DISTINCT title) as c FROM scripts")?.c || 0;
		// 统计注册用户数
		const users = get<{ c: number }>("SELECT COUNT(1) as c FROM users")?.c || 0;
		// 总浏览量（预留，可从 metrics 中取）
		const views = ensureMetric("total_views");
		// 剧本创作次数（由 AI 助手触发累加）
		const creations = ensureMetric("total_creations");
		return NextResponse.json({ scripts, users, views, creations });
	}

export async function POST(req: Request) {
	const body = await req.json().catch(() => ({}));
	const { key, delta = 1, action } = body || {};
	// 新增：刷新动作，直接返回最新聚合
	if (action === "refresh") {
		const scripts = get<{ c: number }>("SELECT COUNT(DISTINCT title) as c FROM scripts")?.c || 0;
		const users = get<{ c: number }>("SELECT COUNT(1) as c FROM users")?.c || 0;
		const views = ensureMetric("total_views");
		const creations = ensureMetric("total_creations");
		return NextResponse.json({ scripts, users, views, creations, refreshed: true });
	}
	if (!key) return NextResponse.json({ error: "缺少 key" }, { status: 400 });
	ensureMetric(key);
	run("UPDATE metrics SET value = value + ? WHERE key = ?", [Number(delta) || 1, key]);
	const row = get<{ value: number }>("SELECT value FROM metrics WHERE key=?", [key]);
	return NextResponse.json({ key, value: Number(row?.value || 0) });
} 