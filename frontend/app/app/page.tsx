"use client";

import { useState, useEffect, useRef } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import {
  startProcessing, uploadAndProcess, getJobStatus, getDownloadUrl,
  deleteJob, getStatusLabel, getAuthToken, getTrialToken, getOAuthToken,
  saveWhatsapp, fetchCredits, checkIn,
  type Credits, type Clip, type Job, type Platform, type CaptionStyle, type Plan,
} from "@/lib/api";

const PLATFORM_OPTIONS: { id: Platform; label: string; icon: string }[] = [
  { id: "tiktok",    label: "TikTok",    icon: "🎵" },
  { id: "instagram", label: "Instagram", icon: "📸" },
  { id: "facebook",  label: "Facebook",  icon: "👥" },
  { id: "youtube",   label: "YT Shorts", icon: "▶️" },
];

const CAPTION_OPTIONS: { id: CaptionStyle; label: string; desc: string; badge?: string }[] = [
  { id: "tiktok",     label: "TikTok",      desc: "Branco + contorno preto — estilo viral" },
  { id: "hormozi",    label: "Hormozi",     desc: "Branco + contorno amarelo — impacto máximo", badge: "🔥" },
  { id: "dark",       label: "Dark Box",    desc: "Caixa escura semi-transparente — legível" },
  { id: "clean",      label: "Clean",       desc: "Texto limpo com sombra sutil" },
  { id: "opensans",   label: "Open Sans",   desc: "Moderno e legível — destaque garantido" },
  { id: "ubuntu",     label: "Ubuntu Bold", desc: "Arredondado e vibrante — muito lido" },
  { id: "montserrat", label: "Montserrat",  desc: "Premium — usado por grandes canais", badge: "⭐" },
  { id: "neon",       label: "Neon Azul",   desc: "Texto ciano com brilho — destaque máximo" },
];

const CAPTION_PREVIEW: Record<string, { text: string; color: string; textShadow: string; bg: string; fontFamily: string; anim: string }> = {
  tiktok:     { text: "palavra viral", color: "#fff",    textShadow: "-2px -2px 0 #000,2px -2px 0 #000,-2px 2px 0 #000,2px 2px 0 #000", bg: "transparent",      fontFamily: "sans-serif",            anim: "cpop"   },
  hormozi:    { text: "IMPACTO!",      color: "#FFBF00", textShadow: "-2px -2px 0 #000,2px -2px 0 #000,-2px 2px 0 #000,2px 2px 0 #000", bg: "transparent",      fontFamily: "sans-serif",            anim: "czoom"  },
  dark:       { text: "fácil de ler",  color: "#fff",    textShadow: "none",                                                              bg: "rgba(0,0,0,0.65)", fontFamily: "sans-serif",            anim: "cslide" },
  clean:      { text: "texto limpo",   color: "#B0C4DE", textShadow: "1px 1px 2px rgba(0,0,0,0.9)",                                       bg: "transparent",      fontFamily: "sans-serif",            anim: "cfade"  },
  opensans:   { text: "destaque",      color: "#7DD3FC", textShadow: "-2px -2px 0 #000,2px -2px 0 #000,-2px 2px 0 #000,2px 2px 0 #000", bg: "transparent",      fontFamily: "'Open Sans',sans-serif", anim: "cpop"   },
  ubuntu:     { text: "arredondado",   color: "#C084FC", textShadow: "-2px -2px 0 #000,2px -2px 0 #000,-2px 2px 0 #000,2px 2px 0 #000", bg: "transparent",      fontFamily: "'Ubuntu',sans-serif",   anim: "czoom"  },
  montserrat: { text: "premium",       color: "#FDE68A", textShadow: "-2px -2px 0 #000,2px -2px 0 #000,-2px 2px 0 #000,2px 2px 0 #000", bg: "transparent",      fontFamily: "Montserrat,sans-serif", anim: "cslide" },
  neon:       { text: "brilho MAX!",   color: "#00FFFF", textShadow: "0 0 8px #00FFFF,0 0 16px #00FFFF,-1px -1px 0 #000,1px 1px 0 #000", bg: "transparent",     fontFamily: "sans-serif",            anim: "cpop"   },
};

const DURATION_OPTIONS = [
  { value: 30, label: "30 seg", desc: "Clips rápidos • TikTok viral" },
  { value: 60, label: "1 min",  desc: "Duração padrão • completo" },
  { value: 90, label: "1:30",   desc: "Clips extensos • podcasts" },
];

const PLAN_MAX_CLIPS: Record<Plan, number> = { trial: 10, gratis: 2, basico: 10, pro: 20, full: 50, agencia: 100 };

const ASPECT_LABELS: Record<string, string> = {
  "9:16": "Vertical", "4:5": "Retrato", "1:1": "Quadrado", "16:9": "Horizontal",
};

const CAPTION_COLORS: { value: string; label: string }[] = [
  { value: "#FFFFFF", label: "Branco" }, { value: "#FFD700", label: "Amarelo ouro" },
  { value: "#FFBF00", label: "Âmbar" },  { value: "#00FFFF", label: "Ciano neon" },
  { value: "#C084FC", label: "Roxo" },   { value: "#FF6B00", label: "Laranja" },
  { value: "#FF69B4", label: "Rosa" },   { value: "#00FF7F", label: "Verde" },
  { value: "#7DD3FC", label: "Azul" },   { value: "#FF3333", label: "Vermelho" },
];

type AppView = "studio" | "history" | "hub" | "brand";

interface HistoryItem {
  id: string;
  date: string;
  url: string;
  clipCount: number;
  clips: Clip[];
}

const NAV_ITEMS: { id: AppView; icon: string; label: string }[] = [
  { id: "studio",  icon: "🎬", label: "Studio"    },
  { id: "history", icon: "📋", label: "Histórico" },
  { id: "hub",     icon: "🔍", label: "Hub"       },
  { id: "brand",   icon: "🎨", label: "Brand Kit" },
];

