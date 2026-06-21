"use client";

import { Sparkles, Zap, Crown, Building, Play } from "lucide-react";
import { CinematicHero } from "@/components/ui/cinematic-landing-hero";
import { CreativePricing, type PricingTier } from "@/components/ui/creative-pricing";
import { AIMultiModalGeneration } from "@/components/ui/ai-gen";
import { MagneticButton } from "@/components/ui/magnetic-button";
import Loader15 from "@/components/ui/loader-15";

const TIERS: PricingTier[] = [
  {
    name: "Básico",
    icon: <Sparkles className="w-6 h-6" />,
    price: 29.9,
    description: "Pra começar a criar cortes virais",
    color: "amber",
    features: ["10 cortes por mês", "Legendas TikTok automáticas", "Download em 9:16", "Suporte por email"],
    ctaText: "Assinar Básico",
    ctaHref: "https://pay.finaliza.shop/pl/cf81361a6d",
  },
  {
    name: "Pro",
    icon: <Zap className="w-6 h-6" />,
    price: 49.9,
    description: "Pra criadores que postam toda semana",
    color: "blue",
    features: ["20 cortes por mês", "Todos os estilos de legenda", "Seletor de cor da legenda", "Suporte prioritário"],
    popular: true,
    ctaText: "Assinar Pro",
    ctaHref: "https://pay.finaliza.shop/pl/9391b0d5c5",
  },
  {
    name: "Full",
    icon: <Crown className="w-6 h-6" />,
    price: 99.9,
    description: "Pra creators profissionais",
    color: "purple",
    features: ["50 cortes por mês", "Análise de viralidade IA", "Download em alta qualidade", "Suporte dedicado"],
    ctaText: "Assinar Full",
    ctaHref: "https://pay.finaliza.shop/pl/1fac0eef10",
  },
];

export default function NovoPage() {
  return (
    <div className="bg-background text-foreground">
      {/* 1. CINEMATIC HERO — abertura cinematográfica scroll-locked com GSAP */}
      <CinematicHero />

      {/* 2. SEÇÃO DEMO DA IA — gerador interativo */}
      <section className="py-24 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="section-badge">VEJA A IA EM AÇÃO</span>
          <h2 className="mt-4 text-4xl md:text-5xl font-bold tracking-tight">
            Sua próxima viral em <span className="gradient-text">3 minutos</span>
          </h2>
          <p className="mt-4 text-zinc-400 text-lg max-w-xl mx-auto">
            Cola o link, escolhe o estilo da legenda, clica e pronto. Sem editar manualmente.
          </p>
        </div>

        <div className="flex justify-center">
          <AIMultiModalGeneration />
        </div>
      </section>

      {/* 3. SEÇÃO LOADER — “como funciona” */}
      <section className="py-24 px-4 bg-gradient-to-b from-transparent via-violet-950/20 to-transparent">
        <div className="max-w-4xl mx-auto text-center">
          <span className="section-badge">ENQUANTO VOCÊ DESCANSA</span>
          <h2 className="mt-4 text-4xl md:text-5xl font-bold tracking-tight">
            A IA <span className="gradient-orange">trabalha por você</span>
          </h2>
          <p className="mt-4 text-zinc-400 text-lg max-w-xl mx-auto">
            Em segundos, ela analisa o vídeo todo, identifica os trechos com maior potencial viral e gera os cortes.
          </p>

          <div className="mt-16 flex justify-center">
            <Loader15 text="Carregando cortes" />
          </div>
        </div>
      </section>

      {/* 4. PRICING — planos do Viraliza */}
      <section id="planos" className="py-24 px-4">
        <CreativePricing
          tag="Planos Viraliza"
          title="Pague pelos cortes que você usa"
          description="Sem contrato, cancele quando quiser"
          tiers={TIERS}
        />

        {/* Plano Agência fora do trio criativo */}
        <div className="max-w-3xl mx-auto mt-16 rounded-2xl border border-violet-500/30 bg-violet-500/5 p-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Building className="w-5 h-5 text-violet-300" />
            <span className="text-violet-300 font-semibold tracking-wide uppercase text-sm">Agência</span>
          </div>
          <h3 className="text-3xl font-bold">Gerencie múltiplos canais</h3>
          <p className="mt-2 text-zinc-400">
            100 cortes/mês, dashboard multi-cliente, white label opcional
          </p>
          <div className="mt-6 text-5xl font-extrabold">
            R$150<span className="text-base text-zinc-400 font-normal">/mês</span>
          </div>
          <div className="mt-6 flex justify-center">
            <MagneticButton>
              <a
                href="https://pay.finaliza.shop/pl/71a2cf32b6"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-fuchsia-500 to-violet-500 text-white font-semibold shadow-[0_8px_30px_rgba(168,85,247,0.4)] hover:shadow-[0_12px_40px_rgba(168,85,247,0.6)] transition-shadow"
              >
                Falar com agência <Play className="w-4 h-4 fill-current" />
              </a>
            </MagneticButton>
          </div>
        </div>
      </section>

      {/* 5. FINAL CTA */}
      <section className="py-32 px-4 text-center">
        <h2 className="text-5xl md:text-6xl font-extrabold tracking-tight">
          Bora viralizar?
        </h2>
        <p className="mt-6 text-zinc-400 text-lg max-w-xl mx-auto">
          10 cortes grátis pra começar. Sem cartão. Sem cadastro chato.
        </p>
        <div className="mt-12 flex justify-center">
          <MagneticButton distance={0.4}>
            <a
              href="https://viralizacortes.com.br"
              className="inline-flex items-center gap-3 px-12 py-5 rounded-full bg-white text-black font-bold text-lg shadow-[0_10px_50px_rgba(255,255,255,0.3)] hover:scale-105 transition-transform"
            >
              Começar agora — é grátis
            </a>
          </MagneticButton>
        </div>
      </section>

      <footer className="py-8 text-center text-xs text-zinc-500 border-t border-white/5">
        <p>Preview /novo — Viraliza Cortes 2026</p>
        <p className="mt-2">
          Imagens são placeholders Unsplash. Substituir por prints/vídeos reais de cortes.
        </p>
      </footer>
    </div>
  );
}
