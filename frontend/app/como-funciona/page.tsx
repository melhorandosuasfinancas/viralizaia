import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Como Funciona — Cortes Virais com IA em 3 Passos",
  description:
    "Veja como o Viraliza Cortes transforma vídeos do YouTube em clips virais para TikTok, Instagram Reels e YouTube Shorts automaticamente. Cole o link, a IA faz o trabalho.",
  alternates: { canonical: "https://viralizacortes.com.br/como-funciona" },
  openGraph: {
    title: "Como Funciona o Viraliza Cortes — Cortes Virais com IA",
    description:
      "Cole o link do YouTube e receba clips virais prontos em 3 minutos. Legenda automática, formato 9:16, sem edição.",
    url: "https://viralizacortes.com.br/como-funciona",
    type: "website",
  },
};

const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "Como criar cortes virais para TikTok com IA",
  description:
    "Transforme vídeos do YouTube em cortes virais prontos para TikTok, Instagram Reels e YouTube Shorts em 3 passos simples usando o Viraliza Cortes.",
  totalTime: "PT5M",
  tool: [{ "@type": "HowToTool", name: "Viraliza Cortes", url: "https://viralizacortes.com.br" }],
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Cole o link do YouTube",
      text: "Acesse viralizacortes.com.br, faça login e cole o link de qualquer vídeo do YouTube. A plataforma suporta vídeos de até 4 horas.",
      image: "https://viralizacortes.com.br/og-image.png",
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "A IA analisa e seleciona os melhores momentos",
      text: "Nossa IA transcreve o áudio, analisa 18 parâmetros de viralidade e seleciona automaticamente os trechos com maior potencial para TikTok, Reels e Shorts. Pronto em 2 a 5 minutos.",
      image: "https://viralizacortes.com.br/og-image.png",
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Baixe os clips prontos e publique",
      text: "Receba os clips em formato 9:16 com legendas automáticas em português gravadas no vídeo. Baixe em Full HD e publique direto no TikTok, Instagram Reels e YouTube Shorts.",
      image: "https://viralizacortes.com.br/og-image.png",
    },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Quanto tempo leva para gerar os cortes virais?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Em média 2 a 5 minutos por hora de vídeo. Para vídeos de 30 minutos, seus cortes ficam prontos em menos de 2 minutos.",
      },
    },
    {
      "@type": "Question",
      name: "Preciso baixar algum programa?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Não. Tudo funciona direto no navegador — cole o link, aguarde o processamento e baixe os clips. Sem instalação.",
      },
    },
    {
      "@type": "Question",
      name: "O Viraliza Cortes funciona com qualquer vídeo do YouTube?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Funciona com qualquer vídeo público do YouTube. Os melhores resultados são com podcasts, entrevistas, lives e aulas — conteúdo com narração contínua.",
      },
    },
    {
      "@type": "Question",
      name: "As legendas automáticas são em português brasileiro?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sim. Nossa IA foi treinada especialmente para o português brasileiro, incluindo gírias, regionalismos e o português coloquial falado em podcasts e lives.",
      },
    },
    {
      "@type": "Question",
      name: "Os clips têm marca d'água?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "O plano gratuito inclui marca d'água. Nos planos pagos (a partir de R$29,90/mês) todos os clips são entregues sem marca d'água em Full HD.",
      },
    },
    {
      "@type": "Question",
      name: "Posso fazer upload de vídeo sem ser do YouTube?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sim. Além do link do YouTube, você pode fazer upload de qualquer arquivo de vídeo MP4 diretamente para a plataforma.",
      },
    },
  ],
};

const steps = [
  {
    number: "01",
    title: "Cole o link do YouTube",
    description:
      "Acesse viralizacortes.com.br e cole o link de qualquer vídeo público do YouTube. Funciona com podcasts, entrevistas, lives, palestras e qualquer conteúdo com narração.",
    detail: "Suporta vídeos de até 4 horas de duração.",
    icon: "🔗",
  },
  {
    number: "02",
    title: "A IA seleciona os melhores momentos",
    description:
      "Nossa inteligência artificial transcreve o áudio em português e analisa 18 parâmetros de viralidade para identificar os trechos com maior potencial para TikTok, Reels e Shorts.",
    detail: "Pronto em 2 a 5 minutos. Sem você fazer nada.",
    icon: "🤖",
  },
  {
    number: "03",
    title: "Baixe e publique",
    description:
      "Receba os clips prontos em formato 9:16 com legendas automáticas em português gravadas no vídeo. Baixe em Full HD e publique direto no TikTok, Instagram Reels e YouTube Shorts.",
    detail: "Sem edição. Sem conhecimento técnico.",
    icon: "✅",
  },
];

const features = [
  { icon: "🎯", title: "IA que entende português", description: "Treinada para gírias, regionalismos e o português coloquial do Brasil." },
  { icon: "📝", title: "8 estilos de legenda", description: "TikTok, Hormozi, Dark Box, Clean, Open Sans, Ubuntu, Montserrat e Neon." },
  { icon: "📐", title: "Formato 9:16 automático", description: "Corte inteligente para TikTok e Reels. Também gera 4:5 e 16:9." },
  { icon: "⚡", title: "GPU dedicada", description: "Processamento em GPU — muito mais rápido que concorrentes com CPU." },
  { icon: "🚫", title: "Sem marca d'água", description: "Todos os clips nos planos pagos entregues sem marca d'água em Full HD." },
  { icon: "📤", title: "Upload ou link", description: "Cole link do YouTube ou faça upload de qualquer arquivo MP4." },
];

