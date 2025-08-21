"use client";
/**
 * Jscbc: AI剧本助手组件 - 现代化聊天界面
 */
import { useState } from "react";

// 完整标签选项
const SCRIPT_TAGS = {
  era: ["古代剧本", "近代剧本", "现代剧本"],
  genre: ["历史故事", "民间传说", "现实生活", "爱情婚姻", "忠孝节义", "社会批判"],
  type: ["正剧", "喜剧", "悲剧"],
  structure: ["全本", "折子戏", "片段", "完整版", "简缩版"],
  style: ["武戏", "文戏", "综合性"]
};

export default function AIAssistant() {
  const [mode, setMode] = useState<"idea"|"segment"|"review">("idea");
  const [selectedTags, setSelectedTags] = useState({
    era: "",
    genre: "",
    type: "",
    structure: "",
    style: ""
  });
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<Array<{
    id: string;
    type: "user" | "assistant";
    content: string;
    timestamp: Date;
  }>>([]);
  const [loading, setLoading] = useState(false);
  const [tagsOpen, setTagsOpen] = useState(true); // 标签区域可折叠，默认展开

  // 处理标签选择
  const handleTagSelect = (category: keyof typeof selectedTags, value: string) => {
    setSelectedTags(prev => ({
      ...prev,
      [category]: prev[category] === value ? "" : value
    }));
  };

  // 首轮带标签的提示文本（仅用于对话框首轮显示）
  const buildFirstTurnPrompt = () => {
    const tags = Object.entries(selectedTags)
      .filter(([_, value]) => value)
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ");
    return `请根据以下标签要求创作${mode === "idea" ? "剧本创意与大纲" : mode === "segment" ? "剧本片段" : "剧本修改建议"}：${tags}。${prompt}`;
  };

  // 发送消息
  const sendMessage = async () => {
    if (!prompt.trim() && Object.values(selectedTags).every(tag => !tag)) {
      return;
    }

    const isFirstTurn = messages.length === 0;

    // 对话框：首轮显示“带标签”的完整提示，后续仅显示本次输入
    const displayContent = isFirstTurn ? buildFirstTurnPrompt() : prompt;
    const userMessage = {
      id: Date.now().toString(),
      type: "user" as const,
      content: displayContent,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      // 历史（不含本次），首轮为空
      const history = messages
        .slice(-8)
        .map(m => ({ role: m.type === "user" ? "user" : "assistant", content: m.content }));

      // 请求参数：首轮包含标签，随后仅带主题
      const requestParams = isFirstTurn
        ? { theme: prompt, genre: selectedTags.genre, era: selectedTags.era, structure: selectedTags.structure, roles: [], draft: "" }
        : { theme: prompt, roles: [], draft: "" };

      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          params: requestParams,
          history
        })
      });

      let reply = "";
      try {
        const json = await res.json();
        if (!res.ok) {
          reply = json?.error
            ? `生成失败：${json.error}${json.error.includes("OPENAI_API_KEY") ? "。请在 .env.local 配置 OPENAI_API_KEY 并重启服务" : ""}`
            : `生成失败（HTTP ${res.status}）`;
        } else {
          reply = json.text || "生成失败，请重试";
        }
      } catch {
        reply = `生成失败（无法解析响应，HTTP ${res.status}）`;
      }

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        type: "assistant" as const,
        content: reply,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        type: "assistant" as const,
        content: "生成失败，请检查网络连接或稍后重试",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      setPrompt("");
    }
  };

  // 清空对话 = 新建对话
  const clearChat = () => {
    setMessages([]);
    setPrompt("");
    // 保留已选标签，便于继续首轮创作；如需清空标签，可在此重置 selectedTags
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* 标签选择区域（可折叠，默认展开） */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700">选择剧本标签</h3>
          <button onClick={() => setTagsOpen(v => !v)} className="text-sm text-gray-600 hover:text-gray-800">
            {tagsOpen ? "收起" : "展开"}
          </button>
        </div>
        {tagsOpen && (
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(SCRIPT_TAGS).map(([category, tags]) => (
              <div key={category}>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  {category === "era" ? "年代" : category === "genre" ? "题材" : category === "type" ? "体裁" : category === "structure" ? "结构" : "风格"}
                </label>
                <div className="flex flex-wrap gap-1">
                  {tags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => handleTagSelect(category as keyof typeof selectedTags, tag)}
                      className={`px-2 py-1 text-xs rounded border transition-colors ${
                        (selectedTags as any)[category] === tag
                          ? "bg-red-600 text-white border-red-600"
                          : "bg-transparent text-gray-600 border-gray-300 hover:border-red-300"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 聊天区域 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-4">🎭</div>
              <p className="text-lg font-medium">欢迎使用楚剧剧本创作助手</p>
              <p className="text-sm mt-2">请选择上方标签并输入您的创作需求</p>
            </div>
          </div>
        ) : (
          messages.map(message => (
            <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-3xl rounded-lg px-4 py-3 ${message.type === "user" ? "bg-red-600 text-white" : "bg-white border border-gray-200 text-gray-900"}`}>
                <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                <div className={`text-xs mt-2 ${message.type === "user" ? "text-red-100" : "text-gray-500"}`}>{message.timestamp.toLocaleTimeString()}</div>
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-lg px-4 py-3">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                <span className="text-sm text-gray-600">AI正在创作中...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 输入区域 */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex space-x-3">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            placeholder="输入主题/场景/需求..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || (!prompt.trim() && Object.values(selectedTags).every(tag => !tag))}
            className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            发送
          </button>
          <button onClick={() => setTagsOpen(v => !v)} className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800">
            {tagsOpen ? "收起标签" : "展开标签"}
          </button>
        </div>
      </div>
    </div>
  );
} 