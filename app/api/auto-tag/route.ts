/**
 * Jscbc: 自动为剧本打标签（启发式规则）
 */
import { NextResponse } from "next/server";
import { all, get, run } from "@/lib/db";
import fs from "fs";

function hasAny(text: string, kws: string[]): boolean {
  return kws.some((k) => text.includes(k));
}

function classifyEra(text: string): string | null {
  if (hasAny(text, ["现代", "新中国", "工厂", "矿", "电话", "飞机", "火车", "邮局", "大学", "工人", "社员"])) return "现代剧本";
  if (hasAny(text, ["民国", "光绪", "同治", "近代", "洋务", "租界"])) return "近代剧本";
  if (hasAny(text, ["秦", "汉", "唐", "宋", "元", "明", "清", "皇帝", "王妃", "宫阙"])) return "古代剧本";
  return null;
}

function classifyTheme(text: string): string[] {
  const tags: string[] = [];
  if (hasAny(text, ["屈原", "李时珍", "昭君", "梁红玉", "包公", "唐知县", "光绪", "珍妃", "岳飞", "薛仁贵", "窦仪"])) tags.push("历史故事");
  if (hasAny(text, ["白蛇", "仙", "妖", "狐", "龙", "祝英台", "梁山伯", "七仙女"])) tags.push("民间传说");
  if (hasAny(text, ["工人", "农民", "厂", "矿", "学校", "车站", "现代", "邮件", "信件"])) tags.push("现实生活");
  if (hasAny(text, ["婚", "嫁", "洞房", "良缘", "姻缘", "夫妻", "相爱", "情"])) tags.push("爱情婚姻");
  return tags;
}

function classifyStyle(text: string): string | null {
  if (hasAny(text, ["自杀", "投江", "投水", "身亡", "殉", "诀别", "惨", "冤", "恨"])) return "悲剧";
  if (hasAny(text, ["闹", "笑", "诙谐", "嬉笑", "调侃", "酒醉", "闹花灯"])) return "喜剧";
  return "正剧";
}

function classifyFormByLength(lines: number): string {
  // 简单规则：行数小于 600 视为折子戏，否则全本
  return lines < 600 ? "折子戏" : "全本";
}

function classifyCompleteness(text: string): string {
  // 若包含“选段/片段/简本”，视为片段；否则默认完整版
  if (hasAny(text, ["选段", "片段", "节选", "简本", "删节"])) return "片段";
  return "完整版";
}

function classifyIdea(text: string): string[] {
  const res: string[] = [];
  if (hasAny(text, ["忠", "孝", "节", "义", "忠义", "节烈"])) res.push("忠孝节义");
  if (hasAny(text, ["贪", "赃", "审", "申冤", "鸣冤", "奇冤", "县衙", "大堂", "腐败"])) res.push("社会批判");
  return res;
}

function classifyFeature(text: string): string {
  const w = ["战", "兵", "将", "刀", "枪", "马", "阵", "斩", "擒", "杀", "劈"];
  const v = ["唱", "念", "做", "舞台", "身段", "抒情", "悲欢"];
  const isWu = hasAny(text, w);
  const isWen = hasAny(text, v);
  if (isWu && isWen) return "综合性";
  if (isWu) return "武戏";
  return "文戏";
}

export async function POST() {
  const rows = all<{ id: string; markdown_path: string; title: string }>("SELECT id, markdown_path, title FROM scripts");
  let updated = 0;
  for (const r of rows) {
    if (!r.markdown_path || !fs.existsSync(r.markdown_path)) continue;
    const raw = fs.readFileSync(r.markdown_path, "utf-8");
    const text = raw.replace(/\s+/g, "");
    const lines = raw.split(/\r?\n/).length;

    const toAssign = new Set<string>();

    // 题材
    for (const t of classifyTheme(text)) toAssign.add(t);

    // 年代
    const era = classifyEra(text);
    if (era) toAssign.add(era);

    // 风格
    const style = classifyStyle(text);
    if (style) toAssign.add(style);

    // 表演形式
    toAssign.add(classifyFormByLength(lines));

    // 完整程度
    toAssign.add(classifyCompleteness(text));

    // 主题思想
    for (const t of classifyIdea(text)) toAssign.add(t);

    // 表演特色
    toAssign.add(classifyFeature(text));

    // 将标签写入关联表
    for (const name of toAssign) {
      const tag = get<{ id: string }>("SELECT id FROM tags WHERE name=?", [name]);
      if (!tag?.id) continue; // 未定义的不写
      run("INSERT OR IGNORE INTO script_tags(script_id, tag_id) VALUES(?,?)", [r.id, tag.id]);
    }
    updated++;
  }

  return NextResponse.json({ ok: true, total: rows.length, updated });
} 