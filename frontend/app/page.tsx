"use client";
import { useState } from "react";
import Link from "next/link";

const stats = [
  { value: "+10.000", label: "Vídeos Processados" },
  { value: "+2 Milhões", label: "Cortes Gerados" },
  { value: "+50 Milhões", label: "Visualizações Criadas" },
];

const benefits = [
  {
    icon: "🎯",
    title: "Detecção Inteligente de Momentos Virais",
    desc: "A IA identifica automaticamente os trechos com maior potencial de retenção e engajamento.",
  },
  {
    icon: "✂️",
    title: "Cortes Automáticos",
    desc: "Transforme horas de conteúdo em dezenas de vídeos curtos prontos para publicar.",
  },
  {
    icon: "📝",
    title: "Legendas Automáticas",
    desc: "Legendas dinâmicas geradas automaticamente com 8 estilos diferentes para escolher.",
  },
  {
    icon: "📱",
    title: "Formato Vertical 9:16",
    desc: "Vídeos prontos para TikTok, Instagram Reels e YouTube Shorts sem ajuste manual.",
  },
  {
    icon: "⚡",
    title: "Processamento Rápido",
    desc: "Receba seus cortes em poucos minutos. Sem fila, sem espera, sem complicação.",
  },
  {
    icon: "🤖",
    title: "IA Treinada para Viralização",
    desc: "Analisa emoção, engajamento e potencial viral de cada trecho do seu conteúdo.",
  },
];

const steps = [
  {
    num: "01",
    title: "Cole o link ou envie o vídeo",
    desc: "Cole o link do YouTube ou faça upload direto do arquivo. Funciona com podcasts, aulas, lives e entrevistas.",
    icon: "🔗",
  },
  {
    num: "02",
    title: "A IA analisa todo o conteúdo",
    desc: "Nossa IA transcreve, analisa emoções e identifica os momentos com maior potencial viral do vídeo.",
    icon: "🧠",
  },
  {
    num: "03",
    title: "Receba os cortes prontos",
    desc: "Baixe dezenas de clips em HD, já com legenda gravada, no formato certo para cada plataforma.",
    icon: "🚀",
  },
];

const features = [
  "Legendas automáticas gravadas no vídeo",
  "Zoom inteligente e rastreamento facial",
  "Formatação vertical 9:16 automática",
  "Exportação HD sem marca d'água (planos pagos)",
  "Upload simplificado ou link do YouTube",
  "Identificação dos melhores momentos com IA",
  "8 templates de legenda virais",
  "Geração em lote de múltiplos clips",
  "Escolha de duração: 30s, 1min ou 1:30",
  "Título viral gerado automaticamente",
  "Descrição otimizada para SEO",
  "Hashtags virais geradas pela IA",
  "CTA personalizado para afiliados",
  "Capa automática para TikTok/Shorts",
];

const comparison = [
  { feature: "Tempo para 10 clips", vc: "5 minutos", manual: "Horas" },
  { feature: "Legendas automáticas", vc: "✅ Sim", manual: "❌ Não" },
  { feature: "Identificação viral", vc: "✅ IA treinada", manual: "❌ Achismo" },
  { feature: "Título e hashtags", vc: "✅ Gerados pela IA", manual: "❌ Manual" },
  { feature: "Escalabilidade", vc: "✅ Alta", manual: "❌ Baixa" },
  { feature: "Custo operacional", vc: "✅ Baixo", manual: "❌ Alto" },
];

const testimonials = [
  {
    name: "Rodrigo Alves",
    role: "Podcaster • 420k seguidores",
    text: "Em 5 minutos eu tenho 15 clips do meu podcast de 2 horas. Triplicou meu alcance no TikTok sem trabalho extra.",
    avatar: "RA",
    stars: 5,
  },
  {
    name: "Camila Torres",
    role: "Afiliada digital • R$18k/mês",
    text: "A IA escolhe exatamente os momentos que geram mais cliques. Minha taxa de conversão subiu 40%.",
    avatar: "CT",
    stars: 5,
  },
  {
    name: "Lucas Mendes",
    role: "Infoprodutor • 3 lançamentos/ano",
    text: "Antes gastava R$800/mês com editor. Agora pago R$39,90 e tenho resultado muito melhor e mais rápido.",
    avatar: "LM",
    stars: 5,
  },
  {
    name: "Ana Beatriz",
    role: "Social Media Agency",
    text: "Gerencio 12 clientes e o Viraliza Cortes é indispensável. Entrego 3x mais conteúdo no mesmo tempo.",
    avatar: "AB",
    stars: 5,
  },
];

