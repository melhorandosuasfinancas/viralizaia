import type { Metadata } from "next";
import Link from "next/link";
import { posts } from "./posts/index";

export const metadata: Metadata = {
  title: "Blog — Dicas e Estratégias para Criadores de Conteúdo",
  description: "Guias, tutoriais e estratégias para criadores de conteúdo que querem crescer no TikTok, Instagram Reels e YouTube Shorts com cortes virais automáticos.",
  alternates: { canonical: "https://viralizacortes.com.br/blog" },
  openGraph: {
    title: "Blog Viraliza Cortes — Dicas para Criadores",
    description: "Guias e estratégias para crescer no TikTok, Reels e Shorts com IA.",
    url: "https://viralizacortes.com.br/blog",
    type: "website",
  },
};

const CATEGORY_COLORS: Record<string, string> = {
  Guias: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  Tutoriais: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  Estratégia: "bg-green-500/20 text-green-300 border-green-500/30",
  Ferramentas: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  Produtividade: "bg-pink-500/20 text-pink-300 border-pink-500/30",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function BlogPage() {
  const sorted = [...posts].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
  const featured = sorted[0];
  const rest = sorted.slice(1);

  return (
    <div className="min-h-screen bg-[#050507] text-[#f9f9f9]">
      {/* Nav */}
      <header className="border-b border-white/10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-sm">✂️</div>
            <span className="font-bold text-white">Viraliza Cortes</span>
          </Link>
          <Link href="/app" className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
            Começar Grátis
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-1.5 text-purple-300 text-sm font-medium mb-6">
            📚 Blog & Tutoriais
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
            Dicas para Criadores de Conteúdo
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Guias práticos, estratégias e tutoriais para crescer no TikTok, Instagram Reels e YouTube Shorts.
          </p>
        </div>

        {/* Featured Post */}
        <Link href={`/blog/${featured.slug}`} className="block group mb-16">
          <article className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/40 transition-all duration-300 hover:bg-white/[0.07]">
            <div className="p-8 md:p-10">
              <div className="flex items-center gap-3 mb-4">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${CATEGORY_COLORS[featured.category] || "bg-gray-500/20 text-gray-300 border-gray-500/30"}`}>
                  {featured.category}
                </span>
                <span className="text-gray-500 text-sm">• {formatDate(featured.publishedAt)}</span>
                <span className="text-gray-500 text-sm">• {featured.readTime} min de leitura</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 group-hover:text-purple-300 transition-colors leading-snug">
                {featured.title}
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed mb-6">{featured.excerpt}</p>
              <div className="flex flex-wrap gap-2 mb-6">
                {featured.tags.slice(0, 4).map((tag) => (
                  <span key={tag} className="text-xs bg-white/5 border border-white/10 text-gray-400 px-3 py-1 rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
              <span className="text-purple-400 font-semibold group-hover:text-purple-300 transition-colors">
                Ler artigo completo →
              </span>
            </div>
          </article>
        </Link>

        {/* Post Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rest.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="block group">
              <article className="h-full bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-purple-500/40 transition-all duration-300 hover:bg-white/[0.07] flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${CATEGORY_COLORS[post.category] || "bg-gray-500/20 text-gray-300 border-gray-500/30"}`}>
                    {post.category}
                  </span>
                  <span className="text-gray-600 text-xs">{post.readTime} min</span>
                </div>
                <h2 className="text-lg font-bold text-white mb-3 group-hover:text-purple-300 transition-colors leading-snug flex-1">
                  {post.title}
                </h2>
                <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-3">{post.excerpt}</p>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/10">
                  <span className="text-gray-600 text-xs">{formatDate(post.publishedAt)}</span>
                  <span className="text-purple-400 text-sm font-medium group-hover:text-purple-300 transition-colors">Ler →</span>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-20 text-center bg-gradient-to-br from-purple-900/30 to-blue-900/20 border border-purple-500/20 rounded-2xl p-10">
          <h2 className="text-3xl font-black text-white mb-4">Pronto para automatizar seus cortes virais?</h2>
          <p className="text-gray-400 mb-8 text-lg max-w-xl mx-auto">
            Crie sua conta grátis e transforme seu primeiro vídeo em clips virais em menos de 5 minutos.
          </p>
          <Link href="/app" className="inline-block bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-bold px-8 py-4 rounded-xl transition-all duration-200 shadow-lg shadow-purple-900/40">
            Começar Grátis — Sem Cartão de Crédito
          </Link>
        </div>
      </main>

      <footer className="border-t border-white/10 px-6 py-8 mt-16">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-gray-600 text-sm">
          <span>© 2026 Viraliza Cortes. Todos os direitos reservados.</span>
          <div className="flex gap-6">
            <Link href="/" className="hover:text-gray-400 transition-colors">Home</Link>
            <Link href="/#planos" className="hover:text-gray-400 transition-colors">Planos</Link>
            <Link href="/blog" className="hover:text-gray-400 transition-colors">Blog</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
