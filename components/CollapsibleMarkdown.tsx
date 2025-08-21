"use client";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function CollapsibleMarkdown({ content }: { content: string }) {
  const [expanded, setExpanded] = useState(false);
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const r = await fetch("/api/auth/me", { cache: "no-store" });
        const j = await r.json();
        setAuthed(Boolean(j?.user));
      } catch {
        setAuthed(false);
      }
    };
    load();
  }, []);

  const onExpand = () => {
    if (authed) {
      setExpanded(true);
    } else {
      alert("登录后可阅读全文");
      location.href = "/login";
    }
  };

  return (
    <div className="relative">
      <div className={expanded ? "" : "max-h-[70vh] overflow-hidden relative"}>
        <article className="prose prose-lg max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </article>
        {!expanded && (
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent" />
        )}
      </div>
      {!expanded && (
        <div className="mt-4 flex justify-center">
          <button onClick={onExpand} className="px-4 py-2 text-sm rounded bg-gray-100 hover:bg-gray-200">展开全文</button>
        </div>
      )}
    </div>
  );
} 