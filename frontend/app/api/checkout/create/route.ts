import { NextRequest, NextResponse } from "next/server";

const APPMAX_API_URL = "https://backend.appmax.com.br/api/v3";
const APPMAX_ACCESS_TOKEN = process.env.APPMAX_ACCESS_TOKEN || "";

const PLAN_PRODUCT_IDS: Record<string, string> = {
  basico:  process.env.APPMAX_BASICO_ID  || "",
  pro:     process.env.APPMAX_PRO_ID     || "",
  full:    process.env.APPMAX_FULL_ID    || "",
  agencia: process.env.APPMAX_AGENCIA_ID || "",
};

const PLAN_PAYMENT_LINKS: Record<string, string> = {
  basico:  process.env.APPMAX_BASICO_LINK  || "https://viralizacortes.carrinho.app/one-checkout/ocmtb/36710557",
  pro:     process.env.APPMAX_PRO_LINK     || "https://viralizacortes.carrinho.app/one-checkout/ocmtb/36710590",
  full:    process.env.APPMAX_FULL_LINK    || "https://viralizacortes.carrinho.app/one-checkout/ocmtb/36711838",
  agencia: process.env.APPMAX_AGENCIA_LINK || "https://viralizacortes.carrinho.app/one-checkout/ocmtb/36711896",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { plan, payMethod, customer, card } = body;

    const productId = PLAN_PRODUCT_IDS[plan];
    if (!productId) {
      return NextResponse.json({ error: "Plano inválido." }, { status: 400 });
    }
    if (!APPMAX_ACCESS_TOKEN) {
      const paymentLink = PLAN_PAYMENT_LINKS[plan];
      return NextResponse.json({ redirectUrl: paymentLink }, { status: 200 });
    }

    // Mapeia método de pagamento para formato APPMAX
    const paymentMethodMap: Record<string, string> = {
      pix:    "pix",
      card:   "credit-card",
      boleto: "boleto",
    };
    const appmaxMethod = paymentMethodMap[payMethod] || "pix";

    // Monta payload APPMAX
    const payload: Record<string, unknown> = {
      access_token: APPMAX_ACCESS_TOKEN,
      customer: {
        firstname: customer.name.split(" ")[0],
        lastname:  customer.name.split(" ").slice(1).join(" ") || ".",
        email:     customer.email,
        document:  customer.cpf,
        telephone: customer.phone,
      },
      products: [{ sku: productId, qty: 1 }],
      payment: { method: appmaxMethod },
    };

    // Adiciona dados do cartão se necessário
    if (payMethod === "card" && card) {
      const [expMonth, expYear] = (card.expiry || "").split("/");
      payload.payment = {
        method: "credit-card",
        credit_card: {
          number:       card.number.replace(/\s/g, ""),
          holder_name:  card.holder,
          exp_month:    expMonth?.padStart(2, "0"),
          exp_year:     expYear ? `20${expYear}` : "",
          cvv:          card.cvv,
          installments: 1,
        },
      };
    }

    // Chama API APPMAX
    const appmaxRes = await fetch(`${APPMAX_API_URL}/order`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(payload),
    });

    const appmaxData = await appmaxRes.json();

    if (!appmaxRes.ok || appmaxData.error) {
      const msg = appmaxData.message || appmaxData.error || "Erro ao processar pagamento.";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    // Retorna de acordo com o método escolhido
    if (payMethod === "pix" && appmaxData.data?.pix) {
      return NextResponse.json({
        pix: {
          qrCode:    appmaxData.data.pix.qrcode_image || "",
          copyPaste: appmaxData.data.pix.qrcode       || "",
          expiresAt: appmaxData.data.pix.expiration   || new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        },
      });
    }

    if (payMethod === "boleto" && appmaxData.data?.boleto) {
      return NextResponse.json({
        redirectUrl: appmaxData.data.boleto.url || appmaxData.data.boleto.digitable_line,
      });
    }

    // Cartão: retorna success ou URL de redirect
    return NextResponse.json({
      success: true,
      redirectUrl: appmaxData.data?.redirect_url || null,
    });

  } catch (err: unknown) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: "Erro interno. Tente novamente ou contate o suporte." },
      { status: 500 }
    );
  }
}