const HUB_DATA = [
  {
    category: "Finanças & Renda",
    icon: "💰",
    channels: [
      { name: "Me Poupe!", url: "https://youtube.com/@mepoupe" },
      { name: "Primo Rico",  url: "https://youtube.com/@PrimoRico" },
      { name: "Joel Jota",   url: "https://youtube.com/@JoelJota" },
    ],
  },
  {
    category: "Motivação & Negócios",
    icon: "🔥",
    channels: [
      { name: "Flávio Augusto",    url: "https://youtube.com/@FlavioAugustodaSilva" },
      { name: "Leandro Karnal",    url: "https://youtube.com/@leandrokarnal" },
      { name: "Thiago Nigro",      url: "https://youtube.com/@ThiagoNigro" },
    ],
  },
  {
    category: "Saúde & Emagrecimento",
    icon: "💪",
    channels: [
      { name: "Dr. Dayan Siebra", url: "https://youtube.com/@drayansiebra" },
      { name: "Drauzio Varella",  url: "https://youtube.com/@DrauzioVarella" },
      { name: "CrossFit Brasil",  url: "https://youtube.com/@CrossFitBrasil" },
    ],
  },
  {
    category: "Entretenimento",
    icon: "😂",
    channels: [
      { name: "Casimiro Miguel",    url: "https://youtube.com/@CasimiroMiguel" },
      { name: "Whindersson Nunes",  url: "https://youtube.com/@whinderssonnunes" },
      { name: "Porta dos Fundos",   url: "https://youtube.com/@portadosfundos" },
    ],
  },
];

// ─── Main Component ──────────────────────────────────────────────────────────

