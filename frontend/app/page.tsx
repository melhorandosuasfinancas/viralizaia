"use client";
import Link from "next/link";
import { useState } from "react";

const YTIcon = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size * 0.7} viewBox="0 0 24 17" fill="none">
    <rect width="24" height="17" rx="4" fill="#FF0000"/>
    <path d="M10 4.5l7 4-7 4V4.5z" fill="white"/>
  </svg>
);
const TTIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="white">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 100 12.68 6.34 6.34 0 006.33-6.34V8.95a8.16 8.16 0 004.84 1.55V7.07a4.85 4.85 0 01-1.07-.38z"/>
  </svg>
);
const IGIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <defs>
      <linearGradient id="ig-g" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#FEDA77"/>
        <stop offset="25%" stopColor="#F58529"/>
        <stop offset="60%" stopColor="#DD2A7B"/>
        <stop offset="100%" stopColor="#8134AF"/>
      </linearGradient>
    </defs>
    <path fill="url(#ig-g)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);
const FBIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#1877F2">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);
const StarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);
const Check = ({ hi }: { hi: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
    <circle cx="10" cy="10" r="10" fill={hi ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.06)"}/>
    <path d="M6 10l2.5 2.5L14 7.5" stroke={hi ? "#a78bfa" : "#555"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const STEPS = [
  { num: "01", icon: "🔗", title: "Cole o link do vídeo", desc: "YouTube, MP4 ou Google Drive. Suportamos até 2 horas em qualquer idioma." },
  { num: "02", icon: "🧠", title: "IA identifica os melhores momentos", desc: "Analisa humor, tensão, engajamento e viralidade para escolher os trechos perfeitos." },
  { num: "03", icon: "✨", title: "Receba seus clips prontos", desc: "Formato 9:16, legenda animada gravada, pronto para TikTok, Reels e Shorts em minutos." },
];

const PLATFORMS = [
  { Logo: () => <TTIcon size={24}/>, name: "TikTok", desc: "Formato 9:16 otimizado para o FYP. A IA entende o que funciona no algoritmo.", border: "rgba(255,255,255,0.12)", bg: "rgba(255,255,255,0.02)" },
  { Logo: () => <IGIcon size={24}/>, name: "Instagram Reels", desc: "Transforme podcasts e vídeos longos em Reels que capturam atenção.", border: "rgba(193,53,132,0.25)", bg: "rgba(193,53,132,0.05)" },
  { Logo: () => <YTIcon size={28}/>, name: "YouTube Shorts", desc: "Extraia os melhores momentos e transforme em Shorts com alcance global.", border: "rgba(255,0,0,0.2)", bg: "rgba(255,0,0,0.04)" },
  { Logo: () => <FBIcon size={24}/>, name: "Facebook Reels", desc: "Alcance novo público com Reels criados do seu melhor conteúdo.", border: "rgba(24,119,242,0.2)", bg: "rgba(24,119,242,0.04)" },
  { Logo: () => <span style={{ fontSize: 24 }}>🎬</span>, name: "Legendas Automáticas", desc: "4 estilos premium: TikTok, Hormozi, Dark Box e Clean — gravados no vídeo.", border: "rgba(124,58,237,0.25)", bg: "rgba(124,58,237,0.05)" },
  { Logo: () => <span style={{ fontSize: 24 }}>⚡</span>, name: "Download Imediato", desc: "Todos os clips prontos em < 3 min. Sem marca d'água. Qualidade original.", border: "rgba(245,158,11,0.2)", bg: "rgba(245,158,11,0.04)" },
];

const TESTIMONIALS = [
  { name: "Lucas M.", role: "Criador · 280k seguidores", text: "Antes eu levava 4 horas editando cada vídeo. Com Viraliza Cortes tenho 10 clips prontos em 5 minutos. Minha produção triplicou.", avatar: "L", color: "#7c3aed" },
  { name: "Ana P.", role: "Coach de vendas · TikTok", text: "A qualidade das legendas é impressionante. Parecem feitas à mão. Meus views aumentaram 340% no primeiro mês.", avatar: "A", color: "#ec4899" },
  { name: "Rafael S.", role: "Podcast Financeiro · 95k ouvintes", text: "A IA escolhe exatamente os momentos que viralizam. Ela sabe o que o público quer. Melhor investimento para meu canal.", avatar: "R", color: "#06b6d4" },
];

const FAQS = [
  { q: "Funciona com vídeos em português?", a: "Sim! A IA foi treinada com conteúdo brasileiro e entende sotaques, gírias e expressões do nosso mercado. Resultado muito mais preciso do que ferramentas americanas." },
  { q: "Quanto tempo leva para processar um vídeo?", a: "Em média menos de 3 minutos para um vídeo de 30 minutos. Você recebe todos os clips prontos para postar, já com legenda gravada." },
  { q: "Preciso de cartão de crédito para começar?", a: "Não! Crie sua conta e teste com 1 clip grátis sem nenhum dado de pagamento. Só assina se gostar." },
  { q: "Posso cancelar quando quiser?", a: "Sim, sem fidelidade e sem multa. Cancele a qualquer momento com 1 clique no painel. Sem burocracia." },
  { q: "Os clips saem com legenda gravada no vídeo?", a: "Sim! As legendas são hardcoded diretamente no vídeo. Você escolhe entre 4 estilos premium: TikTok, Hormozi, Dark Box e Clean." },
];

const PLANS = [
  {
    emoji: "🚀", name: "Starter", price: "R$19,90", period: "/mês", badge: "MAIS POPULAR",
    desc: "Para criadores que publicam todo dia", hi: true,
    features: ["Vídeos ilimitados", "Até 10 cortes por vídeo", "TikTok + Instagram + Facebook", "Legendas automáticas estilizadas", "Sem marca d'água", "Download em HD", "Suporte por chat"],
    cta: "Começar com Starter", href: "https://pay.kiwify.com.br/Ft2LPkC",
  },
  {
    emoji: "💎", name: "Pro", price: "R$39,90", period: "/mês", badge: null,
    desc: "Para criadores sérios — máximo resultado", hi: false,
    features: ["Vídeos ilimitados", "Até 20 cortes por vídeo", "Todos formatos + YouTube Shorts", "IA avançada de viralização", "4 estilos de legenda premium", "Prioridade no processamento", "Sem marca d'água", "Suporte prioritário"],
    cta: "Começar com Pro", href: "https://pay.kiwify.com.br/4Z0jIcC",
  },
];

export default function Page() {
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  return (
    <>
      <style>{`
        @keyframes glow-pulse {
          0%,100% { box-shadow: 0 0 20px rgba(124,58,237,0.45), 0 0 40px rgba(236,72,153,0.2); }
          50% { box-shadow: 0 0 40px rgba(124,58,237,0.8), 0 0 80px rgba(236,72,153,0.35); }
        }
        @keyframes float-a { 0%,100% { transform: translateY(0) rotate(-2deg); } 50% { transform: translateY(-10px) rotate(1deg); } }
        @keyframes float-b { 0%,100% { transform: translateY(0) rotate(2deg); } 50% { transform: translateY(-7px) rotate(-1deg); } }
        @keyframes float-c { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-13px); } }
        @keyframes blink { 0%,80%,100% { opacity:0; } 40% { opacity:1; } }
        .fa { animation: float-a 6s ease-in-out infinite; }
        .fb { animation: float-b 5s ease-in-out infinite 0.5s; }
        .fc { animation: float-c 7s ease-in-out infinite 1s; }
        .glow { animation: glow-pulse 3s ease-in-out infinite; }
        .btn:hover { opacity:.85; transform:translateY(-2px); }
        .btn { transition: all .2s ease; }
        .card:hover { transform:translateY(-4px); border-color:rgba(124,58,237,0.4)!important; }
        .card { transition: all .25s ease; }
        .nl:hover { color:#fff!important; }
        .nl { transition:color .15s; }
        @media(max-width:860px){
          .hgrid{grid-template-columns:1fr!important;}
          .mockup{display:none!important;}
          .sgrid{grid-template-columns:1fr!important;}
        }
        * { box-sizing:border-box; }
      `}</style>

      <div style={{ minHeight:"100vh", background:"#020208", color:"#fff", fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", overflowX:"hidden" }}>

        {/* Ambient blobs */}
        <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0, overflow:"hidden" }}>
          <div style={{ position:"absolute", width:700, height:700, borderRadius:"50%", background:"radial-gradient(circle,rgba(124,58,237,0.13) 0%,transparent 70%)", top:-250, left:-150, filter:"blur(60px)" }}/>
          <div style={{ position:"absolute", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle,rgba(236,72,153,0.09) 0%,transparent 70%)", top:200, right:-100, filter:"blur(50px)" }}/>
          <div style={{ position:"absolute", width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle,rgba(6,182,212,0.06) 0%,transparent 70%)", bottom:300, left:"35%", filter:"blur(50px)" }}/>
        </div>

        {/* Dot grid */}
        <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0, backgroundImage:"radial-gradient(rgba(255,255,255,0.035) 1px,transparent 1px)", backgroundSize:"30px 30px" }}/>

        <div style={{ position:"relative", zIndex:1 }}>

          {/* ── NAV ── */}
          <nav style={{ position:"sticky", top:0, zIndex:50, background:"rgba(2,2,8,0.82)", backdropFilter:"blur(24px)", WebkitBackdropFilter:"blur(24px)", borderBottom:"1px solid rgba(255,255,255,0.055)" }}>
            <div style={{ position:"absolute", top:0, left:0, right:0, height:1, background:"linear-gradient(90deg,transparent,rgba(124,58,237,0.7),rgba(236,72,153,0.7),transparent)" }}/>
            <div style={{ maxWidth:1180, margin:"0 auto", padding:"0 24px", height:64, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:34, height:34, borderRadius:9, background:"linear-gradient(135deg,#7c3aed,#ec4899)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, fontWeight:900, boxShadow:"0 0 14px rgba(124,58,237,0.55)" }}>V</div>
                <span style={{ fontWeight:800, fontSize:18, letterSpacing:"-0.5px" }}>Viraliza Cortes</span>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:28 }}>
                <Link href="#como-funciona" className="nl" style={{ color:"#666", fontSize:14, textDecoration:"none", fontWeight:500 }}>Como funciona</Link>
                <Link href="#planos" className="nl" style={{ color:"#666", fontSize:14, textDecoration:"none", fontWeight:500 }}>Preços</Link>
                <Link href="/app" className="nl" style={{ color:"#666", fontSize:14, textDecoration:"none", fontWeight:500 }}>Entrar</Link>
                <Link href="/app" className="btn" style={{ background:"linear-gradient(135deg,#7c3aed,#ec4899)", color:"#fff", fontSize:13, fontWeight:700, padding:"10px 22px", borderRadius:100, textDecoration:"none", boxShadow:"0 0 18px rgba(124,58,237,0.4)" }}>Começar grátis</Link>
              </div>
            </div>
          </nav>

          {/* ── HERO ── */}
          <section style={{ padding:"88px 24px 72px", maxWidth:1180, margin:"0 auto" }}>
            <div className="hgrid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:64, alignItems:"center" }}>

              {/* Left */}
              <div>
                <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(124,58,237,0.1)", border:"1px solid rgba(124,58,237,0.25)", borderRadius:100, padding:"6px 16px", fontSize:11, color:"#a78bfa", marginBottom:28, fontWeight:700, letterSpacing:"0.08em" }}>
                  <span style={{ width:6, height:6, borderRadius:"50%", background:"#a78bfa", display:"inline-block", animation:"blink 2s infinite" }}/>
                  IA 100% BRASILEIRA
                </div>
                <h1 style={{ fontSize:"clamp(2.5rem,5vw,3.8rem)", fontWeight:900, lineHeight:1.07, letterSpacing:"-2px", marginBottom:22 }}>
                  Cortes virais automáticos{" "}
                  <span style={{ background:"linear-gradient(135deg,#a855f7,#ec4899,#f97316)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>para TikTok e Reels</span>
                </h1>
                <p style={{ color:"#777", fontSize:"1.05rem", lineHeight:1.8, marginBottom:36, maxWidth:460 }}>
                  Cole o link do YouTube e receba cortes virais prontos para TikTok, Instagram Reels e YouTube Shorts em menos de 3 minutos. Legenda gravada automaticamente. Sem editar. Sem assistir tudo.
                </p>

                <div style={{ display:"flex", alignItems:"center", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(124,58,237,0.4)", borderRadius:16, padding:"6px 6px 6px 18px", boxShadow:"0 0 32px rgba(124,58,237,0.15)", maxWidth:520, marginBottom:14, gap:8 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ flexShrink:0 }}>
                    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" stroke="#444" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" stroke="#444" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <span style={{ flex:1, color:"#3a3a3a", fontSize:14 }}>Cole o link do YouTube aqui...</span>
                  <Link href="/app" className="btn glow" style={{ background:"linear-gradient(135deg,#7c3aed,#ec4899)", color:"#fff", fontWeight:800, fontSize:14, padding:"13px 26px", borderRadius:12, textDecoration:"none", whiteSpace:"nowrap" }}>Viralizar agora</Link>
                </div>
                <p style={{ color:"#2e2e2e", fontSize:12, marginBottom:36 }}>Sem cartão de crédito · 1 clip grátis · Resultado em 3 min</p>

                {/* Platform logos */}
                <div style={{ display:"flex", alignItems:"center", gap:16 }}>
                  <span style={{ color:"#333", fontSize:12, fontWeight:500 }}>Funciona em:</span>
                  <div style={{ display:"flex", alignItems:"center", gap:14, opacity:0.65 }}>
                    <TTIcon size={18}/>
                    <IGIcon size={20}/>
                    <YTIcon size={22}/>
                    <FBIcon size={20}/>
                  </div>
                </div>
              </div>

              {/* Right: clip mockup */}
              <div className="mockup" style={{ position:"relative", height:440, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <div style={{ position:"absolute", width:360, height:360, borderRadius:"50%", background:"radial-gradient(circle,rgba(124,58,237,0.18) 0%,transparent 70%)", filter:"blur(40px)" }}/>

                {/* Source video card */}
                <div className="fa" style={{ position:"absolute", left:"2%", top:"12%", width:195, borderRadius:18, background:"rgba(12,12,20,0.95)", border:"1px solid rgba(255,255,255,0.1)", padding:14, zIndex:2 }}>
                  <div style={{ width:"100%", height:105, borderRadius:10, background:"linear-gradient(135deg,#0d0520,#2a1060,#5b21b6)", marginBottom:10, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <div style={{ width:36, height:36, borderRadius:"50%", background:"rgba(255,255,255,0.15)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <svg width="12" height="14" viewBox="0 0 12 14" fill="white"><path d="M0 0l12 7-12 7V0z"/></svg>
                    </div>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <YTIcon size={14}/>
                    <span style={{ fontSize:10, color:"#555" }}>Vídeo original</span>
                  </div>
                </div>

                {/* Arrow */}
                <div style={{ position:"absolute", left:"37%", top:"38%", zIndex:5, fontSize:22, color:"#7c3aed", fontWeight:900, textShadow:"0 0 20px rgba(124,58,237,0.8)" }}>→</div>

                {/* IA badge */}
                <div style={{ position:"absolute", left:"25%", top:"30%", background:"rgba(124,58,237,0.18)", border:"1px solid rgba(124,58,237,0.4)", borderRadius:100, padding:"7px 14px", fontSize:11, color:"#c4b5fd", fontWeight:700, zIndex:6, backdropFilter:"blur(10px)", whiteSpace:"nowrap" }}>
                  🧠 IA analisando...
                </div>

                {/* Clip 1 - TikTok */}
                <div className="fa" style={{ position:"absolute", right:"10%", top:"0%", width:88, height:155, borderRadius:14, background:"rgba(8,8,16,0.98)", border:"1px solid rgba(255,255,255,0.12)", overflow:"hidden", zIndex:4 }}>
                  <div style={{ width:"100%", height:"76%", background:"linear-gradient(180deg,#0d0520,#4c1d95,#7c3aed,#ec4899)" }}/>
                  <div style={{ padding:"7px 9px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:4, marginBottom:5 }}>
                      <TTIcon size={9}/>
                      <span style={{ fontSize:8, color:"#aaa", fontWeight:700 }}>TikTok</span>
                    </div>
                    <div style={{ height:2, borderRadius:2, background:"rgba(255,255,255,0.08)", overflow:"hidden" }}>
                      <div style={{ width:"65%", height:"100%", background:"linear-gradient(90deg,#7c3aed,#ec4899)" }}/>
                    </div>
                  </div>
                </div>

                {/* Clip 2 - Reels */}
                <div className="fb" style={{ position:"absolute", right:"0%", top:"30%", width:88, height:155, borderRadius:14, background:"rgba(8,8,16,0.98)", border:"1px solid rgba(193,53,132,0.35)", overflow:"hidden", zIndex:4, boxShadow:"0 0 24px rgba(193,53,132,0.2)" }}>
                  <div style={{ width:"100%", height:"76%", background:"linear-gradient(180deg,#1a0830,#9c1a74,#dd2a7b,#f58529)" }}/>
                  <div style={{ padding:"7px 9px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:4, marginBottom:5 }}>
                      <IGIcon size={9}/>
                      <span style={{ fontSize:8, color:"#aaa", fontWeight:700 }}>Reels</span>
                    </div>
                    <div style={{ height:2, borderRadius:2, background:"rgba(255,255,255,0.08)", overflow:"hidden" }}>
                      <div style={{ width:"80%", height:"100%", background:"linear-gradient(90deg,#c13584,#f58529)" }}/>
                    </div>
                  </div>
                </div>

                {/* Clip 3 - Shorts */}
                <div className="fc" style={{ position:"absolute", right:"22%", top:"58%", width:88, height:155, borderRadius:14, background:"rgba(8,8,16,0.98)", border:"1px solid rgba(255,0,0,0.25)", overflow:"hidden", zIndex:4 }}>
                  <div style={{ width:"100%", height:"76%", background:"linear-gradient(180deg,#1a0505,#7f1d1d,#dc2626,#f87171)" }}/>
                  <div style={{ padding:"7px 9px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:4, marginBottom:5 }}>
                      <YTIcon size={10}/>
                      <span style={{ fontSize:8, color:"#aaa", fontWeight:700 }}>Shorts</span>
                    </div>
                    <div style={{ height:2, borderRadius:2, background:"rgba(255,255,255,0.08)", overflow:"hidden" }}>
                      <div style={{ width:"45%", height:"100%", background:"linear-gradient(90deg,#dc2626,#f87171)" }}/>
                    </div>
                  </div>
                </div>

                {/* "Pronto!" badge */}
                <div style={{ position:"absolute", right:"5%", bottom:"8%", background:"rgba(16,185,129,0.15)", border:"1px solid rgba(16,185,129,0.35)", borderRadius:100, padding:"5px 12px", fontSize:11, color:"#6ee7b7", fontWeight:700, zIndex:6, backdropFilter:"blur(8px)" }}>
                  ✓ 3 clips prontos
                </div>
              </div>
            </div>
          </section>

          {/* ── STATS ── */}
          <section style={{ maxWidth:820, margin:"0 auto 88px", padding:"0 24px" }}>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", background:"rgba(255,255,255,0.025)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:22, overflow:"hidden" }}>
              {[
                { n:"10.000+", l:"cortes gerados", s:"e crescendo" },
                { n:"4", l:"plataformas", s:"TikTok · IG · YT · FB" },
                { n:"< 3 min", l:"por vídeo", s:"do link ao clip" },
              ].map((s,i) => (
                <div key={s.l} style={{ background:"#05050f", padding:"34px 20px", textAlign:"center", borderRight:i<2?"1px solid rgba(255,255,255,0.05)":"none" }}>
                  <div style={{ fontSize:"2.1rem", fontWeight:900, lineHeight:1, background:"linear-gradient(135deg,#a855f7,#ec4899)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", marginBottom:6 }}>{s.n}</div>
                  <div style={{ color:"#ccc", fontSize:13, fontWeight:600, marginBottom:2 }}>{s.l}</div>
                  <div style={{ color:"#3a3a3a", fontSize:11 }}>{s.s}</div>
                </div>
              ))}
            </div>
          </section>

          {/* ── COMO FUNCIONA ── */}
          <section id="como-funciona" style={{ maxWidth:980, margin:"0 auto 92px", padding:"0 24px" }}>
            <p style={{ textAlign:"center", color:"#7c3aed", fontSize:11, fontWeight:700, letterSpacing:"0.12em", marginBottom:12, textTransform:"uppercase" }}>COMO FUNCIONA</p>
            <h2 style={{ textAlign:"center", fontSize:"clamp(1.8rem,4vw,2.6rem)", fontWeight:900, marginBottom:60, letterSpacing:"-1px" }}>Como criar cortes virais automáticos</h2>
            <div className="sgrid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:0, position:"relative" }}>
              <div style={{ position:"absolute", top:35, left:"17%", right:"17%", height:1, background:"linear-gradient(90deg,#7c3aed,#ec4899)", opacity:0.35 }}/>
              {STEPS.map((s) => (
                <div key={s.num} style={{ textAlign:"center", padding:"0 28px", position:"relative", zIndex:1 }}>
                  <div style={{ width:70, height:70, borderRadius:"50%", background:"linear-gradient(135deg,rgba(124,58,237,0.18),rgba(236,72,153,0.08))", border:"1px solid rgba(124,58,237,0.35)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px", fontSize:28 }}>{s.icon}</div>
                  <div style={{ fontSize:10, fontWeight:800, color:"#7c3aed", letterSpacing:"0.1em", marginBottom:10 }}>PASSO {s.num}</div>
                  <h3 style={{ fontWeight:800, fontSize:"0.95rem", marginBottom:10, lineHeight:1.3 }}>{s.title}</h3>
                  <p style={{ color:"#555", fontSize:13, lineHeight:1.75 }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── PLATAFORMAS ── */}
          <section style={{ maxWidth:980, margin:"0 auto 92px", padding:"0 24px" }}>
            <h2 style={{ textAlign:"center", fontSize:"clamp(1.8rem,4vw,2.4rem)", fontWeight:900, marginBottom:48, letterSpacing:"-1px" }}>
              Otimizado para{" "}
              <span style={{ background:"linear-gradient(135deg,#a855f7,#ec4899)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>todas as plataformas</span>
            </h2>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(270px,1fr))", gap:16 }}>
              {PLATFORMS.map((p) => (
                <div key={p.name} className="card" style={{ background:p.bg, border:`1px solid ${p.border}`, borderRadius:18, padding:"26px", backdropFilter:"blur(8px)" }}>
                  <div style={{ marginBottom:14 }}><p.Logo/></div>
                  <h3 style={{ fontWeight:700, fontSize:"0.95rem", marginBottom:8, color:"#e0e0e0" }}>{p.name}</h3>
                  <p style={{ color:"#555", fontSize:13, lineHeight:1.7 }}>{p.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── TESTIMONIALS ── */}
          <section style={{ maxWidth:980, margin:"0 auto 92px", padding:"0 24px" }}>
            <p style={{ textAlign:"center", color:"#7c3aed", fontSize:11, fontWeight:700, letterSpacing:"0.12em", marginBottom:12, textTransform:"uppercase" }}>DEPOIMENTOS</p>
            <h2 style={{ textAlign:"center", fontSize:"clamp(1.6rem,4vw,2.2rem)", fontWeight:900, marginBottom:8, letterSpacing:"-1px" }}>Criadores que já viralizaram</h2>
            <p style={{ textAlign:"center", color:"#555", fontSize:14, marginBottom:48 }}>Resultados reais de quem usa Viraliza Cortes todos os dias</p>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(270px,1fr))", gap:20 }}>
              {TESTIMONIALS.map((t) => (
                <div key={t.name} className="card" style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:20, padding:"28px 24px", backdropFilter:"blur(8px)" }}>
                  <div style={{ display:"flex", gap:3, marginBottom:16 }}>
                    {[0,1,2,3,4].map(i => <StarIcon key={i}/>)}
                  </div>
                  <p style={{ color:"#bbb", fontSize:14, lineHeight:1.75, marginBottom:20, fontStyle:"italic" }}>"{t.text}"</p>
                  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <div style={{ width:40, height:40, borderRadius:"50%", background:`linear-gradient(135deg,${t.color},${t.color}99)`, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:15, flexShrink:0 }}>{t.avatar}</div>
                    <div>
                      <div style={{ fontWeight:700, fontSize:13 }}>{t.name}</div>
                      <div style={{ color:"#444", fontSize:11 }}>{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── PRICING ── */}
          <section id="planos" style={{ maxWidth:980, margin:"0 auto 92px", padding:"0 24px" }}>
            <p style={{ textAlign:"center", color:"#7c3aed", fontSize:11, fontWeight:700, letterSpacing:"0.12em", marginBottom:12, textTransform:"uppercase" }}>PREÇOS</p>
            <h2 style={{ textAlign:"center", fontSize:"clamp(1.8rem,4vw,2.6rem)", fontWeight:900, marginBottom:8, letterSpacing:"-1px" }}>Planos que cabem no seu bolso</h2>
            <p style={{ textAlign:"center", color:"#555", fontSize:14, marginBottom:32 }}>Comece grátis. Faça upgrade quando precisar. Cancele quando quiser.</p>

            {/* Free banner */}
            <div style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, padding:"16px 24px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12, marginBottom:22 }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <span style={{ background:"linear-gradient(135deg,#7c3aed,#ec4899)", color:"#fff", fontSize:10, fontWeight:800, padding:"3px 10px", borderRadius:100, letterSpacing:"0.05em" }}>GRÁTIS</span>
                <span style={{ fontWeight:600, fontSize:14 }}>Teste antes de pagar</span>
              </div>
              <div style={{ display:"flex", gap:20, color:"#666", fontSize:13, flexWrap:"wrap" }}>
                <span><span style={{ color:"#a78bfa" }}>✓</span> 1 clip grátis</span>
                <span><span style={{ color:"#a78bfa" }}>✓</span> Sem cartão</span>
                <span><span style={{ color:"#a78bfa" }}>✓</span> Resultado imediato</span>
              </div>
              <Link href="/app" className="btn" style={{ background:"rgba(124,58,237,0.12)", border:"1px solid rgba(124,58,237,0.3)", color:"#a78bfa", fontWeight:700, fontSize:13, padding:"10px 22px", borderRadius:100, textDecoration:"none", whiteSpace:"nowrap" }}>Criar conta grátis →</Link>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(290px,1fr))", gap:20 }}>
              {PLANS.map((plan) => (
                <div key={plan.name} style={{ background:plan.hi?"linear-gradient(180deg,rgba(124,58,237,0.1) 0%,rgba(0,0,0,0.5) 100%)":"rgba(255,255,255,0.02)", border:plan.hi?"1px solid rgba(124,58,237,0.45)":"1px solid rgba(255,255,255,0.07)", borderRadius:24, padding:"34px 28px", position:"relative", boxShadow:plan.hi?"0 0 60px rgba(124,58,237,0.2),inset 0 1px 0 rgba(255,255,255,0.08)":"none", backdropFilter:"blur(12px)" }}>
                  {plan.badge && (
                    <div style={{ position:"absolute", top:-14, left:"50%", transform:"translateX(-50%)", background:"linear-gradient(135deg,#7c3aed,#ec4899)", color:"#fff", fontSize:10, fontWeight:800, padding:"5px 18px", borderRadius:100, whiteSpace:"nowrap", letterSpacing:"0.05em", boxShadow:"0 4px 14px rgba(124,58,237,0.55)" }}>★ {plan.badge}</div>
                  )}
                  <div style={{ fontSize:30, marginBottom:10 }}>{plan.emoji}</div>
                  <p style={{ color:"#555", fontSize:11, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:6 }}>{plan.name}</p>
                  <div style={{ display:"flex", alignItems:"flex-end", gap:4, marginBottom:6 }}>
                    <span style={{ fontSize:"3rem", fontWeight:900, lineHeight:1, letterSpacing:"-2px" }}>{plan.price}</span>
                    <span style={{ color:"#444", paddingBottom:6, fontSize:14 }}>{plan.period}</span>
                  </div>
                  <p style={{ color:"#444", fontSize:13, marginBottom:24, lineHeight:1.5 }}>{plan.desc}</p>
                  <div style={{ height:1, background:"rgba(255,255,255,0.05)", marginBottom:22 }}/>
                  <ul style={{ listStyle:"none", padding:0, margin:"0 0 30px", display:"flex", flexDirection:"column", gap:12 }}>
                    {plan.features.map((f) => (
                      <li key={f} style={{ display:"flex", alignItems:"flex-start", gap:10, fontSize:13.5, color:"#ccc", lineHeight:1.4 }}>
                        <Check hi={plan.hi}/>{f}
                      </li>
                    ))}
                  </ul>
                  <a href={plan.href} target="_blank" rel="noopener noreferrer" className="btn" style={{ display:"block", textAlign:"center", background:plan.hi?"linear-gradient(135deg,#7c3aed,#ec4899)":"rgba(255,255,255,0.07)", border:plan.hi?"none":"1px solid rgba(255,255,255,0.1)", color:"#fff", fontWeight:700, fontSize:14, padding:"16px", borderRadius:14, textDecoration:"none", boxShadow:plan.hi?"0 4px 24px rgba(124,58,237,0.45)":"none", letterSpacing:"0.02em" }}>{plan.cta} →</a>
                </div>
              ))}
            </div>
          </section>

          {/* ── FAQ ── */}
          <section style={{ maxWidth:680, margin:"0 auto 92px", padding:"0 24px" }}>
            <p style={{ textAlign:"center", color:"#7c3aed", fontSize:11, fontWeight:700, letterSpacing:"0.12em", marginBottom:12, textTransform:"uppercase" }}>FAQ</p>
            <h2 style={{ textAlign:"center", fontSize:"clamp(1.6rem,4vw,2.2rem)", fontWeight:900, marginBottom:40, letterSpacing:"-1px" }}>Perguntas frequentes</h2>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {FAQS.map((item,i) => (
                <div key={i} style={{ background:"rgba(255,255,255,0.02)", border:`1px solid ${faqOpen===i?"rgba(124,58,237,0.35)":"rgba(255,255,255,0.06)"}`, borderRadius:14, overflow:"hidden", cursor:"pointer", transition:"border-color .2s" }} onClick={() => setFaqOpen(faqOpen===i?null:i)}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"18px 22px" }}>
                    <span style={{ fontWeight:600, fontSize:14, color:faqOpen===i?"#e5e5e5":"#aaa" }}>{item.q}</span>
                    <span style={{ color:"#7c3aed", fontSize:20, fontWeight:300, transform:faqOpen===i?"rotate(45deg)":"none", transition:"transform .2s", flexShrink:0, marginLeft:12, lineHeight:1 }}>+</span>
                  </div>
                  {faqOpen===i && <div style={{ padding:"0 22px 18px", color:"#666", fontSize:13.5, lineHeight:1.8 }}>{item.a}</div>}
                </div>
              ))}
            </div>
          </section>

          {/* ── FINAL CTA ── */}
          <section style={{ maxWidth:760, margin:"0 auto 90px", padding:"0 24px" }}>
            <div style={{ background:"linear-gradient(135deg,rgba(124,58,237,0.16),rgba(236,72,153,0.1))", border:"1px solid rgba(124,58,237,0.28)", borderRadius:28, padding:"64px 40px", textAlign:"center", position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", top:-60, right:-60, width:220, height:220, borderRadius:"50%", background:"radial-gradient(circle,rgba(236,72,153,0.15) 0%,transparent 70%)", filter:"blur(30px)", pointerEvents:"none" }}/>
              <div style={{ position:"absolute", bottom:-60, left:-60, width:220, height:220, borderRadius:"50%", background:"radial-gradient(circle,rgba(124,58,237,0.15) 0%,transparent 70%)", filter:"blur(30px)", pointerEvents:"none" }}/>
              <div style={{ position:"relative" }}>
                <div style={{ fontSize:44, marginBottom:18 }}>🎬</div>
                <h2 style={{ fontSize:"clamp(1.6rem,4vw,2.3rem)", fontWeight:900, marginBottom:14, letterSpacing:"-1px" }}>Comece a viralizar hoje</h2>
                <p style={{ color:"#777", fontSize:15, marginBottom:34, lineHeight:1.7 }}>Sem cartão de crédito. 1 clip grátis para testar.<br/>Resultado em menos de 3 minutos.</p>
                <Link href="/app" className="btn glow" style={{ background:"linear-gradient(135deg,#7c3aed,#ec4899,#f97316)", color:"#fff", fontWeight:800, fontSize:16, padding:"19px 50px", borderRadius:100, textDecoration:"none", display:"inline-block", letterSpacing:"0.02em" }}>Criar meu primeiro clip grátis →</Link>
                <p style={{ color:"#2a2a2a", fontSize:12, marginTop:20 }}>Já com legenda gravada · Sem marca d'água no trial</p>
              </div>
            </div>
          </section>

          {/* ── FOOTER ── */}
          <footer style={{ borderTop:"1px solid rgba(255,255,255,0.05)", padding:"52px 24px 40px" }}>
            <div style={{ maxWidth:980, margin:"0 auto" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:36, marginBottom:44 }}>
                <div>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                    <div style={{ width:32, height:32, borderRadius:8, background:"linear-gradient(135deg,#7c3aed,#ec4899)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:900 }}>V</div>
                    <span style={{ fontWeight:800, fontSize:17, letterSpacing:"-0.5px" }}>Viraliza Cortes</span>
                  </div>
                  <p style={{ color:"#333", fontSize:13, lineHeight:1.7, maxWidth:220 }}>Transforme vídeos longos em clips virais com IA 100% brasileira.</p>
                </div>
                <div style={{ display:"flex", gap:52 }}>
                  <div>
                    <p style={{ color:"#444", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:14 }}>Produto</p>
                    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                      {[{l:"Como funciona",h:"#como-funciona"},{l:"Preços",h:"#planos"},{l:"Entrar",h:"/app"}].map(x=>(
                        <Link key={x.l} href={x.h} className="nl" style={{ color:"#333", fontSize:13, textDecoration:"none" }}>{x.l}</Link>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p style={{ color:"#444", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:14 }}>Plataformas</p>
                    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                      {["TikTok","Instagram Reels","YouTube Shorts","Facebook Reels"].map(l=>(
                        <span key={l} style={{ color:"#333", fontSize:13 }}>{l}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ borderTop:"1px solid rgba(255,255,255,0.04)", paddingTop:24, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
                <p style={{ color:"#222", fontSize:12 }}>© 2026 Viraliza Cortes · Feito no Brasil 🇧🇷</p>
                <div style={{ display:"flex", alignItems:"center", gap:16, opacity:0.35 }}>
                  <TTIcon size={16}/><IGIcon size={18}/><YTIcon size={20}/><FBIcon size={18}/>
                </div>
              </div>
            </div>
          </footer>

        </div>
      </div>
    </>
  );
}
