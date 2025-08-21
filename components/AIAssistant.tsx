"use client";
/**
 * Jscbc: AI剧本助手组件 - 现代化聊天界面
 */
import { useState } from "react";

// 剧本标签选项
const SCRIPT_TAGS = {
  era: ["古代", "近代", "现代"],
  genre: ["历史故事", "民间传说", "现实生活", "爱情婚姻", "神话传说", "宫廷剧", "武侠剧"],
  type: ["悲剧", "喜剧", "正剧", "悲喜剧"],
  style: ["传统", "现代", "实验性", "经典", "创新"]
};

export default function AIAssistant() {
  const [mode, setMode] = useState<"idea"|"segment"|"review">("idea");
  const [selectedTags, setSelectedTags] = useState({
    era: "",
    genre: "",
    type: "",
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

  // 处理标签选择
  const handleTagSelect = (category: keyof typeof selectedTags, value: string) => {
    setSelectedTags(prev => ({
      ...prev,
      [category]: prev[category] === value ? "" : value
    }));
  };

  // 生成提示词
  const generatePrompt = () => {
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

    const userMessage = {
      id: Date.now().toString(),
      type: "user" as const,
      content: generatePrompt(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          params: {
            theme: prompt,
            genre: selectedTags.genre,
            era: selectedTags.era,
            roles: [],
            draft: ""
          }
        })
      });
      
      const json = await res.json();
      
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        type: "assistant" as const,
        content: json.text || "生成失败，请重试",
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

  // 清空对话
  const clearChat = () => {
    setMessages([]);
    setSelectedTags({ era: "", genre: "", type: "", style: "" });
    setPrompt("");
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* 头部 */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">楚剧剧本创作 AI 助手</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={clearChat}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              清空对话
            </button>
          </div>
        </div>
        
        {/* 模式选择 */}
        <div className="mt-4 flex gap-2">
          {(["idea","segment","review"] as const).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1 rounded border transition-colors text-sm ${
                mode === m 
                  ? "bg-red-600 text-white border-red-600" 
                  : "bg-transparent text-gray-700 border-gray-300 hover:border-red-300"
              }`}
            >
              {m === "idea" ? "创意大纲" : m === "segment" ? "片段生成" : "修改建议"}
            </button>
          ))}
        </div>
      </div>

      {/* 标签选择区域 */}
      <div className="bg-white border-b border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">选择剧本标签：</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(SCRIPT_TAGS).map(([category, tags]) => (
            <div key={category}>
              <label className="block text-xs font-medium text-gray-600 mb-2 capitalize">
                {category === "era" ? "年代" : 
                 category === "genre" ? "题材" : 
                 category === "type" ? "类型" : "风格"}
              </label>
              <div className="flex flex-wrap gap-1">
                {tags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleTagSelect(category as keyof typeof selectedTags, tag)}
                    className={`px-2 py-1 text-xs rounded border transition-colors ${
                      selectedTags[category as keyof typeof selectedTags] === tag
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
      </div>

      {/* 聊天区域 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-4">🎭</div>
              <p className="text-lg font-medium">欢迎使用楚剧剧本创作助手</p>
              <p className="text-sm mt-2">请选择剧本标签并输入您的创作需求</p>
            </div>
          </div>
        ) : (
          messages.map(message => (
            <div
              key={message.id}
              className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-3xl rounded-lg px-4 py-3 ${
                  message.type === "user"
                    ? "bg-red-600 text-white"
                    : "bg-white border border-gray-200 text-gray-900"
                }`}
              >
                <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                <div className={`text-xs mt-2 ${
                  message.type === "user" ? "text-red-100" : "text-gray-500"
                }`}>
                  {message.timestamp.toLocaleTimeString()}
                </div>
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
            placeholder="输入主题/题材/场景等..."
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
        </div>
      </div>
    </div>
  );
} 