/**
 * Jscbc: 标签常量与初始化
 */
import { all, run } from "./db";
import { v4 as uuid } from "uuid";

export const DEFAULT_TAGS = [
  "历史故事","民间传说","现实生活","爱情婚姻",
  "古代剧本","近代剧本","现代剧本",
  "悲剧","喜剧","正剧",
  "全本","折子戏",
  "完整版","简缩版","片段",
  "忠孝节义","社会批判",
  "武戏","文戏","综合性"
];

export function ensureTagsSeed() {
  const rows = all<{ name: string }>("SELECT name FROM tags");
  const existing = new Set(rows.map((r) => r.name));
  for (const name of DEFAULT_TAGS) {
    if (!existing.has(name)) {
      run("INSERT INTO tags(id,name) VALUES(?,?)", [uuid(), name]);
    }
  }
}

ensureTagsSeed(); 