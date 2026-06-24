"use client";

import { useRouter } from "next/navigation";
import { GraduationCap, Briefcase, Users, Plane, Shield, ChevronRight, ArrowLeft } from "lucide-react";

const CATEGORIES = [
  {
    id: "studies",
    label: "Studies",
    subtitle: "F-1 · J-1 · M-1 visas",
    description: "Academic programs, language schools, exchange visitors",
    icon: GraduationCap,
    accent: "#4f8ef7",
    bg: "#eff6ff",
    border: "#bfdbfe",
    suggested: [
      "What documents do I need for an F-1 student visa?",
      "How do I apply for OPT after graduation?",
      "What is SEVIS and how do I pay the fee?",
    ],
  },
  {
    id: "employment",
    label: "Employment",
    subtitle: "H-1B · L-1 · O-1 visas",
    description: "Specialty occupations, intracompany transfers, extraordinary ability",
    icon: Briefcase,
    accent: "#f97316",
    bg: "#fff7ed",
    border: "#fed7aa",
    suggested: [
      "How does the H-1B lottery work?",
      "What is the difference between L-1A and L-1B?",
      "How long does O-1 visa processing take?",
    ],
  },
  {
    id: "family",
    label: "Family",
    subtitle: "IR · CR · K-1 visas",
    description: "Immediate relatives, family preference, fiancé visas",
    icon: Users,
    accent: "#ec4899",
    bg: "#fdf2f8",
    border: "#fbcfe8",
    suggested: [
      "How do I sponsor my spouse for a green card?",
      "What is the K-1 fiancé visa process?",
      "How long does an IR-1 visa take to process?",
    ],
  },
  {
    id: "tourism",
    label: "Tourism",
    subtitle: "B-1 · B-2 · ESTA visas",
    description: "Leisure travel, medical visits, short business trips",
    icon: Plane,
    accent: "#10b981",
    bg: "#f0fdf4",
    border: "#a7f3d0",
    suggested: [
      "What documents do I need for a B-2 tourist visa?",
      "How much is the MRV fee for a B1/B2 visa?",
      "What are the current appointment wait times?",
    ],
  },
];

export default function SelectCategory() {
  const router = useRouter();

  function handleSelect(cat: (typeof CATEGORIES)[number]) {
    // Persist selection so the chat page can read it
    sessionStorage.setItem("thomasCategory", JSON.stringify(cat));
    router.push("/chat");
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; color-scheme: light only; }
        body { margin: 0; background: #fff7ed; font-family: 'Plus Jakarta Sans', 'Inter', sans-serif; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .cat-card {
          transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
          cursor: pointer;
        }
        .cat-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.1) !important;
        }
        .cat-card:active { transform: translateY(-1px); }
        .back-btn:hover { color: #f97316 !important; border-color: #f97316 !important; }
        @media (max-width: 480px) {
          .cat-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#fff7ed", display: "flex", flexDirection: "column" }}>

        {/* HEADER — matches chat page exactly */}
        <header style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 24px", background: "#ffffff",
          borderBottom: "1px solid #fed7aa", flexShrink: 0,
          boxShadow: "0 1px 8px rgba(249,115,22,0.08)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              className="back-btn"
              onClick={() => router.push("/")}
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
              }}>
                <img src="/thomas.png" alt="Thomas" style={{ width: 24, height: 24, borderRadius: "50%", objectFit: "cover" }} />
              </div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: "#111827", lineHeight: 1 }}>Thomas</p>
                <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>US Visa Assistant · India</p>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 0 2px #dcfce7" }} />
            <span style={{ fontSize: 13, color: "#6b7280" }}>online</span>
          </div>
        </header>

        {/* MAIN */}
        <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "48px 20px 64px" }}>

          {/* Hero */}
          <div style={{ textAlign: "center", marginBottom: 40, animation: "fadeUp 0.4s ease both" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "4px 12px", borderRadius: 20, marginBottom: 16,
              background: "#fff7ed", border: "1px solid #fed7aa",
              fontSize: 12, fontWeight: 600, color: "#c2410c",
            }}>
              <Shield size={11} /> Official Sources Only · state.gov · ustraveldocs.com
            </div>
            <h1 style={{
              fontSize: 30, fontWeight: 800, color: "#111827", marginBottom: 10,
              fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "-0.5px",
            }}>
              What brings you here?
            </h1>
            <p style={{ fontSize: 16, color: "#6b7280", maxWidth: 400, margin: "0 auto", lineHeight: 1.6 }}>
              Select your visa category so Thomas can give you the most relevant guidance.
            </p>
          </div>

          {/* Cards — single row */}
          <div  className="cat-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 12,
            width: "100%",
            maxWidth: 640,
          }}>
            {CATEGORIES.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  className="cat-card"
                  onClick={() => handleSelect(cat)}
                  style={{
                    background: "#ffffff",
                    border: "1.5px solid #e8e8e8",
                    borderRadius: 16,
                    padding: "22px 18px",
                    textAlign: "left",
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    animation: `fadeUp 0.4s ease ${idx * 0.07}s both`,
                  }}
                >
                  <div style={{
                    width: 48, height: 48, borderRadius: 12,
                    background: cat.bg, border: `1.5px solid ${cat.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Icon size={22} color={cat.accent} />
                  </div>

                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 16, fontWeight: 800, color: "#111827", marginBottom: 2, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      {cat.label}
                    </p>
                    <p style={{ fontSize: 11, fontWeight: 600, color: cat.accent, marginBottom: 7 }}>{cat.subtitle}</p>
                    <p style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.55 }}>{cat.description}</p>
                  </div>

                  <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    borderTop: "1px solid #f3f4f6", paddingTop: 10, marginTop: 2,
                  }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: cat.accent }}>Ask Thomas</span>
                    <div style={{
                      width: 26, height: 26, borderRadius: 7,
                      background: cat.bg, border: `1px solid ${cat.border}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <ChevronRight size={13} color={cat.accent} />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 36, textAlign: "center", maxWidth: 480, lineHeight: 1.6 }}>
            Thomas provides general guidance from official US government sources. For personalized legal advice, consult a licensed immigration attorney.
          </p>
        </main>
      </div>
    </>
  );
}
