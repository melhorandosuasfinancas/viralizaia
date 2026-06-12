import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Viraliza Cortes — Cortes Virais Automáticos com IA";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #050507 0%, #0d0820 40%, #08051a 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background glow orbs */}
        <div style={{ position: "absolute", top: -80, right: -80, width: 480, height: 480, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)", display: "flex" }} />
        <div style={{ position: "absolute", bottom: -60, left: -60, width: 360, height: 360, borderRadius: "50%", background: "radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%)", display: "flex" }} />

        {/* Grid lines decoration */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(139,92,246,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.04) 1px, transparent 1px)", backgroundSize: "60px 60px", display: "flex" }} />

        {/* Badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.35)", borderRadius: 999, padding: "6px 18px", marginBottom: 28 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#a855f7", display: "flex" }} />
          <span style={{ fontSize: 16, color: "#c4b5fd", fontWeight: 600, letterSpacing: 1 }}>IA PARA CRIADORES</span>
        </div>

        {/* Logo + Title */}
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 20 }}>
          <div style={{ background: "linear-gradient(135deg, #7c3aed, #9333ea)", borderRadius: 20, width: 72, height: 72, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, boxShadow: "0 0 40px rgba(139,92,246,0.5)" }}>
            ✂️
          </div>
          <span style={{ fontSize: 56, fontWeight: 900, color: "#ffffff", letterSpacing: -2 }}>
            Viraliza Cortes
          </span>
        </div>

        {/* Tagline */}
        <div style={{ fontSize: 26, fontWeight: 600, color: "#a855f7", marginBottom: 18, textAlign: "center", maxWidth: 800 }}>
          Cole o link → clips virais prontos em 3 minutos
        </div>

        {/* Description */}
        <div style={{ fontSize: 18, color: "#9ca3af", textAlign: "center", maxWidth: 680, lineHeight: 1.6, marginBottom: 36 }}>
          TikTok • Instagram Reels • YouTube Shorts • Legendas automáticas em PT-BR
        </div>

        {/* Stats bar */}
        <div style={{ display: "flex", gap: 0, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, overflow: "hidden" }}>
          {[
            { value: "1.200+", label: "criadores ativos" },
            { value: "47.000+", label: "clips gerados" },
            { value: "-90%", label: "tempo economizado" },
            { value: "4.9 ★", label: "nota dos usuários" },
          ].map((stat, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "14px 28px", borderRight: i < 3 ? "1px solid rgba(255,255,255,0.08)" : "none" }}>
              <span style={{ fontSize: 22, fontWeight: 800, color: "#ffffff" }}>{stat.value}</span>
              <span style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{stat.label}</span>
            </div>
          ))}
        </div>

        {/* URL */}
        <div style={{ position: "absolute", bottom: 28, fontSize: 15, color: "#4b5563", letterSpacing: 0.5 }}>
          viralizacortes.com.br
        </div>
      </div>
    ),
    { ...size }
  );
}
