"use client";
/**
 * Jscbc: 统一的认证页面客户端组件
 */
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthClient() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === "register" && password !== confirmPassword) {
      setError("两次输入的密码不一致");
      setLoading(false);
      return;
    }

    const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
    const body = mode === "login" ? { username: email, password } : { username: email, password };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || `${mode === "login" ? "登录" : "注册"}失败`);
      }
      router.push("/admin");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 gradient-text">楚剧荟・剧本数字典藏馆</h2>
          <p className="mt-2 text-center text-sm text-gray-600">欢迎回来，请登录或注册</p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-xl rounded-lg sm:px-10">
            <div className="mb-6">
              <div className="flex border-b border-gray-200">
                <button onClick={() => setMode("login")} className={`w-1/2 py-4 text-center font-medium text-sm ${mode === 'login' ? 'border-b-2 border-red-600 text-red-600' : 'text-gray-500 hover:text-gray-700'}`}>登录</button>
                <button onClick={() => setMode("register")} className={`w-1/2 py-4 text-center font-medium text-sm ${mode === 'register' ? 'border-b-2 border-red-600 text-red-600' : 'text-gray-500 hover:text-gray-700'}`}>注册</button>
              </div>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {mode === "register" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">邮箱地址</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500" />
                </div>
              )}
              {mode === "login" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">邮箱地址</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500" />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">密码</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500" />
              </div>
              {mode === "register" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">确认密码</label>
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500" />
                </div>
              )}

              {mode === "login" && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded" />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">记住我</label>
                  </div>
                  <div className="text-sm">
                    <a href="/forgot-password"
                       className="font-medium text-red-600 hover:text-red-500">忘记密码？</a>
                  </div>
                </div>
              )}

              {error && <p className="text-sm text-red-600">{error}</p>}

              <div>
                <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50">
                  {loading ? "处理中..." : (mode === "login" ? "登录" : "注册")}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}