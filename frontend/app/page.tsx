"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

// ── Brand Icons ────────────────────────────────────────────────────
const TikTokIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.77a4.85 4.85 0 0 1-1.01-.08z" />
  </svg>
);
const YouTubeIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.54 3.5 12 3.5 12 3.5s-7.54 0-9.38.55A3.02 3.02 0 0 0 .5 6.19 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.81 3.02 3.02 0 0 0 2.12 2.14C4.46 20.5 12 20.5 12 20.5s7.54 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.81zM9.75 15.5V8.5l6.5 3.5-6.5 3.5z" />
  </svg>
);
const InstagramIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C8.74 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
  </svg>
);
const FacebookIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073C24 5.446 18.627 0 12 0S0 5.446 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047v-2.66c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97H15.83c-1.491 0-1.956.932-1.956 1.888v2.264h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
  </svg>
);
const TwitterXIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
const PinterestIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
  </svg>
);
const CheckIcon = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const StarIcon = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="#f59e0b">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);
const PlayIcon = () => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
);
const LinkIcon = () => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);
const PlusIcon = () => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

// ── Data ───────────────────────────────────────────────────────────
const NAV_LINKS = [
  { label: "Recursos", href: "#recursos" },
  { label: "Como funciona", href: "#como-funciona" },
  { label: "Planos", href: "#planos" },
  { label: "FAQ", href: "#faq" },
];

const STATS = [
  { value: "+10x", label: "mais alcance" },
  { value: "+7x", label: "mais engajamento" },
  { value: "-90%", label: "tempo de edição" },
  { value: "+1000+", label: "criadores ativos" },
];

const STEPS = [
  {
    num: "01",
    title: "Cole o link do YouTube",
    desc: "Cole qualquer link do YouTube ou faça upload do seu arquivo de vídeo. Suportamos até 4 horas de conteúdo.",
    icon: "🔗",
  },
  {
    num: "02",
    title: "IA analisa os melhores momentos",
    desc: "Nossa IA analisa humor, emoção, ritmo e engajamento em 18 parâmetros para identificar os trechos mais virais.",
    icon: "🤖",
  },
  {
    num: "03",
    title: "Receba seus cortes prontos",
    desc: "Cortes já no formato 9:16 com legendas estilizadas, prontos para postar no TikTok, Reels e Shorts.",
    icon: "✅",
  },
];

const PLATFORMS = [
  {
    name: "TikTok",
    desc: "Cortes virais prontos para o FYP. A IA sabe o que funciona no TikTok.",
    Icon: TikTokIcon,
    color: "#ffffff",
    bg: "rgba(255,255,255,0.06)",
    border: "rgba(255,255,255,0.12)",
  },
  {
    name: "Instagram Reels",
    desc: "Transforme podcasts e vídeos longos em Reels que capturam atenção.",
    Icon: InstagramIcon,
    color: "#f77737",
    bg: "rgba(247,119,55,0.08)",
    border: "rgba(247,119,55,0.2)",
  },
  {
    name: "YouTube Shorts",
    desc: "Extraia os melhores momentos e transforme em Shorts com milhões de views.",
    Icon: YouTubeIcon,
    color: "#ff0000",
    bg: "rgba(255,0,0,0.08)",
    border: "rgba(255,0,0,0.2)",
  },
  {
    name: "Facebook Reels",
    desc: "Alcance novo público com Reels criados a partir do seu melhor conteúdo.",
    Icon: FacebookIcon,
    color: "#1877f2",
    bg: "rgba(24,119,242,0.08)",
    border: "rgba(24,119,242,0.2)",
  },
  {
    name: "Twitter / X",
    desc: "Clipes impactantes que geram conversas e aumentam o alcance orgânico.",
    Icon: TwitterXIcon,
    color: "#e7e9ea",
    bg: "rgba(231,233,234,0.06)",
    border: "rgba(231,233,234,0.12)",
  },
  {
    name: "Pinterest",
    desc: "Cortes verticais perfeitos para pins que geram tráfego e engajamento.",
    Icon: PinterestIcon,
    color: "#e60023",
    bg: "rgba(230,0,35,0.08)",
    border: "rgba(230,0,35,0.2)",
  },
];

