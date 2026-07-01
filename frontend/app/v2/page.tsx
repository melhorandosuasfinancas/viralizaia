"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import {
  Sparkles, Zap, Crown, Building2, Check, Languages,
  Wand2, Layers, Download, Bot, Palette, ChevronDown, Star,
} from "lucide-react";
import { MagneticButton } from "@/components/ui/magnetic-button";
import ShaderBackground from "@/components/ui/shader-background";
import { GlowCard } from "@/components/ui/spotlight-card";

// Caveat já carregada em globals.css como .font-handwritten
const H = "font-handwritten"; // atalho para headings com Caveat

// ── Reveal animations ─────────────────────────────
const REVEAL = { once: true, amount: 0.15 } as const;
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } } };

// ── Brand SVG icons ────────────────────────────────
const TikTokIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.77a4.85 4.85 0 0 1-1.01-.08z" />
  </svg>
);
const InstagramIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 0C8.74 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 3.252.148 4.771 1.691 4.919 4.919.049 1.265.064 1.645.064 4.849 0 3.205-.015 3.585-.074 4.85-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
  </svg>
);
const YouTubeIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.54 3.5 12 3.5 12 3.5s-7.54 0-9.38.55A3.02 3.02 0 0 0 .5 6.19 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.81 3.02 3.02 0 0 0 2.12 2.14C4.46 20.5 12 20.5 12 20.5s7.54 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.81zM9.75 15.5V8.5l6.5 3.5-6.5 3.5z" />
  </svg>
);

// ── Data ──────────────────────────────────────────
const PLANS = [
  {
    name: "Starter", monthly: 29.9, yearly: 23.92, glow: "orange" as const,
    icon: <Sparkles className="w-5 h-5" />, desc: "Pra começar a crescer",
    href: "https://viralizacortes.carrinho.app/one-checkout/ocmdf/36710557",
    pixHref: "https://viralizacortes.carrinho.app/one-checkout/ocmtb/36888128",
    cta: "Assinar Starter", monthlyCortes: 55, pixCredits: 110,
    features: ["Sem marca d'água", "TikTok + Reels + Shorts", "8 estilos de legenda", "Histórico de projetos"],
  },
  {
    name: "Pro", monthly: 49.9, yearly: 39.92, glow: "purple" as const, popular: true,
    icon: <Zap className="w-5 h-5" />, desc: "Pra criadores sérios",
    href: "https://viralizacortes.carrinho.app/one-checkout/ocmdf/36710590",
    pixHref: "https://viralizacortes.carrinho.app/one-checkout/ocmtb/36888178",
    cta: "Quero o Pro", monthlyCortes: 80, pixCredits: 160,
    features: ["Tudo do Starter", "IA escolhe os mais virais", "Check-in diário (+créditos)", "Suporte prioritário"],
  },
  {
    name: "Full", monthly: 99.9, yearly: 79.92, glow: "blue" as const,
    icon: <Crown className="w-5 h-5" />, desc: "Pra quem quer escalar",
    href: "https://viralizacortes.carrinho.app/one-checkout/ocmdf/36711838",
    pixHref: "https://viralizacortes.carrinho.app/one-checkout/ocmtb/36888195",
    cta: "Assinar Full", monthlyCortes: 140, pixCredits: 280,
    features: ["Tudo do Pro", "IA avançada de viralização", "Brand Kit personalizado", "Suporte VIP"],
  },
  {
    name: "Agência", monthly: 150, yearly: 120, glow: "green" as const,
    icon: <Building2 className="w-5 h-5" />, desc: "Pra equipes e agências",
    href: "https://viralizacortes.carrinho.app/one-checkout/ocmdf/36711896",
    pixHref: "https://viralizacortes.carrinho.app/one-checkout/ocmtb/36888217",
    cta: "Falar com vendas", monthlyCortes: 220, pixCredits: 440,
    features: ["Tudo do Full", "Múltiplos clientes", "API de integração", "Suporte VIP dedicado"],
  },
];

const FEATURES = [
  { title: "IA brasileira treinada", desc: "Nossa IA foi treinada com português brasileiro — entende gírias, contextos e o que viraliza no Brasil.", icon: <Bot className="w-6 h-6" /> },
  { title: "Legendas TikTok automáticas", desc: "Gravadas no vídeo em 8 estilos.", icon: <Languages className="w-6 h-6" /> },
  { title: "Sem marca d'água", desc: "Vídeo limpo, pronto pra postar.", icon: <Wand2 className="w-6 h-6" /> },
  { title: "9:16 vertical perfeito", desc: "Reframing automático centrado no rosto.", icon: <Layers className="w-6 h-6" /> },
  { title: "Brand Kit", desc: "Logo, cores e fontes da sua marca em cada corte.", icon: <Palette className="w-6 h-6" /> },
  { title: "Exporta em segundos", desc: "Download direto ou publicação automática.", icon: <Download className="w-6 h-6" /> },
];

const STEPS = [
  { num: "01", title: "Cole o link do YouTube", desc: "Funciona com qualquer vídeo público — podcasts, lives, aulas.", icon: "🔗", color: "#22D3EE" },
  { num: "02", title: "Nossa IA analisa", desc: "Identifica os melhores momentos, picos de retenção e ganchos.", icon: "🤖", color: "#D946EF" },
  { num: "03", title: "Receba os cortes prontos", desc: "Formato 9:16, legendas, sem marca d'água. Baixe e poste.", icon: "⬇️", color: "#A855F7" },
];

