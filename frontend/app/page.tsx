"use client";

import Link from "next/link";
import { useState } from "react";

const FEATURES = [
  {
    icon: "🤖",
    title: "IA Escolhe os Melhores Momentos",
    desc: "Nossa IA analisa o vídeo e identifica automaticamente os trechos mais virais — sem você precisar assistir tudo.",
  },
  {
    icon: "📱",
    title: "Todos os Formatos de Uma Vez",
    desc: "TikTok 9:16, Instagram Reels, Feed 4:5, Quadrado 1:1 e Facebook — tudo gerado em uma única ação.",
  },
  {
    icon: "⚡",
    title: "Legendas Automáticas",
    desc: "Transcrição com Whisper AI adicionada automaticamente em cada corte, pronta para publicar.",
  },
  {
    icon: "⬇️",
    title: "Download Imediato",
    desc: "Baixe todos os clips em segundos, prontos para postar — sem marca d'água.",
  },
];

const PLANS = [
  {
    name: "Starter",
    price: "R$47",
    period: "/mês",
    desc: "Para quem está começando",
    features: [
      "10 vídeos por mês",
      "Até 5 cortes por vídeo",
      "TikTok + Instagram Reels",
      "Legendas automáticas",
      "Download em HD",
    ],
    cta: "Começar Agora",
    href: "#checkout",
    highlight: false,
  },
  {
    name: "Pro",
    price: "R$97",
    period: "/mês",
    desc: "Para criadores sérios",
    features: [
      "Ilimitado vídeos",
      "Até 10 cortes por vídeo",
      "Todos os formatos + Facebook",
      "IA avançada de viralização",
      "Legendas + hook gerado por IA",
      "Prioridade no processamento",
    ],
    cta: "Quero o Pro",
    href: "#checkout",
    highlight: true,
  },
];

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (email) setSubmitted(true);
  }

  return (
    <div className="min-h-screen bg-[#080808]">
      {/* NAV */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="text-xl font-bold gradient-text">ViralizaIA</div>
        <div className="flex items-center gap-4">
          <Link
            href="#plans"
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Planos
          </Link>
          <Link
            href="/app"
            className="btn-primary px-4 py-2 rounded-full text-sm font-semibold"
          >
            Entrar
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="text-center px-6 pt-16 pb-24 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-1.5 text-purple-300 text-sm mb-6">
          <span>⚡</span>
          <span>IA que cria cortes virais automaticamente</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
          Transforme qualquer{" "}
          <span className="gradient-text">vídeo do YouTube</span>
          <br />
          em cortes virais para{" "}
          <span className="gradient-text">TikTok e Instagram</span>
        </h1>

        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10">
          Cole o link, a IA analisa e gera automaticamente os melhores cortes — já
          no formato certo para cada plataforma, com legenda. Sem editar, sem
          assistir o vídeo inteiro.
        </p>

        <form
          onSubmit={handleEmailSubmit}
          className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
        >
          {!submitted ? (
            <>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Seu melhor e-mail"
                required
                className="flex-1 bg-white/5 border border-white/10 rounded-full px-5 py-3 text-sm outline-none focus:border-purple-500 transition-colors"
              />
              <button
                type="submit"
                className="btn-primary px-6 py-3 rounded-full text-sm font-bold whitespace-nowrap"
              >
                Quero Acesso Gratuito →
              </button>
            </>
          ) : (
            <div className="flex-1 text-center py-3 text-green-400 font-semibold">
              ✅ Perfeito! Te avisamos quando abrir o acesso.
            </div>
          )}
        </form>

        <p className="text-gray-600 text-xs mt-3">
          Sem cartão de crédito para teste • Cancele quando quiser
        </p>
      </section>

      {/* DEMO VISUAL */}
      <section className="px-6 pb-24 max-w-5xl mx-auto">
        <div
          className="card-glow rounded-2xl overflow-hidden bg-[#0f0f0f]"
          style={{ minHeight: 300 }}
        >
          <div className="bg-[#1a1a1a] px-4 py-3 flex items-center gap-2 border-b border-white/5">
            <div className="w-3 h-3 rounded-full bg-red-500/60" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <div className="w-3 h-3 rounded-full bg-green-500/60" />
            <div className="flex-1 bg-white/5 rounded-full px-4 py-1 text-xs text-gray-500 ml-4 max-w-xs">
              app.viralizaia.com.br
            </div>
          </div>
          <div className="p-6 md:p-10">
            <div className="grid md:grid-cols-2 gap-6 items-center">
              <div>
                <p className="text-xs text-gray-500 mb-2">Cole o link do YouTube</p>
                <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-300 mb-4 flex items-center gap-2">
                  <span className="text-red-400">▶</span>
                  youtube.com/watch?v=xK3p2mN...
                </div>
                <div className="flex gap-2 mb-6 flex-wrap">
                  {["TikTok", "Reels", "Feed", "Facebook"].map((p) => (
                    <span
                      key={p}
                      className="text-xs px-3 py-1 rounded-full border border-purple-500/30 text-purple-300 bg-purple-500/10"
                    >
                      {p}
                    </span>
                  ))}
                </div>
                <button className="btn-primary w-full py-3 rounded-xl text-sm font-bold">
                  🤖 Gerar Cortes com IA
                </button>
              </div>
              <div className="space-y-3">
                {[
                  { num: 1, time: "0:15 – 1:12", score: 9, label: "TikTok" },
                  { num: 2, time: "3:40 – 4:28", score: 8, label: "Reels" },
                  { num: 3, time: "7:02 – 7:55", score: 7, label: "Feed" },
                ].map((clip) => (
                  <div
                    key={clip.num}
                    className="bg-white/5 border border-white/8 rounded-xl p-3 flex items-center gap-3"
                  >
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center text-purple-300 font-bold text-sm flex-shrink-0">
                      #{clip.num}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-400">{clip.time}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <div
                          className="h-1.5 rounded-full progress-animated"
                          style={{ width: `${clip.score * 10}%` }}
                        />
                        <span className="text-xs text-gray-500">{clip.score}/10</span>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/20">
                      {clip.label}
                    </span>
                    <button className="text-xs text-blue-400 hover:text-blue-300">
                      ⬇️
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="px-6 pb-24 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">
          Tudo que você precisa para{" "}
          <span className="gradient-text">viralizar mais rápido</span>
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="bg-[#0f0f0f] border border-white/8 rounded-2xl p-6"
            >
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PLANS */}
      <section id="plans" className="px-6 pb-24 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-4">
          Planos simples, resultado{" "}
          <span className="gradient-text">garantido</span>
        </h2>
        <p className="text-gray-400 text-center mb-12">
          Cancele quando quiser. Sem fidelidade.
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-6 relative ${
                plan.highlight
                  ? "card-glow bg-gradient-to-b from-purple-900/20 to-[#0f0f0f]"
                  : "bg-[#0f0f0f] border border-white/8"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                  MAIS POPULAR
                </div>
              )}
              <p className="text-gray-400 text-sm mb-1">{plan.name}</p>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-4xl font-extrabold">{plan.price}</span>
                <span className="text-gray-400 pb-1">{plan.period}</span>
              </div>
              <p className="text-gray-500 text-xs mb-6">{plan.desc}</p>
              <ul className="space-y-2 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                    <span className="text-green-400">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href={plan.href}
                className={`block text-center py-3 rounded-xl font-bold text-sm transition-all ${
                  plan.highlight
                    ? "btn-primary"
                    : "bg-white/5 border border-white/10 hover:bg-white/10"
                }`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 px-6 py-8 text-center">
        <p className="gradient-text font-bold text-lg mb-2">ViralizaIA</p>
        <p className="text-gray-600 text-xs">
          © 2026 ViralizaIA • Feito no Brasil para criadores brasileiros
        </p>
      </footer>
    </div>
  );
}