const FEATURES = [
  { icon: "🤖", title: "IA que entende virais", desc: "18 parâmetros: humor, emoção, ritmo, tom de voz e expressões faciais para identificar o momento perfeito." },
  { icon: "✂️", title: "Cortes automáticos precisos", desc: "Cortes exatos no formato 9:16 sem cortar frases no meio. A IA respeita o contexto da fala." },
  { icon: "💬", title: "4 estilos de legenda", desc: "TikTok, Hormozi, Dark Box e Clean — escolha o estilo e as legendas ficam gravadas no vídeo." },
  { icon: "⬇️", title: "Download sem marca d'água", desc: "Todos os clips em HD, prontos para publicar. Sem watermark, sem custo extra (planos pagos)." },
];

const TESTIMONIALS = [
  {
    name: "Gabriel Costa",
    handle: "@gabrielpodcast",
    avatar: "GC",
    avatarColor: "from-purple-600 to-blue-600",
    text: "Gerei 47 cortes em 1 hora de podcast. Minha conta no TikTok dobrou de seguidores em 2 semanas. Isso é game changer.",
    result: "+12k seguidores em 15 dias",
    platform: <TikTokIcon size={14} />,
  },
  {
    name: "Mariana Silva",
    handle: "@marianaoficial",
    avatar: "MS",
    avatarColor: "from-pink-600 to-orange-500",
    text: "A IA escolhe exatamente os momentos certos. Economizo 3 horas por dia que usava editando manualmente. Não consigo mais trabalhar sem.",
    result: "3h economizadas por dia",
    platform: <InstagramIcon size={14} />,
  },
  {
    name: "Felipe Marketing",
    handle: "@felipemkt",
    avatar: "FM",
    avatarColor: "from-green-600 to-cyan-500",
    text: "Meu engajamento subiu 340% em 30 dias. Uso para meus clientes também e os resultados são absurdos. Vale cada centavo.",
    result: "+340% engajamento em 30 dias",
    platform: <YouTubeIcon size={14} />,
  },
];

const FAQS = [
  { q: "Preciso baixar algum programa?", a: "Não! Tudo funciona direto no navegador. Cole o link, aguarde o processamento e baixe os clips — sem instalação." },
  { q: "Quais formatos de vídeo são aceitos?", a: "Aceitamos links do YouTube, arquivos MP4, MOV e AVI. O vídeo pode ter até 4 horas de duração." },
  { q: "Quanto tempo leva para processar?", a: "Em média 2 a 5 minutos por hora de vídeo. Para vídeos de 30 minutos, seus cortes ficam prontos em menos de 2 minutos." },
  { q: "As legendas são em português?", a: "Sim! Nossa IA foi treinada especialmente para o português brasileiro, incluindo gírias e regionalismos." },
  { q: "Posso cancelar quando quiser?", a: "Sim, sem multa e sem burocracia. Cancele com 1 clique a qualquer momento pelo painel." },
  { q: "Como funciona o plano grátis?", a: "Ao criar sua conta você recebe 2 cortes grátis completos — com legendas, formato 9:16, sem cartão de crédito." },
];