const TESTIMONIALS = [
  { name: "@cariocando", platform: "TikTok" as const, before: "12K", after: "280K", metric: "seguidores em 3 meses", text: "Saí de 12K pra 280K em 3 meses postando os cortes. É absurdo o quanto economiza tempo.", grad: "from-cyan-400 to-pink-500", initials: "CR" },
  { name: "@marketing.real", platform: "Instagram" as const, before: "R$2.000", after: "R$50", metric: "que pagava de editor", text: "Antes eu pagava editor R$2k/mês. Agora gasto R$50 e tenho mais clipes que conseguia editar.", grad: "from-pink-400 to-fuchsia-600", initials: "MR" },
  { name: "@podcast.cast", platform: "YouTube" as const, before: "0", after: "156K", metric: "inscritos do zero", text: "Cortes de podcast longo viram virais sozinhos. A IA acha os momentos certos.", grad: "from-red-400 to-orange-500", initials: "PC" },
  { name: "@guru.financas", platform: "Instagram" as const, before: "1h/dia", after: "1h/semana", metric: "editando vídeos", text: "Em 1 hora gero conteúdo pra semana inteira. Não vivo mais sem.", grad: "from-violet-400 to-fuchsia-600", initials: "GF" },
];

const FAQS = [
  { q: "Funciona com qualquer vídeo do YouTube?", a: "Sim, qualquer vídeo público. Inclusive podcasts longos, lives e webinars de várias horas." },
  { q: "As legendas são em português?", a: "Sim, 100% PT-BR. Nossa IA foi treinada com português brasileiro real e entende gírias." },
  { q: "Posso cancelar quando quiser?", a: "Sim. Cancele com 1 clique a qualquer momento, sem multa. Garantia de 7 dias em todos os planos." },
  { q: "Quanto tempo demora pra gerar?", a: "Em média 2 a 5 minutos por hora de vídeo. Para um vídeo de 30 minutos, seus cortes ficam prontos em ~2 minutos." },
  { q: "Preciso saber editar?", a: "Não. Tudo é automático. Cole o link, espere a IA processar e baixe os cortes prontos." },
  { q: "Quantos cortes vou conseguir gerar?", a: "Depende do vídeo. Em média, um vídeo de 1h gera de 8 a 15 cortes virais." },
];

// ── Animated counter ──────────────────────────────
function Counter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const mv = useMotionValue(0);
  const display = useTransform(mv, (v) =>
    value >= 1000 ? Math.round(v).toLocaleString("pt-BR") : v.toFixed(value < 10 ? 1 : 0).replace(".", ","),
  );
  useEffect(() => {
    if (inView) {
      const c = animate(mv, value, { duration: 2, ease: [0.22, 1, 0.36, 1] });
      return c.stop;
    }
  }, [inView, value, mv]);
  return <span ref={ref}><motion.span>{display}</motion.span>{suffix}</span>;
}

// ── Clip cards ────────────────────────────────────
const CLIPS = [
  { bg: "/clip1.png", caption: "ELES NÃO\nQUEREM\nQUE VOCÊ SAIBA", captionColor: "#FBBF24", views: "892K", likes: "47.2K", platform: "Reels", score: 9.1, rotate: -8, scale: 0.78, z: 1 },
  { bg: "/clip2.png", caption: "PLANO DE\nSAÚDE É\nESTE AQUI!", captionColor: "#FFFFFF", views: "1.2M", likes: "234K", platform: "TikTok", score: 9.8, rotate: 0, scale: 1, z: 3 },
  { bg: "/clip3.png", caption: "ACADEMIA\nNÃO É\nPRO RICO", captionColor: "#22D3EE", views: "634K", likes: "28.9K", platform: "Shorts", score: 8.7, rotate: 8, scale: 0.78, z: 1 },
];

