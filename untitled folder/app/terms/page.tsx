"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Shield, AlertTriangle, Info, Scale } from "lucide-react";

export default function TermsPage() {
  const router = useRouter();

  const sections = [
    {
      icon: <Info size={20} />,
      title: "Informational Purpose Only",
      accent: "#4f8ef7",
      bg: "#eff6ff",
      border: "#bfdbfe",
      content: `Thomas is an AI-powered informational tool designed to help users understand the US visa application process. All content provided by Thomas — including guidance, checklists, timelines, and responses — is strictly for general informational and educational purposes only.

Thomas does not provide legal advice of any kind. The information provided should not be construed as legal counsel, legal opinion, or a substitute for advice from a qualified, licensed immigration attorney.`,
    },
    {
      icon: <Scale size={20} />,
      title: "No Attorney-Client Relationship",
      accent: "#f97316",
      bg: "#fff7ed",
      border: "#fed7aa",
      content: `Your use of Thomas does not create an attorney-client relationship between you and Thomas, Arul Nanda, or any affiliated parties. No such relationship is formed by using this service, regardless of what information you share or receive.

For advice specific to your personal circumstances, you must consult a licensed immigration attorney or accredited representative.`,
    },
    {
      icon: <AlertTriangle size={20} />,
      title: "No Guarantee of Accuracy or Outcome",
      accent: "#ec4899",
      bg: "#fdf2f8",
      border: "#fbcfe8",
      content: `US immigration law is complex and subject to change without notice. While Thomas draws from official sources such as state.gov and ustraveldocs.com, we make no representations or warranties — express or implied — about the accuracy, completeness, reliability, or suitability of any information provided.

Thomas does not guarantee any visa approval, application outcome, or that information provided is current, correct, or applicable to your specific situation. You rely on this information entirely at your own risk.`,
    },
    {
      icon: <Shield size={20} />,
      title: "Limitation of Liability",
      accent: "#10b981",
      bg: "#f0fdf4",
      border: "#a7f3d0",
      content: `To the fullest extent permitted by applicable law, Arul Nanda, the creator of Thomas, shall not be liable for any direct, indirect, incidental, consequential, or special damages arising from your use of — or reliance on — any information provided by Thomas.

This includes but is not limited to: visa denials, missed deadlines, incorrect filings, financial losses, travel disruptions, or any other harm resulting from actions taken based on Thomas's guidance.`,
    },
  ];

  return (
    <>
      <style>{`
        * { box-sizing: border-box; color-scheme: light only; }
        body { margin: 0; background: #fff7ed; font-family: 'Plus Jakarta Sans', 'Inter', sans-serif; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#fff7ed", display: "flex", flexDirection: "column" }}>

        {/* HEADER */}
        <header style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 24px", background: "#ffffff",
          borderBottom: "1px solid #fed7aa", flexShrink: 0,
          boxShadow: "0 1px 8px rgba(249,115,22,0.08)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => router.back()}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                fontSize: 14, color: "#6b7280", cursor: "pointer",
                background: "none", border: "1px solid #e5e7eb",
                borderRadius: 8, padding: "5px 12px",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
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
              }}>
                <img src="/thomas.png" alt="Thomas" style={{ width: 24, height: 24, borderRadius: "50%", objectFit: "cover" }} />
              </div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: "#111827", lineHeight: 1 }}>Thomas</p>
                <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>Terms of Use</p>
              </div>
            </div>
          </div>
        </header>

        {/* MAIN */}
        <main style={{ flex: 1, maxWidth: 720, width: "100%", margin: "0 auto", padding: "48px 20px 80px" }}>

          {/* Hero */}
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 64, height: 64, borderRadius: 18,
              background: "#fff7ed", border: "1.5px solid #fed7aa",
              fontSize: 32, marginBottom: 20,
            }}>
              ⚖️
            </div>
            <h1 style={{
              fontSize: 32, fontWeight: 800, color: "#111827",
              marginBottom: 12, letterSpacing: "-0.5px",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}>
              Terms of Use
            </h1>
            <p style={{ fontSize: 15, color: "#6b7280", lineHeight: 1.7, maxWidth: 500, margin: "0 auto" }}>
              Please read these terms carefully before using Thomas. By using this service, you agree to the following.
            </p>
            <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 12 }}>
              Last updated: June 2025
            </p>
          </div>

          {/* Highlight box */}
          <div style={{
            background: "#fffbeb", border: "1.5px solid #fcd34d",
            borderRadius: 16, padding: "16px 20px",
            display: "flex", gap: 12, alignItems: "flex-start",
            marginBottom: 36,
          }}>
            <AlertTriangle size={18} color="#d97706" style={{ flexShrink: 0, marginTop: 2 }} />
            <p style={{ fontSize: 14, color: "#92400e", lineHeight: 1.6, margin: 0 }}>
              <strong>Important:</strong> Thomas is not a lawyer and cannot give you legal advice. Always consult a licensed immigration attorney for decisions specific to your case.
            </p>
          </div>

          {/* Sections */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {sections.map((s, i) => (
              <div key={i} style={{
                background: "#ffffff",
                border: `1.5px solid ${s.border}`,
                borderRadius: 16,
                overflow: "hidden",
              }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "14px 20px",
                  background: s.bg,
                  borderBottom: `1px solid ${s.border}`,
                }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 9,
                    background: "#ffffff", border: `1.5px solid ${s.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: s.accent, flexShrink: 0,
                  }}>
                    {s.icon}
                  </div>
                  <h2 style={{
                    fontSize: 15, fontWeight: 700, color: "#111827",
                    margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}>
                    {s.title}
                  </h2>
                </div>
                <div style={{ padding: "18px 20px" }}>
                  {s.content.split("\n\n").map((para, j) => (
                    <p key={j} style={{
                      fontSize: 14, color: "#374151", lineHeight: 1.75,
                      margin: j < s.content.split("\n\n").length - 1 ? "0 0 12px 0" : 0,
                    }}>
                      {para}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer note */}
          <div style={{
            marginTop: 40, textAlign: "center",
            padding: "24px 20px",
            background: "#ffffff", borderRadius: 16,
            border: "1.5px solid #fed7aa",
          }}>
            <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.7, margin: "0 0 16px 0" }}>
              By using Thomas, you acknowledge that you have read, understood, and agreed to these terms. If you do not agree, please do not use this service.
            </p>
            <p style={{ fontSize: 13, color: "#9ca3af" }}>
              For questions, contact{" "}
              <a href="www.linkedin.com/in/arul-nanda" style={{ color: "#f97316", textDecoration: "none", fontWeight: 600 }}>
                arulnanda
              </a>
            </p>
            <p style={{ fontSize: 12, color: "#d1d5db", marginTop: 16 }}>
              Made with ♡ by Arul Nanda for the World
            </p>
          </div>

        </main>
      </div>
    </>
  );
}