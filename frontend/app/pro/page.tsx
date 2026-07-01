"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import {
  Sparkles,
  Zap,
  Crown,
  Building2,
  Check,
  Play,
  Languages,
  Wand2,
  Layers,
  Download,
  Bot,
  Palette,
  ChevronDown,
  Star,
} from "lucide-react";
import { MagneticButton } from "@/components/ui/magnetic-button";

// ───────────── Brand icons (mesmos do site original) ─────────────
const TikTokIcon = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.77a4.85 4.85 0 0 1-1.01-.08z" />
  </svg>
);
const InstagramIcon = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 0C8.74 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 3.252.148 4.771 1.691 4.919 4.919.049 1.265.064 1.645.064 4.849 0 3.205-.015 3.585-.074 4.85-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
  </svg>
);
const YouTubeIcon = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.54 3.5 12 3.5 12 3.5s-7.54 0-9.38.55A3.02 3.02 0 0 0 .5 6.19 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.81 3.02 3.02 0 0 0 2.12 2.14C4.46 20.5 12 20.5 12 20.5s7.54 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.81zM9.75 15.5V8.5l6.5 3.5-6.5 3.5z" />
  </svg>
);
const FacebookIcon = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073C24 5.446 18.627 0 12 0S0 5.446 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047v-2.66c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97H15.83c-1.491 0-1.956.932-1.956 1.888v2.264h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
  </svg>
);

const REVEAL = { once: true, amount: 0.2 } as const;
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } },
};
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

// ───────────── Dados ─────────────
const PLANS = [
  {
    name: "Starter",
    monthly: 29.9,
    yearly: 23.92,
    icon: <Sparkles className="w-5 h-5" />,
    desc: "Pra começar a crescer",
    href: "https://viralizacortes.carrinho.app/one-checkout/ocmtb/36710557",
    cta: "Assinar Starter",
    features: [
      "35 cortes por mês",
      "Sem marca d'água",
      "TikTok + Reels + Shorts",
      "8 estilos de legenda",
      "Histórico de projetos",
    ],
  },
  {
    name: "Pro",
    monthly: 49.9,
    yearly: 39.92,
    icon: <Zap className="w-5 h-5" />,
    desc: "Pra criadores sérios",
    href: "https://viralizacortes.carrinho.app/one-checkout/ocmtb/36710590",
    cta: "Quero o Pro",
    popular: true,
    features: [
      "60 cortes por mês",
      "Tudo do Starter",
      "IA escolhe os mais virais",
      "Check-in diário (+créditos)",
      "Suporte prioritário",
    ],
  },
  {
    name: "Full",
    monthly: 99.9,
    yearly: 79.92,
    icon: <Crown className="w-5 h-5" />,
    desc: "Pra quem quer escalar",
    href: "https://viralizacortes.carrinho.app/one-checkout/ocmtb/36711838",
    cta: "Assinar Full",
    features: [
      "120 cortes por mês",
      "Tudo do Pro",
      "IA avançada de viralização",
      "Brand Kit personalizado",
      "Suporte VIP",
    ],
  },
  {
    name: "Agência",
    monthly: 150,
    yearly: 120,
    icon: <Building2 className="w-5 h-5" />,
    desc: "Pra equipes e agências",
    href: "https://viralizacortes.carrinho.app/one-checkout/ocmtb/36711896",
    cta: "Falar com vendas",
    features: [
      "200 cortes por mês",
      "Tudo do Full",
      "Múltiplos clientes",
      "API de integração",
      "Suporte VIP dedicado",
    ],
  },
];

const FEATURES = [
  {
    title: "IA brasileira treinada",
    desc: "Nossa IA foi treinada com português brasileiro — entende gírias, contextos e o que viraliza no Brasil.",
    icon: <Bot className="w-6 h-6" />,
    size: "lg",
  },
  {
    title: "Legendas TikTok automáticas",
    desc: "Gravadas no vídeo em 8 estilos.",
    icon: <Languages className="w-6 h-6" />,
  },
  {
    title: "Sem marca d'água",
    desc: "Vídeo limpo, pronto pra postar.",
    icon: <Wand2 className="w-6 h-6" />,
  },
  {
    title: "9:16 vertical perfeito",
    desc: "Reframing automático centrado no rosto.",
    icon: <Layers className="w-6 h-6" />,
  },
  {
    title: "Brand Kit",
    desc: "Logo, cores e fontes da sua marca em cada corte.",
    icon: <Palette className="w-6 h-6" />,
  },
  {
    title: "Exporta em segundos",
    desc: "Download direto ou publicação automática.",
    icon: <Download className="w-6 h-6" />,
  },
];

type Step = {
  num: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
  accentColor: string;
};

const STEPS: Step[] = [
  {
    num: "01",
    title: "Cole o link do YouTube",
    desc: "Funciona com qualquer vídeo público — podcasts, lives, aulas.",
    icon: <span className="text-xl">🔗</span>,
    accentColor: "#22D3EE",
  },
  {
    num: "02",
    title: "Nossa IA analisa",
    desc: "Identifica os melhores momentos, picos de retenção e ganchos.",
    icon: <Bot className="w-5 h-5" />,
    accentColor: "#D946EF",
  },
  {
    num: "03",
    title: "Receba os cortes prontos",
    desc: "Formato 9:16, legendas, sem marca d'água. Baixe e poste.",
    icon: <Download className="w-5 h-5" />,
    accentColor: "#A855F7",
  },
];

