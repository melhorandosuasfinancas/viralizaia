"use client";

import Link from "next/link";

const STEPS = [
  {
    num: "01",
    title: "Cole o link do vídeo",
    desc: "YouTube, MP4 ou Google Drive. Suportamos até 20 minutos de vídeo.",
  },
  {
    num: "02",
    title: "IA analisa os melhores momentos",
    desc: "A IA identifica humor, tensão, engajamento e escolhe os trechos mais virais.",
  },
  {
    num: "03",
    title: "Receba seus cortes prontos",
    desc: "Clips no formato certo, com legenda gravada — prontos para TikTok, Reels e Shorts.",
  },
];

const PLATFORMS = [
  { icon: "🎵", name: "TikTok", desc: "Formato 9:16 otimizado para o FYP. A IA sabe o que funciona no TikTok." },
  { icon: "📸", name: "Instagram Reels", desc: "Transforme podcasts e vídeos longos em Reels que capturam atenção." },
  { icon: "▶️", name: "YouTube Shorts", desc: "Extraia os melhores momentos e transforme em Shorts virais." },
  { icon: "👥", name: "Facebook Reels", desc: "Alcance novo público com Reels criados a partir do seu melhor conteúdo." },
  { icon: "🎬", name: "Legendas Automáticas", desc: "4 estilos: TikTok, Hormozi, Dark Box e Clean — gravados no vídeo." },
  { icon: "⚡", name: "Download Imediato", desc: "Baixe todos os clips em segundos. Sem marca d'água, sem espera." },
];

