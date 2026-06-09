"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const PLANS_DATA: Record<string, {
  name: string; price: string; priceNum: number; period: string;
  clips: number; features: string[]; color: string; description: string;
}> = {
  basico: {
    name: "Básico",
    price: "R$29,90",
    priceNum: 2990,
    period: "/mês",
    clips: 10,
    color: "#a78bfa",
    description: "Para criadores iniciantes que querem crescer",
    features: [
      "10 cortes por vídeo",
      "Vídeos ilimitados",
      "Sem marca d'água",
      "TikTok + Reels + Shorts",
      "Legendas automáticas",
      "Garantia de 7 dias",
    ],
  },
  pro: {
    name: "Pro",
    price: "R$49,90",
    priceNum: 4990,
    period: "/mês",
    clips: 20,
    color: "#8B2BE2",
    description: "Para criadores em crescimento acelerado",
    features: [
      "20 cortes por vídeo",
      "Vídeos ilimitados",
      "Sem marca d'água",
      "Todos os formatos",
      "4 estilos de legenda premium",
      "Download HD",
      "Garantia de 7 dias",
    ],
  },
  full: {
    name: "Full",
    price: "R$99,90",
    priceNum: 9990,
    period: "/mês",
    clips: 50,
    color: "#f97316",
    description: "Para criadores avançados com alto volume",
    features: [
      "50 cortes por vídeo",
      "Vídeos ilimitados",
      "Sem marca d'água",
      "Todos os formatos",
      "IA avançada de viralização",
      "Suporte prioritário",
      "Garantia de 7 dias",
    ],
  },
  agencia: {
    name: "Agência",
    price: "R$150",
    priceNum: 15000,
    period: "/mês",
    clips: 100,
    color: "#22d3ee",
    description: "Para equipes e agências de marketing",
    features: [
      "100 cortes por vídeo",
      "Vídeos ilimitados",
      "Tudo do Full",
      "10 contas simultâneas",
      "API de integração",
      "Suporte VIP",
      "Garantia de 7 dias",
    ],
  },
};

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const planKey = (params.plan as string)?.toLowerCase();
  const plan = PLANS_DATA[planKey];

  const [form, setForm] = useState({ name: "", email: "", cpf: "", phone: "" });
  const [payMethod, setPayMethod] = useState<"pix" | "card" | "boleto">("pix");
  const [cardData, setCardData] = useState({ number: "", holder: "", expiry: "", cvv: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pixData, setPixData] = useState<{ qrCode: string; copyPaste: string; expiresAt: string } | null>(null);
  const [copied, setCopied] = useState(false);

  if (!plan) {
    return (
      <div className="min-h-screen bg-[#050507] flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-2xl font-black mb-4">Plano não encontrado</p>
          <Link href="/#planos" className="text-purple-400 underline">Ver planos →</Link>
        </div>
      </div>
    );
  }

  function formatCPF(v: string) {
    const d = v.replace(/\D/g, "").slice(0, 11);
    return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
            .replace(/(\d{3})(\d{3})(\d{3})/, "$1.$2.$3")
            .replace(/(\d{3})(\d{3})/, "$1.$2");
  }
  function formatPhone(v: string) {
    const d = v.replace(/\D/g, "").slice(0, 11);
    return d.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
            .replace(/(\d{2})(\d{4,5})/, "($1) $2");
  }
  function formatCard(v: string) {
    return v.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})/g, "$1 ").trim();
  }
  function formatExpiry(v: string) {
    return v.replace(/\D/g, "").slice(0, 4).replace(/(\d{2})(\d)/, "$1/$2");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const cpfDigits = form.cpf.replace(/\D/g, "");
    const phoneDigits = form.phone.replace(/\D/g, "");
    if (!form.name || !form.email || cpfDigits.length < 11 || phoneDigits.length < 10) {
      setError("Preencha todos os campos corretamente.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/checkout/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: planKey,
          payMethod,
          customer: { name: form.name, email: form.email, cpf: cpfDigits, phone: phoneDigits },
          ...(payMethod === "card" && { card: cardData }),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao processar pagamento.");
      if (payMethod === "pix" && data.pix) {
        setPixData(data.pix);
      } else if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        router.push("/app?checkout=success");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao processar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  function copyPix() {
    if (pixData) {
      navigator.clipboard.writeText(pixData.copyPaste);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="min-h-screen bg-[#050507] text-white">
      {/* Header */}
      <header className="border-b border-white/5 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo-viraliza-cortes.png" alt="Viraliza Cortes" width={40} height={40} className="rounded-lg" />
            <span className="font-black text-sm text-white">Viraliza Cortes</span>
          </Link>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>🔒</span>
            <span>Pagamento 100% seguro</span>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid md:grid-cols-5 gap-8">

          {/* Coluna esquerda — Resumo do plano */}
          <div className="md:col-span-2">
            <div className="rounded-3xl p-7 sticky top-6"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="section-badge mb-4" style={{ color: plan.color, background: plan.color + "18", borderColor: plan.color + "40" }}>
                Plano {plan.name}
              </div>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-4xl font-black text-white">{plan.price}</span>
                <span className="text-gray-400 pb-1.5 font-bold">{plan.period}</span>
              </div>
              <p className="text-gray-400 text-sm mb-6 font-medium">{plan.description}</p>

              <div className="space-y-2.5 mb-7">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm">
                    <span className="text-green-400 font-black flex-shrink-0">✓</span>
                    <span className="text-gray-300 font-medium">{f}</span>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl px-4 py-4 text-center"
                style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)" }}>
                <p className="text-xs font-black text-green-400 mb-1">🔒 GARANTIA DE 7 DIAS</p>
                <p className="text-xs text-gray-500">Não satisfeito? Devolvemos cada centavo.</p>
              </div>
            </div>
          </div>

          {/* Coluna direita — Formulário */}
          <div className="md:col-span-3">
            {pixData ? (
              /* Tela PIX */
              <div className="rounded-3xl p-8 text-center"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="text-5xl mb-4">📱</div>
                <h2 className="text-2xl font-black mb-2">Pague com PIX</h2>
                <p className="text-gray-400 text-sm mb-6 font-medium">
                  Escaneie o QR Code ou copie o código abaixo para pagar.
                  Seu acesso é liberado em segundos após o pagamento.
                </p>

                {/* QR Code placeholder */}
                <div className="w-48 h-48 mx-auto mb-4 rounded-2xl flex items-center justify-center text-gray-600"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <div className="text-center">
                    <div className="text-4xl mb-2">📷</div>
                    <p className="text-xs">QR Code PIX</p>
                  </div>
                </div>

                <button
                  onClick={copyPix}
                  className="w-full py-3.5 rounded-2xl font-black text-sm mb-4 transition-all"
                  style={{
                    background: copied ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.06)",
                    border: `1px solid ${copied ? "rgba(34,197,94,0.4)" : "rgba(255,255,255,0.1)"}`,
                    color: copied ? "#4ade80" : "white",
                  }}>
                  {copied ? "✓ Código copiado!" : "📋 Copiar código PIX"}
                </button>

                <div className="rounded-2xl p-4 text-left mb-4"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <p className="text-xs text-gray-400 font-bold mb-1 uppercase tracking-wider">Código PIX</p>
                  <p className="text-xs text-gray-500 break-all font-mono">{pixData.copyPaste}</p>
                </div>

                <p className="text-xs text-gray-600 font-medium">
                  Expira em: {new Date(pixData.expiresAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                </p>
                <p className="text-xs text-gray-700 mt-2">Após o pagamento, seu acesso é liberado automaticamente.</p>
              </div>
            ) : (
              /* Formulário de checkout */
              <form onSubmit={handleSubmit} className="rounded-3xl p-8"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <h2 className="text-2xl font-black mb-6 tracking-tight">Finalizar compra</h2>

                {/* Dados pessoais */}
                <div className="mb-6">
                  <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">Seus dados</p>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Nome completo"
                      value={form.name}
                      onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                      className="input-premium w-full px-4 py-3 rounded-2xl text-sm"
                      required
                    />
                    <input
                      type="email"
                      placeholder="E-mail"
                      value={form.email}
                      onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                      className="input-premium w-full px-4 py-3 rounded-2xl text-sm"
                      required
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="CPF"
                        value={form.cpf}
                        onChange={(e) => setForm(f => ({ ...f, cpf: formatCPF(e.target.value) }))}
                        className="input-premium w-full px-4 py-3 rounded-2xl text-sm"
                        required
                      />
                      <input
                        type="text"
                        placeholder="WhatsApp (DDD + número)"
                        value={form.phone}
                        onChange={(e) => setForm(f => ({ ...f, phone: formatPhone(e.target.value) }))}
                        className="input-premium w-full px-4 py-3 rounded-2xl text-sm"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Método de pagamento */}
                <div className="mb-6">
                  <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">Forma de pagamento</p>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {(["pix", "card", "boleto"] as const).map((method) => {
                      const labels = { pix: "PIX", card: "Cartão", boleto: "Boleto" };
                      const icons  = { pix: "⚡", card: "💳", boleto: "📄" };
                      return (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setPayMethod(method)}
                          className="py-3 rounded-2xl text-sm font-black transition-all"
                          style={{
                            background: payMethod === method ? "rgba(139,43,226,0.2)" : "rgba(255,255,255,0.04)",
                            border: `1px solid ${payMethod === method ? "rgba(139,43,226,0.6)" : "rgba(255,255,255,0.08)"}`,
                            color: payMethod === method ? "#b44ff7" : "#9ca3af",
                          }}>
                          {icons[method]} {labels[method]}
                        </button>
                      );
                    })}
                  </div>

                  {payMethod === "pix" && (
                    <div className="rounded-2xl p-4 text-center"
                      style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)" }}>
                      <p className="text-sm font-black text-green-400">⚡ PIX — Aprovação instantânea</p>
                      <p className="text-xs text-gray-500 mt-1">Gere o QR Code e pague em segundos</p>
                    </div>
                  )}

                  {payMethod === "card" && (
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Número do cartão"
                        value={cardData.number}
                        onChange={(e) => setCardData(c => ({ ...c, number: formatCard(e.target.value) }))}
                        className="input-premium w-full px-4 py-3 rounded-2xl text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Nome no cartão"
                        value={cardData.holder}
                        onChange={(e) => setCardData(c => ({ ...c, holder: e.target.value.toUpperCase() }))}
                        className="input-premium w-full px-4 py-3 rounded-2xl text-sm"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Validade (MM/AA)"
                          value={cardData.expiry}
                          onChange={(e) => setCardData(c => ({ ...c, expiry: formatExpiry(e.target.value) }))}
                          className="input-premium w-full px-4 py-3 rounded-2xl text-sm"
                        />
                        <input
                          type="text"
                          placeholder="CVV"
                          value={cardData.cvv}
                          onChange={(e) => setCardData(c => ({ ...c, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                          className="input-premium w-full px-4 py-3 rounded-2xl text-sm"
                        />
                      </div>
                    </div>
                  )}

                  {payMethod === "boleto" && (
                    <div className="rounded-2xl p-4 text-center"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                      <p className="text-sm font-bold text-gray-300">📄 Boleto bancário</p>
                      <p className="text-xs text-gray-500 mt-1">Compensação em até 3 dias úteis</p>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="mb-4 px-4 py-3 rounded-2xl text-sm text-red-300 font-medium"
                    style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-4 rounded-2xl font-black text-base disabled:opacity-50">
                  {loading
                    ? "Processando..."
                    : payMethod === "pix"
                    ? "⚡ Gerar QR Code PIX"
                    : payMethod === "boleto"
                    ? "📄 Gerar Boleto"
                    : "💳 Finalizar Pagamento"}
                </button>

                <p className="text-center text-xs text-gray-600 mt-4 font-medium">
                  🔒 Pagamento processado com segurança pela APPMAX &nbsp;·&nbsp;
                  Seus dados estão protegidos
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
