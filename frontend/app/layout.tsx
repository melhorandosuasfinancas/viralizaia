import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ViralizaIA — Cortes Virais com Inteligência Artificial",
  description: "Transforme qualquer vídeo do YouTube em cortes virais para TikTok, Instagram e Facebook automaticamente com IA.",
  keywords: "cortes virais, tiktok, instagram, reels, youtube, inteligência artificial, criador de conteúdo",
  openGraph: {
    title: "ViralizaIA",
    description: "Cortes virais automáticos com IA para criadores de conteúdo brasileiros",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className={`${inter.className} min-h-full bg-[#080808] text-[#f9f9f9]`}>
        {children}
      </body>
    </html>
  );
}