const PLANS = [
  {
    name: "GRÁTIS",
    price: "R$0",
    period: "",
    desc: "Para testar a plataforma",
    features: [
      "2 cortes por vídeo",
      "Marca d'água Viraliza",
      "TikTok e Reels",
      "Qualidade HD",
    ],
    cta: "Começar Grátis",
    href: "/app",
    highlight: false,
  },
  {
    name: "BÁSICO",
    price: "R$29,90",
    period: "/mês",
    desc: "Para criadores iniciantes",
    features: [
      "Vídeos ilimitados",
      "10 cortes por vídeo",
      "Sem marca d'água",
      "TikTok + Reels + Shorts",
      "Legendas automáticas",
    ],
    cta: "Assinar Básico",
    href: "https://pay.kiwify.com.br/Ft2LPkC",
    highlight: false,
  },
  {
    name: "PRO",
    price: "R$49,90",
    period: "/mês",
    desc: "Para criadores em crescimento",
    features: [
      "Vídeos ilimitados",
      "20 cortes por vídeo",
      "Sem marca d'água",
      "Todos os formatos",
      "4 estilos de legenda premium",
      "Download HD",
    ],
    cta: "Quero o Pro",
    href: "https://pay.kiwify.com.br/4Z0jIcC",
    highlight: true,
    badge: "MAIS POPULAR",
  },
  {
    name: "FULL",
    price: "R$99,90",
    period: "/mês",
    desc: "Para criadores avançados",
    features: [
      "Vídeos ilimitados",
      "50 cortes por vídeo",
      "Sem marca d'água",
      "Todos os formatos + Shorts",
      "IA avançada de viralização",
      "Suporte prioritário",
    ],
    cta: "Assinar Full",
    href: "https://pay.kiwify.com.br/full",
    highlight: false,
  },
  {
    name: "AGÊNCIA",
    price: "R$150",
    period: "/mês",
    desc: "Para equipes e agências",
    features: [
      "Vídeos ilimitados",
      "100 cortes por vídeo",
      "Tudo do Full",
      "10 contas simultâneas",
      "API de integração",
      "Suporte VIP",
    ],
    cta: "Falar com vendas",
    href: "https://wa.me/5500000000000",
    highlight: false,
  },
];