type Testimonial = {
  name: string;
  platform: "TikTok" | "Instagram" | "YouTube";
  before: string;
  after: string;
  metric: string;
  text: string;
  avatarBg: string;
  initials: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    name: "@cariocando",
    platform: "TikTok",
    before: "12K",
    after: "280K",
    metric: "seguidores em 3 meses",
    text: "Saí de 12K pra 280K em 3 meses postando os cortes. É absurdo o quanto economiza tempo.",
    avatarBg: "from-cyan-400 to-pink-500",
    initials: "CR",
  },
  {
    name: "@marketing.real",
    platform: "Instagram",
    before: "R$2.000",
    after: "R$50",
    metric: "que pagava de editor",
    text: "Antes eu pagava editor R$2k/mês. Agora gasto R$50 e tenho mais clipes que conseguia editar.",
    avatarBg: "from-pink-400 to-fuchsia-600",
    initials: "MR",
  },
  {
    name: "@podcast.cast",
    platform: "YouTube",
    before: "0",
    after: "156K",
    metric: "inscritos do zero",
    text: "Cortes de podcast longo viram virais sozinhos. A IA acha os momentos certos.",
    avatarBg: "from-red-400 to-orange-500",
    initials: "PC",
  },
  {
    name: "@guru.financas",
    platform: "Instagram",
    before: "1h/dia",
    after: "1h/semana",
    metric: "editando vídeos",
    text: "Em 1 hora gero conteúdo pra semana inteira. Não vivo mais sem.",
    avatarBg: "from-violet-400 to-fuchsia-600",
    initials: "GF",
  },
];

const FAQS = [
  { q: "Funciona com qualquer vídeo do YouTube?", a: "Sim, qualquer vídeo público. Inclusive podcasts longos, lives e webinars de várias horas." },
  { q: "As legendas são em português?", a: "Sim, 100% PT-BR. Nossa IA foi treinada com português brasileiro real e entende gírias." },
  { q: "Posso cancelar quando quiser?", a: "Sim. Cancele com 1 clique a qualquer momento, sem multa. Garantia de 7 dias em todos os planos." },
  { q: "Quanto tempo demora pra gerar?", a: "Em média 2 a 5 minutos por hora de vídeo. Para um vídeo de 30 minutos, seus cortes ficam prontos em ~2 minutos." },
  { q: "Preciso saber editar?", a: "Não. Tudo é automático. Cole o link, espere a IA processar e baixe os cortes prontos." },
  { q: "Quantos cortes vou conseguir gerar?", a: "Depende do vídeo. Em média, um vídeo de 1h gera de 8 a 15 cortes virais." },
];

const STATS = [
  { value: "1.247", label: "criadores ativos" },
  { value: "73K+", label: "cortes gerados" },
  { value: "4.9", label: "avaliação média" },
  { value: "2 min", label: "tempo médio" },
];

// ───────────── Componente: Showcase de cortes verticais 9:16 ─────────────
type Corte = {
  bg: string;
  caption: string;
  captionColor: string;
  views: string;
  likes: string;
  platform: "TikTok" | "Reels" | "Shorts";
  score: number;
  audio: string;
  rotate: number;
  scale: number;
  zIndex: number;
};

const CORTES: Corte[] = [
  {
    // Lateral esquerdo
    bg: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=720&fit=crop&q=80&auto=format",
    caption: "ELES NÃO QUEREM\nQUE VOCÊ SAIBA",
    captionColor: "#FBBF24",
    views: "892K",
    likes: "47.2K",
    platform: "Reels",
    score: 9.1,
    audio: "Original • Reels",
    rotate: -8,
    scale: 0.78,
    zIndex: 1,
  },
  {
    // Centro — principal
    bg: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=540&h=960&fit=crop&q=85&auto=format",
    caption: "100M DE PESSOAS\nDEPENDEM\nFINANCEIRAMENTE",
    captionColor: "#FFFFFF",
    views: "1.2M",
    likes: "234K",
    platform: "TikTok",
    score: 9.8,
    audio: "Som Original • Viral",
    rotate: 0,
    scale: 1,
    zIndex: 3,
  },
  {
    // Lateral direito
    bg: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=720&fit=crop&q=80&auto=format",
    caption: "O SEGREDO\nDOS RICOS",
    captionColor: "#22D3EE",
    views: "634K",
    likes: "28.9K",
    platform: "Shorts",
    score: 8.7,
    audio: "Trending • YT Shorts",
    rotate: 8,
    scale: 0.78,
    zIndex: 1,
  },
];

