"use client";
import { useState } from "react";

export default function NewScriptPage() {
  const [title, setTitle] = useState("");
  const [alias, setAlias] = useState("");
  const [era, setEra] = useState("");
  const [author, setAuthor] = useState("");
  const [tags, setTags] = useState("");
  const [markdown, setMarkdown] = useState("# 新剧本\n\n");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const submit = async () => {
    setLoading(true); setMsg("");
    try {
      const res = await fetch("/api/scripts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
        title, alias, era, author, tags: tags.split(/[，,\s]+/).filter(Boolean), markdown
      })});
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "创建失败");
      setMsg("创建成功！");
    } catch (e: any) {
      setMsg(e.message || "失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold mb-4">新增剧本</h1>
      <div className="grid grid-cols-2 gap-4">
        <input value={title} onChange={e=>setTitle(e.target.value)} className="border p-2 rounded" placeholder="标题(必填)" />
        <input value={alias} onChange={e=>setAlias(e.target.value)} className="border p-2 rounded" placeholder="别名" />
        <input value={era} onChange={e=>setEra(e.target.value)} className="border p-2 rounded" placeholder="年代" />
        <input value={author} onChange={e=>setAuthor(e.target.value)} className="border p-2 rounded" placeholder="作者" />
        <input value={tags} onChange={e=>setTags(e.target.value)} className="border p-2 rounded col-span-2" placeholder="标签（以逗号分隔）" />
      </div>
      <textarea value={markdown} onChange={e=>setMarkdown(e.target.value)} className="w-full border p-2 rounded h-80" />
      <div className="flex gap-3">
        <button onClick={submit} disabled={loading} className="bg-red-600 text-white px-4 py-2 rounded">{loading?"提交中...":"提交"}</button>
      </div>
      {msg && <div className="text-sm text-gray-700">{msg}</div>}
    </div>
  );
} 