"use client";
/**
 * Jscbc: 楚剧剧本创作 AI 助手 - 前端页面
 */
import { useState } from "react";

export default function AssistantPage() {
  const [mode, setMode] = useState<"idea"|"segment"|"review">("idea");
  const [theme, setTheme] = useState("");
  const [genre, setGenre] = useState("");
  const [era, setEra] = useState("");
  const [roles, setRoles] = useState("");
  const [draft, setDraft] = useState("");
  const [out, setOut] = useState("");
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true); setOut("");
    const res = await fetch("/api/assistant", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
      mode,
      params: { theme, genre, era, roles: roles.split(/[,\s]+/).filter(Boolean), draft }
    }) });
    const json = await res.json();
    setOut(json.text || "");
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">楚剧剧本创作 AI 助手</h1>
      <div className="bg-white p-4 rounded-xl shadow mb-6 grid md:grid-cols-2 gap-4">
        <div className="flex gap-2">
          {(["idea","segment","review"] as const).map(m => (
            <button key={m} onClick={() => setMode(m)} className={`px-3 py-1 rounded ${mode===m?"bg-red-600 text-white":"bg-red-50 text-red-700"}`}>{m}</button>
          ))}
        </div>
        <div className="text-gray-500">idea: 剧本创意与大纲 · segment: 片段生成 · review: 修改建议</div>
        <input className="border rounded px-3 py-2" placeholder="主题/题材" value={theme} onChange={(e)=>setTheme(e.target.value)} />
        <input className="border rounded px-3 py-2" placeholder="剧情风格/表演形式" value={genre} onChange={(e)=>setGenre(e.target.value)} />
        <input className="border rounded px-3 py-2" placeholder="年代（古代/近代/现代）" value={era} onChange={(e)=>setEra(e.target.value)} />
        <input className="border rounded px-3 py-2" placeholder="角色（逗号/空格分隔）" value={roles} onChange={(e)=>setRoles(e.target.value)} />
        {mode === "review" && <textarea className="border rounded px-3 py-2 md:col-span-2 h-40" placeholder="贴上你的剧本文本" value={draft} onChange={(e)=>setDraft(e.target.value)} />}
        <button onClick={run} className="bg-red-600 text-white px-4 py-2 rounded md:col-span-2">{loading?"生成中…":"生成"}</button>
      </div>
      <div className="bg-white p-4 rounded-xl shadow whitespace-pre-wrap min-h-[200px]">{out}</div>
    </div>
  );
} 