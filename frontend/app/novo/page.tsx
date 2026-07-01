"use client";

import { Sparkles, Zap, Crown, Building, Play } from "lucide-react";
import { CinematicHero } from "@/components/ui/cinematic-landing-hero";
import { CreativePricing, type PricingTier } from "@/components/ui/creative-pricing";
import { AIMultiModalGeneration } from "@/components/ui/ai-gen";
import { MagneticButton } from "@/components/ui/magnetic-button";
import Loader15 from "@/components/ui/loader-15";

const TIERS: PricingTier[] = [
  {
    name: "Starter",
    icon: <Sparkles className="w-6 h-6" />,
    price: 29.9,
    description: "Pra começar a crescer",
    color: "amber",
    features: ["55 cortes por mês", "Sem marca d'água", "TikTok + Reels + Shorts", "8 estilos de legenda", "Histórico de projetos"],
    ctaText: "Assinar Starter",
    ctaHref: "https://viralizacortes.carrinho.app/one-checkout/ocmtb/36710557",
  },
  {
    name: "Pro",
    icon: <Zap className="w-6 h-6" />,
    price: 49.9,
    description: "Pra criadores sérios",
    color: "blue",
    features: ["80 cortes por mês", "Tudo do Starter", "IA escolhe os mais virais", "Check-in diário (+créditos)", "Suporte prioritário"],
    popular: true,
    ctaText: "Quero o Pro",
    ctaHref: "https://viralizacortes.carrinho.app/one-checkout/ocmtb/36710590",
  },
  {
    name: "Full",
    icon: <Crown className="w-6 h-6" />,
    price: 99.9,
    description: "Pra quem quer escalar",
    color: "purple",
    features: ["140 cortes por mês", "Tudo do Pro", "IA avançada de viralização", "Brand Kit personalizado", "Suporte VIP"],
    ctaText: "Assinar Full",
    ctaHref: "https://viralizacortes.carrinho.app/one-checkout/ocmtb/36711838",
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
            220 cortes/mês · Múltiplos clientes · API de integração · Suporte VIP dedicado
          </p>
          <div className="mt-6 text-5xl font-extrabold">
            R$150<span className="text-base text-zinc-400 font-normal">/mês</span>
          </div>
          <div className="mt-6 flex justify-center">
            <MagneticButton>
              <a
                href="https://viralizacortes.carrinho.app/one-checkout/ocmtb/36711896"
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

      {/* 5. SEÇÃO PIX — pacotes de créditos */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="section-badge">PAGUE COM PIX</span>
            <h2 className="mt-4 text-4xl md:text-5xl font-bold tracking-tight">
              Prefere pagar uma vez?
            </h2>
            <p className="mt-4 text-zinc-400 text-lg max-w-xl mx-auto">
              Compra única via PIX com o <span className="text-green-400 font-semibold">dobro de créditos</span>. Sem assinatura, sem vencimento.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: "Starter", credits: 110, price: "R$29,90", href: "https://viralizacortes.carrinho.app/one-checkout/ocmtb/36888128" },
              { name: "Pro", credits: 160, price: "R$49,90", href: "https://viralizacortes.carrinho.app/one-checkout/ocmtb/36888178", popular: true },
              { name: "Full", credits: 280, price: "R$99,90", href: "https://viralizacortes.carrinho.app/one-checkout/ocmtb/36888195" },
              { name: "Agência", credits: 440, price: "R$150", href: "https://viralizacortes.carrinho.app/one-checkout/ocmtb/36888217" },
            ].map((pkg) => (
              <a
                key={pkg.name}
                href={pkg.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`relative flex flex-col rounded-2xl border p-6 text-center transition-all hover:scale-105 ${
                  pkg.popular
                    ? "border-green-500/50 bg-green-500/10 shadow-[0_0_30px_rgba(34,197,94,0.15)]"
                    : "border-white/10 bg-white/5 hover:border-white/20"
                }`}
              >
                {pkg.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-black text-xs font-bold px-3 py-1 rounded-full">
                    MAIS POPULAR
                  </span>
                )}
                <p className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">{pkg.name}</p>
                <p className="mt-3 text-4xl font-extrabold text-green-400">{pkg.credits}</p>
                <p className="text-sm text-zinc-500">créditos de cortes</p>
                <p className="mt-4 text-2xl font-bold">{pkg.price}</p>
                <p className="text-xs text-zinc-500 mb-4">pagamento único via PIX</p>
                <div className="mt-auto pt-4 border-t border-white/10">
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-green-400">
                    Pagar com PIX →
                  </span>
                </div>
              </a>
            ))}
          </div>
          <p className="text-center text-xs text-zinc-600 mt-6">Créditos não expiram · Acumule e use quando quiser</p>
        </div>
      </section>

      {/* 6. FINAL CTA */}
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
