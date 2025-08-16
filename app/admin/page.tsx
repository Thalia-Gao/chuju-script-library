"use client";
/**
 * Jscbc: 管理后台页面
 */
import { useEffect, useState } from "react";

export default function AdminPage() {
  const [items, setItems] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [markdown, setMarkdown] = useState("# 新剧本\n");
  const [tagsInput, setTagsInput] = useState("");

  const load = async () => {
    const res = await fetch("/api/scripts");
    const json = await res.json();
    setItems(json.items || []);
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    const tags = tagsInput.split(/[\,\s]+/).filter(Boolean);
    const res = await fetch("/api/scripts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, markdown, tags }) });
    if (res.ok) { setTitle(""); setMarkdown("# 新剧本\n"); setTagsInput(""); load(); }
  };

  const del = async (id: string) => {
    if (!confirm("确认删除？")) return;
    await fetch(`/api/scripts/${id}`, { method: "DELETE" });
    load();
  };

  const backup = async () => {
    const res = await fetch("/api/backup");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "chuju-backup.zip"; a.click();
    URL.revokeObjectURL(url);
  };

  const generateStill = async (titles: string[]) => {
    const res = await fetch("/api/stills-sf", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ titles, size: "1792x1024" }) });
    return res.json();
  };

  const setCover = async (id: string, url: string) => {
    await fetch(`/api/scripts/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ cover_url: url }) });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">管理后台</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="font-semibold mb-3">新增剧本</h2>
          <input className="w-full border rounded px-3 py-2 mb-3" placeholder="标题" value={title} onChange={(e) => setTitle(e.target.value)} />
          <textarea className="w-full border rounded px-3 py-2 mb-3 h-48" value={markdown} onChange={(e) => setMarkdown(e.target.value)} />
          <input className="w-full border rounded px-3 py-2 mb-3" placeholder="标签（逗号或空格分隔）" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} />
          <button onClick={create} className="bg-red-600 text-white px-4 py-2 rounded">保存</button>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="font-semibold mb-3">系统</h2>
          <button onClick={backup} className="bg-gray-800 text-white px-4 py-2 rounded">下载备份</button>
          <div className="text-sm text-gray-500 mt-2">在 .env.local 配置 SILICONFLOW_API_KEY 后可生成剧照</div>
        </div>
      </div>

      <h2 className="font-semibold mt-8 mb-3">剧本列表</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((s) => (
          <div key={s.id} className="bg-white p-4 rounded-xl shadow">
            <div className="font-semibold mb-1">{s.title}</div>
            <div className="text-xs text-gray-500 mb-3">{(s.tags||[]).join(" · ")}</div>
            <div className="flex gap-2 flex-wrap">
              <a className="text-blue-600" href={`/scripts/${s.id}`} target="_blank" rel="noreferrer">查看</a>
              <button className="text-red-600" onClick={() => del(s.id)}>删除</button>
              <button className="text-gray-700" onClick={async () => {
                const r = await generateStill([s.title]);
                const item = r?.items?.find((x: any) => x.url);
                if (item?.url) {
                  await setCover(s.id, item.url);
                  alert("已生成并设为封面");
                  load();
                } else {
                  alert(r?.items?.[0]?.error || "生成失败");
                }
              }}>生成剧照(硅基流动)并设为封面</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 