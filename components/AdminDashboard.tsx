"use client";
/**
 * Jscbc: 全新的后台管理页面客户端组件
 * 参考了 poe-preview (3).html 的设计
 */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Jscbc: 引入Lucide React图标，这里只引入了部分，实际使用时可能需要更多
// 为了简化，这里直接使用SVG路径，避免引入整个库
const HomeIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 ${className || ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const DatabaseIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 ${className || ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12V19A9 3 0 0 0 21 19V12"/></svg>;
const UsersIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 ${className || ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const SettingsIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 ${className || ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.78 1.28a2 2 0 00.73 2.73l.04.02a2 2 0 01.97 1.95v.44a2 2 0 01-.97 1.95l-.04.02a2 2 0 00-.73 2.73l.78 1.28a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.78-1.28a2 2 0 00-.73-2.73l-.04-.02a2 2 0 01-.97-1.95v-.44a2 2 0 01.97-1.95l.04-.02a2 2 0 00.73-2.73l-.78-1.28a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z"/><circle cx="12" cy="12" r="3"/></svg>;
const SearchIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={`w-4 h-4 ${className || ""}`}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);
const PlusIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 ${className || ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>;
const EyeIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 ${className || ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>;
const EditIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 ${className || ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>;
const Trash2Icon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 ${className || ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>;
const FilterIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 ${className || ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 3H2l8 10.66V21l4-3V13.66L22 3z"/></svg>;
const UploadIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 ${className || ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>;
const BrainIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 ${className || ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.23 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.23 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>;

import AIAssistant from "./AIAssistant";

type ScriptItem = {
  id: string;
  title: string;
  author?: string;
  era?: string;
  tags: string[];
  alias?: string; // Jscbc: 新增别名
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "scripts" | "users" | "settings" | "assistant">("scripts");
  const [scripts, setScripts] = useState<ScriptItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalScripts, setTotalScripts] = useState(0); // Jscbc: 新增总剧本数状态
  const [currentPage, setCurrentPage] = useState(1); // Jscbc: 新增当前页码
  const [pageSize, setPageSize] = useState(20); // Jscbc: 新增每页显示数量
  const router = useRouter();

  // 仪表盘统计
  const [stats, setStats] = useState<{scripts: number; users: number; views: number; creations: number}>({scripts: 0, users: 0, views: 0, creations: 0});
  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      const json = await res.json();
      setStats({ scripts: json.scripts || 0, users: json.users || 0, views: json.views || 0, creations: json.creations || 0 });
    } catch (e) {
      console.error(e);
    }
  };

  // 标签筛选
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  type TagGroups = Record<string, string[]>; // 分组名 -> 标签
  const [tagGroups, setTagGroups] = useState<TagGroups>({});
  const categorizeTag = (name: string): string => {
    // 简易分组：题材/年代/体裁/结构/表演/其他
    const topic = ["历史故事","民间传说","现实生活","爱情婚姻","社会批判","忠孝节义"];
    const era = ["古代剧本","近代剧本","现代剧本"]; 
    const genre = ["正剧","喜剧","悲剧"]; 
    const structure = ["全本","折子戏","片段","完整版","简缩版"]; 
    const style = ["武戏","文戏","综合性"]; 
    if (topic.includes(name)) return "题材";
    if (era.includes(name)) return "年代";
    if (genre.includes(name)) return "体裁";
    if (structure.includes(name)) return "结构";
    if (style.includes(name)) return "表演";
    return "其他";
  };
  const fetchAllTags = async () => {
    try {
      const r = await fetch("/api/tags");
      const j = await r.json();
      const names: string[] = (j.items || []).map((x: any) => x.name).filter(Boolean);
      // 去重，过滤掉数据库内可能存在的“全部”
      const unique = Array.from(new Set(names.filter(n => n !== "全部"))).sort((a, b) => a.localeCompare(b, "zh-Hans-CN"));
      setAvailableTags(["全部", ...unique]);
      // 分组
      const groups: TagGroups = {};
      for (const t of unique) {
        const g = categorizeTag(t);
        groups[g] = groups[g] || [];
        groups[g].push(t);
      }
      // 保证每组内部也排序
      Object.keys(groups).forEach(k => groups[k].sort((a,b)=>a.localeCompare(b, "zh-Hans-CN")));
      setTagGroups(groups);
    } catch (e) {
      console.error(e);
      setAvailableTags(["全部"]);
      setTagGroups({});
    }
  };

  // Jscbc: AI助手相关状态
  const [aiMode, setAiMode] = useState<"idea"|"segment"|"review">("idea");
  const [aiTheme, setAiTheme] = useState("");
  const [aiGenre, setAiGenre] = useState("");
  const [aiEra, setAiEra] = useState("");
  const [aiRoles, setAiRoles] = useState("");
  const [aiDraft, setAiDraft] = useState("");
  const [aiOut, setAiOut] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // Jscbc: AI助手运行函数
  const runAiAssistant = async () => {
    setAiLoading(true); setAiOut("");
    try {
      const res = await fetch("/api/assistant", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
        mode: aiMode,
        params: { theme: aiTheme, genre: aiGenre, era: aiEra, roles: aiRoles.split(/[,-\s]+/).filter(Boolean), draft: aiDraft }
      }) });
      const json = await res.json();
      setAiOut(json.text || "");
      // 成功后刷新创作计数
      fetchStats();
    } catch (error) {
      console.error("AI Assistant error:", error);
      setAiOut("生成失败，请检查API密钥或网络连接。");
    } finally {
      setAiLoading(false);
    }
  };

  // Jscbc: 从API获取剧本列表
  const fetchScripts = async (page = 1) => {
    setLoading(true);
    try {
      const tagParam = selectedTag && selectedTag !== "全部" ? `&tags=${encodeURIComponent(selectedTag)}` : "";
      const res = await fetch(`/api/scripts?page=${page}&pageSize=${pageSize}${tagParam}`);
      if (!res.ok) throw new Error("Failed to fetch scripts");
      const data = await res.json();
      setScripts(data.items || []);
      setTotalScripts(data.total || 0);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching scripts:", error);
      setScripts([]); // 清空数据或显示错误状态
      setTotalScripts(0); // Jscbc: 错误时总数设为0
    } finally {
      setLoading(false);
    }
  };

  // 用户列表
  const [users, setUsers] = useState<Array<{id:string; username:string; role:string; created_at:string}>>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const r = await fetch('/api/users');
      const j = await r.json();
      setUsers(j.items || []);
    } catch (e) {
      console.error(e);
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "scripts") {
      if (availableTags.length === 0) fetchAllTags();
      fetchScripts(1);
    }
    if (activeTab === "dashboard") {
      fetchStats();
    }
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab, pageSize, selectedTag]);

  // Jscbc: 处理页码变化
  const handlePageChange = (page: number) => {
    fetchScripts(page);
  };

  // Jscbc: 计算总页数
  const totalPages = Math.ceil(totalScripts / pageSize);

  // Jscbc: 处理剧本删除
  const handleDeleteScript = async (id: string) => {
    if (!confirm("确定要删除此剧本吗？")) return;
    try {
      const res = await fetch(`/api/scripts/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete script");
      alert("剧本删除成功！");
      fetchScripts(currentPage); // 刷新列表
    } catch (error) {
      console.error("Error deleting script:", error);
      alert("删除失败: " + (error as Error).message);
    }
  };

  // Jscbc: 处理数据备份
  const handleBackup = async () => {
    try {
      const res = await fetch("/api/backup");
      if (!res.ok) throw new Error("Failed to backup data");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_${new Date().toISOString().slice(0,10)}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      alert("数据备份成功！");
    } catch (error) {
      console.error("Error backing up data:", error);
      alert("备份失败: " + (error as Error).message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">楚</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">管理后台</h2>
              <p className="text-sm text-gray-500">剧本典藏馆</p>
            </div>
          </div>
        </div>

        <nav className="p-4">
          {[ 
            { id: 'dashboard', name: '控制台', icon: HomeIcon },
            { id: 'scripts', name: '剧本管理', icon: DatabaseIcon },
            { id: 'users', name: '用户管理', icon: UsersIcon },
            { id: 'settings', name: '系统设置', icon: SettingsIcon },
            { id: 'assistant', name: 'AI 剧本助手', icon: BrainIcon } // Jscbc: 新增AI助手导航项
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors mb-2 ${
                activeTab === item.id
                  ? 'bg-red-100 text-red-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <item.icon />
              <span>{item.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              {activeTab === 'dashboard' && '控制台'}
              {activeTab === 'scripts' && '剧本管理'}
              {activeTab === 'users' && '用户管理'}
              {activeTab === 'settings' && '系统设置'}
              {activeTab === 'assistant' && 'AI 剧本助手'} {/* Jscbc: 新增AI助手标题 */}
            </h1>
            <div className="flex items-center space-x-4">

              {activeTab === 'dashboard' && (
                <button onClick={async () => {
                  try {
                    await fetch('/api/admin/stats', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'refresh' }) });
                    await fetchStats();
                  } catch (e) { console.error(e); }
                }} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">刷新数据</button>
              )}
              {activeTab === 'scripts' && (
                <>
                  <button onClick={() => location.assign('/admin/scripts/new')} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2">
                    <PlusIcon />
                    <span>新增剧本</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Dashboard Cards */}
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center justify-between">
                  <div><p className="text-gray-500 text-sm">总剧本数</p><p className="text-3xl font-bold text-gray-900">{stats.scripts}</p></div>
                  <DatabaseIcon className="w-12 h-12 text-red-600" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center justify-between">
                  <div><p className="text-gray-500 text-sm">注册用户</p><p className="text-3xl font-bold text-gray-900">{stats.users.toLocaleString()}</p></div>
                  <UsersIcon className="w-12 h-12 text-blue-600" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center justify-between">
                  <div><p className="text-gray-500 text-sm">总浏览量</p><p className="text-3xl font-bold text-gray-900">{stats.views.toLocaleString()}</p></div>
                  <EyeIcon className="w-12 h-12 text-green-600" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center justify-between">
                  <div><p className="text-gray-500 text-sm">剧本创作次数</p><p className="text-3xl font-bold text-gray-900">{stats.creations.toLocaleString()}</p></div>
                  <UploadIcon className="w-12 h-12 text-purple-600" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'scripts' && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">剧本列表</h3>
                    <p className="text-sm text-gray-500 mt-1">共 {totalScripts} 个剧本</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <label className="text-sm text-gray-600">每页显示：</label>
                      <select
                        value={pageSize}
                        onChange={(e) => setPageSize(Number(e.target.value))}
                        className="border border-gray-300 rounded-lg px-2 py-1 text-sm"
                      >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                    </div>
                  </div>
                </div>
                {/* 标签筛选行 */}
                <div className="mt-4 space-y-3">
                  {/* 顶部“全部” */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => { setSelectedTag(null); setCurrentPage(1); }}
                      className={`px-3 py-1 rounded-full border text-sm transition-colors ${
                        !selectedTag ? "bg-red-600 text-white border-red-600" : "bg-white text-red-600 border-red-200 hover:bg-red-50"
                      }`}
                    >全部</button>
                  </div>
                  {/* 分组标签 */}
                  {Object.keys(tagGroups).sort((a,b)=>a.localeCompare(b, "zh-Hans-CN")).map((group) => (
                    <div key={group} className="flex flex-wrap gap-2 items-center">
                      <span className="text-xs text-gray-500 w-10">{group}</span>
                      <div className="flex flex-wrap gap-2">
                        {tagGroups[group].map((t) => (
                          <button
                            key={t}
                            onClick={() => { setSelectedTag(t); setCurrentPage(1); }}
                            className={`px-3 py-1 rounded-full border text-sm transition-colors ${
                              selectedTag === t ? "bg-red-600 text-white border-red-600" : "bg-white text-red-600 border-red-200 hover:bg-red-50"
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">剧本信息</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">作者</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">年代</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">标签</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">加载中...</td></tr>
                    ) : scripts.length === 0 ? (
                      <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">暂无剧本数据</td></tr>
                    ) : (
                      scripts.map((script) => (
                        <tr key={script.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{script.title}</div>
                            {script.alias && <div className="text-sm text-gray-500">别名：{script.alias}</div>}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{script.author || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{script.era || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-wrap gap-1">
                              {script.tags?.slice(0, 3).map((tag, index) => (
                                <span key={index} className="px-2 py-1 text-xs bg-red-50 text-red-600 rounded-full">
                                  {tag}
                                </span>
                              ))}
                              {script.tags && script.tags.length > 3 && (
                                <span className="px-2 py-1 text-xs bg-gray-50 text-gray-500 rounded-full">
                                  +{script.tags.length - 3}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button className="text-blue-600 hover:text-blue-900">
                                <EyeIcon />
                              </button>
                              <button className="text-green-600 hover:text-green-900">
                                <EditIcon />
                              </button>
                              <button onClick={() => handleDeleteScript(script.id)} className="text-red-600 hover:text-red-900">
                                <Trash2Icon />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="flex justify-center items-center py-4 border-t border-gray-200">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 border border-gray-300 rounded-lg mr-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    上一页
                  </button>
                  <span className="px-3 py-2 text-gray-600">
                    第 {currentPage} 页，共 {totalPages} 页
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 border border-gray-300 rounded-lg ml-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    下一页
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'users' && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">用户列表</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">用户信息</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">邮箱</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">角色</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">创建时间</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {usersLoading ? (
                      <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">加载中...</td></tr>
                    ) : users.length === 0 ? (
                      <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">暂无用户</td></tr>
                    ) : (
                      users.map((u) => (
                        <tr key={u.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{u.username}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.username}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.role}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.created_at}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button className="text-green-600 hover:text-green-900">
                                <EditIcon />
                              </button>
                              <button className="text-red-600 hover:text-red-900">
                                <Trash2Icon />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">网站设置</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">网站标题</label>
                    <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2" defaultValue="楚剧荟·剧本数字典藏馆" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">网站描述</label>
                    <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2" rows={3} defaultValue="传承千年戏曲文化，弘扬民族艺术精神" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">数据备份</h3>
                <div className="space-y-4">
                  <button onClick={handleBackup} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">立即备份数据</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'assistant' && (
            <div className="h-[calc(100vh-200px)]">
              <AIAssistant />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}