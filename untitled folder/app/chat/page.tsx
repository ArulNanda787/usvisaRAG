"use client";

import { useState, useRef, useEffect, CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { Send, RotateCcw, ArrowLeft, Bot } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
  sources?: string[];
  categories?: string[];
};

type VisaCategory = {
  id: string;
  label: string;
  subtitle: string;
  description: string;
  accent: string;
  bg: string;
  border: string;
  suggested: string[];
};

const SUGGESTED = [
  { icon: "✈️", label: "B-2 Tourist Visa",  query: "What documents do I need for a B-2 tourist visa?" },
  { icon: "💵", label: "MRV Fee",            query: "How much is the MRV fee for a B1/B2 visa?" },
  { icon: "📋", label: "DS-160 Form",        query: "How do I correctly fill out the DS-160 form?" },
  { icon: "⏱️", label: "Wait Times",         query: "What are the current appointment wait times?" },
  { icon: "⚠️", label: "214(b) Denial",      query: "What happens if my visa is denied under 214(b)?" },
  { icon: "🏢", label: "VAC Appointment",    query: "What documents should I bring to my VAC appointment?" },
];

const CATEGORY_COLORS: Record<string, string> = {
  visa_fees:  "#f59e0b",
  b1_b2:      "#4f8ef7",
  f1:         "#34d399",
  h1b:        "#f87171",
  ds160:      "#a78bfa",
  documents:  "#60a5fa",
  wait_times: "#f472b6",
};