function ClipCard({ clip, i }: { clip: typeof CLIPS[0]; i: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: clip.scale * 0.88 }}
      animate={{ opacity: 1, y: 0, scale: clip.scale, rotate: clip.rotate }}
      transition={{ duration: 0.9, delay: 0.7 + i * 0.15, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: clip.scale * 1.06, rotate: 0, zIndex: 10 }}
      style={{ zIndex: clip.z }}
      className={`relative w-[140px] sm:w-[210px] md:w-[248px] aspect-[9/16] rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden shadow-[0_30px_80px_-20px_rgba(168,85,247,0.55)] border-2 sm:border-[3px] border-white/10 flex-shrink-0 ${i === 0 ? "-mr-10 sm:mr-0" : i === 2 ? "-ml-10 sm:ml-0" : ""}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={clip.bg}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          filter: "contrast(1.08) saturate(1.15) brightness(1.03)",
          transform: "scale(1.01)",
          transformOrigin: "center",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/75" />

      <div className="absolute top-3 left-4 right-4 flex justify-between text-white text-[10px] font-semibold">
        <span>9:41</span>
        <div className="flex items-center gap-1"><span>•••</span><div className="w-5 h-2.5 border border-white rounded-sm flex items-center px-px"><div className="w-3 h-full bg-white rounded-[1px]" /></div></div>
      </div>

      <div className="absolute top-10 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-fuchsia-500 to-violet-500 text-white text-[10px] font-bold shadow-lg">
        <Star className="w-2.5 h-2.5 fill-white" />{clip.score}/10
      </div>
      <div className="absolute top-10 left-3 px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold border border-white/15">{clip.platform}</div>

      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-2 text-center font-black tracking-tight leading-tight text-base sm:text-2xl"
        style={{ color: clip.captionColor, fontFamily: "'Arial Black',sans-serif", textShadow: "0 0 1px #000, 0 4px 12px rgba(0,0,0,0.9), 2px 2px 0 #000, -2px -2px 0 #000", WebkitTextStroke: "1px black" }}
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
      >
        {clip.caption.split("\n").map((l, j) => <div key={j}>{l}</div>)}
      </motion.div>

      <div className="absolute right-3 bottom-24 flex flex-col items-center gap-4 text-white">
        {["❤️", "💬", "📤"].map((em, j) => (
          <div key={j} className="flex flex-col items-center">
            <div className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 flex items-center justify-center text-base">{em}</div>
            {j === 0 && <span className="text-[10px] font-bold mt-1 drop-shadow">{clip.likes}</span>}
          </div>
        ))}
      </div>

      <div className="absolute bottom-3 left-3 right-16 text-white">
        <div className="text-[11px] font-bold mb-1 flex items-center gap-1.5">
          <span className="opacity-90">@viralizacortes</span>
          <span className="px-1.5 py-px rounded-sm bg-white/15 text-[8px] font-semibold">SEGUIR</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] opacity-80"><span>👁</span><span className="font-semibold">{clip.views} views</span></div>
        <div className="flex items-center gap-1.5 text-[10px] opacity-80 mt-0.5">
          <motion.span animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}>🎵</motion.span>
          <span className="font-medium truncate">Som Original • Viral</span>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/15">
        <motion.div className="h-full bg-white" animate={{ width: ["0%", "100%"] }} transition={{ duration: 8, repeat: Infinity, ease: "linear", delay: i * 0.5 }} />
      </div>
    </motion.div>
  );
}

// ── Main page ─────────────────────────────────────
export default function V2Page() {
  const [yearly, setYearly] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [url, setUrl] = useState("");
  const [demoTab, setDemoTab] = useState<"config" | "processing">("config");

  return (
    <div className="min-h-screen text-white overflow-x-hidden">
      <ShaderBackground />
      {/* Overlay escuro para legibilidade */}
      <div className="fixed inset-0 bg-black/40 -z-[5] pointer-events-none" />

      {/* ── Banner urgência ── */}
      <div className="relative z-[60] sticky top-0 py-2.5 px-4 text-center text-xs font-bold text-white flex items-center justify-center gap-2 flex-wrap"
        style={{ background: "linear-gradient(90deg,#5b21b6 0%,#7c3aed 50%,#5b21b6 100%)", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
        <span><strong>1.247 criadores</strong> geraram clips hoje —</span>
        <Link href="/app" className="underline text-yellow-300 font-bold hover:no-underline">Comece grátis agora →</Link>
      </div>

      {/* ── Nav (pill flutuante) ── */}
      <div className="relative z-50 sticky top-9 px-4 py-2">
        <nav className="max-w-4xl mx-auto flex items-center justify-between px-5 py-2.5 rounded-full backdrop-blur-xl bg-black/60 border border-white/[0.12] shadow-[0_8px_40px_rgba(0,0,0,0.5)]">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo-viraliza-cortes.png" alt="Viraliza Cortes" width={28} height={28} className="rounded-md" />
            <span className="font-bold text-sm hidden sm:block">Viraliza Cortes</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            {[["Recursos","#recursos"],["Como funciona","#como-funciona"],["Planos","#planos"],["FAQ","#faq"]].map(([l, h]) => (
              <a key={l} href={h} className="text-sm text-zinc-300 hover:text-white transition-colors">{l}</a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link href="/entrar" className="text-sm text-zinc-400 hover:text-white hidden sm:block">Entrar</Link>
            <Link href="/app" className="px-4 py-1.5 rounded-full bg-gradient-to-r from-fuchsia-500 to-violet-500 text-white text-sm font-bold shadow-[0_4px_20px_rgba(168,85,247,0.4)] hover:scale-105 transition-transform">
              Começar grátis
            </Link>
          </div>
        </nav>
      </div>

      {/* ── HERO ── */}
      <section className="relative z-10 px-6 pt-24 pb-16 max-w-6xl mx-auto text-center">
        {/* Badge */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-fuchsia-400/30 bg-fuchsia-500/10 backdrop-blur-sm mb-8">
          <svg width="18" height="13" viewBox="0 0 18 13" className="rounded-sm" aria-hidden>
            <rect width="18" height="13" fill="#009C3B" />
            <polygon points="9,1.5 16.5,6.5 9,11.5 1.5,6.5" fill="#FFDF00" />
            <circle cx="9" cy="6.5" r="2.8" fill="#002776" />
            <path d="M 6.5 6.8 Q 9 4.5 11.5 6.8" stroke="white" strokeWidth="0.6" fill="none" />
          </svg>
          <span className="text-xs font-semibold text-fuchsia-200 tracking-wide">IA 100% Brasileira</span>
          <span className="w-1 h-1 rounded-full bg-fuchsia-400 animate-pulse" />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial="hidden" animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } } }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-extrabold tracking-[-0.04em] leading-[1.0] mb-7"
        >
          <motion.span variants={fadeUp} className="inline-block">1 link.</motion.span>
          <br />
          <motion.span variants={fadeUp} className="inline-block bg-gradient-to-r from-fuchsia-300 via-pink-300 to-violet-300 bg-clip-text text-transparent">
            Dezenas de cortes
          </motion.span>
          <br />
          <motion.span variants={fadeUp} className="inline-block bg-gradient-to-r from-fuchsia-300 via-pink-300 to-violet-300 bg-clip-text text-transparent">
            virais.
          </motion.span>
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.7 }}
          className="text-zinc-300 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Cole o link do YouTube. Nossa IA brasileira identifica os melhores momentos,
          corta no 9:16, adiciona legendas e entrega pronto para TikTok, Reels e Shorts.{" "}
          <span className="text-fuchsia-300 font-semibold">Em menos de 3 minutos.</span>
        </motion.p>

        {/* Form integrado (estilo opus.pro) */}
        <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.6 }}
          onSubmit={(e) => { e.preventDefault(); window.location.href = url ? `/app?url=${encodeURIComponent(url)}` : "/app"; }}
          className="max-w-2xl mx-auto mb-5">
          <div className="flex items-center gap-2 p-2 rounded-2xl border border-white/15 bg-black/40 backdrop-blur-xl focus-within:border-fuchsia-400/60 hover:border-white/25 transition-colors shadow-[0_20px_60px_-20px_rgba(0,0,0,0.7)]">
            <div className="flex items-center gap-3 flex-1 px-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-500 flex-shrink-0">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              <input type="url" placeholder="Cole o link do YouTube aqui..." value={url} onChange={(e) => setUrl(e.target.value)}
                className="flex-1 bg-transparent text-sm md:text-base text-white placeholder-zinc-500 outline-none min-w-0 py-2" aria-label="Link do YouTube" />
            </div>
            <button type="submit" className="flex-shrink-0 px-7 py-3.5 rounded-xl bg-gradient-to-r from-fuchsia-500 to-violet-500 text-white font-bold text-sm shadow-[0_8px_30px_-8px_rgba(217,70,239,0.7)] hover:scale-[1.02] transition-transform whitespace-nowrap">
              Viralizar →
            </button>
          </div>
        </motion.form>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-zinc-400 mb-10">
          <span className="flex items-center gap-1"><Check className="w-3 h-3 text-emerald-400" /> Sem cartão de crédito</span>
          <span className="flex items-center gap-1"><Check className="w-3 h-3 text-emerald-400" /> 10 cortes grátis</span>
          <a href="#como-funciona" className="text-fuchsia-300 hover:text-fuchsia-200 font-medium">Ver como funciona ↓</a>
        </motion.div>

        {/* Clips mockup */}
        <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.55, ease: [0.22, 1, 0.36, 1] }} className="mt-8">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.6, duration: 0.6 }}
            className="relative z-10 mx-auto mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-black/40 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" />
            <span className="text-xs font-medium text-white">
              <span className="text-fuchsia-300 font-semibold">3 cortes</span> gerados pela IA em
              <span className="text-fuchsia-300 font-semibold"> 2 minutos</span>
            </span>
          </motion.div>

          <div className="flex justify-center items-end gap-0 sm:gap-6 px-2 sm:px-4 py-6">
            {CLIPS.map((c, i) => <ClipCard key={i} clip={c} i={i} />)}
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2, duration: 0.7 }} className="mt-10">
            <p className="text-center text-[11px] font-semibold tracking-[0.25em] uppercase text-zinc-500 mb-5">Exporta direto para</p>
            <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
              {[
                { name: "TikTok", color: "#fff", bg: "rgba(255,255,255,0.06)", Icon: TikTokIcon },
                { name: "Instagram Reels", color: "#E1306C", bg: "rgba(225,48,108,0.1)", Icon: InstagramIcon },
                { name: "YouTube Shorts", color: "#FF0000", bg: "rgba(255,0,0,0.1)", Icon: YouTubeIcon },
              ].map(({ name, color, bg, Icon }) => (
                <motion.div key={name} whileHover={{ y: -3, scale: 1.05 }} className="flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-white/10 backdrop-blur-sm" style={{ background: bg }}>
                  <span style={{ color }}><Icon size={20} /></span>
                  <span className="text-base font-bold" style={{ color }}>{name}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Stats ── */}
      <motion.section className="relative z-10 px-6 pt-24 pb-12 max-w-6xl mx-auto" initial="hidden" whileInView="show" viewport={REVEAL} variants={stagger}>
        <motion.p variants={fadeUp} className="text-center text-xs text-zinc-500 uppercase tracking-[0.25em] font-semibold mb-10">Usado por +1.200 criadores brasileiros</motion.p>
        <motion.div variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: "👥", value: 1247, suffix: "", label: "Criadores ativos" },
            { icon: "✂️", value: 73000, suffix: "+", label: "Cortes gerados" },
            { icon: "⭐", value: 4.9, suffix: "", label: "Avaliação média" },
            { icon: "⚡", value: 2, suffix: " min", label: "Tempo médio" },
          ].map((s) => (
            <motion.div key={s.label} variants={fadeUp} whileHover={{ y: -4 }}>
              <GlowCard customSize glowColor="purple" className="p-6 overflow-hidden group relative">
                <div className="absolute -top-4 -right-4 text-5xl opacity-15 group-hover:opacity-25 transition-opacity">{s.icon}</div>
                <div className="relative">
                  <div className="text-3xl md:text-4xl font-bold tracking-tight">
                    <Counter value={s.value} suffix={s.suffix} />
                  </div>
                  <div className="text-[11px] text-zinc-400 uppercase tracking-wider mt-2 font-semibold">{s.label}</div>
                </div>
              </GlowCard>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* ── Como funciona ── */}
      <motion.section id="como-funciona" className="relative z-10 px-6 py-32 max-w-6xl mx-auto" initial="hidden" whileInView="show" viewport={REVEAL} variants={stagger}>
        <motion.div variants={fadeUp} className="text-center mb-20">
          <p className="text-xs text-fuchsia-300 uppercase tracking-[0.2em] font-semibold mb-3">Como funciona</p>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Do link ao clip em 3 passos.
          </h2>
          <p className="text-zinc-400 mt-4 max-w-xl mx-auto">Não precisa instalar nada, não precisa saber editar. Tudo é automático.</p>
        </motion.div>

        <motion.div variants={stagger} className="grid md:grid-cols-3 gap-6">
          {STEPS.map((s, i) => (
            <motion.div key={s.num} variants={fadeUp}>
              <GlowCard customSize glowColor={i === 0 ? "blue" : i === 1 ? "purple" : "orange"} className="p-8 flex flex-col items-center text-center h-full">
                <div className="relative mb-6">
                  <div className="absolute inset-0 -m-4 rounded-full blur-2xl opacity-50" style={{ background: s.color }} />
                  <div className="relative w-20 h-20 rounded-full border-2 flex items-center justify-center text-2xl"
                    style={{ background: `linear-gradient(135deg,${s.color}25,transparent)`, borderColor: `${s.color}70` }}>
                    {s.icon}
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-bold text-black" style={{ background: s.color }}>
                    {s.num}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2 tracking-tight">{s.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{s.desc}</p>
              </GlowCard>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* ── App Demo (futurista) ── */}
      <motion.section className="relative z-10 px-6 py-24 max-w-6xl mx-auto" initial="hidden" whileInView="show" viewport={REVEAL} variants={stagger}>
        <motion.div variants={fadeUp} className="text-center mb-14">
          <p className="text-xs text-cyan-400 uppercase tracking-[0.2em] font-semibold mb-3">O app por dentro</p>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Interface simples.<br /><span className="bg-gradient-to-r from-cyan-300 to-violet-300 bg-clip-text text-transparent">Resultado profissional.</span>
          </h2>
          <p className="text-zinc-400 mt-4 max-w-lg mx-auto">Cole o link, escolha as opções e deixa a IA fazer o resto. Veja como é fácil.</p>
        </motion.div>

        <motion.div variants={fadeUp} className="relative max-w-4xl mx-auto">
          {/* Glow atrás do frame */}
          <div className="absolute inset-0 -m-10 bg-violet-600/10 rounded-[3rem] blur-3xl pointer-events-none" />
          <div className="absolute inset-0 -m-6 bg-cyan-500/5 rounded-[3rem] blur-2xl pointer-events-none" />

          {/* Browser frame */}
          <div className="relative rounded-2xl overflow-hidden border border-violet-500/25 shadow-[0_0_120px_rgba(168,85,247,0.12),inset_0_1px_0_rgba(255,255,255,0.05)]"
            style={{ background: "linear-gradient(180deg,#0c0c1e 0%,#07071a 100%)" }}>

            {/* Browser top bar */}
            <div className="flex items-center gap-4 px-5 py-3 border-b border-white/[0.06]" style={{ background: "#09091c" }}>
              <div className="flex gap-1.5 flex-shrink-0">
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <div className="w-3 h-3 rounded-full bg-green-500/70" />
              </div>
              {/* URL bar */}
              <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] max-w-xs mx-auto">
                <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                <span className="text-[11px] text-zinc-500 font-mono truncate">viralizacortes.com.br/app</span>
              </div>
              {/* Tab switcher */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {([["config", "⚙️ Configurar"], ["processing", "⚡ Processando"]] as const).map(([id, label]) => (
                  <button key={id} onClick={() => setDemoTab(id)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${demoTab === id
                      ? "bg-violet-500/25 text-violet-200 border border-violet-400/30 shadow-[0_0_10px_rgba(167,139,250,0.2)]"
                      : "text-zinc-500 hover:text-zinc-300"}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Screenshot area */}
            <div className="relative overflow-hidden" style={{ minHeight: 320 }}>
              <AnimatePresence mode="wait">
                <motion.img
                  key={demoTab}
                  src={demoTab === "config" ? "/app-config.png" : "/app-processing.png"}
                  alt={demoTab === "config" ? "App Viraliza — Configuração" : "App Viraliza — Processando"}
                  className="w-full object-cover object-top"
                  style={{ maxHeight: 520, filter: "brightness(1.05) contrast(1.05)" }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                />
              </AnimatePresence>

              {/* Scanline animada */}
              <motion.div
                className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-violet-400/30 to-transparent pointer-events-none"
                animate={{ y: [0, 520] }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              />
              {/* Fade bottom */}
              <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
                style={{ background: "linear-gradient(to top,#07071a,transparent)" }} />
            </div>

            {/* Status bar */}
            <div className="flex items-center justify-between px-5 py-2.5 border-t border-white/[0.04]" style={{ background: "#09091c" }}>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] text-zinc-500 font-mono">Sistema operacional</span>
              </div>
              <div className="flex items-center gap-4 text-[10px] text-zinc-600 font-mono">
                <span>IA v3.2</span>
                <span className="text-violet-500">●</span>
                <span>PT-BR</span>
              </div>
            </div>
          </div>

          {/* Floating badges */}
          <motion.div animate={{ y: [0, -7, 0] }} transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -left-6 top-20 hidden lg:flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border border-violet-500/30 shadow-[0_8px_30px_rgba(168,85,247,0.2)]"
            style={{ background: "rgba(10,10,28,0.95)", backdropFilter: "blur(12px)" }}>
            <span className="text-xl">⚡</span>
            <div><div className="text-xs font-black text-white">Pronto em 2 min</div><div className="text-[10px] text-zinc-500">por hora de vídeo</div></div>
          </motion.div>

          <motion.div animate={{ y: [0, -9, 0] }} transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
            className="absolute -right-6 top-16 hidden lg:flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border border-cyan-500/25 shadow-[0_8px_30px_rgba(34,211,238,0.12)]"
            style={{ background: "rgba(10,10,28,0.95)", backdropFilter: "blur(12px)" }}>
            <span className="text-xl">🤖</span>
            <div><div className="text-xs font-black text-white">IA Brasileira</div><div className="text-[10px] text-zinc-500">PT-BR nativo</div></div>
          </motion.div>

          <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
            className="absolute -right-6 bottom-24 hidden lg:flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border border-emerald-500/25 shadow-[0_8px_30px_rgba(52,211,153,0.12)]"
            style={{ background: "rgba(10,10,28,0.95)", backdropFilter: "blur(12px)" }}>
            <span className="text-xl">✨</span>
            <div><div className="text-xs font-black text-white">Sem marca d'água</div><div className="text-[10px] text-zinc-500">vídeo limpo</div></div>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* ── Features bento ── */}
      <motion.section id="recursos" className="relative z-10 px-6 py-24 max-w-6xl mx-auto" initial="hidden" whileInView="show" viewport={REVEAL} variants={stagger}>
        <motion.div variants={fadeUp} className="text-center mb-14">
          <p className="text-xs text-fuchsia-300 uppercase tracking-[0.2em] font-semibold mb-3">Recursos</p>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Tudo o que você precisa<br /><span className="text-zinc-500">pra viralizar.</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4">
          <motion.div variants={fadeUp} className="md:col-span-2 md:row-span-2">
            <GlowCard customSize glowColor="purple" className="p-8 h-full">
              <div className="w-12 h-12 rounded-xl bg-fuchsia-500/20 text-fuchsia-300 flex items-center justify-center mb-5">{FEATURES[0].icon}</div>
              <h3 className="text-2xl font-bold mb-3">{FEATURES[0].title}</h3>
              <p className="text-zinc-400 text-base leading-relaxed max-w-md">{FEATURES[0].desc}</p>
              <div className="mt-6 flex items-center gap-1">
                {[1,2,3,4,5].map((i) => <Star key={i} className="w-4 h-4 fill-fuchsia-400 text-fuchsia-400" />)}
                <span className="text-sm text-zinc-300 ml-2">4.9 — 287 avaliações</span>
              </div>
            </GlowCard>
          </motion.div>

          {FEATURES.slice(1).map((f, i) => (
            <motion.div key={f.title} variants={fadeUp}>
              <GlowCard customSize glowColor={i % 2 === 0 ? "blue" : "orange"} className="p-7 h-full">
                <div className="w-10 h-10 rounded-lg bg-white/5 text-fuchsia-300 flex items-center justify-center mb-4">{f.icon}</div>
                <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{f.desc}</p>
              </GlowCard>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ── Depoimentos ── */}
      <motion.section className="relative z-10 px-6 py-24 max-w-6xl mx-auto" initial="hidden" whileInView="show" viewport={REVEAL} variants={stagger}>
        <motion.div variants={fadeUp} className="text-center mb-14">
          <p className="text-xs text-fuchsia-300 uppercase tracking-[0.2em] font-semibold mb-3">Depoimentos</p>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Criadores reais.<br /><span className="text-zinc-500">Resultados reais.</span>
          </h2>
        </motion.div>

        <motion.div variants={stagger} className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {TESTIMONIALS.map((t, i) => {
            const Icon = t.platform === "TikTok" ? TikTokIcon : t.platform === "Instagram" ? InstagramIcon : YouTubeIcon;
            const color = t.platform === "TikTok" ? "#fff" : t.platform === "Instagram" ? "#E1306C" : "#FF0000";
            return (
              <motion.div key={t.name} variants={fadeUp}>
                <GlowCard customSize glowColor={i % 2 === 0 ? "purple" : "blue"} className="p-6 flex flex-col h-full">
                  <div className="absolute top-2 right-3 text-7xl font-serif leading-none text-white/[0.04] select-none">&ldquo;</div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${t.grad} flex items-center justify-center text-white font-bold text-sm shadow-lg`}>{t.initials}</div>
                    <div>
                      <div className="text-sm font-semibold">{t.name}</div>
                      <div className="flex items-center gap-1 mt-0.5 text-[11px] text-zinc-500"><span style={{ color }}><Icon size={12} /></span><span>{t.platform}</span></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-4 p-2.5 rounded-lg bg-white/[0.04] border border-white/5">
                    <div className="flex-1 text-center"><div className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold">Antes</div><div className="text-sm font-bold text-zinc-400 mt-0.5">{t.before}</div></div>
                    <div className="text-fuchsia-400">→</div>
                    <div className="flex-1 text-center"><div className="text-[9px] uppercase tracking-wider text-emerald-300 font-bold">Depois</div><div className="text-base font-bold bg-gradient-to-r from-fuchsia-300 to-violet-300 bg-clip-text text-transparent mt-0.5">{t.after}</div></div>
                  </div>
                  <div className="text-[10px] text-zinc-500 text-center mb-3">{t.metric}</div>
                  <div className="flex gap-0.5 mb-3">{[1,2,3,4,5].map((j) => <Star key={j} className="w-3 h-3 fill-yellow-400 text-yellow-400" />)}</div>
                  <p className="text-zinc-300 text-sm leading-relaxed mt-auto">{t.text}</p>
                </GlowCard>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.section>

      {/* ── Pricing + PIX Combinados ── */}
      <motion.section id="planos" className="relative z-10 px-6 py-24 max-w-7xl mx-auto" initial="hidden" whileInView="show" viewport={REVEAL} variants={stagger}>
        <motion.div variants={fadeUp} className="text-center mb-10">
          <p className="text-xs text-fuchsia-300 uppercase tracking-[0.2em] font-semibold mb-3">Planos</p>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Assine ou pague uma vez.
          </h2>
          <p className="text-zinc-400 max-w-xl mx-auto text-base">
            Cada plano tem opção mensal ou <span className="text-green-400 font-semibold">PIX com o dobro de cortes</span> — compare e escolha.
          </p>
        </motion.div>

        {/* Toggle Mensal/Anual */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex items-center gap-1 p-1 rounded-xl border border-white/10 bg-black/30 backdrop-blur-sm">
            {[["Mensal", false], ["Anual", true]].map(([l, v]) => (
              <button key={String(l)} onClick={() => setYearly(v as boolean)}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${yearly === v ? "bg-white text-black" : "text-zinc-400 hover:text-white"}`}>
                {l}
                {v && <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${yearly ? "bg-emerald-500/20 text-emerald-700" : "bg-emerald-500/20 text-emerald-300"}`}>-20%</span>}
              </button>
            ))}
          </div>
        </div>

        <motion.div variants={stagger} className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
          {PLANS.map((plan) => {
            const price = yearly ? plan.yearly : plan.monthly;
            return (
              <motion.div key={plan.name} variants={fadeUp} className="flex flex-col">
                <GlowCard customSize glowColor={plan.glow} className="flex flex-col flex-1 relative overflow-hidden">
                  {/* Linha de destaque no topo do card popular */}
                  {plan.popular && (
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-fuchsia-500 via-violet-400 to-transparent" />
                  )}
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-fuchsia-500 to-violet-500 text-white text-[11px] font-black tracking-widest whitespace-nowrap uppercase shadow-[0_4px_20px_rgba(168,85,247,0.5)]">
                      Mais Popular
                    </div>
                  )}

                  <div className="p-6 flex flex-col flex-1">
                    {/* Plan header — nome impactante */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-white/[0.07] text-fuchsia-300 flex-shrink-0">
                        {plan.icon}
                      </div>
                      <div>
                        <div className="text-[22px] font-black tracking-tight leading-tight">{plan.name}</div>
                        <p className="text-zinc-500 text-[12px] leading-tight">{plan.desc}</p>
                      </div>
                    </div>

                    {/* Features */}
                    <ul className="space-y-2 mb-6 flex-1">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-[13px] text-zinc-300">
                          <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-[3px]" />{f}
                        </li>
                      ))}
                    </ul>

                    {/* Comparação Mensal vs PIX */}
                    <div className="grid grid-cols-2 gap-2.5 border-t border-white/10 pt-5">
                      {/* Assinatura mensal */}
                      <div className="rounded-2xl bg-violet-500/10 border border-violet-500/25 p-4 flex flex-col items-center text-center">
                        <span className="text-[9px] text-violet-400 font-black uppercase tracking-[0.18em] mb-3 block">Mensal</span>
                        <div className="text-[28px] font-black tracking-tight leading-none">R${price.toString().replace(".", ",")}</div>
                        <div className="text-[11px] text-zinc-500 mt-1">/mês</div>
                        <div className="text-[13px] text-violet-300 mt-2 mb-4 font-bold">{plan.monthlyCortes} cortes</div>
                        {yearly && <div className="text-[10px] text-emerald-400 -mt-2 mb-2 font-semibold">-20% off</div>}
                        <a href={plan.href} target="_blank" rel="noopener noreferrer"
                          className={`mt-auto w-full py-2 rounded-xl text-[12px] font-bold text-center block transition-all ${plan.popular
                            ? "bg-gradient-to-r from-fuchsia-500 to-violet-500 text-white shadow-[0_4px_20px_rgba(168,85,247,0.35)]"
                            : "bg-violet-500/20 text-violet-300 hover:bg-violet-500/30"}`}>
                          Assinar →
                        </a>
                      </div>

                      {/* PIX único */}
                      <div className="rounded-2xl bg-green-500/10 border border-green-500/25 p-4 flex flex-col items-center text-center relative">
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] bg-green-500 text-black font-black px-2.5 py-0.5 rounded-full whitespace-nowrap">2× CORTES</span>
                        <span className="text-[9px] text-green-400 font-black uppercase tracking-[0.18em] mb-3 mt-1 block">PIX Único</span>
                        <div className="text-[28px] font-black tracking-tight leading-none">R${plan.monthly.toString().replace(".", ",")}</div>
                        <div className="text-[11px] text-zinc-500 mt-1">único</div>
                        <div className="text-[13px] text-green-300 mt-2 mb-4 font-bold">{plan.pixCredits} créditos</div>
                        <a href={plan.pixHref} target="_blank" rel="noopener noreferrer"
                          className="mt-auto w-full py-2 rounded-xl text-[12px] font-bold bg-green-500/20 text-green-300 hover:bg-green-500/30 transition-all text-center block border border-green-500/20">
                          Pagar PIX →
                        </a>
                      </div>
                    </div>
                  </div>
                </GlowCard>
              </motion.div>
            );
          })}
        </motion.div>

        <p className="text-center text-xs text-zinc-500 mt-6">
          Assinatura: 7 dias de garantia · Cancele quando quiser &nbsp;·&nbsp; PIX: créditos não expiram · acumule quando quiser
        </p>

        {/* Créditos extras */}
        <motion.div variants={fadeUp} className="mt-20 max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-400/30 bg-amber-500/10 mb-4">
            <span className="text-lg">⚡</span>
            <span className="text-xs font-bold tracking-wider text-amber-200 uppercase">Acabaram os cortes do mês?</span>
          </div>
          <p className="text-zinc-400 text-sm mb-8">Compre créditos extras a qualquer momento, sem trocar de plano.</p>
          <div className="grid grid-cols-3 gap-3 max-w-xl mx-auto">
            {[{ clips: "10 cortes", price: "R$15", icon: "🔋" }, { clips: "25 cortes", price: "R$30", icon: "⚡" }, { clips: "50 cortes", price: "R$50", icon: "🚀" }].map((p) => (
              <motion.div key={p.clips} whileHover={{ y: -4 }}>
                <GlowCard customSize glowColor="orange" className="p-5 text-center cursor-pointer">
                  <div className="text-3xl mb-2">{p.icon}</div>
                  <div className="text-xl font-bold">{p.price}</div>
                  <div className="text-xs text-zinc-500 mt-1">{p.clips}</div>
                </GlowCard>
              </motion.div>
            ))}
          </div>
          <p className="text-[11px] text-zinc-600 mt-5">Disponíveis para compra dentro da plataforma após o login</p>
        </motion.div>
      </motion.section>

      {/* ── FAQ ── */}
      <motion.section id="faq" className="relative z-10 px-6 py-24 max-w-3xl mx-auto" initial="hidden" whileInView="show" viewport={REVEAL} variants={stagger}>
        <motion.div variants={fadeUp} className="text-center mb-12">
          <p className="text-xs text-fuchsia-300 uppercase tracking-[0.2em] font-semibold mb-3">Perguntas frequentes</p>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">Ainda tem dúvida?</h2>
        </motion.div>
        <motion.div variants={stagger} className="space-y-2">
          {FAQS.map((faq, i) => {
            const open = openFaq === i;
            return (
              <motion.div key={faq.q} variants={fadeUp}>
                <GlowCard customSize glowColor="purple" className="overflow-hidden">
                  <button onClick={() => setOpenFaq(open ? null : i)} className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left">
                    <span className="font-semibold text-base">{faq.q}</span>
                    <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronDown className="w-5 h-5 text-zinc-500" />
                    </motion.div>
                  </button>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                        <div className="px-6 pb-5 text-zinc-400 text-sm leading-relaxed">{faq.a}</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </GlowCard>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.section>

      {/* ── CTA final ── */}
      <motion.section className="relative z-10 px-6 py-32" initial="hidden" whileInView="show" viewport={REVEAL} variants={stagger}>
        <motion.div variants={fadeUp} className="max-w-4xl mx-auto text-center p-12 md:p-20 rounded-3xl relative overflow-hidden"
          style={{ background: "linear-gradient(135deg,rgba(217,70,239,0.12) 0%,rgba(168,85,247,0.06) 50%,rgba(34,211,238,0.08) 100%)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <motion.div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-fuchsia-500/20 rounded-full blur-3xl pointer-events-none"
            animate={{ x: [0, 40, 0], y: [0, 30, 0] }} transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }} />
          <motion.div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-violet-500/20 rounded-full blur-3xl pointer-events-none"
            animate={{ x: [0, -50, 0], y: [0, -30, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }} />

          <div className="relative">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/10 mb-8">
              <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" /></span>
              <span className="text-xs font-semibold text-emerald-200">23 criadores começaram hoje</span>
            </div>

            <h2 className="text-5xl md:text-7xl font-extrabold tracking-[-0.04em] mb-6 leading-[1.0]">
              Pronto pra<br />
              <span className="bg-gradient-to-r from-fuchsia-300 via-pink-300 to-violet-300 bg-clip-text text-transparent">viralizar?</span>
            </h2>
            <p className="text-zinc-300 text-lg md:text-xl max-w-xl mx-auto mb-10">
              10 cortes grátis no primeiro mês.<br className="md:hidden" />
              <span className="text-zinc-500"> Sem cartão. Sem cadastro chato.</span>
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <MagneticButton distance={0.35}>
                <Link href="/app" className="inline-flex items-center gap-2 px-9 py-4 rounded-xl bg-white text-black font-bold text-base shadow-[0_15px_60px_-10px_rgba(255,255,255,0.6)] hover:scale-[1.03] transition-transform">
                  Começar agora — é grátis →
                </Link>
              </MagneticButton>
              <a href="#planos" className="text-sm text-zinc-400 hover:text-white transition-colors font-medium">Ver planos →</a>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-5 text-xs text-zinc-500">
              <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> Garantia 7 dias</span>
              <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> Pix, cartão ou boleto</span>
              <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> Cancele com 1 clique</span>
            </div>
          </div>
        </motion.div>
      </motion.section>

      {/* ── Footer ── */}
      <footer className="relative z-10 px-6 pt-16 pb-10 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Image src="/logo-viraliza-cortes.png" alt="Viraliza Cortes" width={28} height={28} className="rounded-md" />
              <span className="font-bold text-sm">Viraliza Cortes</span>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed">IA 100% brasileira pra transformar vídeos longos em cortes virais.</p>
          </div>
          {[
            { title: "Produto", links: [["Recursos","#recursos"],["Planos","#planos"],["Como funciona","#como-funciona"]] },
            { title: "Empresa", links: [["Blog","/blog"],["Contato","mailto:contato@viralizacortes.com.br"],["FAQ","#faq"]] },
            { title: "Legal", links: [["Privacidade","/privacidade"],["Excluir conta","/excluir-conta"]] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-xs uppercase tracking-wider text-zinc-500 font-bold mb-3">{col.title}</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                {col.links.map(([l, h]) => <li key={l}><a href={h} className="hover:text-white transition-colors">{l}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="max-w-6xl mx-auto mt-12 pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-zinc-600">© 2026 Viraliza Cortes. Feito no Brasil 🇧🇷</p>
          <p className="text-xs text-zinc-500">Preview /v2 — com ShaderBackground + GlowCard + Syne + Space Grotesk</p>
        </div>
      </footer>
    </div>
  );
}