export default function AppPage() {
  const { data: session, status: sessionStatus } = useSession();

  const [step, setStep] = useState<"login" | "register" | "app" | "trial-register">("login");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [plan, setPlan] = useState<Plan>("trial");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [isTrial, setIsTrial] = useState(false);
  const [credits, setCredits] = useState<Credits>({ monthly: 0, avulso: 0, total: 0 });

  // Trial registration
  const [trialName, setTrialName] = useState("");
  const [trialEmail, setTrialEmail] = useState("");
  const [trialWhatsapp, setTrialWhatsapp] = useState("");
  const [trialError, setTrialError] = useState("");
  const [trialLoading, setTrialLoading] = useState(false);

  // WhatsApp registration
  const [whatsapp, setWhatsapp] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [registering, setRegistering] = useState(false);
  const [pendingToken, setPendingToken] = useState<string | null>(null);
  const [pendingPlan, setPendingPlan] = useState<Plan>("trial");
  const [pendingEmail, setPendingEmail] = useState("");
  const [pendingCredits, setPendingCredits] = useState<Credits | undefined>(undefined);

  // Studio
  const [inputMode, setInputMode] = useState<"url" | "upload">("url");
  const [url, setUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [platforms, setPlatforms] = useState<Platform[]>(["tiktok", "instagram"]);
  const [mode, setMode] = useState<"ai" | "manual">("ai");
  const [maxClips, setMaxClips] = useState(3);
  const [captionStyle, setCaptionStyle] = useState<CaptionStyle>("tiktok");
  const [captionColor, setCaptionColor] = useState("#FFFFFF");
  const [targetDuration, setTargetDuration] = useState(60);
  const [jobId, setJobId] = useState<string | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [processing, setProcessing] = useState(false);
  const [urlError, setUrlError] = useState("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Navigation & new features
  const [view, setView] = useState<AppView>("studio");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [expandedHistory, setExpandedHistory] = useState<string | null>(null);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkinMsg, setCheckinMsg] = useState("");
  const [checkedInToday, setCheckedInToday] = useState(false);
  const [brandWatermark, setBrandWatermark] = useState("");
  const [brandSaved, setBrandSaved] = useState(false);

  const planMaxClips = PLAN_MAX_CLIPS[plan] || 10;

  // ── Init: restore session and local data ──
  useEffect(() => {
    const saved        = localStorage.getItem("viralizaia_token");
    const savedPlan    = localStorage.getItem("viralizaia_plan") as Plan | null;
    const savedEmail   = localStorage.getItem("viralizaia_email");
    const savedCredits = localStorage.getItem("viralizaia_credits");
    if (saved) {
      setToken(saved);
      if (savedPlan)    setPlan(savedPlan);
      if (savedEmail)   setEmail(savedEmail);
      if (savedCredits) { try { setCredits(JSON.parse(savedCredits)); } catch {} }
      setStep("app");
      if (savedEmail) {
        fetchCredits(savedEmail).then(c => {
          setCredits(c);
          localStorage.setItem("viralizaia_credits", JSON.stringify(c));
        }).catch(() => {});
      }
    }
    // History
    try {
      const h = localStorage.getItem("viralizaia_history");
      if (h) setHistory(JSON.parse(h));
    } catch {}
    // Check-in
    const today = new Date().toISOString().slice(0, 10);
    setCheckedInToday(localStorage.getItem("viralizaia_last_checkin") === today);
    // Brand
    const bw = localStorage.getItem("viralizaia_brand_watermark");
    if (bw) setBrandWatermark(bw);
  }, []);

  // ── OAuth auto-login ──
  useEffect(() => {
    if (sessionStatus === "authenticated" && session?.user?.email && step === "login" && !loggingIn) {
      handleOAuthLogin(session.user.email);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionStatus, session]);

  // ── Poll job status ──
  useEffect(() => {
    if (!jobId) return;
    pollRef.current = setInterval(async () => {
      try {
        const status = await getJobStatus(jobId);
        setJob(status);
        if (status.status === "done" || status.status === "error") {
          clearInterval(pollRef.current!);
          setProcessing(false);
          if (email) {
            fetchCredits(email).then(c => {
              setCredits(c);
              localStorage.setItem("viralizaia_credits", JSON.stringify(c));
            }).catch(() => {});
          }
        }
      } catch {
        clearInterval(pollRef.current!);
        setProcessing(false);
        setJob({ status: "error", progress: 0, clips: [], error: "Conexão perdida. Tente novamente." });
      }
    }, 2000);
    return () => clearInterval(pollRef.current!);
  }, [jobId, email]);

  // ── Save to history when job completes ──
  const savedJobRef = useRef<string | null>(null);
  useEffect(() => {
    if (job?.status === "done" && job.clips.length > 0 && jobId && savedJobRef.current !== jobId) {
      savedJobRef.current = jobId;
      const item: HistoryItem = {
        id: jobId,
        date: new Date().toISOString(),
        url,
        clipCount: job.clips.length,
        clips: job.clips,
      };
      setHistory(prev => {
        const updated = [item, ...prev].slice(0, 30);
        localStorage.setItem("viralizaia_history", JSON.stringify(updated));
        return updated;
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [job?.status, job?.clips?.length, jobId]);

  // ── Auth handlers ──
  async function handleOAuthLogin(oauthEmail: string) {
    setLoggingIn(true);
    setLoginError("");
    try {
      const result = await getOAuthToken(oauthEmail);
      const hasWhatsapp = localStorage.getItem("viralizaia_whatsapp");
      if (!hasWhatsapp) {
        setPendingToken(result.token); setPendingPlan(result.plan);
        setPendingEmail(oauthEmail);   setPendingCredits(result.credits);
        setStep("register");
      } else {
        finishLogin(result.token, result.plan, oauthEmail, result.isTrial || false, result.credits);
      }
    } catch (err: unknown) {
      setLoginError(err instanceof Error ? err.message : "Erro ao fazer login com OAuth");
    } finally { setLoggingIn(false); }
  }

  async function handleLogin(e: React.FormEvent, useTrial = false) {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError("");
    try {
      const result = useTrial ? await getTrialToken(email) : await getAuthToken(email);
      const hasWhatsapp = localStorage.getItem("viralizaia_whatsapp");
      if (!hasWhatsapp) {
        setPendingToken(result.token); setPendingPlan(result.plan);
        setPendingEmail(email);        setPendingCredits(result.credits);
        setStep("register");
      } else {
        finishLogin(result.token, result.plan, email, result.isTrial || false, result.credits);
      }
    } catch (err: unknown) {
      setLoginError(err instanceof Error ? err.message : "Erro ao fazer login");
    } finally { setLoggingIn(false); }
  }

  async function handleRegisterWhatsapp() {
    const digits = whatsapp.replace(/\D/g, "");
    if (digits.length < 10) { setRegisterError("Digite um número válido com DDD"); return; }
    setRegistering(true);
    setRegisterError("");
    try {
      await saveWhatsapp(pendingEmail, digits, pendingToken!);
      localStorage.setItem("viralizaia_whatsapp", digits);
      finishLogin(pendingToken!, pendingPlan, pendingEmail, false, pendingCredits);
    } catch (err: unknown) {
      setRegisterError(err instanceof Error ? err.message : "Erro ao salvar WhatsApp");
    } finally { setRegistering(false); }
  }

  async function handleTrialRegister() {
    if (!trialName.trim()) { setTrialError("Digite seu nome"); return; }
    if (!trialEmail.includes("@")) { setTrialError("E-mail inválido"); return; }
    const digits = trialWhatsapp.replace(/\D/g, "");
    if (digits.length < 10) { setTrialError("WhatsApp inválido — inclua o DDD"); return; }
    setTrialLoading(true);
    setTrialError("");
    try {
      const result = await getTrialToken(trialEmail, trialName);
      await saveWhatsapp(trialEmail, digits, result.token);
      localStorage.setItem("viralizaia_whatsapp", digits);
      finishLogin(result.token, result.plan, trialEmail, true, result.credits);
    } catch (err: unknown) {
      setTrialError(err instanceof Error ? err.message : "Erro ao criar conta");
    } finally { setTrialLoading(false); }
  }

  function finishLogin(tok: string, p: Plan, loginEmail: string, trial: boolean, creds?: Credits) {
    setToken(tok); setPlan(p); setIsTrial(trial); setEmail(loginEmail);
    localStorage.setItem("viralizaia_token", tok);
    localStorage.setItem("viralizaia_plan", p);
    localStorage.setItem("viralizaia_email", loginEmail);
    if (creds) { setCredits(creds); localStorage.setItem("viralizaia_credits", JSON.stringify(creds)); }
    setStep("app");
  }

  function handleLogout() {
    setToken(null);
    localStorage.removeItem("viralizaia_token");
    localStorage.removeItem("viralizaia_plan");
    localStorage.removeItem("viralizaia_email");
    localStorage.removeItem("viralizaia_credits");
    setStep("login");
    setJob(null); setJobId(null);
    setCredits({ monthly: 0, avulso: 0, total: 0 });
    if (sessionStatus === "authenticated") signOut({ redirect: false });
  }

  async function handleCheckIn() {
    if (checkingIn || checkedInToday || !token) return;
    setCheckingIn(true);
    try {
      const result = await checkIn(token);
      const today = new Date().toISOString().slice(0, 10);
      localStorage.setItem("viralizaia_last_checkin", today);
      setCheckedInToday(true);
      if (result.credits) {
        setCredits(result.credits);
        localStorage.setItem("viralizaia_credits", JSON.stringify(result.credits));
      }
      setCheckinMsg(result.ok ? "+1 crédito!" : "Já feito hoje");
    } catch {
      setCheckinMsg("Tente novamente");
    } finally {
      setCheckingIn(false);
      setTimeout(() => setCheckinMsg(""), 3000);
    }
  }

  async function handleProcess(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    if (platforms.length === 0) { setUrlError("Selecione ao menos uma plataforma."); return; }
    if (inputMode === "url") {
      if (!url.includes("youtube.com") && !url.includes("youtu.be")) {
        setUrlError("Use um link do YouTube válido."); return;
      }
    } else if (!selectedFile) {
      setUrlError("Selecione um arquivo de vídeo."); return;
    }
    setUrlError("");
    setProcessing(true);
    setJob(null);
    setJobId(null);
    try {
      const clipsToRequest = Math.min(maxClips, planMaxClips);
      let id: string;
      if (inputMode === "url") {
        ({ jobId: id } = await startProcessing(url, platforms, mode, token, clipsToRequest, captionStyle, targetDuration, captionColor));
      } else {
        ({ jobId: id } = await uploadAndProcess(selectedFile!, platforms, mode, token, clipsToRequest, captionStyle, targetDuration, captionColor));
      }
      setJobId(id);
      setJob({ status: "queued", progress: 0, clips: [], error: null });
    } catch (err: unknown) {
      setProcessing(false);
      const msg = err instanceof Error ? err.message : "Erro ao processar";
      if (msg.toLowerCase().includes("cr") && msg.toLowerCase().includes("ditos")) {
        setUrlError("Créditos insuficientes. Adquira mais créditos ou aguarde a renovação mensal.");
        if (email) fetchCredits(email).then(c => { setCredits(c); localStorage.setItem("viralizaia_credits", JSON.stringify(c)); }).catch(() => {});
      } else {
        setUrlError(msg);
      }
    }
  }

  function togglePlatform(p: Platform) {
    setPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  }

  async function handleNewVideo() {
    if (jobId) await deleteJob(jobId);
    setJobId(null); setJob(null); setUrl(""); setSelectedFile(null); setProcessing(false);
  }

  function useHubUrl(hubUrl: string) {
    setUrl(hubUrl);
    setView("studio");
    setInputMode("url");
  }

  // ── LOGIN SCREEN ──────────────────────────────────────────────────────────
  if (step === "login") {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <p className="gradient-text font-extrabold text-2xl mb-1">Viraliza Cortes</p>
            <p className="text-gray-400 text-sm">Cortes virais com IA em segundos</p>
          </div>
          <div className="space-y-3 mb-5">
            <button onClick={() => signIn("google", { callbackUrl: "/app" })} disabled={loggingIn}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-xl font-bold text-sm bg-white text-gray-900 hover:bg-gray-100 transition-all disabled:opacity-50">
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Entrar com Google
            </button>
          </div>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
            <div className="relative flex justify-center"><span className="bg-[#080808] px-3 text-xs text-gray-600">ou entre com e-mail</span></div>
          </div>
          <form onSubmit={handleLogin} className="space-y-3">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com" required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500 transition-colors" />
            {loginError && <p className="text-red-400 text-xs">{loginError}</p>}
            <button type="submit" disabled={loggingIn}
              className="btn-primary w-full py-3 rounded-xl font-bold text-sm disabled:opacity-50">
              {loggingIn ? "Verificando..." : "Entrar com assinatura →"}
            </button>
          </form>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
            <div className="relative flex justify-center"><span className="bg-[#080808] px-3 text-xs text-gray-600">ou</span></div>
          </div>
          <button onClick={() => setStep("trial-register")}
            className="w-full py-3 rounded-xl font-bold text-sm border border-purple-500/40 text-purple-300 hover:bg-purple-500/10 transition-all">
            🎁 Testar 10 clips grátis
          </button>
          <p className="text-center text-xs text-gray-600 mt-2">Sem cartão • Resultado em minutos</p>
          <p className="text-center text-xs text-gray-600 mt-6">
            Ainda não é assinante?{" "}
            <a href="/#planos" className="text-purple-400 hover:underline">Ver planos</a>
          </p>
        </div>
      </div>
    );
  }

  // ── TRIAL REGISTER ────────────────────────────────────────────────────────
  if (step === "trial-register") {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🎬</div>
            <p className="gradient-text font-extrabold text-2xl mb-1">Viraliza Cortes</p>
            <p className="font-bold text-lg mt-2 mb-1">Criar conta grátis</p>
            <p className="text-gray-400 text-sm">10 clips grátis · sem cartão de crédito</p>
          </div>
          <div className="space-y-3">
            <input type="text" value={trialName} onChange={(e) => setTrialName(e.target.value)}
              placeholder="Seu nome completo"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500 transition-colors" />
            <input type="email" value={trialEmail} onChange={(e) => setTrialEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500 transition-colors" />
            <div>
              <input type="tel" value={trialWhatsapp} onChange={(e) => setTrialWhatsapp(e.target.value)}
                placeholder="WhatsApp com DDD — (11) 99999-9999"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500 transition-colors" />
              <p className="text-xs text-gray-600 mt-1">Para avisar quando os clips ficarem prontos</p>
            </div>
            {trialError && <p className="text-red-400 text-xs">{trialError}</p>}
            <button onClick={handleTrialRegister} disabled={trialLoading}
              className="btn-primary w-full py-3 rounded-xl font-bold text-sm disabled:opacity-50">
              {trialLoading ? "Criando conta..." : "Criar conta e testar grátis →"}
            </button>
            <button onClick={() => setStep("login")} className="w-full py-2 text-xs text-gray-600 hover:text-gray-400 transition-colors">
              ← Voltar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── WHATSAPP REGISTER ─────────────────────────────────────────────────────
  if (step === "register") {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">📱</div>
            <p className="font-extrabold text-xl mb-2">Quase pronto!</p>
            <p className="text-gray-400 text-sm leading-relaxed">
              Adicione seu WhatsApp para receber aviso quando seus clips ficarem prontos.
            </p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 mb-2 block">WhatsApp (com DDD)</label>
              <input type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="(11) 99999-9999"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500 transition-colors" />
            </div>
            {registerError && <p className="text-red-400 text-xs">{registerError}</p>}
            <button onClick={handleRegisterWhatsapp} disabled={registering}
              className="btn-primary w-full py-3 rounded-xl font-bold text-sm disabled:opacity-50">
              {registering ? "Salvando..." : "Confirmar e entrar →"}
            </button>
            <button onClick={() => {
              localStorage.setItem("viralizaia_whatsapp", "skip");
              finishLogin(pendingToken!, pendingPlan, pendingEmail, false, pendingCredits);
            }} className="w-full py-2 text-xs text-gray-600 hover:text-gray-400 transition-colors">
              Pular por enquanto
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── APP (with sidebar) ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#080808] flex flex-col">

      {/* Top Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-white/8 bg-[#0a0a0a] sticky top-0 z-50">
        <span className="gradient-text font-extrabold text-lg tracking-tight">Viraliza Cortes</span>
        <div className="flex items-center gap-2">
          {/* Daily check-in */}
          <button onClick={handleCheckIn} disabled={checkingIn || checkedInToday}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              checkedInToday
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 cursor-default"
                : "bg-purple-500/10 text-purple-300 border-purple-500/25 hover:bg-purple-500/20"
            }`}>
            {checkinMsg ? <span className="animate-pulse">{checkinMsg}</span> : checkedInToday ? "✓ Check-in" : "🎁 Check-in +1"}
          </button>
          {/* Credits badge */}
          <span className={`text-xs px-2.5 py-1.5 rounded-lg border font-bold tabular-nums ${
            isTrial
              ? "bg-amber-500/10 text-amber-300 border-amber-500/20"
              : "bg-purple-500/10 text-purple-300 border-purple-500/20"
          }`}>
            {credits.total} cr.
          </span>
          <button onClick={handleLogout} className="text-xs text-gray-600 hover:text-gray-400 transition-colors px-1">
            Sair
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar — desktop */}
        <aside className="hidden md:flex flex-col w-[72px] bg-[#090909] border-r border-white/8 py-4 gap-1 items-center shrink-0">
          {NAV_ITEMS.map(item => (
            <button key={item.id} onClick={() => setView(item.id)}
              className={`flex flex-col items-center gap-1.5 w-[56px] py-3 rounded-xl transition-all ${
                view === item.id
                  ? "bg-purple-600/20 text-white"
                  : "text-gray-600 hover:text-gray-300 hover:bg-white/5"
              }`}>
              <span className="text-[22px] leading-none">{item.icon}</span>
              <span className="text-[9px] font-semibold leading-none uppercase tracking-wide">{item.label}</span>
            </button>
          ))}
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-6">
          <div className="max-w-2xl mx-auto px-4 py-6">

            {/* ── STUDIO VIEW ── */}
            {view === "studio" && (
              <>
                {!job && (
                  <form onSubmit={handleProcess} className="space-y-5">
                    <style>{`
                      @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@700&family=Ubuntu:wght@700&display=swap');
                      @keyframes cpop  { 0%,6%{opacity:0;transform:scale(0.7)} 14%,78%{opacity:1;transform:scale(1)} 88%,100%{opacity:0;transform:scale(1)} }
                      @keyframes czoom { 0%,6%{opacity:0;transform:scale(0.3)} 16%,78%{opacity:1;transform:scale(1)} 88%,100%{opacity:0;transform:scale(1)} }
                      @keyframes cslide{ 0%,6%{opacity:0;transform:translateY(10px)} 14%,78%{opacity:1;transform:translateY(0)} 88%,100%{opacity:0;transform:translateY(0)} }
                      @keyframes cfade { 0%,8%{opacity:0} 16%,80%{opacity:1} 90%,100%{opacity:0} }
                    `}</style>

                    {/* URL / Upload toggle */}
                    <div className="flex gap-2">
                      {(["url", "upload"] as const).map(m => (
                        <button key={m} type="button" onClick={() => setInputMode(m)}
                          className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${inputMode === m ? "border-purple-500/50 bg-purple-500/15 text-white" : "border-white/10 bg-white/5 text-gray-400"}`}>
                          {m === "url" ? "🔗 Link YouTube" : "📁 Upload de arquivo"}
                        </button>
                      ))}
                    </div>

                    {/* Input */}
                    <div>
                      {inputMode === "url" ? (
                        <>
                          <label className="text-xs text-gray-400 mb-2 block">Link do YouTube</label>
                          <input type="url" value={url} onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://youtube.com/watch?v=..." disabled={processing}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500 transition-colors disabled:opacity-50" />
                        </>
                      ) : (
                        <>
                          <label className="text-xs text-gray-400 mb-2 block">Arquivo de vídeo <span className="text-gray-600">(MP4, MOV, AVI — máx 500 MB)</span></label>
                          <label className={`flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${selectedFile ? "border-purple-500/50 bg-purple-500/5" : "border-white/10 bg-white/5 hover:border-white/20"} ${processing ? "opacity-50 pointer-events-none" : ""}`}>
                            <input type="file" accept="video/*" className="hidden" disabled={processing}
                              onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)} />
                            {selectedFile
                              ? <span className="text-sm text-purple-300 px-4 text-center truncate max-w-full">{selectedFile.name}</span>
                              : <span className="text-sm text-gray-500">Clique para selecionar o vídeo</span>}
                          </label>
                        </>
                      )}
                      {urlError && (
                        <div className="mt-2">
                          <p className="text-red-400 text-xs">{urlError}</p>
                          {urlError.includes("réditos") && (
                            <a href="/#planos" className="text-xs text-purple-400 hover:underline mt-1 inline-block">
                              Ver planos e comprar créditos →
                            </a>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Platforms */}
                    <div>
                      <label className="text-xs text-gray-400 mb-3 block">Plataformas</label>
                      <div className="flex flex-wrap gap-2">
                        {PLATFORM_OPTIONS.map(p => (
                          <button key={p.id} type="button" onClick={() => togglePlatform(p.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${platforms.includes(p.id) ? "border-purple-500/50 bg-purple-500/15 text-white" : "border-white/10 bg-white/5 text-gray-400"}`}>
                            <span>{p.icon}</span>{p.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Caption style */}
                    <div>
                      <label className="text-xs text-gray-400 mb-3 block">Estilo de legenda</label>
                      <div className="grid grid-cols-2 gap-2">
                        {CAPTION_OPTIONS.map((c, index) => {
                          const p = CAPTION_PREVIEW[c.id];
                          return (
                            <button key={c.id} type="button" onClick={() => setCaptionStyle(c.id)}
                              className={`flex flex-col rounded-xl text-left text-sm border transition-all overflow-hidden ${captionStyle === c.id ? "border-purple-500/50 bg-purple-500/15 text-white" : "border-white/10 bg-white/5 text-gray-400"}`}>
                              <div className="w-full h-10 flex items-center justify-center" style={{ background: "#080808" }}>
                                <span style={{
                                  color: captionColor !== "#FFFFFF" ? captionColor : p.color,
                                  textShadow: p.textShadow, fontFamily: p.fontFamily, fontWeight: 700, fontSize: "11px",
                                  background: p.bg, padding: p.bg !== "transparent" ? "1px 7px" : "0",
                                  borderRadius: p.bg !== "transparent" ? "3px" : "0",
                                  animation: `${p.anim} 2.8s ease-in-out ${index * 0.35}s infinite`, display: "inline-block",
                                }}>{p.text}</span>
                              </div>
                              <div className="px-3 py-2">
                                <span className="font-semibold">{c.badge} {c.label}</span>
                                <span className="text-xs text-gray-500 mt-0.5 block">{c.desc}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Caption color */}
                    <div>
                      <label className="text-xs text-gray-400 mb-3 block">Cor da legenda</label>
                      <div className="flex gap-2 flex-wrap">
                        {CAPTION_COLORS.map(c => (
                          <button key={c.value} type="button" onClick={() => setCaptionColor(c.value)} title={c.label}
                            className={`w-8 h-8 rounded-full transition-all ${captionColor === c.value ? "ring-2 ring-white ring-offset-2 ring-offset-[#080808] scale-110" : "opacity-70 hover:opacity-100"}`}
                            style={{ backgroundColor: c.value }} />
                        ))}
                      </div>
                    </div>

                    {/* Duration */}
                    <div>
                      <label className="text-xs text-gray-400 mb-3 block">Duração de cada corte</label>
                      <div className="flex gap-2">
                        {DURATION_OPTIONS.map(d => (
                          <button key={d.value} type="button" onClick={() => setTargetDuration(d.value)}
                            className={`flex-1 flex flex-col items-center py-3 rounded-xl text-sm font-medium border transition-all ${targetDuration === d.value ? "border-purple-500/50 bg-purple-500/15 text-white" : "border-white/10 bg-white/5 text-gray-400"}`}>
                            <span className="font-bold text-base">{d.label}</span>
                            <span className="text-xs text-gray-500 mt-0.5 text-center">{d.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Mode */}
                    <div>
                      <label className="text-xs text-gray-400 mb-3 block">Modo de corte</label>
                      <div className="flex gap-2">
                        {(["ai", "manual"] as const).map(m => (
                          <button key={m} type="button" onClick={() => setMode(m)}
                            className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all ${mode === m ? "border-purple-500/50 bg-purple-500/15 text-white" : "border-white/10 bg-white/5 text-gray-400"}`}>
                            {m === "ai" ? "🤖 IA escolhe" : "✂️ Dividir igual"}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Clip count */}
                    {!isTrial && (
                      <div>
                        <label className="text-xs text-gray-400 mb-3 block">
                          Quantidade de clips <span className="text-gray-600">máx {planMaxClips} no seu plano</span>
                        </label>
                        <div className="flex gap-2 flex-wrap">
                          {Array.from({ length: Math.min(planMaxClips, 5) }, (_, i) => i + 1).map(n => (
                            <button key={n} type="button" onClick={() => setMaxClips(n)}
                              className={`flex-1 min-w-[52px] py-2 rounded-xl text-sm font-bold border transition-all ${maxClips === n ? "border-purple-500/50 bg-purple-500/15 text-white" : "border-white/10 bg-white/5 text-gray-400"}`}>
                              {n}
                            </button>
                          ))}
                          {planMaxClips > 5 && (
                            <button type="button" onClick={() => setMaxClips(planMaxClips)}
                              className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${maxClips === planMaxClips ? "border-purple-500/50 bg-purple-500/15 text-white" : "border-white/10 bg-white/5 text-gray-400"}`}>
                              {planMaxClips} (max)
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    <button type="submit" disabled={processing}
                      className="btn-primary w-full py-4 rounded-xl font-bold text-base disabled:opacity-50">
                      {processing ? "Processando..." : `🚀 Gerar ${isTrial ? "clips grátis" : `${maxClips} clip${maxClips > 1 ? "s" : ""}`}`}
                    </button>
                  </form>
                )}

                {/* Processing status */}
                {job && job.status !== "done" && job.status !== "error" && (
                  <div className="card-glow rounded-2xl p-6 text-center space-y-4">
                    <div className="text-4xl animate-pulse">
                      {job.status === "downloading" ? "⬇️" : job.status === "transcribing" ? "🎙️" : job.status === "analyzing" ? "🤖" : "✂️"}
                    </div>
                    <p className="font-semibold">{getStatusLabel(job.status)}</p>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full progress-animated rounded-full transition-all duration-500" style={{ width: `${job.progress}%` }} />
                    </div>
                    <p className="text-xs text-gray-500">{job.progress}% concluído</p>
                  </div>
                )}

                {/* Error */}
                {job?.status === "error" && (
                  <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-6 text-center space-y-3">
                    <p className="text-red-400 font-semibold">❌ Erro no processamento</p>
                    <p className="text-gray-400 text-sm">{job.error}</p>
                    <button onClick={handleNewVideo} className="btn-primary px-6 py-2 rounded-xl text-sm font-bold">
                      Tentar novamente
                    </button>
                  </div>
                )}

                {/* Results */}
                {job?.status === "done" && job.clips.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="font-bold text-lg">{job.clips.length} clips gerados ✅</h2>
                      <button onClick={handleNewVideo} className="text-sm text-purple-400 hover:text-purple-300">
                        + Novo vídeo
                      </button>
                    </div>
                    {isTrial && (
                      <div className="rounded-xl bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/20 p-4 text-center">
                        <p className="text-sm font-semibold text-white mb-1">Gostou? Assine para gerar até 100 clips por vídeo 🚀</p>
                        <a href="/#planos" className="inline-block mt-2 btn-primary px-6 py-2 rounded-full text-sm font-bold">
                          Ver planos a partir de R$29,90
                        </a>
                      </div>
                    )}
                    {job.clips.map(clip => (
                      <ClipCard key={`${clip.clipNumber}-${clip.platform}`} clip={clip} />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ── HISTORY VIEW ── */}
            {view === "history" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-bold text-lg">Histórico de projetos</h2>
                  {history.length > 0 && (
                    <button onClick={() => {
                      setHistory([]);
                      localStorage.removeItem("viralizaia_history");
                    }} className="text-xs text-gray-600 hover:text-red-400 transition-colors">
                      Limpar tudo
                    </button>
                  )}
                </div>
                {history.length === 0 ? (
                  <div className="text-center py-16 space-y-3">
                    <div className="text-5xl">📋</div>
                    <p className="text-gray-400 text-sm">Nenhum projeto ainda</p>
                    <p className="text-gray-600 text-xs">Seus clips gerados aparecem aqui para download posterior</p>
                    <button onClick={() => setView("studio")} className="btn-primary px-6 py-2 rounded-xl text-sm font-semibold mt-2">
                      Gerar primeiro clip →
                    </button>
                  </div>
                ) : (
                  history.map(item => (
                    <div key={item.id} className="bg-[#0f0f0f] border border-white/8 rounded-2xl overflow-hidden">
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500 mb-1">
                              {new Date(item.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                            </p>
                            <p className="text-sm text-gray-300 truncate font-mono">{item.url.replace("https://", "").slice(0, 50)}</p>
                          </div>
                          <span className="text-xs px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 font-semibold shrink-0">
                            {item.clipCount} clip{item.clipCount !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <button onClick={() => setExpandedHistory(expandedHistory === item.id ? null : item.id)}
                            className="flex-1 py-2 rounded-xl text-xs font-semibold bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                            {expandedHistory === item.id ? "Ocultar clips" : "Ver clips"}
                          </button>
                          <button onClick={() => { setUrl(item.url); setView("studio"); setInputMode("url"); }}
                            className="flex-1 py-2 rounded-xl text-xs font-semibold bg-purple-500/10 border border-purple-500/20 text-purple-300 hover:bg-purple-500/20 transition-colors">
                            Usar URL →
                          </button>
                        </div>
                      </div>
                      {expandedHistory === item.id && item.clips.length > 0 && (
                        <div className="border-t border-white/8 p-4 space-y-2">
                          {item.clips.map(clip => (
                            <a key={`${clip.clipNumber}-${clip.platform}`}
                              href={getDownloadUrl(clip.downloadUrl)} download={clip.fileName} target="_blank" rel="noopener noreferrer"
                              className="flex items-center justify-between py-2 px-3 rounded-xl bg-white/3 border border-white/8 hover:bg-white/8 transition-colors">
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-gray-200 truncate">{clip.title || clip.platformLabel}</p>
                                <p className="text-xs text-gray-500">{clip.platformLabel} • {clip.duration}s</p>
                              </div>
                              <span className="text-xs text-purple-400 ml-3 shrink-0">⬇️ Baixar</span>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ── HUB VIEW ── */}
            {view === "hub" && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-bold text-lg mb-1">Hub de Conteúdo</h2>
                  <p className="text-gray-500 text-sm">Canais brasileiros com conteúdo perfeito para cortes virais. Clique em um canal, escolha um vídeo longo e copie a URL para o Studio.</p>
                </div>
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3 flex gap-3 items-start">
                  <span className="text-xl">💡</span>
                  <p className="text-xs text-purple-200 leading-relaxed">
                    <strong>Dica:</strong> vídeos longos (30min+) de entrevistas, podcasts e debates geram mais clips virais. Use a IA para ela escolher os melhores momentos automaticamente.
                  </p>
                </div>
                {HUB_DATA.map(section => (
                  <div key={section.category}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">{section.icon}</span>
                      <h3 className="font-semibold text-sm text-gray-200">{section.category}</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {section.channels.map(ch => (
                        <div key={ch.name} className="flex items-center justify-between bg-[#0f0f0f] border border-white/8 rounded-xl px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600/40 to-blue-600/40 border border-white/10 flex items-center justify-center text-sm font-bold text-white">
                              {ch.name.charAt(0)}
                            </div>
                            <span className="text-sm font-medium text-gray-200">{ch.name}</span>
                          </div>
                          <a href={ch.url} target="_blank" rel="noopener noreferrer"
                            className="text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                            Abrir →
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="bg-white/3 border border-white/8 rounded-xl p-4 text-center space-y-2">
                  <p className="text-sm font-semibold">Quer clipar um vídeo específico?</p>
                  <p className="text-xs text-gray-500">Cole a URL direto no Studio</p>
                  <button onClick={() => setView("studio")} className="btn-primary px-6 py-2 rounded-xl text-sm font-semibold">
                    Ir ao Studio →
                  </button>
                </div>
              </div>
            )}

            {/* ── BRAND KIT VIEW ── */}
            {view === "brand" && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-bold text-lg mb-1">Brand Kit</h2>
                  <p className="text-gray-500 text-sm">Personalize seus clips com a identidade da sua marca.</p>
                </div>

                <div className="bg-[#0f0f0f] border border-white/8 rounded-2xl p-5 space-y-4">
                  <div>
                    <label className="text-xs text-gray-400 mb-2 block font-semibold">Texto de marca (aparece no final dos clips)</label>
                    <input
                      type="text"
                      value={brandWatermark}
                      onChange={(e) => setBrandWatermark(e.target.value)}
                      placeholder="@seu.perfil ou Nome do Canal"
                      maxLength={40}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500 transition-colors"
                    />
                    <p className="text-xs text-gray-600 mt-1">{brandWatermark.length}/40 caracteres</p>
                  </div>

                  {brandWatermark && (
                    <div className="rounded-xl bg-black border border-white/10 p-4 flex items-end justify-end" style={{ minHeight: 80 }}>
                      <span style={{ color: "#FFBF00", fontWeight: 700, fontSize: 13, textShadow: "-1px -1px 0 #000,1px -1px 0 #000,-1px 1px 0 #000,1px 1px 0 #000" }}>
                        {brandWatermark}
                      </span>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      localStorage.setItem("viralizaia_brand_watermark", brandWatermark);
                      setBrandSaved(true);
                      setTimeout(() => setBrandSaved(false), 2000);
                    }}
                    className="btn-primary w-full py-3 rounded-xl font-bold text-sm"
                  >
                    {brandSaved ? "✓ Salvo!" : "Salvar Brand Kit"}
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="bg-white/3 border border-white/8 rounded-xl p-4 flex gap-3 items-start opacity-60">
                    <span className="text-xl">🖼️</span>
                    <div>
                      <p className="text-sm font-semibold">Logo personalizado</p>
                      <p className="text-xs text-gray-500 mt-0.5">Upload da sua logo nos clips — em breve</p>
                    </div>
                    <span className="ml-auto text-xs px-2 py-0.5 rounded bg-gray-700 text-gray-400">Em breve</span>
                  </div>
                  <div className="bg-white/3 border border-white/8 rounded-xl p-4 flex gap-3 items-start opacity-60">
                    <span className="text-xl">🎨</span>
                    <div>
                      <p className="text-sm font-semibold">Paleta de cores da marca</p>
                      <p className="text-xs text-gray-500 mt-0.5">Cores personalizadas nas legendas — em breve</p>
                    </div>
                    <span className="ml-auto text-xs px-2 py-0.5 rounded bg-gray-700 text-gray-400">Em breve</span>
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* Bottom navigation — mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0a0a0a] border-t border-white/8 flex z-50">
        {NAV_ITEMS.map(item => (
          <button key={item.id} onClick={() => setView(item.id)}
            className={`flex-1 flex flex-col items-center py-2.5 gap-0.5 transition-colors ${
              view === item.id ? "text-purple-400" : "text-gray-600"
            }`}>
            <span className="text-lg leading-none">{item.icon}</span>
            <span className="text-[9px] font-semibold leading-none">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

// ─── ClipCard Component ───────────────────────────────────────────────────────

function ClipCard({ clip }: { clip: Clip }) {
  const [showPlayer, setShowPlayer] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(clip.title);
  const [editHook, setEditHook] = useState(clip.hook || "");
  const [copied, setCopied] = useState<"hook" | "caption" | null>(null);

  const platformColors: Record<string, string> = {
    tiktok:           "text-pink-400 bg-pink-500/10 border-pink-500/20",
    instagram_reels:  "text-purple-400 bg-purple-500/10 border-purple-500/20",
    instagram_feed:   "text-purple-400 bg-purple-500/10 border-purple-500/20",
    instagram_square: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    facebook:         "text-blue-400 bg-blue-500/10 border-blue-500/20",
    youtube_shorts:   "text-red-400 bg-red-500/10 border-red-500/20",
  };
  const colorClass = platformColors[clip.platform] || "text-gray-400 bg-white/5 border-white/10";

  function copyText(text: string, type: "hook" | "caption") {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  const suggestedCaption = `${editTitle}\n\n${editHook ? editHook + "\n\n" : ""}#viral #shorts #clip #conteudo #criadores`;

  return (
    <div className="bg-[#0f0f0f] border border-white/8 rounded-2xl overflow-hidden">
      {/* Video preview player */}
      {showPlayer && (
        <div className="bg-black flex items-center justify-center" style={{ maxHeight: 400 }}>
          <video
            controls
            autoPlay
            playsInline
            src={getDownloadUrl(clip.downloadUrl)}
            className="max-h-96 max-w-full"
            style={{ display: "block" }}
          />
        </div>
      )}

      <div className="p-4 space-y-3">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold ${colorClass}`}>
                {clip.platformLabel}
              </span>
              <span className="text-xs text-gray-500">
                {ASPECT_LABELS[clip.aspectRatio] || clip.aspectRatio} • {clip.duration}s
              </span>
            </div>
            {/* Editable title */}
            {editing ? (
              <input
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                className="w-full bg-white/5 border border-purple-500/40 rounded-lg px-2 py-1 text-sm font-semibold outline-none"
              />
            ) : (
              <p className="font-semibold text-sm leading-snug">{editTitle}</p>
            )}
            {/* Editable hook */}
            {editing ? (
              <textarea
                value={editHook}
                onChange={e => setEditHook(e.target.value)}
                rows={3}
                className="w-full bg-white/5 border border-purple-500/40 rounded-lg px-2 py-1 text-xs text-gray-300 outline-none mt-1 resize-none"
                placeholder="Hook de abertura..."
              />
            ) : (
              editHook && <p className="text-xs text-gray-400 mt-1 leading-relaxed">💬 {editHook}</p>
            )}
          </div>
          <div className="flex-shrink-0 text-center">
            <div className="text-xs text-gray-500 mb-0.5">Viral</div>
            <div className="text-lg font-bold text-purple-400">{clip.viralScore}<span className="text-xs text-gray-600">/10</span></div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setShowPlayer(v => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              showPlayer ? "border-blue-500/40 bg-blue-500/10 text-blue-300" : "border-white/10 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
            }`}
          >
            {showPlayer ? "⏹ Fechar" : "▶ Preview"}
          </button>
          <button
            onClick={() => setEditing(v => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              editing ? "border-purple-500/40 bg-purple-500/10 text-purple-300" : "border-white/10 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
            }`}
          >
            ✏️ {editing ? "Fechar editor" : "Editar"}
          </button>
          <button
            onClick={() => copyText(editHook || editTitle, "hook")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/10 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
          >
            {copied === "hook" ? "✓ Copiado!" : "📋 Hook"}
          </button>
          <button
            onClick={() => copyText(suggestedCaption, "caption")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/10 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
          >
            {copied === "caption" ? "✓ Copiado!" : "📝 Legenda"}
          </button>
        </div>

        {/* Download button */}
        <a href={getDownloadUrl(clip.downloadUrl)} download={clip.fileName} target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-semibold hover:bg-white/10 transition-colors">
          ⬇️ Baixar {clip.platformLabel}
        </a>
      </div>
    </div>
  );
}