const faqs = [
  {
    q: "A IA realmente escolhe os melhores momentos?",
    a: "Sim! Nossa IA foi treinada para identificar picos de emoção, mudanças de ritmo, momentos de humor e frases de impacto — exatamente o que mantém as pessoas assistindo.",
  },
  {
    q: "Preciso saber editar vídeos?",
    a: "Zero conhecimento técnico necessário. Cole o link, escolha o estilo e pronto. A IA faz todo o trabalho de edição.",
  },
  {
    q: "Funciona para podcasts e lives?",
    a: "Perfeitamente! Funciona com qualquer conteúdo do YouTube: podcasts, aulas online, lives, entrevistas, vlogs e muito mais.",
  },
  {
    q: "Posso usar para TikTok, Reels e Shorts ao mesmo tempo?",
    a: "Sim! Em um único processamento, você recebe clips otimizados para TikTok, Instagram Reels, YouTube Shorts e Facebook.",
  },
  {
    q: "Quanto tempo leva para gerar os cortes?",
    a: "Em média 3 a 8 minutos dependendo da duração do vídeo. Vídeos de 1 hora geram até 20 clips em menos de 10 minutos.",
  },
  {
    q: "Posso cancelar quando quiser?",
    a: "Sim, sem fidelidade e sem multa. Cancele a qualquer momento direto nas configurações da sua conta.",
  },
];