function VerticalClipCard({ corte, index }: { corte: Corte; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: corte.scale * 0.9 }}
      animate={{ opacity: 1, y: 0, scale: corte.scale, rotate: corte.rotate }}
      transition={{ duration: 0.9, delay: 0.7 + index * 0.15, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: corte.scale * 1.04, rotate: 0, zIndex: 10, transition: { duration: 0.4 } }}
      style={{ zIndex: corte.zIndex }}
      className="relative w-[230px] sm:w-[260px] md:w-[280px] aspect-[9/16] rounded-[2rem] overflow-hidden shadow-[0_30px_80px_-20px_rgba(168,85,247,0.5)] border-[3px] border-white/10 flex-shrink-0"
    >
      {/* Background image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={corte.bg} alt="" className="absolute inset-0 w-full h-full object-cover" />
      {/* Dark vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80" />

      {/* Top status bar mock */}
      <div className="absolute top-3 left-4 right-4 flex justify-between items-center text-white text-[10px] font-semibold tracking-tight">
        <span>9:41</span>
        <div className="flex items-center gap-1.5">
          <span>•••</span>
          <div className="w-5 h-2.5 border border-white rounded-sm flex items-center px-px">
            <div className="w-3 h-full bg-white rounded-[1px]" />
          </div>
        </div>
      </div>

      {/* Score badge */}
      <div className="absolute top-10 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-fuchsia-500 to-violet-500 text-white text-[10px] font-bold shadow-lg">
        <Star className="w-2.5 h-2.5 fill-white" />
        {corte.score}/10
      </div>

      {/* Platform badge */}
      <div className="absolute top-10 left-3 px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold border border-white/15">
        {corte.platform}
      </div>

      {/* TikTok-style caption — palavra por palavra animada */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-2 text-center font-black tracking-tight leading-tight"
        style={{
          color: corte.captionColor,
          fontFamily: "'Arial Black', sans-serif",
          fontSize: "1.5rem",
          textShadow: "0 0 1px #000, 0 0 1px #000, 0 4px 12px rgba(0,0,0,0.9), 2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000",
          WebkitTextStroke: "1px black",
        }}
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
      >
        {corte.caption.split("\n").map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </motion.div>

      {/* Right side actions */}
      <div className="absolute right-3 bottom-24 flex flex-col items-center gap-4 text-white">
        <div className="flex flex-col items-center">
          <div className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 flex items-center justify-center">
            <span className="text-base">❤️</span>
          </div>
          <span className="text-[10px] font-bold mt-1 drop-shadow">{corte.likes}</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 flex items-center justify-center">
            <span className="text-base">💬</span>
          </div>
          <span className="text-[10px] font-bold mt-1 drop-shadow">{(parseFloat(corte.likes) * 0.07).toFixed(1)}K</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 flex items-center justify-center">
            <span className="text-base">📤</span>
          </div>
        </div>
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-3 left-3 right-16 text-white">
        <div className="text-[11px] font-bold mb-1 flex items-center gap-1.5">
          <span className="opacity-90">@viralizacortes</span>
          <span className="px-1.5 py-px rounded-sm bg-white/15 text-[8px] font-semibold tracking-wide">SEGUIR</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] opacity-80">
          <span>👁</span>
          <span className="font-semibold">{corte.views} views</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] opacity-80 mt-0.5">
          <motion.span animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}>🎵</motion.span>
          <span className="font-medium truncate">{corte.audio}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/15">
        <motion.div
          className="h-full bg-white"
          animate={{ width: ["0%", "100%"] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear", delay: index * 0.5 }}
        />
      </div>
    </motion.div>
  );
}

function ProductMockup() {
  return (
    <div className="relative mx-auto max-w-5xl">
      {/* Glow externo */}
      <div className="absolute inset-0 -m-12 rounded-[4rem] bg-gradient-to-br from-fuchsia-500/25 via-violet-500/20 to-cyan-500/15 blur-3xl" />

      {/* Floating label "Gerados pela IA em 2:14" */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6, duration: 0.6 }}
        className="relative z-10 mx-auto mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 bg-white/[0.04] backdrop-blur-md shadow-lg"
      >
        <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" />
        <span className="text-xs font-medium text-white">
          <span className="text-fuchsia-300 font-semibold">3 cortes</span> gerados pela IA em
          <span className="text-fuchsia-300 font-semibold"> 2 minutos</span>
        </span>
      </motion.div>

      {/* Grid de cortes verticais */}
      <div className="relative flex justify-center items-end gap-3 sm:gap-6 md:gap-8 px-4 py-6">
        {CORTES.map((corte, i) => (
          <VerticalClipCard key={i} corte={corte} index={i} />
        ))}
      </div>

      {/* Linha de plataformas — com ícones reais maiores */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.9, duration: 0.8 }}
        className="relative mt-12"
      >
        <p className="text-center text-[11px] font-semibold tracking-[0.25em] uppercase text-zinc-500 mb-5">
          Exporta direto para
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
          {[
            { name: "TikTok", color: "#fff", bg: "rgba(255,255,255,0.06)", Icon: TikTokIcon },
            { name: "Instagram Reels", color: "#E1306C", bg: "rgba(225,48,108,0.1)", Icon: InstagramIcon },
            { name: "YouTube Shorts", color: "#FF0000", bg: "rgba(255,0,0,0.1)", Icon: YouTubeIcon },
            { name: "Facebook", color: "#1877F2", bg: "rgba(24,119,242,0.1)", Icon: FacebookIcon },
          ].map(({ name, color, bg, Icon }) => (
            <motion.div
              key={name}
              whileHover={{ y: -3, scale: 1.05 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-white/10 backdrop-blur-sm"
              style={{ background: bg }}
            >
              <span style={{ color }}>
                <Icon size={22} />
              </span>
              <span className="text-base md:text-lg font-bold tracking-tight" style={{ color }}>
                {name}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// ───────────── Sticker flutuante (hero) ─────────────
interface StickerProps {
  text: string;
  color: string;
  position: string;
  rotate: number;
  delay: number;
  duration: number;
  mono?: boolean;
}
function Sticker({ text, color, position, rotate, delay, duration, mono }: StickerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, rotate: rotate - 20 }}
      animate={{ opacity: 1, scale: 1, rotate }}
      transition={{ duration: 0.7, delay, type: "spring", stiffness: 120, damping: 12 }}
      className={`absolute ${position} z-10 hidden sm:block select-none pointer-events-none`}
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration, repeat: Infinity, ease: "easeInOut" }}
        className={`px-3 py-1.5 rounded-xl border backdrop-blur-md text-xs md:text-sm font-bold whitespace-nowrap shadow-[0_8px_25px_-5px] ${mono ? "font-mono" : ""}`}
        style={{
          background: `${color}26`,
          borderColor: `${color}66`,
          color,
          boxShadow: `0 8px 25px -5px ${color}50`,
        }}
      >
        {text}
      </motion.div>
    </motion.div>
  );
}

