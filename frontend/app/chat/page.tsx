"use client";

import { useState, useRef, useEffect, CSSProperties } from "react";
import { useRouter } from "next/navigation";

type Message = {
  role: "user" | "assistant";
  content: string;
  sources?: string[];
  categories?: string[];
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

const GRADIENT          = "linear-gradient(135deg, #d97706, #ea580c)";
const GRADIENT_ANIMATED = "linear-gradient(270deg, #d97706, #ea580c, #d97706)";

const s = {
  shell: { display: "flex", flexDirection: "column", height: "100vh", position: "relative", zIndex: 1 } as CSSProperties,
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", borderBottom: "1px solid var(--border)", background: "var(--surface)", flexShrink: 0 } as CSSProperties,
  headerLeft: { display: "flex", alignItems: "center", gap: 10 } as CSSProperties,
  avatar: { width: 34, height: 34, borderRadius: 10, background: "var(--accent-dim)", border: "1px solid var(--accent-glow)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 } as CSSProperties,
  headerName: { fontSize: 16, fontWeight: 600, color: "#fff", lineHeight: 1 } as CSSProperties,
  headerSub: { fontSize: 13, color: "var(--muted)", marginTop: 2 } as CSSProperties,
  headerRight: { display: "flex", alignItems: "center", gap: 12 } as CSSProperties,
  backBtn: { fontSize: 14, color: "var(--muted)", cursor: "pointer", background: "none", border: "1px solid var(--border)", borderRadius: 8, padding: "5px 10px", fontFamily: "'DM Sans', sans-serif", transition: "color 0.15s, border-color 0.15s" } as CSSProperties,
  statusWrap: { display: "flex", alignItems: "center", gap: 6 } as CSSProperties,
  statusDot: { width: 7, height: 7, borderRadius: "50%", background: "var(--green)" } as CSSProperties,
  statusLabel: { fontSize: 13, color: "var(--muted)" } as CSSProperties,
  chatArea: { flex: 1, overflowY: "auto", padding: "24px 16px", display: "flex", flexDirection: "column", gap: 12 } as CSSProperties,
  inner: { maxWidth: 720, width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: 12, flex: 1 } as CSSProperties,
  emptyWrap: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 32, paddingBottom: 48 } as CSSProperties,
  emptyTitle: { fontSize: 32, fontWeight: 600, color: "#fff", marginBottom: 4, textAlign: "center" } as CSSProperties,
  emptySub: { fontSize: 16, color: "var(--muted)", textAlign: "center" } as CSSProperties,
  suggestLabel: { fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted)", textAlign: "center", marginBottom: 10 } as CSSProperties,
  suggestGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, width: "100%", maxWidth: 480 } as CSSProperties,
  suggestBtnWrap: { borderRadius: 13, padding: 2, background: "transparent", backgroundSize: "300% 300%", animation: "gradientShift 6s ease infinite" } as CSSProperties,
  suggestBtn: { display: "flex", alignItems: "center", justifyContent: "center",gap: 10, padding: "10px 14px", borderRadius: 11, border: "2px solid transparent", background: "linear-gradient(#1a1a1a, #1a1a1a) padding-box, linear-gradient(270deg, #d97706, #ea580c, #d97706) border-box", backgroundClip: "padding-box, border-box", cursor: "pointer",  backgroundSize: "100% 100%, 200% 200%", animation: "borderFlow 6s ease infinite",textAlign: "center", width: "100%", transition: "background 0.15s" } as CSSProperties,
  suggestIcon: { fontSize: 20, flexShrink: 0 } as CSSProperties,
  suggestText: { fontSize: 15, color: "var(--muted2)", lineHeight: 1.3 } as CSSProperties,
  rowUser: { display: "flex", justifyContent: "flex-end" } as CSSProperties,
  rowAssistant: { display: "flex", justifyContent: "flex-start" } as CSSProperties,
  bubbleUser: { maxWidth: "72%", padding: "12px 18px", borderRadius: "18px 18px 4px 18px", background: "linear-gradient(135deg, #d97706 0%, #ea580c 100%)", color: "#fff", fontSize: 17, lineHeight: 1.6 } as CSSProperties,
  bubbleAssistantWrap: { maxWidth: "80%", borderRadius: 19, padding: 1, background: "transparent", backgroundSize: "300% 300%", animation: "gradientShift 6s ease infinite" } as CSSProperties,
  bubbleAssistant: { padding: "14px 18px", borderRadius: 18,border: "1.5px solid transparent", background: `linear-gradient(var(--surface), var(--surface)) padding-box, linear-gradient(270deg, #d97706, #ea580c, #d97706) border-box`, backgroundSize: "100% 100%, 200% 200%", animation: "borderFlow 8s ease infinite", fontSize: 17, lineHeight: 1.7 } as CSSProperties,
  tagRow: { display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 8 } as CSSProperties,
  divider: { borderTop: "1px solid var(--border)", marginTop: 10, paddingTop: 10 } as CSSProperties,
  srcLabel: { fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 6 } as CSSProperties,
  srcRow: { display: "flex", flexWrap: "wrap", gap: 6 } as CSSProperties,
  typingWrap: { display: "flex", alignItems: "center", gap: 5, padding: "10px 14px", borderRadius: "18px 18px 18px 4px", border: "1px solid var(--border2)", background: "var(--surface)", width: "fit-content" } as CSSProperties,
  inputBar: { flexShrink: 0, borderTop: "1px solid var(--border)", background: "var(--surface)", padding: "12px 16px 10px" } as CSSProperties,
  inputRow: { maxWidth: 720, margin: "0 auto", display: "flex", alignItems: "center", gap: 8 } as CSSProperties,
  inputWrap: { flex: 1, borderRadius: 13, padding: 0, background: "transparent" } as CSSProperties,
  input: { width: "100%", border: "2px solid #e9590c", borderRadius: 11, padding: "12px 18px", fontSize: 17, color: "var(--text)", outline: "none", fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box" as const, background: "transparent" } as CSSProperties,
  clearBtn: { width: 36, height: 36, borderRadius: 10, flexShrink: 0, border: "1px solid var(--border)", background: "transparent", color: "var(--muted)", cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", transition: "border-color 0.15s, color 0.15s" } as CSSProperties,
  sendBtn: { width: 40, height: 40, borderRadius: 10, flexShrink: 0, border: "none", background: "linear-gradient(135deg, #f97316, #8b5cf6)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "opacity 0.15s" } as CSSProperties,
  footer: { fontSize: 12, color: "var(--muted)", textAlign: "center", marginTop: 6 } as CSSProperties,
};

function CategoryTag({ cat }: { cat: string }) {
  const color = CATEGORY_COLORS[cat] ?? "#64748b";
  return (
    <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", padding: "2px 8px", borderRadius: 20, border: `1px solid ${color}50`, background: `${color}18`, color }}>
      {cat.replace(/_/g, " ")}
    </span>
  );
}

function SourcePill({ url }: { url: string }) {
  const domain = url.startsWith("http") ? url.split("/")[2] : url;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, padding: "3px 10px", borderRadius: 20, border: "1px solid var(--border2)", color: "var(--accent)", background: "var(--accent-dim)", textDecoration: "none" }}>
      {domain}
    </a>
  );
}

