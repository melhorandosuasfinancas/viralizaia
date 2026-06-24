import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug, getAllSlugs, posts } from "../posts/index";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  const url = `https://viralizacortes.com.br/blog/${post.slug}`;
  return {
    title: post.title,
    description: post.description,
    keywords: post.tags,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      type: "article",
      publishedTime: post.publishedAt,
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const related = posts
    .filter((p) => p.slug !== slug && p.tags.some((t) => post.tags.includes(t)))
    .slice(0, 3);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    author: { "@type": "Organization", name: "Viraliza Cortes" },
    publisher: {
      "@type": "Organization",
      name: "Viraliza Cortes",
      logo: { "@type": "ImageObject", url: "https://viralizacortes.com.br/logo-viraliza-cortes.png" },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": `https://viralizacortes.com.br/blog/${slug}` },
  };

  return (
    <div className="min-h-screen bg-[#050507] text-[#f9f9f9]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />

      {/* Nav */}
      <header className="border-b border-white/10 px-6 py-4 sticky top-0 z-50 bg-[#050507]/90 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-sm">✂️</div>
            <span className="font-bold text-white">Viraliza Cortes</span>
          </Link>
          <Link href="/app" className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
            Começar Grátis
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-gray-300 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-gray-300 transition-colors">Blog</Link>
          <span>/</span>
          <span className="text-gray-400 truncate max-w-xs">{post.title}</span>
        </nav>

        {/* Article header */}
        <article>
          <header className="mb-10">
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold px-3 py-1 rounded-full">
                {post.category}
              </span>
              <span className="text-gray-500 text-sm">{formatDate(post.publishedAt)}</span>
              <span className="text-gray-500 text-sm">· {post.readTime} min de leitura</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight mb-6">
              {post.title}
            </h1>
            <p className="text-xl text-gray-400 leading-relaxed">{post.description}</p>
          </header>

          {/* Article content */}
          <div
            className="prose-viraliza"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-10 pt-8 border-t border-white/10">
            {post.tags.map((tag) => (
              <span key={tag} className="text-xs bg-white/5 border border-white/10 text-gray-400 px-3 py-1 rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        </article>

        {/* CTA inline */}
        <div className="my-12 bg-gradient-to-br from-purple-900/40 to-blue-900/20 border border-purple-500/30 rounded-2xl p-8 text-center">
          <div className="text-3xl mb-3">✂️</div>
          <h2 className="text-2xl font-black text-white mb-3">Experimente gratuitamente</h2>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Transforme seu próximo vídeo em cortes virais com IA. 2 cortes grátis, sem cartão de crédito.
          </p>
          <Link href="/app" className="inline-block bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-bold px-6 py-3 rounded-xl transition-all duration-200">
            Começar Grátis Agora
          </Link>
        </div>

        {/* Related posts */}
        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-bold text-white mb-6">Artigos relacionados</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {related.map((p) => (
                <Link key={p.slug} href={`/blog/${p.slug}`} className="block group">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-purple-500/40 transition-all h-full">
                    <span className="text-purple-400 text-xs font-medium">{p.category}</span>
                    <h3 className="text-sm font-bold text-white mt-1 mb-2 group-hover:text-purple-300 transition-colors leading-snug">
                      {p.title}
                    </h3>
                    <span className="text-xs text-gray-500">{p.readTime} min de leitura</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-white/10 px-6 py-8 mt-16">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-gray-600 text-sm">
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