const faqs = [
  {
    q: "Quanto tempo leva para gerar os cortes virais?",
    a: "Em média 2 a 5 minutos por hora de vídeo. Para vídeos de 30 minutos, seus cortes ficam prontos em menos de 2 minutos.",
  },
  {
    q: "Preciso baixar algum programa?",
    a: "Não. Tudo funciona direto no navegador — cole o link, aguarde o processamento e baixe os clips. Sem instalação.",
  },
  {
    q: "O Viraliza Cortes funciona com qualquer vídeo do YouTube?",
    a: "Funciona com qualquer vídeo público do YouTube. Os melhores resultados são com podcasts, entrevistas, lives e aulas — conteúdo com narração contínua.",
  },
  {
    q: "As legendas automáticas são em português brasileiro?",
    a: "Sim. Nossa IA foi treinada especialmente para o português brasileiro, incluindo gírias, regionalismos e o português coloquial falado em podcasts e lives.",
  },
  {
    q: "Os clips têm marca d'água?",
    a: "O plano gratuito inclui marca d'água. Nos planos pagos (a partir de R$29,90/mês) todos os clips são entregues sem marca d'água em Full HD.",
  },
  {
    q: "Posso fazer upload de vídeo sem ser do YouTube?",
    a: "Sim. Além do link do YouTube, você pode fazer upload de qualquer arquivo de vídeo MP4 diretamente para a plataforma.",
  },
];

export default function ComoFuncionaPage() {
  return (
    <div className="min-h-screen bg-[#050507] text-[#f9f9f9]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* Nav */}
      <header className="border-b border-white/10 px-6 py-4 sticky top-0 z-50 bg-[#050507]/90 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-sm">
              ✂️
            </div>
            <span className="font-bold text-white">Viraliza Cortes</span>
          </Link>
          <Link
            href="/app"
            className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            Começar Grátis
          </Link>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="max-w-5xl mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-1.5 text-purple-300 text-sm font-medium mb-6">
            ✂️ Simples. Rápido. Automático.
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
            Cole o link.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400">
              A IA faz o resto.
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Transforme qualquer vídeo do YouTube em cortes virais prontos para TikTok, Instagram Reels e YouTube Shorts em menos de 5 minutos — com legenda automática em português.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/app"
              className="bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-bold px-8 py-4 rounded-xl transition-all duration-200 shadow-lg shadow-purple-900/40 text-lg"
            >
              Testar Grátis — Sem Cartão
            </Link>
            <Link
              href="/blog"
              className="border border-white/20 text-gray-300 hover:border-white/40 hover:text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 text-lg"
            >
              Ver Tutoriais
            </Link>
          </div>
        </section>

        {/* Steps */}
        <section className="max-w-5xl mx-auto px-6 pb-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Como funciona em 3 passos</h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              Do link do YouTube aos clips prontos para publicar — sem edição, sem conhecimento técnico.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {steps.map((step) => (
              <div
                key={step.number}
                className="relative bg-white/5 border border-white/10 rounded-2xl p-8 hover:border-purple-500/30 transition-all"
              >
                <div className="text-5xl mb-4">{step.icon}</div>
                <div className="text-purple-400 text-sm font-bold mb-2 tracking-widest">PASSO {step.number}</div>
                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-gray-400 leading-relaxed mb-4">{step.description}</p>
                <p className="text-purple-300 text-sm font-medium">{step.detail}</p>
              </div>
            ))}
          </div>

          {/* Features */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-white mb-4">O que vem em cada corte</h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              Cada clip gerado já vem pronto para publicar — sem ajustes adicionais.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-24">
            {features.map((f) => (
              <div key={f.title} className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-purple-500/20 transition-all">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-bold text-white mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>

          {/* FAQ */}
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-black text-white text-center mb-12">Perguntas frequentes</h2>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <div key={faq.q} className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="font-bold text-white mb-2">{faq.q}</h3>
                  <p className="text-gray-400 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA final */}
        <section className="border-t border-white/10 bg-gradient-to-b from-purple-950/20 to-transparent">
          <div className="max-w-3xl mx-auto px-6 py-20 text-center">
            <div className="text-4xl mb-4">✂️</div>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              Pronto para começar?
            </h2>
            <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
              2 cortes grátis, sem cartão de crédito. Veja com seus próprios olhos em menos de 5 minutos.
            </p>
            <Link
              href="/app"
              className="inline-block bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-bold px-10 py-4 rounded-xl transition-all duration-200 shadow-lg shadow-purple-900/40 text-lg"
            >
              Criar Meus Primeiros Cortes Grátis
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 px-6 py-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-gray-600 text-sm">
          <span>© 2026 Viraliza Cortes. Todos os direitos reservados.</span>
          <div className="flex gap-6">
            <Link href="/" className="hover:text-gray-400 transition-colors">Home</Link>
            <Link href="/como-funciona" className="hover:text-gray-400 transition-colors">Como Funciona</Link>
            <Link href="/#planos" className="hover:text-gray-400 transition-colors">Planos</Link>
            <Link href="/blog" className="hover:text-gray-400 transition-colors">Blog</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