// ───────────── Stats com contador animado ─────────────
function AnimatedNumber({ value, suffix = "", duration = 2 }: { value: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (v) =>
    value >= 1000 ? Math.round(v).toLocaleString("pt-BR") : v.toFixed(1).replace(".", ","),
  );

  useEffect(() => {
    if (inView) {
      const controls = animate(motionValue, value, { duration, ease: [0.22, 1, 0.36, 1] });
      return controls.stop;
    }
  }, [inView, value, duration, motionValue]);

  return (
    <span ref={ref}>
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  );
}

const STAT_CARDS = [
  { icon: "👥", value: 1247, suffix: "", label: "Criadores ativos" },
  { icon: "✂️", value: 73000, suffix: "+", label: "Cortes gerados" },
  { icon: "⭐", value: 4.9, suffix: "", label: "Avaliação média" },
  { icon: "⚡", value: 2, suffix: " min", label: "Tempo médio" },
];

function SocialProofSection() {
  return (
    <motion.section
      className="relative z-10 px-6 pt-24 pb-12 max-w-6xl mx-auto"
      initial="hidden"
      whileInView="show"
      viewport={REVEAL}
      variants={stagger}
    >
      <motion.p variants={fadeUp} className="text-center text-xs text-zinc-500 uppercase tracking-[0.25em] font-semibold mb-12">
        Usado por +1.200 criadores brasileiros
      </motion.p>
      <motion.div variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {STAT_CARDS.map((s) => (
          <motion.div
            key={s.label}
            variants={fadeUp}
            whileHover={{ y: -4 }}
            className="relative p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.01] backdrop-blur-sm overflow-hidden group"
          >
            <div className="absolute -top-4 -right-4 text-5xl opacity-15 group-hover:opacity-25 transition-opacity">{s.icon}</div>
            <div className="relative">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent tracking-tight">
                <AnimatedNumber value={s.value} suffix={s.suffix} />
              </div>
              <div className="text-[11px] text-zinc-500 uppercase tracking-wider mt-2 font-semibold">{s.label}</div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  );
}

// ───────────── Pricing Card ─────────────
function PricingCard({ plan, yearly }: { plan: typeof PLANS[number]; yearly: boolean }) {
  const price = yearly ? plan.yearly : plan.monthly;
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className={`relative rounded-2xl p-7 flex flex-col ${
        plan.popular
          ? "bg-gradient-to-b from-fuchsia-500/15 to-violet-500/5 border border-fuchsia-400/30 shadow-[0_30px_80px_-20px_rgba(217,70,239,0.4)]"
          : "bg-white/[0.03] border border-white/10"
      }`}
    >
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-fuchsia-500 to-violet-500 text-white text-xs font-bold tracking-wider whitespace-nowrap">
          MAIS POPULAR
        </div>
      )}
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${plan.popular ? "bg-fuchsia-500/20 text-fuchsia-300" : "bg-white/5 text-zinc-400"}`}>
          {plan.icon}
        </div>
        <span className="text-sm font-semibold tracking-tight">{plan.name}</span>
      </div>

      <p className="text-zinc-500 text-sm mb-5">{plan.desc}</p>

      <div className="mb-6">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold tracking-tight">
            R${price.toString().replace(".", ",")}
          </span>
          <span className="text-zinc-500 text-sm">/mês</span>
        </div>
        {yearly && (
          <p className="text-xs text-emerald-400 mt-1">
            R${(plan.monthly - plan.yearly).toFixed(2).replace(".", ",")} de desconto
          </p>
        )}
      </div>

      <ul className="space-y-2.5 mb-7 flex-1">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-zinc-300">
            <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <MagneticButton distance={0.2}>
        <a
          href={plan.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`block text-center py-3 rounded-xl font-semibold text-sm transition-all ${
            plan.popular
              ? "bg-gradient-to-r from-fuchsia-500 to-violet-500 text-white hover:shadow-[0_10px_40px_-10px_rgba(217,70,239,0.7)]"
              : "bg-white/5 border border-white/10 text-white hover:bg-white/10"
          }`}
        >
          {plan.cta}
        </a>
      </MagneticButton>
    </motion.div>
  );
}

// ───────────── Página ─────────────
export default function ProPage() {
  const [yearly, setYearly] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-[#050507] text-white overflow-x-hidden font-sans antialiased">
      {/* Background glows finos */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-300px] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-fuchsia-500/15 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] left-[-300px] w-[600px] h-[600px] bg-violet-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[20%] right-[-200px] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px]" />
      </div>

      {/* NAV */}
      <nav className="relative z-50 sticky top-0 backdrop-blur-xl bg-[#050507]/80 border-b border-white/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3.5">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo-viraliza-cortes.png" alt="Viraliza Cortes" width={36} height={36} className="rounded-lg" />
            <span className="font-bold text-base hidden sm:block">Viraliza Cortes</span>
          </Link>
          <div className="hidden md:flex items-center gap-7">
            {[
              { l: "Recursos", h: "#recursos" },
              { l: "Como funciona", h: "#como-funciona" },
              { l: "Planos", h: "#planos" },
              { l: "FAQ", h: "#faq" },
            ].map((i) => (
              <a key={i.l} href={i.h} className="text-sm text-zinc-400 hover:text-white transition-colors">
                {i.l}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link href="/entrar" className="text-sm text-zinc-400 hover:text-white hidden sm:block">
              Entrar
            </Link>
            <MagneticButton distance={0.2}>
              <Link href="/app" className="px-4 py-2 rounded-lg bg-gradient-to-r from-fuchsia-500 to-violet-500 text-white text-sm font-semibold">
                Começar grátis
              </Link>
            </MagneticButton>
          </div>
        </div>
      </nav>

      {/* ━━━━━━━━━━━━━━━━ HERO ━━━━━━━━━━━━━━━━ */}
      <section className="relative z-10 px-6 pt-20 pb-12 max-w-6xl mx-auto text-center">

        {/* Timeline lines decorativas no fundo do hero (referência a régua de vídeo) */}
        <div className="absolute inset-x-0 top-32 bottom-0 -z-10 overflow-hidden pointer-events-none">
          <svg className="absolute inset-0 w-full h-full opacity-[0.07]" viewBox="0 0 1200 600" preserveAspectRatio="none" aria-hidden="true">
            {/* Linhas verticais — timeline */}
            {Array.from({ length: 60 }).map((_, i) => (
              <line
                key={i}
                x1={i * 20}
                x2={i * 20}
                y1="0"
                y2={i % 5 === 0 ? "32" : "16"}
                stroke="white"
                strokeWidth="1"
              />
            ))}
            {/* Linha horizontal régua */}
            <line x1="0" x2="1200" y1="0" y2="0" stroke="white" strokeWidth="1" opacity="0.5" />
          </svg>
        </div>

        {/* Badge IA 100% Brasileira com bandeira mini */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-sm mb-8"
        >
          {/* Mini bandeira BR */}
          <svg width="18" height="13" viewBox="0 0 18 13" aria-hidden="true" className="rounded-sm overflow-hidden flex-shrink-0">
            <rect width="18" height="13" fill="#009C3B" />
            <polygon points="9,1.5 16.5,6.5 9,11.5 1.5,6.5" fill="#FFDF00" />
            <circle cx="9" cy="6.5" r="2.8" fill="#002776" />
            <path d="M 6.5 6.8 Q 9 4.5 11.5 6.8" stroke="white" strokeWidth="0.6" fill="none" />
          </svg>
          <span className="text-xs font-semibold text-zinc-200 tracking-wide">IA 100% Brasileira</span>
          <span className="w-1 h-1 rounded-full bg-fuchsia-400 animate-pulse" />
        </motion.div>

        {/* Container do título com stickers ao redor */}
        <div className="relative inline-block">

          {/* Stickers flutuantes em volta do título */}
          <Sticker
            text="✂️ Corte #1"
            color="#00C896"
            position="top-2 -left-12 md:-left-32"
            rotate={-8}
            delay={1.2}
            duration={3.5}
          />
          <Sticker
            text="🔥 VIRAL"
            color="#FF6B35"
            position="-top-4 -right-6 md:-right-24"
            rotate={10}
            delay={1.5}
            duration={4}
          />
          <Sticker
            text="9:16"
            color="#22D3EE"
            position="top-32 -left-8 md:-left-40"
            rotate={-12}
            delay={1.8}
            duration={3.2}
            mono
          />
          <Sticker
            text="▶ 1.2M views"
            color="#D946EF"
            position="bottom-8 -right-10 md:-right-36"
            rotate={6}
            delay={2.1}
            duration={3.8}
          />
          <Sticker
            text="100% PT-BR 🇧🇷"
            color="#A855F7"
            position="-bottom-2 -left-6 md:-left-28"
            rotate={-6}
            delay={2.4}
            duration={3.6}
          />

          <motion.h1
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
            }}
            className="relative text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-bold tracking-[-0.04em] leading-[1.02] mb-6"
          >
            <motion.span variants={fadeUp} className="inline-block">1</motion.span>{" "}
            <motion.span variants={fadeUp} className="inline-block">link.</motion.span>
            <br />
            <motion.span variants={fadeUp} className="inline-block bg-gradient-to-r from-fuchsia-300 via-pink-300 to-violet-300 bg-clip-text text-transparent">
              Dezenas
            </motion.span>{" "}
            <motion.span variants={fadeUp} className="inline-block bg-gradient-to-r from-fuchsia-300 via-pink-300 to-violet-300 bg-clip-text text-transparent">
              de
            </motion.span>{" "}
            <motion.span variants={fadeUp} className="inline-block bg-gradient-to-r from-fuchsia-300 via-pink-300 to-violet-300 bg-clip-text text-transparent">
              cortes
            </motion.span>{" "}
            <motion.span variants={fadeUp} className="inline-block bg-gradient-to-r from-fuchsia-300 via-pink-300 to-violet-300 bg-clip-text text-transparent">
              virais.
            </motion.span>
          </motion.h1>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Cole o link do YouTube. Nossa IA brasileira identifica os melhores momentos, corta no 9:16,
          adiciona legendas e entrega pronto para TikTok, Reels e Shorts. Em menos de 3 minutos.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6"
        >
          <MagneticButton distance={0.35}>
            <Link
              href="/app"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white text-black font-semibold text-base shadow-[0_10px_40px_-10px_rgba(255,255,255,0.5)] hover:scale-[1.02] transition-transform"
            >
              Comece grátis <span aria-hidden>→</span>
            </Link>
          </MagneticButton>
          <a href="#como-funciona" className="text-zinc-400 hover:text-white text-sm font-medium transition-colors">
            Ver como funciona ↓
          </a>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-xs text-zinc-500"
        >
          Sem cartão de crédito · 10 cortes grátis no primeiro mês
        </motion.p>

        {/* MOCKUP DO PRODUTO */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mt-20"
        >
          <ProductMockup />
        </motion.div>
      </section>

      {/* ━━━━━━━━━━━━━━━━ SOCIAL PROOF (stats com contador) ━━━━━━━━━━━━━━━━ */}
      <SocialProofSection />

      {/* ━━━━━━━━━━━━━━━━ COMO FUNCIONA (steps com linha conectora) ━━━━━━━━━━━━━━━━ */}
      <motion.section
        id="como-funciona"
        className="relative z-10 px-6 py-32 max-w-6xl mx-auto"
        initial="hidden"
        whileInView="show"
        viewport={REVEAL}
        variants={stagger}
      >
        <motion.div variants={fadeUp} className="text-center mb-20">
          <p className="text-xs text-fuchsia-400 uppercase tracking-[0.2em] font-semibold mb-3">Como funciona</p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Do link ao clip em 3 passos.
          </h2>
          <p className="text-zinc-500 mt-4 max-w-xl mx-auto">
            Não precisa instalar nada, não precisa saber editar. Tudo é automático.
          </p>
        </motion.div>

        {/* Linha conectora desktop */}
        <div className="relative">
          <svg
            className="absolute top-12 left-[16%] right-[16%] hidden md:block z-0 pointer-events-none"
            viewBox="0 0 100 4"
            preserveAspectRatio="none"
            style={{ height: 2 }}
          >
            <defs>
              <linearGradient id="connector-grad" x1="0%" x2="100%">
                <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.5" />
                <stop offset="50%" stopColor="#D946EF" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#A855F7" stopOpacity="0.5" />
              </linearGradient>
            </defs>
            <motion.path
              d="M 0 2 L 100 2"
              stroke="url(#connector-grad)"
              strokeWidth="0.4"
              strokeDasharray="2 1.5"
              fill="none"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={REVEAL}
              transition={{ duration: 1.8, ease: "easeInOut", delay: 0.3 }}
            />
          </svg>

          <motion.div variants={stagger} className="grid md:grid-cols-3 gap-6 relative z-10">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.num}
                variants={fadeUp}
                whileHover={{ y: -6 }}
                className="relative"
              >
                {/* Círculo grande com ícone + número */}
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-6">
                    {/* Halo glow */}
                    <div
                      className="absolute inset-0 -m-4 rounded-full blur-2xl opacity-60"
                      style={{ background: s.accentColor }}
                    />
                    <div
                      className="relative w-24 h-24 rounded-full border-2 flex items-center justify-center text-white shadow-[0_15px_50px_-10px] backdrop-blur-sm"
                      style={{
                        background: `linear-gradient(135deg, ${s.accentColor}30, transparent)`,
                        borderColor: `${s.accentColor}80`,
                        boxShadow: `0 15px 50px -10px ${s.accentColor}60`,
                      }}
                    >
                      <div className="text-2xl">{s.icon}</div>
                    </div>
                    <div
                      className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-bold tracking-wider text-black"
                      style={{ background: s.accentColor }}
                    >
                      {s.num}
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold mb-2.5 tracking-tight">{s.title}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed max-w-xs">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* ━━━━━━━━━━━━━━━━ FEATURES BENTO ━━━━━━━━━━━━━━━━ */}
      <motion.section
        id="recursos"
        className="relative z-10 px-6 py-32 max-w-6xl mx-auto"
        initial="hidden"
        whileInView="show"
        viewport={REVEAL}
        variants={stagger}
      >
        <motion.div variants={fadeUp} className="text-center mb-16">
          <p className="text-xs text-fuchsia-400 uppercase tracking-[0.2em] font-semibold mb-3">Recursos</p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Tudo o que você precisa
            <br />
            <span className="text-zinc-500">pra viralizar.</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4">
          {/* Feature destaque */}
          <motion.div
            variants={fadeUp}
            whileHover={{ y: -4 }}
            className="md:col-span-2 md:row-span-2 p-8 rounded-2xl border border-white/10 bg-gradient-to-br from-fuchsia-500/10 via-violet-500/5 to-transparent relative overflow-hidden"
          >
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-fuchsia-500/20 rounded-full blur-3xl" />
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-fuchsia-500/20 text-fuchsia-300 flex items-center justify-center mb-5">
                {FEATURES[0].icon}
              </div>
              <h3 className="text-2xl font-bold mb-3">{FEATURES[0].title}</h3>
              <p className="text-zinc-400 text-base leading-relaxed max-w-md">{FEATURES[0].desc}</p>
              <div className="mt-6 flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-4 h-4 fill-fuchsia-400 text-fuchsia-400" />
                ))}
                <span className="text-sm text-zinc-300 ml-2">4.9 — 287 avaliações</span>
              </div>
            </div>
          </motion.div>

          {FEATURES.slice(1).map((f) => (
            <motion.div
              key={f.title}
              variants={fadeUp}
              whileHover={{ y: -4 }}
              className="p-7 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-white/20 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-white/5 text-fuchsia-300 flex items-center justify-center mb-4">
                {f.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ━━━━━━━━━━━━━━━━ DEPOIMENTOS ━━━━━━━━━━━━━━━━ */}
      <motion.section
        className="relative z-10 px-6 py-32 max-w-6xl mx-auto"
        initial="hidden"
        whileInView="show"
        viewport={REVEAL}
        variants={stagger}
      >
        <motion.div variants={fadeUp} className="text-center mb-16">
          <p className="text-xs text-fuchsia-400 uppercase tracking-[0.2em] font-semibold mb-3">Depoimentos</p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Criadores reais.
            <br />
            <span className="text-zinc-500">Resultados reais.</span>
          </h2>
        </motion.div>
        <motion.div variants={stagger} className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {TESTIMONIALS.map((t) => {
            const PlatformIcon =
              t.platform === "TikTok" ? TikTokIcon : t.platform === "Instagram" ? InstagramIcon : YouTubeIcon;
            const platformColor =
              t.platform === "TikTok" ? "#fff" : t.platform === "Instagram" ? "#E1306C" : "#FF0000";
            return (
              <motion.div
                key={t.name}
                variants={fadeUp}
                whileHover={{ y: -6 }}
                className="relative p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.01] overflow-hidden group"
              >
                {/* Quote decoration */}
                <div className="absolute top-2 right-3 text-7xl font-serif leading-none text-white/[0.04] select-none">&ldquo;</div>

                {/* Avatar + nome + plataforma */}
                <div className="relative flex items-center gap-3 mb-4">
                  <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${t.avatarBg} flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                    {t.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{t.name}</div>
                    <div className="flex items-center gap-1 mt-0.5 text-[11px] text-zinc-500">
                      <span style={{ color: platformColor }}><PlatformIcon size={12} /></span>
                      <span>{t.platform}</span>
                    </div>
                  </div>
                </div>

                {/* Stats Before/After */}
                <div className="relative flex items-center gap-2 mb-4 p-2.5 rounded-lg bg-white/[0.03] border border-white/5">
                  <div className="flex-1 text-center">
                    <div className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold">Antes</div>
                    <div className="text-sm font-bold text-zinc-400 mt-0.5">{t.before}</div>
                  </div>
                  <div className="text-fuchsia-400 text-base">→</div>
                  <div className="flex-1 text-center">
                    <div className="text-[9px] uppercase tracking-wider text-emerald-300 font-bold">Depois</div>
                    <div className="text-base font-bold bg-gradient-to-r from-fuchsia-300 to-violet-300 bg-clip-text text-transparent mt-0.5">{t.after}</div>
                  </div>
                </div>
                <div className="text-[10px] text-zinc-500 text-center mb-4">{t.metric}</div>

                {/* Stars */}
                <div className="relative flex gap-0.5 mb-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Quote */}
                <p className="relative text-zinc-300 text-sm leading-relaxed">{t.text}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.section>

      {/* ━━━━━━━━━━━━━━━━ PRICING ━━━━━━━━━━━━━━━━ */}
      <motion.section
        id="planos"
        className="relative z-10 px-6 py-32 max-w-7xl mx-auto"
        initial="hidden"
        whileInView="show"
        viewport={REVEAL}
        variants={stagger}
      >
        <motion.div variants={fadeUp} className="text-center mb-12">
          <p className="text-xs text-fuchsia-400 uppercase tracking-[0.2em] font-semibold mb-3">Planos</p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Comece grátis.
            <br />
            <span className="text-zinc-500">Escale quando quiser.</span>
          </h2>

          {/* Toggle Mensal / Anual */}
          <div className="inline-flex items-center gap-1 p-1 rounded-xl border border-white/10 bg-white/[0.03]">
            <button
              onClick={() => setYearly(false)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                !yearly ? "bg-white text-black" : "text-zinc-400 hover:text-white"
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setYearly(true)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                yearly ? "bg-white text-black" : "text-zinc-400 hover:text-white"
              }`}
            >
              Anual
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${yearly ? "bg-emerald-500/20 text-emerald-700" : "bg-emerald-500/20 text-emerald-300"}`}>
                -20%
              </span>
            </button>
          </div>
        </motion.div>

        <motion.div variants={stagger} className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
          {PLANS.map((plan) => (
            <PricingCard key={plan.name} plan={plan} yearly={yearly} />
          ))}
        </motion.div>

        <p className="text-center text-xs text-zinc-500 mt-8">
          7 dias de garantia · Cancele quando quiser · Sem fidelidade
        </p>
      </motion.section>

      {/* ━━━━━━━━━━━━━━━━ FAQ ━━━━━━━━━━━━━━━━ */}
      <motion.section
        id="faq"
        className="relative z-10 px-6 py-32 max-w-3xl mx-auto"
        initial="hidden"
        whileInView="show"
        viewport={REVEAL}
        variants={stagger}
      >
        <motion.div variants={fadeUp} className="text-center mb-12">
          <p className="text-xs text-fuchsia-400 uppercase tracking-[0.2em] font-semibold mb-3">Perguntas frequentes</p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Ainda tem dúvida?</h2>
        </motion.div>

        <motion.div variants={stagger} className="space-y-2">
          {FAQS.map((faq, i) => {
            const open = openFaq === i;
            return (
              <motion.div
                key={faq.q}
                variants={fadeUp}
                className="border border-white/10 bg-white/[0.02] rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(open ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-white/[0.02] transition-colors"
                >
                  <span className="font-medium text-base">{faq.q}</span>
                  <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="w-5 h-5 text-zinc-500" />
                  </motion.div>
                </button>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-5 text-zinc-400 text-sm leading-relaxed">{faq.a}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.section>

      {/* ━━━━━━━━━━━━━━━━ CTA FINAL ━━━━━━━━━━━━━━━━ */}
      <motion.section
        className="relative z-10 px-6 py-32"
        initial="hidden"
        whileInView="show"
        viewport={REVEAL}
        variants={stagger}
      >
        <motion.div
          variants={fadeUp}
          className="max-w-4xl mx-auto text-center p-12 md:p-20 rounded-3xl border border-white/10 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, rgba(217,70,239,0.08) 0%, rgba(168,85,247,0.04) 50%, rgba(34,211,238,0.06) 100%)" }}
        >
          {/* Mesh gradient blobs animados */}
          <motion.div
            className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-fuchsia-500/25 rounded-full blur-3xl"
            animate={{ x: [0, 40, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-violet-500/25 rounded-full blur-3xl"
            animate={{ x: [0, -50, 0], y: [0, -30, 0], scale: [1, 1.15, 1] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Grid overlay sutil */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />

          <div className="relative">
            {/* Live counter */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={REVEAL}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/10 backdrop-blur-sm mb-8"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <span className="text-xs font-semibold text-emerald-200">
                23 criadores começaram hoje
              </span>
            </motion.div>

            <h2 className="text-5xl md:text-7xl font-bold tracking-[-0.04em] mb-6 leading-[1.02]">
              Pronto pra
              <br />
              <span className="bg-gradient-to-r from-fuchsia-300 via-pink-300 to-violet-300 bg-clip-text text-transparent">
                viralizar?
              </span>
            </h2>
            <p className="text-zinc-300 text-lg md:text-xl max-w-xl mx-auto mb-10">
              10 cortes grátis no primeiro mês.
              <br className="md:hidden" />
              <span className="text-zinc-500"> Sem cartão. Sem cadastro chato.</span>
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <MagneticButton distance={0.35}>
                <Link
                  href="/app"
                  className="inline-flex items-center gap-2 px-9 py-4 rounded-xl bg-white text-black font-bold text-base shadow-[0_15px_60px_-10px_rgba(255,255,255,0.6)] hover:scale-[1.03] transition-transform"
                >
                  Começar agora — é grátis <span aria-hidden>→</span>
                </Link>
              </MagneticButton>
              <a href="#planos" className="text-sm text-zinc-400 hover:text-white transition-colors font-medium">
                Ver planos →
              </a>
            </div>

            {/* Trust row */}
            <div className="flex flex-wrap items-center justify-center gap-5 text-xs text-zinc-500">
              <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> Garantia 7 dias</span>
              <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> Pix, cartão ou boleto</span>
              <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> Cancele com 1 clique</span>
            </div>
          </div>
        </motion.div>
      </motion.section>

      {/* ━━━━━━━━━━━━━━━━ FOOTER ━━━━━━━━━━━━━━━━ */}
      <footer className="relative z-10 px-6 pt-16 pb-10 border-t border-white/5">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Image src="/logo-viraliza-cortes.png" alt="Viraliza Cortes" width={28} height={28} className="rounded-md" />
              <span className="font-bold text-sm">Viraliza Cortes</span>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed">
              IA 100% brasileira pra transformar vídeos longos em cortes virais.
            </p>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-wider text-zinc-500 font-bold mb-3">Produto</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li><a href="#recursos" className="hover:text-white transition-colors">Recursos</a></li>
              <li><a href="#planos" className="hover:text-white transition-colors">Planos</a></li>
              <li><a href="#como-funciona" className="hover:text-white transition-colors">Como funciona</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-wider text-zinc-500 font-bold mb-3">Empresa</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
              <li><a href="mailto:contato@viralizacortes.com.br" className="hover:text-white transition-colors">Contato</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-wider text-zinc-500 font-bold mb-3">Legal</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li><Link href="/privacidade" className="hover:text-white transition-colors">Privacidade</Link></li>
              <li><Link href="/excluir-conta" className="hover:text-white transition-colors">Excluir conta</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-12 pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-zinc-600">© 2026 Viraliza Cortes. Feito no Brasil 🇧🇷</p>
          <p className="text-xs text-zinc-600">viralizacortes.com.br</p>
        </div>
      </footer>
    </div>
  );
}
