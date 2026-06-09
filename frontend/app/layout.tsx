import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Viraliza Cortes — Cortes Virais Automáticos para TikTok, Reels e Shorts",
  description: "Transforme vídeos do YouTube em cortes virais para TikTok, Instagram Reels e YouTube Shorts automaticamente com IA. Legenda gravada, formato 9:16. Grátis para começar.",
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
  ],
  authors: [{ name: "Viraliza Cortes" }],
  creator: "Viraliza Cortes",
  publisher: "Viraliza Cortes",
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
    siteName: "Viraliza Cortes",
    title: "Viraliza Cortes — Cortes Virais Automáticos com IA",
    description: "Cole o link do YouTube e receba cortes virais prontos para TikTok, Reels e Shorts em menos de 3 minutos. Legenda automática gravada no vídeo.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Viraliza Cortes — Cortes Virais com IA",
    description: "Transforme vídeos longos em clips virais para TikTok, Instagram Reels e YouTube Shorts automaticamente.",
    creator: "@viralizacortes",
  },
  category: "technology",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Viraliza Cortes",
              "applicationCategory": "MultimediaApplication",
              "operatingSystem": "Web",
              "description": "Ferramenta de IA que transforma vídeos longos em cortes virais para TikTok, Instagram Reels e YouTube Shorts automaticamente.",
              "url": "https://viralizacortes.com.br",
              "inLanguage": "pt-BR",
              "offers": [
                {
                  "@type": "Offer",
                  "name": "Grátis",
                  "price": "0",
                  "priceCurrency": "BRL",
                  "description": "1 corte grátis sem cartão de crédito"
                },
                {
                  "@type": "Offer",
                  "name": "Starter",
                  "price": "19.90",
                  "priceCurrency": "BRL",
                  "billingIncrement": "P1M",
                  "description": "Vídeos ilimitados, até 10 cortes por vídeo"
                },
                {
                  "@type": "Offer",
                  "name": "Pro",
                  "price": "39.90",
                  "priceCurrency": "BRL",
                  "billingIncrement": "P1M",
                  "description": "Vídeos ilimitados, até 20 cortes por vídeo, todos os formatos"
                }
              ],
              "featureList": [
                "Cortes virais automáticos com IA",
                "Formato 9:16 para TikTok e Reels",
                "Legenda automática gravada no vídeo",
                "YouTube Shorts automático",
                "Download imediato em HD"
              ],
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.9",
                "ratingCount": "847",
                "bestRating": "5"
              }
            })
          }}
        />
      </head>
      <body className={`${inter.className} min-h-full bg-[#080808] text-[#f9f9f9]`}>
        {children}
      </body>
    </html>
  );
}
