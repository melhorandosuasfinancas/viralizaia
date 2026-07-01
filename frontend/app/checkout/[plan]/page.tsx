"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

const APPMAX_URLS: Record<string, string> = {
  basico:  "https://viralizacortes.carrinho.app/one-checkout/ocmtb/36710557",
  pro:     "https://viralizacortes.carrinho.app/one-checkout/ocmtb/36710590",
  full:    "https://viralizacortes.carrinho.app/one-checkout/ocmtb/36711838",
  agencia: "https://viralizacortes.carrinho.app/one-checkout/ocmtb/36711896",
};

export default function CheckoutPage() {
  const params = useParams();
  const planKey = (params.plan as string)?.toLowerCase();
  const url = APPMAX_URLS[planKey];

  useEffect(() => {
    if (url) window.location.replace(url);
  }, [url]);

  if (!url) {
    return (
      <div className="min-h-screen bg-[#050507] flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-2xl font-black mb-4">Plano não encontrado</p>
          <Link href="/#planos" className="text-purple-400 underline">Ver planos →</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050507] flex items-center justify-center text-white">
      <div className="text-center">
        <Image src="/logo-viraliza-cortes.png" alt="Viraliza Cortes" width={64} height={64} className="rounded-2xl mx-auto mb-6" />
        <p className="text-gray-400 text-sm mb-2">Redirecionando para o checkout seguro...</p>
        <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  );
}