const plans = [
  {
    name: "Grátis",
    price: "R$0",
    period: "",
    desc: "Para começar a testar",
    features: ["1 clip por vídeo", "Marca d'água Viraliza Cortes", "TikTok e Reels", "Qualidade HD"],
    cta: "Começar Grátis",
    href: "/app",
    highlight: false,
  },
  {
    name: "Starter",
    price: "R$19,90",
    period: "/mês",
    desc: "Para criadores em crescimento",
    features: ["Vídeos ilimitados", "Até 15 clips por vídeo", "Sem marca d'água", "Todos os formatos", "8 estilos de legenda", "Créditos extras disponíveis", "Suporte prioritário"],
    cta: "Assinar Starter",
    href: "https://pay.kiwify.com.br/Ft2LPkC",
    highlight: false,
  },
  {
    name: "Pro",
    price: "R$39,90",
    period: "/mês",
    desc: "Para profissionais e agências",
    features: ["Vídeos ilimitados", "Até 40 clips por vídeo", "Sem marca d'água", "Todos os formatos", "8 estilos de legenda", "Título + hashtags + descrição IA", "Capa automática TikTok/Shorts", "CTA para afiliados", "Créditos extras disponíveis", "Suporte VIP"],
    cta: "Assinar Pro",
    href: "https://pay.kiwify.com.br/4Z0jIcC",
    highlight: true,
  },
];

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#070711", color: "#f0f0ff", minHeight: "100vh", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0a0a1a; }
        ::-webkit-scrollbar-thumb { background: #4c1d95; border-radius: 3px; }

        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes pulse-glow { 0%,100%{box-shadow:0 0 20px rgba(139,92,246,0.4)} 50%{box-shadow:0 0 50px rgba(139,92,246,0.8),0 0 80px rgba(59,130,246,0.4)} }
        @keyframes scan-line { 0%{top:-100%} 100%{top:200%} }
        @keyframes gradient-x { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes slide-up { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        @keyframes counter-spin { from{transform:rotateY(0)} to{transform:rotateY(360deg)} }
        @keyframes neon-border { 0%,100%{border-color:rgba(139,92,246,0.5)} 50%{border-color:rgba(59,130,246,0.9)} }
        @keyframes particle-float { 0%{transform:translateY(0) translateX(0) scale(1);opacity:0.6} 25%{transform:translateY(-20px) translateX(10px) scale(1.1);opacity:0.8} 50%{transform:translateY(-40px) translateX(-5px) scale(0.9);opacity:0.6} 75%{transform:translateY(-20px) translateX(-10px) scale(1.05);opacity:0.7} 100%{transform:translateY(0) translateX(0) scale(1);opacity:0.6} }

        .neon-btn {
          background: linear-gradient(135deg, #7c3aed, #2563eb);
          border: none;
          color: white;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .neon-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #6d28d9, #1d4ed8);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .neon-btn:hover::before { opacity: 1; }
        .neon-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(124,58,237,0.6); }

        .glass-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(139,92,246,0.2);
          backdrop-filter: blur(12px);
          transition: all 0.3s ease;
        }
        .glass-card:hover {
          border-color: rgba(139,92,246,0.5);
          background: rgba(139,92,246,0.07);
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(139,92,246,0.15);
        }

        .gradient-text {
          background: linear-gradient(135deg, #a78bfa, #60a5fa, #f472b6);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradient-x 4s ease infinite;
        }

        .hero-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          z-index: 0;
        }

        .step-line {
          position: absolute;
          left: 50%;
          top: 100%;
          width: 2px;
          height: 60px;
          background: linear-gradient(to bottom, rgba(139,92,246,0.6), transparent);
          transform: translateX(-50%);
        }

        .comparison-row:hover { background: rgba(139,92,246,0.08); }

        .faq-item { border-bottom: 1px solid rgba(139,92,246,0.15); }
        .faq-item:last-child { border-bottom: none; }

        .plan-highlight {
          background: linear-gradient(135deg, rgba(124,58,237,0.2), rgba(37,99,235,0.2));
          border: 2px solid rgba(139,92,246,0.6) !important;
          animation: neon-border 3s ease infinite;
        }

        .mockup-screen {
          background: linear-gradient(135deg, #0f0f23, #1a1a3e);
          border: 1px solid rgba(139,92,246,0.3);
          border-radius: 12px;
          overflow: hidden;
          animation: float 4s ease-in-out infinite;
        }

        .platform-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 999px;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.3s;
        }
        .platform-badge:hover { transform: scale(1.05); }

        @media (max-width: 768px) {
          .hero-title { font-size: 2.2rem !important; }
          .hero-cols { flex-direction: column !important; }
          .steps-grid { grid-template-columns: 1fr !important; }
          .benefits-grid { grid-template-columns: 1fr !important; }
          .plans-grid { grid-template-columns: 1fr !important; }
          .testimonials-grid { grid-template-columns: 1fr !important; }
          .features-cols { flex-direction: column !important; }
          .comparison-table { font-size: 13px !important; }
        }
      `}</style>

      {/* ── NAVIGATION ── */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "16px 24px", background: "rgba(7,7,17,0.85)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(139,92,246,0.15)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#7c3aed,#2563eb)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, boxShadow: "0 0 20px rgba(124,58,237,0.5)" }}>✂️</div>
            <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: "-0.5px" }}>
              <span className="gradient-text">Viraliza Cortes</span>
            </span>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <a href="#como-funciona" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none", fontSize: 14, fontWeight: 500, transition: "color 0.2s" }}>Como funciona</a>
            <a href="#planos" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none", fontSize: 14, fontWeight: 500 }}>Planos</a>
            <Link href="/app">
              <button className="neon-btn" style={{ padding: "8px 20px", borderRadius: 8, fontSize: 14 }}>
                Entrar na plataforma →
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO SECTION ── */}
      <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", paddingTop: 100, paddingBottom: 80, overflow: "hidden" }}>
        {/* Background glows */}
        <div className="hero-glow" style={{ width: 600, height: 600, background: "rgba(124,58,237,0.15)", top: -100, left: -100 }} />
        <div className="hero-glow" style={{ width: 500, height: 500, background: "rgba(37,99,235,0.12)", bottom: -50, right: -100 }} />
        <div className="hero-glow" style={{ width: 300, height: 300, background: "rgba(244,114,182,0.08)", top: "30%", right: "20%" }} />

        {/* Dot grid background */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(139,92,246,0.15) 1px, transparent 1px)", backgroundSize: "40px 40px", zIndex: 0 }} />

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", width: "100%", position: "relative", zIndex: 1 }}>
          <div className="hero-cols" style={{ display: "flex", alignItems: "center", gap: 60 }}>
            {/* Left: Text */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Badge */}
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(124,58,237,0.15)", border: "1px solid rgba(139,92,246,0.4)", borderRadius: 999, padding: "6px 16px", marginBottom: 24, fontSize: 13, color: "#c4b5fd" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#7c3aed", display: "inline-block", boxShadow: "0 0 8px #7c3aed", animation: "blink 2s ease infinite" }} />
                IA treinada para viralização • Novo: geração de títulos e hashtags
              </div>

              <h1 className="hero-title" style={{ fontSize: "3.6rem", fontWeight: 900, lineHeight: 1.1, marginBottom: 24, letterSpacing: "-1px" }}>
                Transforme Qualquer Vídeo em{" "}
                <span className="gradient-text">Dezenas de Cortes Virais</span>{" "}
                com IA
              </h1>

              <p style={{ fontSize: "1.15rem", color: "rgba(255,255,255,0.65)", lineHeight: 1.7, marginBottom: 36, maxWidth: 540 }}>
                Nossa Inteligência Artificial identifica automaticamente os melhores momentos do seu vídeo, cria cortes profissionais, adiciona legendas e gera conteúdos prontos para TikTok, Reels e Shorts.
              </p>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 48 }}>
                <Link href="/app">
                  <button className="neon-btn" style={{ padding: "14px 32px", borderRadius: 10, fontSize: 16, letterSpacing: "0.3px" }}>
                    🚀 Começar Agora
                  </button>
                </Link>
                <Link href="/app">
                  <button style={{ padding: "14px 32px", borderRadius: 10, fontSize: 16, background: "transparent", border: "1px solid rgba(139,92,246,0.5)", color: "#c4b5fd", cursor: "pointer", transition: "all 0.3s", fontWeight: 600, letterSpacing: "0.3px" }}
                    onMouseEnter={e => { (e.target as HTMLButtonElement).style.background = "rgba(139,92,246,0.1)"; (e.target as HTMLButtonElement).style.borderColor = "rgba(139,92,246,0.8)"; }}
                    onMouseLeave={e => { (e.target as HTMLButtonElement).style.background = "transparent"; (e.target as HTMLButtonElement).style.borderColor = "rgba(139,92,246,0.5)"; }}>
                    ✨ Testar Gratuitamente
                  </button>
                </Link>
              </div>

              {/* Trust indicators */}
              <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 20 }}>
                {["✅ Sem cartão de crédito", "✅ 1 clip grátis", "✅ Resultado em minutos"].map(item => (
                  <span key={item} style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>{item}</span>
                ))}
              </div>
              {/* Social login hint */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>Acesso rápido via:</span>
                <div style={{ display: "flex", gap: 8 }}>
                  <Link href="/app">
                    <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "5px 12px", cursor: "pointer", fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: 600, transition: "all 0.2s" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                      Google
                    </div>
                  </Link>
                  <Link href="/app">
                    <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(24,119,242,0.15)", border: "1px solid rgba(24,119,242,0.3)", borderRadius: 8, padding: "5px 12px", cursor: "pointer", fontSize: 12, color: "#60a5fa", fontWeight: 600, transition: "all 0.2s" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                      Facebook
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            {/* Right: Phone mockup */}
            <div style={{ flex: "0 0 auto", position: "relative", width: 320 }}>
              <div style={{ position: "relative" }}>
                {/* Main phone frame */}
                <div className="mockup-screen" style={{ width: 240, height: 440, margin: "0 auto", padding: 12, boxShadow: "0 0 60px rgba(124,58,237,0.3), 0 40px 80px rgba(0,0,0,0.5)" }}>
                  {/* Screen content */}
                  <div style={{ height: "100%", borderRadius: 8, background: "#0a0a1f", overflow: "hidden", position: "relative" }}>
                    {/* Status bar */}
                    <div style={{ padding: "8px 12px", background: "rgba(124,58,237,0.2)", display: "flex", justifyContent: "space-between", fontSize: 10, color: "rgba(255,255,255,0.6)" }}>
                      <span>Viraliza Cortes</span>
                      <span>● AI</span>
                    </div>
                    {/* Clip cards */}
                    {[
                      { label: "TikTok Viral", color: "#7c3aed", views: "128k views", icon: "🎵" },
                      { label: "Reels Trend", color: "#ec4899", views: "89k views", icon: "📸" },
                      { label: "YT Shorts", color: "#dc2626", views: "201k views", icon: "▶️" },
                    ].map((clip, i) => (
                      <div key={i} style={{ margin: "8px", borderRadius: 8, overflow: "hidden", border: `1px solid ${clip.color}44` }}>
                        <div style={{ height: 80, background: `linear-gradient(135deg, ${clip.color}33, #0f0f2366)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, position: "relative" }}>
                          {clip.icon}
                          <div style={{ position: "absolute", bottom: 4, left: 8, right: 8, height: 3, background: "#ffffff22", borderRadius: 2 }}>
                            <div style={{ width: `${60 + i * 15}%`, height: "100%", background: clip.color, borderRadius: 2 }} />
                          </div>
                        </div>
                        <div style={{ padding: "6px 8px", background: "rgba(0,0,0,0.4)" }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>{clip.label}</div>
                          <div style={{ fontSize: 10, color: clip.color }}>{clip.views}</div>
                        </div>
                      </div>
                    ))}
                    {/* Processing indicator */}
                    <div style={{ margin: "8px", borderRadius: 8, border: "1px solid rgba(139,92,246,0.3)", padding: "8px", background: "rgba(124,58,237,0.1)", textAlign: "center" }}>
                      <div style={{ fontSize: 11, color: "#a78bfa", fontWeight: 600, marginBottom: 4 }}>⚡ IA Processando...</div>
                      <div style={{ height: 4, background: "#1a1a3e", borderRadius: 2 }}>
                        <div style={{ width: "72%", height: "100%", background: "linear-gradient(90deg,#7c3aed,#2563eb)", borderRadius: 2, animation: "pulse-glow 2s ease infinite" }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating badges */}
                <div style={{ position: "absolute", top: -20, right: -20, background: "linear-gradient(135deg,#7c3aed,#2563eb)", borderRadius: 12, padding: "8px 14px", fontSize: 12, fontWeight: 700, boxShadow: "0 8px 24px rgba(124,58,237,0.5)", animation: "float 3s ease-in-out infinite" }}>
                  🔥 Viral Score: 9.8
                </div>
                <div style={{ position: "absolute", bottom: 40, left: -30, background: "rgba(16,16,40,0.95)", border: "1px solid rgba(139,92,246,0.4)", borderRadius: 12, padding: "8px 14px", fontSize: 11, fontWeight: 600, boxShadow: "0 8px 24px rgba(0,0,0,0.4)", animation: "float 3.5s ease-in-out infinite 0.5s" }}>
                  ✨ 15 clips gerados
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ padding: "60px 24px", borderTop: "1px solid rgba(139,92,246,0.1)", borderBottom: "1px solid rgba(139,92,246,0.1)", background: "rgba(139,92,246,0.03)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 40, textAlign: "center" }}>
          {stats.map(s => (
            <div key={s.label}>
              <div style={{ fontSize: "2.8rem", fontWeight: 900, lineHeight: 1 }} className="gradient-text">{s.value}</div>
              <div style={{ marginTop: 8, color: "rgba(255,255,255,0.5)", fontSize: 15, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── BENEFITS ── */}
      <section style={{ padding: "100px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div style={{ display: "inline-block", background: "rgba(124,58,237,0.15)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: 999, padding: "6px 16px", fontSize: 13, color: "#c4b5fd", marginBottom: 16 }}>
              Funcionalidades
            </div>
            <h2 style={{ fontSize: "2.4rem", fontWeight: 800, marginBottom: 16, letterSpacing: "-0.5px" }}>
              Tudo o que você precisa para{" "}
              <span className="gradient-text">crescer nas redes sociais</span>
            </h2>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 16, maxWidth: 500, margin: "0 auto" }}>
              Uma plataforma completa que transforma seu conteúdo longo em múltiplas peças virais automaticamente.
            </p>
          </div>

          <div className="benefits-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
            {benefits.map((b, i) => (
              <div key={i} className="glass-card" style={{ borderRadius: 16, padding: "28px 24px" }}>
                <div style={{ fontSize: 36, marginBottom: 16 }}>{b.icon}</div>
                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10, color: "#f0f0ff" }}>{b.title}</h3>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, lineHeight: 1.6 }}>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="como-funciona" style={{ padding: "100px 24px", background: "rgba(139,92,246,0.03)", borderTop: "1px solid rgba(139,92,246,0.1)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 72 }}>
            <div style={{ display: "inline-block", background: "rgba(124,58,237,0.15)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: 999, padding: "6px 16px", fontSize: 13, color: "#c4b5fd", marginBottom: 16 }}>
              Como funciona
            </div>
            <h2 style={{ fontSize: "2.4rem", fontWeight: 800, letterSpacing: "-0.5px" }}>
              <span className="gradient-text">3 Passos</span> para Viralizar
            </h2>
          </div>

          <div className="steps-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 32 }}>
            {steps.map((step, i) => (
              <div key={i} style={{ position: "relative", textAlign: "center" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
                  <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg,rgba(124,58,237,0.3),rgba(37,99,235,0.3))", border: "2px solid rgba(139,92,246,0.5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, boxShadow: "0 0 30px rgba(124,58,237,0.3)" }}>
                    {step.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#7c3aed", letterSpacing: "2px", marginBottom: 8 }}>PASSO {step.num}</div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>{step.title}</h3>
                    <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, lineHeight: 1.6 }}>{step.desc}</p>
                  </div>
                </div>
                {i < steps.length - 1 && (
                  <div style={{ position: "absolute", top: 40, right: -16, fontSize: 20, color: "rgba(139,92,246,0.5)" }}>→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLATFORMS + DEMO SECTION ── */}
      <section style={{ padding: "100px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <h2 style={{ fontSize: "2.4rem", fontWeight: 800, marginBottom: 16, letterSpacing: "-0.5px" }}>
              Cortes prontos para todas as{" "}
              <span className="gradient-text">plataformas</span>
            </h2>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 16 }}>Gere clips otimizados para cada rede social em um único clique</p>
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap", marginBottom: 60 }}>
            {[
              { name: "TikTok", icon: "🎵", color: "#7c3aed", bg: "rgba(124,58,237,0.15)" },
              { name: "Instagram Reels", icon: "📸", color: "#ec4899", bg: "rgba(236,72,153,0.15)" },
              { name: "YouTube Shorts", icon: "▶️", color: "#dc2626", bg: "rgba(220,38,38,0.15)" },
              { name: "Facebook", icon: "👥", color: "#2563eb", bg: "rgba(37,99,235,0.15)" },
            ].map(p => (
              <div key={p.name} className="platform-badge" style={{ background: p.bg, border: `1px solid ${p.color}44`, color: p.color }}>
                <span>{p.icon}</span>
                <span style={{ fontWeight: 700 }}>{p.name}</span>
              </div>
            ))}
          </div>

          {/* Demo flow */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
            <div className="glass-card" style={{ borderRadius: 16, padding: "24px 28px", textAlign: "center", minWidth: 160 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🎬</div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Vídeo original</div>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>60 minutos</div>
            </div>
            <div style={{ fontSize: 28, color: "rgba(139,92,246,0.6)" }}>→</div>
            <div className="glass-card" style={{ borderRadius: 16, padding: "24px 28px", textAlign: "center", minWidth: 160, border: "1px solid rgba(139,92,246,0.5)", background: "rgba(124,58,237,0.1)" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🤖</div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>IA analisa</div>
              <div style={{ color: "#a78bfa", fontSize: 13 }}>~3 minutos</div>
            </div>
            <div style={{ fontSize: 28, color: "rgba(139,92,246,0.6)" }}>→</div>
            <div className="glass-card" style={{ borderRadius: 16, padding: "24px 28px", textAlign: "center", minWidth: 160 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>✂️</div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>15 cortes gerados</div>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>HD prontos para publicar</div>
            </div>
            <div style={{ fontSize: 28, color: "rgba(139,92,246,0.6)" }}>→</div>
            <div className="glass-card" style={{ borderRadius: 16, padding: "24px 28px", textAlign: "center", minWidth: 160 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📈</div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Visualizações</div>
              <div style={{ color: "#34d399", fontSize: 13 }}>multiplicadas</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES LIST ── */}
      <section style={{ padding: "80px 24px", background: "rgba(139,92,246,0.03)", borderTop: "1px solid rgba(139,92,246,0.1)" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <h2 style={{ fontSize: "2.2rem", fontWeight: 800, letterSpacing: "-0.5px" }}>
              Tudo incluído no <span className="gradient-text">plano Pro</span>
            </h2>
          </div>
          <div className="features-cols" style={{ display: "flex", gap: 20, justifyContent: "center" }}>
            <div style={{ flex: 1, maxWidth: 480 }}>
              {features.slice(0, Math.ceil(features.length / 2)).map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 0", borderBottom: "1px solid rgba(139,92,246,0.08)" }}>
                  <span style={{ color: "#7c3aed", fontSize: 18, flexShrink: 0 }}>✦</span>
                  <span style={{ color: "rgba(255,255,255,0.75)", fontSize: 15 }}>{f}</span>
                </div>
              ))}
            </div>
            <div style={{ flex: 1, maxWidth: 480 }}>
              {features.slice(Math.ceil(features.length / 2)).map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 0", borderBottom: "1px solid rgba(139,92,246,0.08)" }}>
                  <span style={{ color: "#7c3aed", fontSize: 18, flexShrink: 0 }}>✦</span>
                  <span style={{ color: "rgba(255,255,255,0.75)", fontSize: 15 }}>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── COMPARISON TABLE ── */}
      <section style={{ padding: "100px 24px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <h2 style={{ fontSize: "2.2rem", fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 12 }}>
              Viraliza Cortes vs{" "}
              <span className="gradient-text">Edição Manual</span>
            </h2>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 15 }}>Por que centenas de criadores já migraram para a IA</p>
          </div>
          <div className="glass-card comparison-table" style={{ borderRadius: 20, overflow: "hidden", fontSize: 15 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", background: "rgba(124,58,237,0.15)", padding: "14px 20px", fontWeight: 700 }}>
              <div style={{ color: "rgba(255,255,255,0.6)" }}>Recurso</div>
              <div style={{ color: "#a78bfa", textAlign: "center" }}>✂️ Viraliza Cortes</div>
              <div style={{ color: "rgba(255,255,255,0.4)", textAlign: "center" }}>Edição Manual</div>
            </div>
            {comparison.map((row, i) => (
              <div key={i} className="comparison-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: "14px 20px", borderTop: "1px solid rgba(139,92,246,0.1)", transition: "background 0.2s" }}>
                <div style={{ color: "rgba(255,255,255,0.8)", fontWeight: 500 }}>{row.feature}</div>
                <div style={{ textAlign: "center", color: "#7c3aed", fontWeight: 600 }}>{row.vc}</div>
                <div style={{ textAlign: "center", color: "rgba(255,255,255,0.35)" }}>{row.manual}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ padding: "100px 24px", background: "rgba(139,92,246,0.03)", borderTop: "1px solid rgba(139,92,246,0.1)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div style={{ display: "inline-block", background: "rgba(124,58,237,0.15)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: 999, padding: "6px 16px", fontSize: 13, color: "#c4b5fd", marginBottom: 16 }}>
              Depoimentos
            </div>
            <h2 style={{ fontSize: "2.2rem", fontWeight: 800, letterSpacing: "-0.5px" }}>
              Criadores já estão{" "}
              <span className="gradient-text">viralizando</span>
            </h2>
          </div>
          <div className="testimonials-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 20 }}>
            {testimonials.map((t, i) => (
              <div key={i} className="glass-card" style={{ borderRadius: 16, padding: "28px" }}>
                <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <span key={j} style={{ color: "#f59e0b", fontSize: 16 }}>★</span>
                  ))}
                </div>
                <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 15, lineHeight: 1.7, marginBottom: 20, fontStyle: "italic" }}>"{t.text}"</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#2563eb)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14 }}>{t.avatar}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{t.name}</div>
                    <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="planos" style={{ padding: "100px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div style={{ display: "inline-block", background: "rgba(124,58,237,0.15)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: 999, padding: "6px 16px", fontSize: 13, color: "#c4b5fd", marginBottom: 16 }}>
              Planos e preços
            </div>
            <h2 style={{ fontSize: "2.2rem", fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 12 }}>
              Comece <span className="gradient-text">grátis</span>, escale quando quiser
            </h2>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 15 }}>Sem fidelidade. Cancele a qualquer momento.</p>
          </div>
          <div className="plans-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20, alignItems: "start" }}>
            {plans.map((plan, i) => (
              <div key={i} className={`glass-card ${plan.highlight ? "plan-highlight" : ""}`} style={{ borderRadius: 20, padding: "32px 24px", position: "relative" }}>
                {plan.highlight && (
                  <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg,#7c3aed,#2563eb)", borderRadius: 999, padding: "4px 16px", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>
                    ⭐ MAIS POPULAR
                  </div>
                )}
                <div style={{ marginBottom: 8, color: "rgba(255,255,255,0.5)", fontWeight: 600, fontSize: 14 }}>{plan.name}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 8 }}>
                  <span style={{ fontSize: "2.2rem", fontWeight: 900, color: plan.highlight ? "#a78bfa" : "#f0f0ff" }}>{plan.price}</span>
                  {plan.period && <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>{plan.period}</span>}
                </div>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginBottom: 24 }}>{plan.desc}</div>
                <div style={{ marginBottom: 28, display: "flex", flexDirection: "column", gap: 10 }}>
                  {plan.features.map((f, j) => (
                    <div key={j} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 14, color: "rgba(255,255,255,0.7)" }}>
                      <span style={{ color: plan.highlight ? "#7c3aed" : "#34d399", fontSize: 16, flexShrink: 0, lineHeight: 1.4 }}>✓</span>
                      {f}
                    </div>
                  ))}
                </div>
                <a href={plan.href} style={{ display: "block", textDecoration: "none" }}>
                  <button
                    className={plan.highlight ? "neon-btn" : ""}
                    style={{
                      width: "100%",
                      padding: "12px 0",
                      borderRadius: 10,
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: "pointer",
                      background: plan.highlight ? undefined : "transparent",
                      border: plan.highlight ? "none" : "1px solid rgba(139,92,246,0.4)",
                      color: plan.highlight ? "white" : "#a78bfa",
                      transition: "all 0.3s",
                    }}
                  >
                    {plan.cta}
                  </button>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CREDIT PACKS ── */}
      <section style={{ padding: "0 24px 80px" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <div style={{ marginBottom: 28 }}>
            <h3 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#f0f0ff", marginBottom: 8 }}>
              ⚡ Acabaram os clips antes do mês vencer?
            </h3>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 14 }}>
              Compre créditos extras a qualquer momento, sem precisar trocar de plano
            </p>
          </div>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            {[
              { clips: "10 clips", price: "R$15", icon: "🔋" },
              { clips: "20 clips", price: "R$20", icon: "⚡" },
            ].map((pack, i) => (
              <div key={i} className="glass-card" style={{ borderRadius: 16, padding: "20px 32px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, minWidth: 160 }}>
                <span style={{ fontSize: 28 }}>{pack.icon}</span>
                <span style={{ fontWeight: 800, fontSize: 20, color: "#a78bfa" }}>{pack.price}</span>
                <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 14 }}>{pack.clips} extras</span>
              </div>
            ))}
          </div>
          <p style={{ marginTop: 16, color: "rgba(255,255,255,0.3)", fontSize: 12 }}>
            Créditos disponíveis dentro da plataforma após o login
          </p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ padding: "80px 24px", background: "rgba(139,92,246,0.03)", borderTop: "1px solid rgba(139,92,246,0.1)" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <h2 style={{ fontSize: "2.2rem", fontWeight: 800, letterSpacing: "-0.5px" }}>
              Perguntas <span className="gradient-text">frequentes</span>
            </h2>
          </div>
          <div className="glass-card" style={{ borderRadius: 20, overflow: "hidden" }}>
            {faqs.map((faq, i) => (
              <div key={i} className="faq-item">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{ width: "100%", textAlign: "left", padding: "20px 24px", background: "transparent", border: "none", color: "#f0f0ff", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, fontSize: 15, fontWeight: 600 }}
                >
                  {faq.q}
                  <span style={{ color: "#7c3aed", fontSize: 20, flexShrink: 0, transition: "transform 0.3s", transform: openFaq === i ? "rotate(45deg)" : "rotate(0)" }}>+</span>
                </button>
                {openFaq === i && (
                  <div style={{ padding: "0 24px 20px", color: "rgba(255,255,255,0.6)", fontSize: 14, lineHeight: 1.7 }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ padding: "120px 24px", position: "relative", overflow: "hidden" }}>
        <div className="hero-glow" style={{ width: 500, height: 500, background: "rgba(124,58,237,0.15)", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
          <h2 style={{ fontSize: "2.8rem", fontWeight: 900, marginBottom: 20, letterSpacing: "-1px", lineHeight: 1.15 }}>
            Pare de perder horas{" "}
            <span className="gradient-text">editando vídeos</span>
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 17, lineHeight: 1.7, marginBottom: 40, maxWidth: 560, margin: "0 auto 40px" }}>
            Deixe a Inteligência Artificial encontrar os melhores momentos e transformar seu conteúdo em uma máquina de visualizações.
          </p>
          <Link href="/app">
            <button className="neon-btn" style={{ padding: "16px 48px", borderRadius: 12, fontSize: 18, letterSpacing: "0.5px", animation: "pulse-glow 3s ease infinite" }}>
              🚀 Começar Agora — É Grátis
            </button>
          </Link>
          <div style={{ marginTop: 20, color: "rgba(255,255,255,0.35)", fontSize: 13 }}>
            Sem cartão de crédito • 1 clip gratuito para testar
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: "1px solid rgba(139,92,246,0.15)", padding: "40px 24px", background: "rgba(0,0,0,0.3)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 20 }}>✂️</span>
              <span style={{ fontWeight: 800, fontSize: 16 }} className="gradient-text">Viraliza Cortes</span>
            </div>
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>Transformando vídeos longos em conteúdo viral.</p>
          </div>
          <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 13, textAlign: "right" }}>
            <div>© 2026 Viraliza Cortes. Todos os direitos reservados.</div>
            <div style={{ marginTop: 4 }}>
              <a href="#" style={{ color: "rgba(255,255,255,0.25)", textDecoration: "none" }}>Termos de uso</a>
              {" · "}
              <a href="#" style={{ color: "rgba(255,255,255,0.25)", textDecoration: "none" }}>Privacidade</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