function AssistantBubble({ content, sources = [], categories = [] }: { content: string; sources?: string[]; categories?: string[] }) {
  const lines = content.split("\n");
  return (
    <div style={s.rowAssistant} className="msg-enter">
      <div style={s.bubbleAssistantWrap}>
        <div style={s.bubbleAssistant}>
          {categories.length > 0 && <div style={s.tagRow}>{categories.map(c => <CategoryTag key={c} cat={c} />)}</div>}
          <div>
            {lines.map((line, i) => {
              if (line.startsWith("- ") || line.startsWith("• "))
                return <div key={i} style={{ display: "flex", gap: 8, marginBottom: 3 }}><span style={{ color: "var(--accent)", marginTop: 1, flexShrink: 0 }}>▸</span><span>{line.slice(2)}</span></div>;
              if (line.trim() === "") return <div key={i} style={{ height: 6 }} />;
              return <p key={i} style={{ marginBottom: 2 }}>{line}</p>;
            })}
          </div>
          {sources.length > 0 && (
            <div style={s.divider}>
              <p style={s.srcLabel}>Sources</p>
              <div style={s.srcRow}>{sources.map(u => <SourcePill key={u} url={u} />)}</div>
            </div>
          )}
        </div>
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

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  async function sendQuery(query: string) {
    if (!query.trim() || loading) return;
    setMessages(prev => [...prev, { role: "user", content: query }]);
    setInput("");
    setLoading(true);
    try {
      const res  = await fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query }) });
      const data = await res.json();
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
        @keyframes gradientShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
      <div style={s.shell}>
        <header style={s.header}>
          <div style={s.headerLeft}>
            <div style={s.avatar}>🗽</div>
            <div>
              <p style={s.headerName}>Thomas</p>
              <p style={s.headerSub}>US Visa Assistant · India</p>
            </div>
          </div>
          <div style={s.headerRight}>
            <button style={s.backBtn} onClick={() => router.push("/")}
              onMouseEnter={e => {
                e.currentTarget.style.filter = "brightness(1.1)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.filter = "brightness(1)";
              }}
            >← Back</button>
            <div style={s.statusWrap}>
              <span style={s.statusDot} className="pulse" />
              <span style={s.statusLabel}>online</span>
            </div>
          </div>
        </header>

        <div style={s.chatArea}>
          <div style={s.inner}>
            {isEmpty && (
              <div style={s.emptyWrap}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 44, marginBottom: 12 }}>🗽</div>
                  <p style={s.emptyTitle}>Ask Thomas anything</p>
                  <p style={s.emptySub}>Non-immigrant visa guidance from official US government sources</p>
                </div>
                <div style={{ width: "100%", maxWidth: 480 }}>
                  <p style={s.suggestLabel}>Suggested</p>
                  <div style={s.suggestGrid}>
                    {SUGGESTED.map(s2 => (
                      <div key={s2.label} style={s.suggestBtnWrap}>
                        <button style={s.suggestBtn} onClick={() => sendQuery(s2.query)}
                          onMouseEnter={e => {
                            e.currentTarget.style.filter = "brightness(1.15)";
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.filter = "brightness(1)";
                          }}
                        >
                          <span style={s.suggestIcon}>{s2.icon}</span>
                          <span style={s.suggestText}>{s2.label}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {messages.map((m, i) =>
              m.role === "user"
                ? <div key={i} style={s.rowUser} className="msg-enter"><div style={s.bubbleUser}>{m.content}</div></div>
                : <AssistantBubble key={i} content={m.content} sources={m.sources} categories={m.categories} />
            )}

            {loading && (
              <div style={s.rowAssistant}>
                <div style={s.typingWrap}>
                  <span className="dot" /><span className="dot" /><span className="dot" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        <div style={s.inputBar}>
          <div style={s.inputRow}>
            {messages.length > 0 && (
              <button style={s.clearBtn} onClick={() => setMessages([])} title="Clear chat">↺</button>
            )}
            <div style={s.inputWrap}>
              <input ref={inputRef} style={s.input} value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendQuery(input); }}}
                placeholder="Ask about visas, fees, documents, wait times…"
                disabled={loading}
              />
            </div>
            <button style={{ ...s.sendBtn, opacity: loading || !input.trim() ? 0.35 : 1 }}
              onClick={() => sendQuery(input)} disabled={loading || !input.trim()}>
              <svg width="14" height="14" viewBox="0 0 15 15" fill="none">
                <path d="M1 7.5h13M8 1.5l6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          <p style={s.footer}>Sourced from state.gov · ustraveldocs.com · For India-based applicants</p>
        </div>
      </div>
    </>
  );
}