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
          background: "linear-gradient(135deg, #050507 0%, #0d0d1a 50%, #0a0618 100%)",
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
        {/* Glow background */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 800,
            height: 400,
            background: "radial-gradient(ellipse, rgba(139,92,246,0.25) 0%, transparent 70%)",
            display: "flex",
          }}
        />

        {/* Logo text */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #8b5cf6, #a855f7)",
              borderRadius: 16,
              width: 64,
              height: 64,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
            }}
          >
            ✂️
          </div>
          <span
            style={{
              fontSize: 52,
              fontWeight: 800,
              color: "#ffffff",
              letterSpacing: -1,
            }}
          >
            Viraliza Cortes
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 28,
            fontWeight: 600,
            background: "linear-gradient(90deg, #a855f7, #ec4899)",
            backgroundClip: "text",
            color: "transparent",
            marginBottom: 20,
            textAlign: "center",
          }}
        >
          Cortes Virais Automáticos com IA
        </div>

        {/* Description */}
        <div
          style={{
            fontSize: 20,
            color: "#9ca3af",
            textAlign: "center",
            maxWidth: 700,
            lineHeight: 1.5,
          }}
        >
          Cole o link do YouTube → receba clips prontos para TikTok, Reels e Shorts
        </div>

        {/* Tags */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 32,
          }}
        >
          {["TikTok", "Instagram Reels", "YouTube Shorts", "Legenda Automática"].map((tag) => (
            <div
              key={tag}
              style={{
                background: "rgba(139,92,246,0.2)",
                border: "1px solid rgba(139,92,246,0.4)",
                borderRadius: 999,
                padding: "6px 16px",
                fontSize: 15,
                color: "#c4b5fd",
              }}
            >
              {tag}
            </div>
          ))}
        </div>

        {/* URL */}
        <div
          style={{
            position: "absolute",
            bottom: 32,
            fontSize: 16,
            color: "#6b7280",
          }}
        >
          viralizacortes.com.br
        </div>
      </div>
    ),
    { ...size }
  );
}