const API = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/api/chat`
  : "http://localhost:8000/api/chat";

function CategoryTag({ cat }: { cat: string }) {
  const color = CATEGORY_COLORS[cat] ?? "#64748b";
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, letterSpacing: "0.08em",
      textTransform: "uppercase", padding: "2px 8px", borderRadius: 20,
      border: `1px solid ${color}40`, background: `${color}15`, color,
    }}>
      {cat.replace(/_/g, " ")}
    </span>
  );
}

function SourcePill({ url }: { url: string }) {
  const domain = url.startsWith("http") ? url.split("/")[2] : url;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" style={{
      fontSize: 12, padding: "3px 10px", borderRadius: 20,
      border: "1px solid #fed7aa", color: "#ea580c",
      background: "#fff7ed", textDecoration: "none",
    }}>
      {domain}
    </a>
  );
}

function AssistantBubble({ content, sources = [], categories = [] }: {
  content: string; sources?: string[]; categories?: string[];
}) {
  const lines = content.split("\n");
  return (
    <div style={{ display: "flex", justifyContent: "flex-start", gap: 8 }}>
      {/* Avatar */}
      <div style={{
        width: 32, height: 32, borderRadius: "50%", background: "#f97316",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, marginTop: 2,
      }}>
        <Bot size={16} color="#fff" />
      </div>
      {/* Bubble */}
      <div style={{
        maxWidth: "78%", padding: "14px 18px", borderRadius: "18px 18px 18px 4px",
        background: "#ffffff", border: "1.5px solid #fed7aa",
        boxShadow: "0 1px 4px rgba(249,115,22,0.08)",
        fontSize: 16, lineHeight: 1.7, color: "#1a1a1a",
      }}>
        {categories.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 10 }}>
            {categories.map(c => <CategoryTag key={c} cat={c} />)}
          </div>
        )}
        <div>
          {lines.map((line, i) => {
            if (line.startsWith("- ") || line.startsWith("• "))
              return (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                  <span style={{ color: "#f97316", flexShrink: 0, marginTop: 2 }}>▸</span>
                  <span style={{ color: "#374151" }}>{line.slice(2)}</span>
                </div>
              );
            if (line.trim() === "") return <div key={i} style={{ height: 6 }} />;
            return <p key={i} style={{ marginBottom: 2, color: "#374151" }}>{line}</p>;
          })}
        </div>
        {sources.length > 0 && (
          <div style={{ borderTop: "1px solid #fed7aa", marginTop: 12, paddingTop: 10 }}>
            <p style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9ca3af", marginBottom: 6 }}>Sources</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {sources.map(u => <SourcePill key={u} url={u} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
      <div style={{
        width: 32, height: 32, borderRadius: "50%", background: "#f97316",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <Bot size={16} color="#fff" />
      </div>
      <div style={{
        padding: "14px 18px", borderRadius: "18px 18px 18px 4px",
        background: "#ffffff", border: "1.5px solid #fed7aa",
        boxShadow: "0 1px 4px rgba(249,115,22,0.08)",
        display: "flex", gap: 5, alignItems: "center",
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 8, height: 8, borderRadius: "50%", background: "#f97316",
            animation: `bounce 0.7s ease-in-out ${i * 0.15}s infinite`,
          }} />
        ))}
      </div>
    </div>
  );
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const bottomRef               = useRef<HTMLDivElement>(null);
  const inputRef                = useRef<HTMLInputElement>(null);
  const router                  = useRouter();
  const [category, setCategory] = useState<VisaCategory | null>(null);
  const [summary, setSummary] = useState("");
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);
  useEffect(() => {
  try {
    const saved = sessionStorage.getItem("thomasCategory");
    if (saved) setCategory(JSON.parse(saved));
  } catch {}
}, []);

  async function sendQuery(query: string) {
    if (!query.trim() || loading) return;
    setMessages(prev => [...prev, { role: "user", content: query }]);
    setInput("");
    setLoading(true);
    try {
      const res  = await fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
  query,
  summary,
  history: [
  ...messages.map(m => ({ role: m.role, content: m.content })),
  { role: "user", content: query },
],
  ...(category && {
    category: category.id,
    category_label: category.label,
    category_subtitle: category.subtitle,
  }),
}) });
      const data = await res.json();
      setSummary(data.summary ?? "");
      setMessages(prev => [...prev, { role: "assistant", content: data.answer, sources: data.sources, categories: data.categories }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Something went wrong. Make sure the backend is running on port 8000." }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }

  const isEmpty = messages.length === 0;

  return (
    <>
      <style>{`
        * { box-sizing: border-box; color-scheme: light only; }
        body { background: #fff7ed; margin: 0; font-family: 'Plus Jakarta Sans', 'Inter', sans-serif; }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-5px); }
        }
        @keyframes borderFlow {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .suggest-btn:hover { background: #fff7ed !important; }
        .input-field:focus { border-color: #f97316 !important; box-shadow: 0 0 0 3px rgba(249,115,22,0.12); }
        .send-btn:hover:not(:disabled) { background: #ea580c !important; }
        .back-btn:hover { color: #f97316 !important; border-color: #f97316 !important; }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#fff7ed" }}>

        {/* HEADER */}
        <header style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 24px", background: "#ffffff",
          borderBottom: "1px solid #fed7aa", flexShrink: 0,
          boxShadow: "0 1px 8px rgba(249,115,22,0.08)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              className="back-btn"
              onClick={() => router.push("/select")}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                fontSize: 14, color: "#6b7280", cursor: "pointer",
                background: "none", border: "1px solid #e5e7eb",
                borderRadius: 8, padding: "5px 12px",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                transition: "color 0.15s, border-color 0.15s",
              }}
            >
              <ArrowLeft size={14} /> Back
            </button>
            <div style={{ width: 1, height: 24, background: "#fed7aa" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: "#fff7ed", border: "1.5px solid #fed7aa",
                display: "flex", alignItems: "center", justifyContent: "center",
}}><img src="/thomas.png" alt="Thomas" style={{ width: 24, height: 24, borderRadius: "50%", objectFit: "cover" }} /></div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: "#111827", lineHeight: 1 }}>Thomas</p>
                <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
                  {category ? `${category.label} · ${category.subtitle}` : "US Visa Assistant · India"}
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 8, height: 8, borderRadius: "50%", background: "#22c55e",
              boxShadow: "0 0 0 2px #dcfce7",
            }} />
            <span style={{ fontSize: 13, color: "#6b7280" }}>online</span>
          </div>
        </header>

        {/* CHAT AREA */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 16px" }}>
          <div style={{ maxWidth: 720, width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: 16, minHeight: "100%" }}>

            {isEmpty && (
              <div style={{
                flex: 1, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                gap: 32, paddingBottom: 48, paddingTop: 40,
              }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{
                    width: 72, height: 72, borderRadius: 20, background: "#f97316",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 16px", boxShadow: "0 8px 24px rgba(249,115,22,0.3)", overflow: "hidden",
}}><img src="/thomas.png" alt="Thomas" style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>
                  <p style={{ fontSize: 28, fontWeight: 800, color: "#111827", marginBottom: 8 }}>Ask Thomas anything</p>
                  <p style={{ fontSize: 16, color: "#6b7280", maxWidth: 380, margin: "0 auto" }}>
                    Non-immigrant visa guidance from official US government sources
                  </p>
                </div>

                <div style={{ width: "100%", maxWidth: 520 }}>
                  <p style={{
                    fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase",
                    color: "#9ca3af", textAlign: "center", marginBottom: 12, fontWeight: 600,
                  }}>Suggested questions</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {SUGGESTED.map(s2 => (
                      <button
                        key={s2.label}
                        className="suggest-btn"
                        onClick={() => sendQuery(s2.query)}
                        style={{
                          display: "flex", alignItems: "center", gap: 10,
                          padding: "12px 16px", borderRadius: 12,
                          border: "1.5px solid #fed7aa", background: "#ffffff",
                          cursor: "pointer", textAlign: "left", width: "100%",
                          transition: "background 0.15s, border-color 0.15s",
                          boxShadow: "0 1px 3px rgba(249,115,22,0.06)",
                        }}
                      >
                        <span style={{ fontSize: 20, flexShrink: 0 }}>{s2.icon}</span>
                        <span style={{ fontSize: 14, color: "#374151", fontWeight: 500, lineHeight: 1.3 }}>{s2.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {messages.map((m, i) =>
              m.role === "user" ? (
                <div key={i} style={{ display: "flex", justifyContent: "flex-end" }}>
                  <div style={{
                    maxWidth: "72%", padding: "12px 18px",
                    borderRadius: "18px 18px 4px 18px",
                    background: "linear-gradient(135deg, #f97316, #ea580c)",
                    color: "#ffffff", fontSize: 16, lineHeight: 1.6,
                    boxShadow: "0 2px 8px rgba(249,115,22,0.3)",
                  }}>
                    {m.content}
                  </div>
                </div>
              ) : (
                <AssistantBubble key={i} content={m.content} sources={m.sources} categories={m.categories} />
              )
            )}

            {loading && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* INPUT BAR */}
        <div style={{
          flexShrink: 0, borderTop: "1px solid #fed7aa",
          background: "#ffffff", padding: "14px 16px 12px",
          boxShadow: "0 -2px 12px rgba(249,115,22,0.06)",
        }}>
          <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", alignItems: "center", gap: 10 }}>
            {messages.length > 0 && (
              <button
                onClick={() => { setMessages([]); setSummary(""); }}
                title="Clear chat"
                style={{
                  width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                  border: "1px solid #e5e7eb", background: "transparent",
                  color: "#9ca3af", cursor: "pointer", fontSize: 16,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "border-color 0.15s, color 0.15s",
                }}
              >
                <RotateCcw size={15} />
              </button>
            )}
            <input
              ref={inputRef}
              className="input-field"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendQuery(input); }}}
              placeholder={category ? `Ask about ${category.label.toLowerCase()} visas…` : "Ask about visas, fees, documents, wait times…"}
              disabled={loading}
              style={{
                flex: 1, border: "1.5px solid #fed7aa", borderRadius: 12,
                padding: "12px 18px", fontSize: 16, color: "#111827",
                outline: "none", fontFamily: "'Plus Jakarta Sans', sans-serif",
                background: "#fff7ed", transition: "border-color 0.2s, box-shadow 0.2s",
              }}
            />
            <button
              className="send-btn"
              onClick={() => sendQuery(input)}
              disabled={loading || !input.trim()}
              style={{
                width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                border: "none", background: "#f97316", color: "#fff",
                cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                opacity: loading || !input.trim() ? 0.4 : 1,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "background 0.15s, opacity 0.15s",
              }}
            >
              <Send size={16} />
            </button>
          </div>
          <p style={{ fontSize: 12, color: "#9ca3af", textAlign: "center", marginTop: 8 }}>
            Sourced from state.gov · ustraveldocs.com · For India-based applicants
          </p>
        </div>

      </div>
    </>
  );
}