// ── Clip Mockup ───────────────────────────────────────────────────
function ClipMockup({ label, score, color, timeStart, bg }: {
  label: string; score: number; color: string; timeStart: string; timeEnd: string; bg: string;
}) {
  return (
    <div className="flex flex-col items-center">
      <div
        className="relative rounded-2xl overflow-hidden border border-white/10 shadow-lg"
        style={{ width: 90, aspectRatio: "9/16", background: bg }}
      >
        <div className="absolute inset-0" style={{ background: `linear-gradient(160deg, ${color}22 0%, #00000080 100%)` }} />
        <div
          className="absolute top-2 right-2 text-xs font-black px-1.5 py-0.5 rounded-full"
          style={{ background: color + "33", color, border: `1px solid ${color}55`, fontSize: 10 }}
        >
          {score}/10
        </div>
        <div className="absolute top-2 left-2 opacity-80" style={{ color }}>
          <TikTokIcon size={12} />
        </div>
        <div className="absolute bottom-6 left-0 right-0 flex justify-center">
          <div className="flex flex-col items-center gap-0.5">
            <div className="w-7 h-7 rounded-full border border-white/20" style={{ background: "linear-gradient(135deg, #d4a76a, #a0725a)" }} />
            <div className="w-12 h-8 rounded-t-full" style={{ background: "linear-gradient(180deg, #2a2a3a 0%, transparent 100%)" }} />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-6 flex items-center justify-center"
          style={{ background: "linear-gradient(0deg, rgba(0,0,0,0.8) 0%, transparent 100%)" }}>
          <div className="h-1.5 w-14 rounded-full" style={{ background: `linear-gradient(90deg, ${color}, white)` }} />
        </div>
        <div className="absolute bottom-7 left-1.5 text-white font-bold" style={{ fontSize: 8 }}>
          {timeStart}
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-1.5 text-center font-medium">{label}</p>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────
export default function LandingPage() {
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [url, setUrl] = useState("");

  return (
    <div className="min-h-screen bg-[#050507] text-white overflow-x-hidden">

      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div style={{
          position: "absolute", top: -200, right: "10%",
          width: 800, height: 800,
          background: "radial-gradient(ellipse, rgba(139,43,226,0.32) 0%, transparent 65%)",
        }} />
        <div style={{
          position: "absolute", top: 400, left: "-10%",
          width: 600, height: 600,
          background: "radial-gradient(ellipse, rgba(59,130,246,0.12) 0%, transparent 65%)",
        }} />
        <div style={{
          position: "absolute", bottom: "30%", right: "-5%",
          width: 500, height: 500,
          background: "radial-gradient(ellipse, rgba(236,72,153,0.08) 0%, transparent 65%)",
        }} />
      </div>

      {/* NAV */}
      <nav className="relative z-50 sticky top-0 px-6 md:px-10 py-4"
        style={{ background: "rgba(5,5,7,0.85)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center flex-shrink-0">
            <Image src="/logo-viraliza-cortes.png" alt="Viraliza Cortes — cortes virais automáticos com IA" width={160} height={160} className="rounded-xl" />
          </Link>
          <div className="hidden lg:flex items-center gap-1 nav-pill rounded-full px-2 py-1.5">
            {NAV_LINKS.map((l) => (
              <Link key={l.label} href={l.href}
                className="text-sm text-gray-400 hover:text-white transition-colors px-4 py-1.5 rounded-full hover:bg-white/5">
                {l.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link href="/app" className="text-sm text-gray-400 hover:text-white transition-colors hidden sm:block font-medium">
              Entrar
            </Link>
            <Link href="/app" className="btn-primary text-sm font-bold px-5 py-2.5 rounded-full whitespace-nowrap">
              Começar grátis →
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative z-10 px-6 md:px-10 pt-16 pb-20 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-14">

          {/* Left */}
          <div className="flex-1 text-center lg:text-left max-w-2xl mx-auto lg:mx-0">
            <div className="section-badge mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
              IA 100% Brasileira
            </div>

            <h1 className="text-5xl md:text-6xl xl:text-7xl font-black leading-[1.05] mb-6 tracking-tight">
              Transforme vídeos longos em{" "}
              <span style={{ background: "linear-gradient(135deg, #f97316, #ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                cortes virais
              </span>{" "}
              com{" "}
              <span style={{ background: "linear-gradient(135deg, #22d3ee, #3b82f6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                Inteligência Artificial
              </span>
            </h1>

            <p className="text-gray-400 text-lg md:text-xl max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed font-medium">
              A IA encontra os melhores momentos, corta, adiciona legendas e
              deixa tudo pronto para viralizar nas redes sociais.
            </p>

            {/* URL Input */}
            <div className="flex gap-2 mb-8 max-w-xl mx-auto lg:mx-0">
              <div className="flex-1 flex items-center gap-3 input-premium rounded-full px-5 py-3.5">
                <span className="text-gray-500 flex-shrink-0"><LinkIcon /></span>
                <input
                  type="text"
                  placeholder="Cole o link do YouTube aqui..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none font-medium"
                  aria-label="Link do YouTube"
                />
              </div>
              <Link href="/app" className="btn-primary px-6 py-3.5 rounded-full font-black text-sm whitespace-nowrap flex items-center gap-2">
                <PlayIcon /> Viralizar
              </Link>
            </div>

            <div className="flex flex-wrap gap-5 justify-center lg:justify-start text-sm text-gray-500 font-medium">
              {["Sem cartão de crédito", "2 clips grátis", "Resultado em minutos"].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <span className="text-green-400">✓</span> {t}
                </span>
              ))}
            </div>
          </div>

          {/* Right — Mockup */}
          <div className="flex-1 w-full max-w-xl">
            <div className="card-glow rounded-3xl bg-[#0a0a14] p-6">
              <div className="flex items-center gap-3 mb-5">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">1 Vídeo Longo</span>
                <div className="flex-1 h-px bg-white/5" />
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-purple-400 font-black text-lg" style={{ background: "rgba(124,58,237,0.15)" }}>→</div>
                <div className="flex-1 h-px bg-white/5" />
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Múltiplos Cortes Virais</span>
              </div>

              <div className="flex gap-4 items-start">
                {/* YouTube window */}
                <div className="flex-none w-52">
                  <div className="rounded-xl overflow-hidden border border-white/10" style={{ background: "#0f0f0f" }}>
                    <div className="flex items-center gap-1.5 px-2.5 py-2" style={{ background: "#212121" }}>
                      <div className="w-2 h-2 rounded-full bg-red-500/80" />
                      <div className="w-2 h-2 rounded-full bg-yellow-500/80" />
                      <div className="w-2 h-2 rounded-full bg-green-500/80" />
                      <div className="flex-1 mx-2 flex items-center gap-1 rounded px-2 py-0.5" style={{ background: "#121212", fontSize: 8 }}>
                        <YouTubeIcon size={8} />
                        <span className="text-gray-400 truncate" style={{ fontSize: 8 }}>youtube.com/watch?v=xK3p...</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between px-2.5 py-1.5" style={{ background: "#0f0f0f", borderBottom: "1px solid #272727" }}>
                      <div className="flex items-center gap-1">
                        <div className="flex items-center gap-0.5" style={{ color: "#ff0000" }}>
                          <YouTubeIcon size={14} />
                        </div>
                        <span className="font-black text-white" style={{ fontSize: 9 }}>YouTube</span>
                      </div>
                      <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center text-white font-black" style={{ fontSize: 7 }}>C</div>
                    </div>
                    <div className="relative" style={{ aspectRatio: "16/9" }}>
                      <div className="absolute inset-0" style={{ background: "linear-gradient(160deg, #1a0530 0%, #0d1a2e 40%, #0a0a14 100%)" }} />
                      <div className="absolute inset-0 flex items-end justify-center pb-2">
                        <div className="flex flex-col items-center gap-0.5">
                          <div className="w-8 h-8 rounded-full border border-white/10" style={{ background: "linear-gradient(135deg, #d4a76a, #8b5e3c)" }} />
                          <div className="w-14 h-10 rounded-t-full opacity-60" style={{ background: "linear-gradient(180deg, #3a3a4a, transparent)" }} />
                        </div>
                      </div>
                      <div className="absolute bottom-3 left-2" style={{ fontSize: 10 }}>🎙️</div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center border border-white/20" style={{ background: "rgba(0,0,0,0.7)" }}>
                          <span className="text-white ml-0.5" style={{ fontSize: 10 }}>▶</span>
                        </div>
                      </div>
                      <div className="absolute bottom-1 right-1 text-white font-bold rounded px-1" style={{ background: "rgba(0,0,0,0.85)", fontSize: 8 }}>40:50</div>
                    </div>
                    <div className="px-0">
                      <div className="h-0.5 w-full" style={{ background: "#272727" }}>
                        <div className="h-full w-1/3 bg-red-600 rounded-full relative">
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-red-600" />
                        </div>
                      </div>
                    </div>
                    <div className="px-2.5 py-1.5" style={{ background: "#0f0f0f" }}>
                      <p className="text-white font-bold leading-tight mb-1" style={{ fontSize: 8 }}>Podcast EP. 127 — Como Viralizar no TikTok em 2026</p>
                      <div className="flex items-center gap-2 text-gray-500" style={{ fontSize: 7 }}>
                        <span>Canal do Creator</span>
                        <span>•</span>
                        <span>2.4M views</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 text-center mt-2 font-medium">1 vídeo longo</p>
                </div>

                {/* Generated clips */}
                <div className="flex-1 flex justify-around gap-2">
                  <ClipMockup label="TikTok" score={9} color="#69C9D0" timeStart="0:32" timeEnd="1:14" bg="linear-gradient(160deg, #0a0a14, #1a0a2e)" />
                  <ClipMockup label="Reels" score={8} color="#f77737" timeStart="3:41" timeEnd="4:28" bg="linear-gradient(160deg, #0a0a14, #2a0a1a)" />
                  <ClipMockup label="Shorts" score={9} color="#ff4444" timeStart="7:02" timeEnd="7:55" bg="linear-gradient(160deg, #0a0a14, #2a0a0a)" />
                </div>
              </div>

              {/* Platform badges */}
              <div className="flex items-center gap-2 mt-5 flex-wrap">
                <span className="text-xs text-gray-600 font-medium mr-1">Exporta para:</span>
                {[
                  { Icon: TikTokIcon, color: "#fff", bg: "#010101" },
                  { Icon: InstagramIcon, color: "#f77737", bg: "#1a0a0a" },
                  { Icon: YouTubeIcon, color: "#ff4444", bg: "#1a0a0a" },
                  { Icon: FacebookIcon, color: "#1877f2", bg: "#0a0a1a" },
                  { Icon: TwitterXIcon, color: "#e7e9ea", bg: "#111" },
                ].map(({ Icon, color, bg }, i) => (
                  <div key={i} className="w-7 h-7 rounded-full flex items-center justify-center border border-white/8 flex-shrink-0" style={{ background: bg, color }}>
                    <Icon size={13} />
                  </div>
                ))}
                <span className="text-gray-600 text-xs font-medium">+ mais</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="relative z-10 border-y border-white/5 py-10 px-6" style={{ background: "rgba(255,255,255,0.015)" }}>
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map((s) => (
            <div key={s.value}>
              <p className="text-4xl font-black gradient-text mb-1">{s.value}</p>
              <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" className="relative z-10 px-6 md:px-10 py-24 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="section-badge mb-4">Como funciona</div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            Do link ao clip em{" "}
            <span className="gradient-text">3 passos</span>
          </h2>
          <p className="text-gray-400 max-w-lg mx-auto font-medium">
            Processo 100% automático. Você cola o link, a IA faz o resto.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {STEPS.map((step, i) => (
            <div key={step.num} className="card-border-hover rounded-3xl p-8 relative">
              {i < STEPS.length - 1 && (
                <div className="hidden md:block absolute top-14 -right-3 w-6 h-px" style={{ background: "linear-gradient(90deg, rgba(124,58,237,0.4), transparent)" }} />
              )}
              <div className="text-5xl font-black mb-4" style={{
                background: "linear-gradient(135deg, rgba(124,58,237,0.5), rgba(59,130,246,0.3))",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text"
              }}>
                {step.num}
              </div>
              <div className="text-3xl mb-4">{step.icon}</div>
              <h3 className="text-xl font-black mb-3 tracking-tight">{step.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed font-medium">{step.desc}</p>
            </div>
          ))}
        </div>

        {/* App mockup */}
        <div className="card-border rounded-3xl overflow-hidden" style={{ background: "#080812" }}>
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/5">
            <div className="w-3 h-3 rounded-full bg-red-500/70" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <div className="w-3 h-3 rounded-full bg-green-500/70" />
            <div className="flex-1 mx-4 bg-white/5 rounded-full px-4 py-1 text-xs text-gray-500 max-w-xs font-medium">
              app.viralizacortes.com.br
            </div>
          </div>
          <div className="p-6 md:p-10">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-3">Cole o link do YouTube</p>
                <div className="flex items-center gap-3 bg-white/5 border border-white/8 rounded-2xl px-4 py-3 mb-4">
                  <span className="text-purple-400"><LinkIcon /></span>
                  <span className="text-sm text-gray-400 font-medium">youtube.com/watch?v=xK3p2mN8jqA</span>
                </div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-3">Plataformas de saída</p>
                <div className="flex flex-wrap gap-2 mb-5">
                  {[
                    { name: "TikTok", Icon: TikTokIcon, color: "#fff" },
                    { name: "Reels", Icon: InstagramIcon, color: "#f77737" },
                    { name: "Shorts", Icon: YouTubeIcon, color: "#ff4444" },
                    { name: "Facebook", Icon: FacebookIcon, color: "#1877f2" },
                  ].map(({ name, Icon, color }) => (
                    <div key={name} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/8 bg-white/4 text-xs font-semibold" style={{ color }}>
                      <Icon size={12} /> {name}
                    </div>
                  ))}
                </div>
                <button className="btn-primary w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2">
                  <span>🤖</span> Gerar Cortes com IA
                </button>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-3">Cortes gerados</p>
                {[
                  { n: 1, time: "0:32 – 1:14", score: 9, label: "TikTok", color: "#69C9D0" },
                  { n: 2, time: "3:41 – 4:28", score: 8, label: "Reels", color: "#f77737" },
                  { n: 3, time: "7:02 – 7:55", score: 9, label: "Shorts", color: "#ff4444" },
                ].map((clip) => (
                  <div key={clip.n} className="flex items-center gap-4 bg-white/3 border border-white/6 rounded-2xl px-4 py-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0"
                      style={{ background: clip.color + "20", color: clip.color }}>
                      #{clip.n}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 font-medium">{clip.time}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex-1 h-1.5 rounded-full bg-white/8 overflow-hidden">
                          <div className="h-full progress-animated rounded-full" style={{ width: `${clip.score * 10}%` }} />
                        </div>
                        <span className="text-xs font-bold" style={{ color: clip.color }}>{clip.score}/10</span>
                      </div>
                    </div>
                    <div className="text-xs px-2.5 py-1 rounded-full font-bold flex-shrink-0" style={{ background: clip.color + "15", color: clip.color, border: `1px solid ${clip.color}30` }}>
                      {clip.label}
                    </div>
                    <button className="text-gray-400 hover:text-white transition-colors" aria-label="Baixar clip">⬇️</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PLATAFORMAS */}
      <section id="recursos" className="relative z-10 px-6 md:px-10 py-24" style={{ background: "rgba(0,0,0,0.3)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="section-badge mb-4">Plataformas</div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
              Um clip,{" "}
              <span style={{ background: "linear-gradient(135deg, #f97316, #ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                todas as redes
              </span>
            </h2>
            <p className="text-gray-400 max-w-lg mx-auto font-medium">
              Gere cortes otimizados para cada plataforma com um único clique.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PLATFORMS.map((p) => (
              <div
                key={p.name}
                className="rounded-3xl p-7 transition-all duration-300 hover:-translate-y-1 cursor-default group"
                style={{ background: p.bg, border: `1px solid ${p.border}` }}
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110"
                  style={{ background: p.color + "15", color: p.color, border: `1px solid ${p.color}20` }}>
                  <p.Icon size={28} />
                </div>
                <h3 className="text-xl font-black mb-2 tracking-tight">{p.name}</h3>
                <p className="text-gray-400 text-sm leading-relaxed font-medium">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="relative z-10 px-6 md:px-10 py-24 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="section-badge mb-4">Recursos</div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            Tudo que você precisa para{" "}
            <span className="gradient-text">criar, crescer e viralizar</span>
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((f) => (
            <div key={f.title} className="card-border-hover rounded-3xl p-7">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-5"
                style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.2)" }}>
                {f.icon}
              </div>
              <h3 className="font-black text-base mb-2 tracking-tight">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed font-medium">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section className="relative z-10 px-6 md:px-10 py-24" style={{ background: "rgba(0,0,0,0.2)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="section-badge mb-4">Depoimentos</div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
              Criadores que já estão{" "}
              <span className="gradient-text">viralizando</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="card-border-hover rounded-3xl p-7 flex flex-col gap-5">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => <StarIcon key={i} />)}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed font-medium flex-1">"{t.text}"</p>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold"
                  style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", color: "#4ade80" }}>
                  <span>📈</span> {t.result}
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.avatarColor} flex items-center justify-center text-xs font-black text-white`}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-black text-sm">{t.name}</p>
                    <p className="text-gray-500 text-xs font-medium">{t.handle}</p>
                  </div>
                  <div className="ml-auto text-gray-600">{t.platform}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PLANOS */}
      <section id="planos" className="relative z-10 px-6 md:px-10 py-24 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="section-badge mb-4">Planos</div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            Planos que cabem no{" "}
            <span style={{ background: "linear-gradient(135deg, #22d3ee, #3b82f6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              seu crescimento
            </span>
          </h2>
          <p className="text-gray-400 font-medium">Cancele quando quiser. Sem fidelidade.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 items-stretch">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-3xl p-7 flex flex-col ${plan.highlight ? "card-glow" : "card-border-hover"}`}
              style={plan.highlight ? { background: "linear-gradient(160deg, #1a0a3a 0%, #0a0a1a 100%)" } : {}}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 btn-primary text-xs font-black px-4 py-1.5 rounded-full whitespace-nowrap tracking-wider">
                  ⭐ {plan.badge}
                </div>
              )}

              <div className="mb-6">
                <p className="text-xs font-black tracking-widest text-gray-500 uppercase mb-3">{plan.name}</p>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-3xl font-black tracking-tight">{plan.price}</span>
                  <span className="text-gray-500 pb-1 font-semibold text-sm">{plan.period}</span>
                </div>
                <p className="text-gray-500 text-xs font-medium">{plan.desc}</p>
              </div>

              <ul className="space-y-2.5 mb-7 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-gray-300 font-medium">
                    <span className="text-green-400 flex-shrink-0 mt-0.5"><CheckIcon /></span>
                    {f}
                  </li>
                ))}
              </ul>

              <a
                href={plan.href}
                target={plan.href.startsWith("http") ? "_blank" : undefined}
                rel={plan.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className={`block text-center py-3.5 rounded-2xl font-black text-sm transition-all ${
                  plan.highlight
                    ? "btn-primary"
                    : "border border-white/10 bg-white/5 hover:bg-white/10 text-white"
                }`}>
                {plan.cta}
              </a>
            </div>
          ))}
        </div>

        <p className="text-center text-gray-600 text-sm mt-8 font-medium">
          Ainda na dúvida?{" "}
          <Link href="/app" className="text-purple-400 hover:text-purple-300 underline font-semibold">
            Teste grátis sem cartão →
          </Link>
        </p>
      </section>

      {/* FAQ */}
      <section id="faq" className="relative z-10 px-6 md:px-10 py-24 max-w-3xl mx-auto">
        <div className="text-center mb-14">
          <div className="section-badge mb-4">FAQ</div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight">
            Perguntas{" "}
            <span className="gradient-text">frequentes</span>
          </h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className="faq-item rounded-2xl overflow-hidden cursor-pointer"
              onClick={() => setFaqOpen(faqOpen === i ? null : i)}
            >
              <div className="flex items-center justify-between px-6 py-5">
                <p className="font-black text-sm md:text-base tracking-tight pr-4">{faq.q}</p>
                <span className="text-gray-400 flex-shrink-0 transition-transform duration-200" style={{ transform: faqOpen === i ? "rotate(45deg)" : "none" }}>
                  <PlusIcon />
                </span>
              </div>
              {faqOpen === i && (
                <div className="px-6 pb-5">
                  <p className="text-gray-400 text-sm leading-relaxed font-medium">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="relative z-10 px-6 py-16 max-w-3xl mx-auto text-center">
        <div className="card-glow rounded-3xl p-12" style={{ background: "linear-gradient(160deg, #1a0a3a 0%, #0a0a1a 100%)" }}>
          <div className="section-badge mx-auto mb-5">Comece Hoje</div>
          <h3 className="text-4xl font-black tracking-tight mb-3">
            2 clips grátis —{" "}
            <span style={{ background: "linear-gradient(135deg, #f97316, #ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              sem cartão
            </span>
          </h3>
          <p className="text-gray-400 mb-8 font-medium">
            Veja o resultado com seus próprios olhos antes de assinar.
          </p>
          <Link href="/app" className="btn-primary px-10 py-4 rounded-full text-base font-black inline-flex items-center gap-2">
            🎬 Criar meus clips grátis
          </Link>
          <p className="text-gray-600 text-xs mt-4 font-medium">Sem cartão • Sem cadastro complicado • Resultado em minutos</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-white/5 px-6 py-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center">
            <Image src="/logo-viraliza-cortes.png" alt="Viraliza Cortes" width={44} height={44} className="rounded-xl" />
          </div>
          <p className="text-gray-600 text-xs font-medium text-center">
            © 2026 Viraliza Cortes · Feito no Brasil para criadores brasileiros
          </p>
          <div className="flex gap-5 text-xs text-gray-500 font-semibold">
            <Link href="#" className="hover:text-white transition-colors">Termos</Link>
            <Link href="#" className="hover:text-white transition-colors">Privacidade</Link>
            <Link href="#" className="hover:text-white transition-colors">Contato</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