const PLANS = [
  {
    emoji: "✨",
    name: "Grátis",
    price: "R$0",
    period: "",
    badge: null,
    desc: "Teste antes de pagar",
    highlight: false,
    features: [
      "1 clip grátis para testar",
      "TikTok + Instagram",
      "Legenda automática",
      "Com marca d'água",
      "Sem cartão de crédito",
    ],
    cta: "Começar Grátis →",
    href: "/app",
    isLink: true,
  },
  {
    emoji: "🚀",
    name: "Starter",
    price: "R$19,90",
    period: "/mês",
    badge: "MAIS POPULAR",
    desc: "Para criadores que publicam todo dia",
    highlight: true,
    features: [
      "Vídeos ilimitados",
      "Até 10 cortes por vídeo",
      "TikTok + Instagram + Facebook",
      "Legendas automáticas estilizadas",
      "Sem marca d'água",
      "Download em HD",
      "Suporte por chat",
    ],
    cta: "Assinar Starter →",
    href: "https://pay.kiwify.com.br/Ft2LPkC",
    isLink: false,
  },
  {
    emoji: "💎",
    name: "Pro",
    price: "R$39,90",
    period: "/mês",
    badge: null,
    desc: "Para criadores sérios — máximo resultado",
    highlight: false,
    features: [
      "Vídeos ilimitados",
      "Até 20 cortes por vídeo",
      "Todos formatos + YouTube Shorts",
      "IA avançada de viralização",
      "4 estilos de legenda premium",
      "Prioridade no processamento",
      "Sem marca d'água",
      "Suporte prioritário",
    ],
    cta: "Assinar Pro →",
    href: "https://pay.kiwify.com.br/4Z0jIcC",
    isLink: false,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: "#000000", color: "#ffffff" }}>

      {/* NAV */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(0,0,0,0.85)", backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)"
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: "linear-gradient(135deg, #7c3aed, #ec4899)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, fontWeight: 900
            }}>V</div>
            <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: "-0.5px" }}>ViralizaIA</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <Link href="#como-funciona" style={{ color: "#aaa", fontSize: 14, textDecoration: "none" }}>Como funciona</Link>
            <Link href="#planos" style={{ color: "#aaa", fontSize: 14, textDecoration: "none" }}>Preços</Link>
            <Link href="/app" style={{ color: "#aaa", fontSize: 14, textDecoration: "none" }}>Entrar</Link>
            <Link href="/app" style={{
              background: "linear-gradient(135deg, #7c3aed, #ec4899)",
              color: "white", fontSize: 13, fontWeight: 700,
              padding: "8px 20px", borderRadius: 100, textDecoration: "none",
              transition: "opacity 0.2s"
            }}>Começar grátis</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ textAlign: "center", padding: "80px 24px 64px", maxWidth: 800, margin: "0 auto" }}>
        {/* Badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.3)",
          borderRadius: 100, padding: "6px 16px", fontSize: 12, color: "#a78bfa",
          marginBottom: 28, fontWeight: 600, letterSpacing: "0.05em"
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#a78bfa", display: "inline-block" }} />
          IA 100% BRASILEIRA
        </div>

        <h1 style={{ fontSize: "clamp(2.4rem, 6vw, 4rem)", fontWeight: 900, lineHeight: 1.1, marginBottom: 20, letterSpacing: "-1.5px" }}>
          Crie conteúdo viral{" "}
          <span style={{
            background: "linear-gradient(135deg, #a855f7, #ec4899, #f59e0b)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text"
          }}>100x mais rápido</span>
        </h1>

        <p style={{ color: "#888", fontSize: "1.1rem", lineHeight: 1.7, marginBottom: 40, maxWidth: 560, margin: "0 auto 40px" }}>
          Cole o link do YouTube, a IA analisa e gera automaticamente os melhores cortes —
          já no formato certo, com legenda gravada. Sem editar. Sem assistir tudo.
        </p>

        {/* Input CTA */}
        <div style={{
          display: "flex", alignItems: "center",
          background: "#0f0f0f", border: "1px solid rgba(124,58,237,0.5)",
          borderRadius: 16, padding: "6px 6px 6px 20px",
          boxShadow: "0 0 30px rgba(124,58,237,0.2)",
          maxWidth: 580, margin: "0 auto 16px",
          gap: 8
        }}>
          <span style={{ color: "#555", fontSize: 18 }}>🔗</span>
          <span style={{ flex: 1, color: "#555", fontSize: 14, textAlign: "left" }}>
            Cole o link do seu vídeo aqui...
          </span>
          <Link href="/app" style={{
            background: "linear-gradient(135deg, #7c3aed, #ec4899, #f59e0b)",
            color: "white", fontWeight: 800, fontSize: 14,
            padding: "12px 28px", borderRadius: 12, textDecoration: "none",
            whiteSpace: "nowrap"
          }}>Viralizar</Link>
        </div>

        <p style={{ color: "#444", fontSize: 12 }}>
          Sem cartão de crédito · 1 clip grátis para testar · Resultado em minutos
        </p>
      </section>

      {/* STATS */}
      <section style={{ maxWidth: 700, margin: "0 auto 72px", padding: "0 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, background: "rgba(255,255,255,0.06)", borderRadius: 16, overflow: "hidden" }}>
          {[
            { num: "10.000+", label: "cortes gerados" },
            { num: "4", label: "plataformas suportadas" },
            { num: "< 3 min", label: "tempo de resultado" },
          ].map((s) => (
            <div key={s.label} style={{ background: "#0a0a0a", padding: "28px 16px", textAlign: "center" }}>
              <div style={{
                fontSize: "1.8rem", fontWeight: 900,
                background: "linear-gradient(135deg, #a855f7, #ec4899)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                marginBottom: 4
              }}>{s.num}</div>
              <div style={{ color: "#666", fontSize: 12 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" style={{ maxWidth: 900, margin: "0 auto 80px", padding: "0 24px" }}>
        <p style={{ textAlign: "center", color: "#7c3aed", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 12 }}>COMO FUNCIONA</p>
        <h2 style={{ textAlign: "center", fontSize: "clamp(1.8rem, 4vw, 2.4rem)", fontWeight: 800, marginBottom: 48, letterSpacing: "-0.5px" }}>
          Simples assim. Sem complicação.
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24 }}>
          {STEPS.map((s) => (
            <div key={s.num} style={{
              background: "#0a0a0a", border: "1px solid #1a1a1a",
              borderRadius: 16, padding: "28px 24px"
            }}>
              <div style={{
                fontSize: "2.2rem", fontWeight: 900, lineHeight: 1,
                background: "linear-gradient(135deg, #7c3aed, #ec4899)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                marginBottom: 12
              }}>{s.num}</div>
              <h3 style={{ fontWeight: 700, fontSize: "1rem", marginBottom: 8 }}>{s.title}</h3>
              <p style={{ color: "#666", fontSize: 13, lineHeight: 1.6 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PLATAFORMAS */}
      <section style={{ maxWidth: 900, margin: "0 auto 80px", padding: "0 24px" }}>
        <h2 style={{ textAlign: "center", fontSize: "clamp(1.8rem, 4vw, 2.4rem)", fontWeight: 800, marginBottom: 48, letterSpacing: "-0.5px" }}>
          Otimizado para{" "}
          <span style={{
            background: "linear-gradient(135deg, #a855f7, #ec4899)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text"
          }}>todas as plataformas</span>
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
          {PLATFORMS.map((p) => (
            <div key={p.name} style={{
              background: "#0a0a0a", border: "1px solid #1a1a1a",
              borderRadius: 16, padding: "24px",
              transition: "border-color 0.2s",
              cursor: "default"
            }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{p.icon}</div>
              <h3 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 6 }}>{p.name}</h3>
              <p style={{ color: "#666", fontSize: 12, lineHeight: 1.6 }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PLANOS */}
      <section id="planos" style={{ maxWidth: 1000, margin: "0 auto 80px", padding: "0 24px" }}>
        <p style={{ textAlign: "center", color: "#7c3aed", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 12 }}>PREÇOS</p>
        <h2 style={{ textAlign: "center", fontSize: "clamp(1.8rem, 4vw, 2.4rem)", fontWeight: 800, marginBottom: 8, letterSpacing: "-0.5px" }}>
          Planos que cabem no seu bolso
        </h2>
        <p style={{ textAlign: "center", color: "#666", fontSize: 14, marginBottom: 16 }}>
          Comece grátis. Faça upgrade quando precisar. Cancele quando quiser.
        </p>

        {/* Free banner */}
        <div style={{
          background: "#0a0a0a", border: "1px solid #1a1a1a",
          borderRadius: 12, padding: "14px 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 12, marginBottom: 24
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{
              background: "linear-gradient(135deg, #7c3aed, #ec4899)",
              color: "white", fontSize: 11, fontWeight: 800,
              padding: "4px 12px", borderRadius: 100
            }}>GRÁTIS PARA SEMPRE</span>
            <span style={{ fontWeight: 600, fontSize: 14 }}>Teste antes de pagar</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 20, color: "#888", fontSize: 13 }}>
            <span>✓ <strong style={{ color: "#fff" }}>1 clip grátis</strong></span>
            <span>✓ Sem cartão de crédito</span>
            <span>✓ Resultado imediato</span>
          </div>
          <Link href="/app" style={{
            background: "linear-gradient(135deg, #7c3aed, #ec4899)",
            color: "white", fontWeight: 700, fontSize: 13,
            padding: "10px 24px", borderRadius: 100, textDecoration: "none",
            whiteSpace: "nowrap"
          }}>Criar conta grátis →</Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
          {PLANS.slice(1).map((plan) => (
            <div key={plan.name} style={{
              background: plan.highlight ? "linear-gradient(180deg, rgba(124,58,237,0.12) 0%, #0a0a0a 100%)" : "#0a0a0a",
              border: plan.highlight ? "1px solid rgba(124,58,237,0.4)" : "1px solid #1a1a1a",
              borderRadius: 20, padding: "28px 24px",
              position: "relative",
              boxShadow: plan.highlight ? "0 0 40px rgba(124,58,237,0.15)" : "none"
            }}>
              {plan.badge && (
                <div style={{
                  position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
                  background: "linear-gradient(135deg, #7c3aed, #ec4899)",
                  color: "white", fontSize: 11, fontWeight: 800,
                  padding: "4px 16px", borderRadius: 100, whiteSpace: "nowrap"
                }}>+ {plan.badge}</div>
              )}

              <div style={{ marginBottom: 4, fontSize: 20 }}>{plan.emoji}</div>
              <p style={{ color: "#888", fontSize: 13, marginBottom: 4 }}>{plan.name}</p>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 4, marginBottom: 4 }}>
                <span style={{ fontSize: "2.4rem", fontWeight: 900, lineHeight: 1 }}>{plan.price}</span>
                <span style={{ color: "#666", paddingBottom: 4 }}>{plan.period}</span>
              </div>
              <p style={{ color: "#555", fontSize: 12, marginBottom: 20 }}>{plan.desc}</p>

              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "flex", flexDirection: "column", gap: 10 }}>
                {plan.features.map((f) => (
                  <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: "#ccc" }}>
                    <span style={{ color: "#7c3aed", fontWeight: 700, marginTop: 1 }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              {plan.isLink ? (
                <Link href={plan.href} style={{
                  display: "block", textAlign: "center",
                  background: plan.highlight ? "linear-gradient(135deg, #7c3aed, #ec4899)" : "rgba(255,255,255,0.05)",
                  border: plan.highlight ? "none" : "1px solid rgba(255,255,255,0.1)",
                  color: "white", fontWeight: 700, fontSize: 13,
                  padding: "14px", borderRadius: 12, textDecoration: "none"
                }}>{plan.cta}</Link>
              ) : (
                <a href={plan.href} target="_blank" rel="noopener noreferrer" style={{
                  display: "block", textAlign: "center",
                  background: plan.highlight ? "linear-gradient(135deg, #7c3aed, #ec4899)" : "rgba(255,255,255,0.05)",
                  border: plan.highlight ? "none" : "1px solid rgba(255,255,255,0.1)",
                  color: "white", fontWeight: 700, fontSize: 13,
                  padding: "14px", borderRadius: 12, textDecoration: "none"
                }}>{plan.cta}</a>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ maxWidth: 700, margin: "0 auto 80px", padding: "0 24px" }}>
        <div style={{
          background: "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(236,72,153,0.1))",
          border: "1px solid rgba(124,58,237,0.25)",
          borderRadius: 24, padding: "48px 32px", textAlign: "center"
        }}>
          <h2 style={{ fontSize: "clamp(1.5rem, 4vw, 2rem)", fontWeight: 800, marginBottom: 12, letterSpacing: "-0.5px" }}>
            Comece a viralizar hoje
          </h2>
          <p style={{ color: "#888", fontSize: 14, marginBottom: 28 }}>
            Sem cartão de crédito. 1 clip grátis para testar. Resultado em menos de 3 minutos.
          </p>
          <Link href="/app" style={{
            background: "linear-gradient(135deg, #7c3aed, #ec4899, #f59e0b)",
            color: "white", fontWeight: 800, fontSize: 15,
            padding: "16px 40px", borderRadius: 100, textDecoration: "none",
            display: "inline-block"
          }}>🎬 Criar meu primeiro clip grátis</Link>
          <p style={{ color: "#444", fontSize: 11, marginTop: 16 }}>Já com legenda gravada no vídeo</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        borderTop: "1px solid #111", padding: "32px 24px",
        textAlign: "center"
      }}>
        <div style={{
          fontWeight: 800, fontSize: 16, marginBottom: 4,
          background: "linear-gradient(135deg, #a855f7, #ec4899)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text"
        }}>ViralizaIA</div>
        <p style={{ color: "#444", fontSize: 12 }}>
          © 2026 ViralizaIA · Feito no Brasil para criadores brasileiros
        </p>
      </footer>
    </div>
  );
}
