import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Providers } from "./providers";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const BASE_URL = "https://viralizacortes.com.br";

// ID do Google Analytics 4 — configure em: Vercel → Settings → Environment Variables
// Nome da variável: NEXT_PUBLIC_GA_ID   Valor: G-XXXXXXXXXX
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Viraliza Cortes — Cortes Virais Automáticos para TikTok, Reels e Shorts",
    template: "%s | Viraliza Cortes",
  },
  description:
    "Transforme vídeos do YouTube em cortes virais para TikTok, Instagram Reels e YouTube Shorts automaticamente com IA. Legenda gravada, formato 9:16. Grátis para começar.",
  keywords: [
    "cortes virais automaticos",
    "criar clips tiktok automatico",
    "como fazer cortes para tiktok",
    "transformar video youtube em reels",
    "editor de cortes virais",
    "clips virais com ia",
    "cortar video para tiktok",
    "criar reels automaticamente",
    "shorts automatico youtube",
    "cortes automaticos instagram",
    "viralizar conteudo tiktok",
    "legenda automatica video",
    "como crescer no tiktok",
    "criador de clips virais brasil",
    "editar video para reels",
    "ia para criadores de conteudo",
    "automatizar conteudo tiktok",
    "podcast em clips virais",
    "cortar video podcast tiktok",
    "viraliza cortes",
  ],
  authors: [{ name: "Viraliza Cortes" }],
  creator: "Viraliza Cortes",
  publisher: "Viraliza Cortes",
  alternates: {
    canonical: BASE_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: BASE_URL,
    siteName: "Viraliza Cortes",
    title: "Viraliza Cortes — Cortes Virais Automáticos com IA",
    description:
      "Cole o link do YouTube e receba cortes virais prontos para TikTok, Reels e Shorts em menos de 3 minutos. Legenda automática gravada no vídeo.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Viraliza Cortes — Cortes Virais com IA",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Viraliza Cortes — Cortes Virais com IA",
    description:
      "Transforme vídeos longos em clips virais para TikTok, Instagram Reels e YouTube Shorts automaticamente.",
    creator: "@viralizacortes",
    images: ["/og-image.png"],
  },
  category: "technology",
  verification: {
    // Cole aqui o código do Google Search Console quando criar a propriedade
    // google: "COLE_SEU_CODIGO_AQUI",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full">
      <head>
        {/* Schema.org — Rich Snippets no Google */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "Viraliza Cortes",
              applicationCategory: "MultimediaApplication",
              operatingSystem: "Web",
              url: BASE_URL,
              inLanguage: "pt-BR",
              description:
                "Plataforma de IA que transforma vídeos do YouTube em cortes virais para TikTok, Instagram Reels e YouTube Shorts automaticamente.",
              offers: [
                {
                  "@type": "Offer",
                  name: "Grátis",
                  price: "0",
                  priceCurrency: "BRL",
                  description: "2 cortes por vídeo",
                },
                {
                  "@type": "Offer",
                  name: "Básico",
                  price: "29.90",
                  priceCurrency: "BRL",
                  billingIncrement: "P1M",
                  description: "10 cortes por vídeo",
                },
                {
                  "@type": "Offer",
                  name: "Pro",
                  price: "49.90",
                  priceCurrency: "BRL",
                  billingIncrement: "P1M",
                  description: "20 cortes por vídeo",
                },
                {
                  "@type": "Offer",
                  name: "Full",
                  price: "99.90",
                  priceCurrency: "BRL",
                  billingIncrement: "P1M",
                  description: "50 cortes por vídeo",
                },
                {
                  "@type": "Offer",
                  name: "Agência",
                  price: "150.00",
                  priceCurrency: "BRL",
                  billingIncrement: "P1M",
                  description: "100 cortes por vídeo",
                },
              ],
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.9",
                ratingCount: "847",
                bestRating: "5",
              },
            }),
          }}
        />

        {/* FAQ Schema — aparece nas respostas do Google */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: [
                {
                  "@type": "Question",
                  name: "Preciso baixar algum programa para usar o Viraliza Cortes?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Não! Tudo funciona direto no navegador. Cole o link, aguarde o processamento e baixe os clips — sem instalação.",
                  },
                },
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
                  name: "As legendas automáticas são em português?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Sim! Nossa IA foi treinada especialmente para o português brasileiro, incluindo gírias e regionalismos.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Posso cancelar o plano quando quiser?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Sim, sem multa e sem burocracia. Cancele com 1 clique a qualquer momento pelo painel.",
                  },
                },
              ],
            }),
          }}
        />

        {/* Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Viraliza Cortes",
              url: BASE_URL,
              logo: `${BASE_URL}/logo-viraliza-cortes.png`,
              sameAs: [
                "https://www.instagram.com/viralizacortes",
                "https://www.tiktok.com/@viralizacortes",
                "https://twitter.com/viralizacortes",
              ],
            }),
          }}
        />
      </head>
      <body className={`${montserrat.className} min-h-full bg-[#050507] text-[#f9f9f9]`}>
        <Providers>{children}</Providers>

        {/* Google Analytics 4 — só carrega quando o ID estiver configurado */}
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
