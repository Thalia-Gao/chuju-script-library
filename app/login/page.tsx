"use client";
/**
 * Jscbc: 登录页面
 */
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  const submit = async () => {
    setErr(null);
    const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password }) });
    const json = await res.json();
    if (!res.ok) return setErr(json.error || "登录失败");
    router.push("/admin");
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-white p-6 rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-4">登录</h1>
      <input className="w-full border rounded px-3 py-2 mb-3" placeholder="用户名" value={username} onChange={(e) => setUsername(e.target.value)} />
      <input className="w-full border rounded px-3 py-2 mb-3" type="password" placeholder="密码" value={password} onChange={(e) => setPassword(e.target.value)} />
      {err && <div className="text-red-600 text-sm mb-2">{err}</div>}
      <button onClick={submit} className="w-full bg-red-600 text-white py-2 rounded">登录</button>
    </div>
  );
} 