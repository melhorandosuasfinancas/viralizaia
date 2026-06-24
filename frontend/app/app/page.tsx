"use client";

import { useState, useEffect, useRef } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import {
  startProcessing, uploadAndProcess, getJobStatus, getDownloadUrl,
  getForceDownloadUrl,
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

const PLAN_MAX_CLIPS: Record<Plan, number> = { trial: 10, gratis: 2, basico: 35, pro: 60, full: 120, agencia: 200 };

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
  const [addWatermark, setAddWatermark] = useState(true);
  const [layout, setLayout] = useState<'crop' | 'blur'>('crop');
  const [addCaptions, setAddCaptions] = useState(true);

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
      const effectiveWatermark = (plan === "trial" || plan === "gratis") ? true : addWatermark;
      if (inputMode === "url") {
        ({ jobId: id } = await startProcessing(url, platforms, mode, token, clipsToRequest, captionStyle, targetDuration, captionColor, effectiveWatermark, layout, addCaptions));
      } else {
        ({ jobId: id } = await uploadAndProcess(selectedFile!, platforms, mode, token, clipsToRequest, captionStyle, targetDuration, captionColor, effectiveWatermark, layout, addCaptions));
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
      <div className="min-h-screen w-screen bg-black relative overflow-hidden flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-fuchsia-500/40 via-violet-700/50 to-black pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120vh] h-[60vh] rounded-b-[50%] bg-fuchsia-400/20 blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[90vh] h-[90vh] rounded-t-full bg-violet-400/20 blur-[60px] pointer-events-none" />
        <div className="w-full max-w-sm relative z-10 bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/[0.05] shadow-2xl">
          <div className="text-center mb-6">
            <div className="mx-auto w-10 h-10 rounded-full border border-white/10 flex items-center justify-center bg-gradient-to-br from-fuchsia-500/30 to-violet-500/30 mb-2">
              <span className="text-lg font-bold text-white">V</span>
            </div>
            <p className="font-extrabold text-xl bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80">Viraliza Cortes</p>
            <p className="text-white/60 text-xs mt-1">Cortes virais com IA em segundos</p>
          </div>
          <div className="space-y-3 mb-4">
            <button onClick={() => signIn("google", { callbackUrl: "/app" })} disabled={loggingIn}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-sm bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all disabled:opacity-50">
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span className="text-white/80">Entrar com Google</span>
            </button>
          </div>
          <div className="relative my-3 flex items-center">
            <div className="flex-grow border-t border-white/5" />
            <span className="mx-3 text-xs text-white/40">ou</span>
            <div className="flex-grow border-t border-white/5" />
          </div>
          <form onSubmit={handleLogin} className="space-y-3">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com" required
              className="w-full bg-white/5 border border-transparent rounded-lg px-3 h-10 text-sm text-white outline-none placeholder:text-white/30 focus:bg-white/10 focus:border-white/30 transition-all" />
            {loginError && <p className="text-rose-300 text-xs bg-rose-500/10 border border-rose-500/30 rounded-lg px-3 py-2">{loginError}</p>}
            <button type="submit" disabled={loggingIn}
              className="w-full relative group/btn mt-1">
              <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500/30 to-violet-500/30 rounded-lg blur-lg opacity-0 group-hover/btn:opacity-70 transition-opacity duration-300" />
              <div className="relative overflow-hidden bg-gradient-to-r from-fuchsia-500 to-violet-500 text-white font-semibold h-10 rounded-lg flex items-center justify-center text-sm disabled:opacity-50">
                {loggingIn ? "Verificando..." : "Entrar com assinatura →"}
              </div>
            </button>
          </form>
          <div className="relative my-3 flex items-center">
            <div className="flex-grow border-t border-white/5" />
            <span className="mx-3 text-xs text-white/40">ou</span>
            <div className="flex-grow border-t border-white/5" />
          </div>
          <button onClick={() => setStep("trial-register")}
            className="w-full py-2.5 rounded-lg font-semibold text-sm border border-fuchsia-400/30 text-fuchsia-200 bg-fuchsia-500/5 hover:bg-fuchsia-500/15 transition-all">
            🎁 Testar 10 clips grátis
          </button>
          <p className="text-center text-xs text-white/40 mt-2">Sem cartão • Resultado em minutos</p>
          <p className="text-center text-xs text-white/60 mt-5">
            Ainda não é assinante?{" "}
            <a href="/#planos" className="text-fuchsia-300 hover:text-fuchsia-200 underline-offset-4 hover:underline">Ver planos</a>
          </p>
        </div>
      </div>
    );
  }

  // ── TRIAL REGISTER ────────────────────────────────────────────────────────
  if (step === "trial-register") {
    return (
      <div className="min-h-screen w-screen bg-black relative overflow-hidden flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-fuchsia-500/40 via-violet-700/50 to-black pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120vh] h-[60vh] rounded-b-[50%] bg-fuchsia-400/20 blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[90vh] h-[90vh] rounded-t-full bg-violet-400/20 blur-[60px] pointer-events-none" />
        <div className="w-full max-w-sm relative z-10 bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/[0.05] shadow-2xl">
          <div className="text-center mb-6">
            <div className="mx-auto w-12 h-12 rounded-full border border-white/10 flex items-center justify-center bg-gradient-to-br from-fuchsia-500/30 to-violet-500/30 mb-3 text-2xl">🎬</div>
            <p className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80">Criar conta grátis</p>
            <p className="text-white/60 text-xs mt-1">10 clips grátis · sem cartão de crédito</p>
          </div>
          <div className="space-y-3">
            <input type="text" value={trialName} onChange={(e) => setTrialName(e.target.value)}
              placeholder="Seu nome completo"
              className="w-full bg-white/5 border border-transparent rounded-lg px-3 h-10 text-sm text-white outline-none placeholder:text-white/30 focus:bg-white/10 focus:border-white/30 transition-all" />
            <input type="email" value={trialEmail} onChange={(e) => setTrialEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full bg-white/5 border border-transparent rounded-lg px-3 h-10 text-sm text-white outline-none placeholder:text-white/30 focus:bg-white/10 focus:border-white/30 transition-all" />
            <div>
              <input type="tel" value={trialWhatsapp} onChange={(e) => setTrialWhatsapp(e.target.value)}
                placeholder="WhatsApp com DDD — (11) 99999-9999"
                className="w-full bg-white/5 border border-transparent rounded-lg px-3 h-10 text-sm text-white outline-none placeholder:text-white/30 focus:bg-white/10 focus:border-white/30 transition-all" />
              <p className="text-xs text-white/40 mt-1">Para avisar quando os clips ficarem prontos</p>
            </div>
            {trialError && <p className="text-rose-300 text-xs bg-rose-500/10 border border-rose-500/30 rounded-lg px-3 py-2">{trialError}</p>}
            <button onClick={handleTrialRegister} disabled={trialLoading}
              className="w-full relative group/btn mt-1">
              <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500/30 to-violet-500/30 rounded-lg blur-lg opacity-0 group-hover/btn:opacity-70 transition-opacity duration-300" />
              <div className="relative overflow-hidden bg-gradient-to-r from-fuchsia-500 to-violet-500 text-white font-semibold h-10 rounded-lg flex items-center justify-center text-sm disabled:opacity-50">
                {trialLoading ? "Criando conta..." : "Criar conta e testar grátis →"}
              </div>
            </button>
            <button onClick={() => setStep("login")} className="w-full py-2 text-xs text-white/50 hover:text-white/80 transition-colors">
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
      <div className="min-h-screen w-screen bg-black relative overflow-hidden flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-fuchsia-500/40 via-violet-700/50 to-black pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120vh] h-[60vh] rounded-b-[50%] bg-fuchsia-400/20 blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[90vh] h-[90vh] rounded-t-full bg-violet-400/20 blur-[60px] pointer-events-none" />
        <div className="w-full max-w-sm relative z-10 bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/[0.05] shadow-2xl">
          <div className="text-center mb-6">
            <div className="mx-auto w-12 h-12 rounded-full border border-white/10 flex items-center justify-center bg-gradient-to-br from-fuchsia-500/30 to-violet-500/30 mb-3 text-2xl">📱</div>
            <p className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80">Quase pronto!</p>
            <p className="text-white/60 text-xs mt-1 leading-relaxed">
              Adicione seu WhatsApp para receber aviso quando seus clips ficarem prontos.
            </p>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-white/60 mb-1.5 block">WhatsApp (com DDD)</label>
              <input type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="(11) 99999-9999"
                className="w-full bg-white/5 border border-transparent rounded-lg px-3 h-10 text-sm text-white outline-none placeholder:text-white/30 focus:bg-white/10 focus:border-white/30 transition-all" />
            </div>
            {registerError && <p className="text-rose-300 text-xs bg-rose-500/10 border border-rose-500/30 rounded-lg px-3 py-2">{registerError}</p>}
            <button onClick={handleRegisterWhatsapp} disabled={registering}
              className="w-full relative group/btn">
              <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500/30 to-violet-500/30 rounded-lg blur-lg opacity-0 group-hover/btn:opacity-70 transition-opacity duration-300" />
              <div className="relative overflow-hidden bg-gradient-to-r from-fuchsia-500 to-violet-500 text-white font-semibold h-10 rounded-lg flex items-center justify-center text-sm disabled:opacity-50">
                {registering ? "Salvando..." : "Confirmar e entrar →"}
              </div>
            </button>
            <button onClick={() => {
              localStorage.setItem("viralizaia_whatsapp", "skip");
              finishLogin(pendingToken!, pendingPlan, pendingEmail, false, pendingCredits);
            }} className="w-full py-2 text-xs text-white/50 hover:text-white/80 transition-colors">
              Pular por enquanto
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── APP (with sidebar) ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-black flex flex-col relative overflow-hidden">

      {/* Mesh gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-fuchsia-500/15 via-violet-700/10 to-black pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-[60vh] h-[60vh] rounded-full bg-fuchsia-500/15 blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[70vh] h-[70vh] rounded-full bg-violet-500/15 blur-[100px] pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-50 flex items-center justify-between px-4 py-3 border-b border-white/[0.05] bg-black/40 backdrop-blur-xl sticky top-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center bg-gradient-to-br from-fuchsia-500/30 to-violet-500/30">
            <span className="text-sm font-bold text-white">V</span>
          </div>
          <span className="font-extrabold text-base tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-200 to-violet-200">Viraliza Cortes</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Daily check-in */}
          <button onClick={handleCheckIn} disabled={checkingIn || checkedInToday}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border backdrop-blur transition-all ${
              checkedInToday
                ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/25 cursor-default"
                : "bg-fuchsia-500/10 text-fuchsia-200 border-fuchsia-400/30 hover:bg-fuchsia-500/20"
            }`}>
            {checkinMsg ? <span className="animate-pulse">{checkinMsg}</span> : checkedInToday ? "✓ Check-in" : "🎁 Check-in +1"}
          </button>
          {/* Credits badge */}
          <span className={`text-xs px-2.5 py-1.5 rounded-lg border font-bold tabular-nums backdrop-blur ${
            isTrial
              ? "bg-amber-500/10 text-amber-200 border-amber-400/30"
              : "bg-gradient-to-r from-fuchsia-500/15 to-violet-500/15 text-white border-white/15"
          }`}>
            {credits.total} cr.
          </span>
          <button onClick={handleLogout} className="text-xs text-white/50 hover:text-white/90 transition-colors px-1">
            Sair
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="relative z-10 flex flex-1 overflow-hidden">

        {/* Sidebar — desktop */}
        <aside className="hidden md:flex flex-col w-[72px] bg-black/30 backdrop-blur-xl border-r border-white/[0.05] py-4 gap-1 items-center shrink-0">
          {NAV_ITEMS.map(item => (
            <button key={item.id} onClick={() => setView(item.id)}
              className={`flex flex-col items-center gap-1.5 w-[56px] py-3 rounded-xl transition-all relative ${
                view === item.id
                  ? "bg-gradient-to-br from-fuchsia-500/25 to-violet-500/25 text-white border border-white/10 shadow-[0_0_20px_-5px_rgba(217,70,239,0.5)]"
                  : "text-white/40 hover:text-white/80 hover:bg-white/5 border border-transparent"
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
                          className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${inputMode === m ? "border-fuchsia-400/40 bg-gradient-to-br from-fuchsia-500/20 to-violet-500/20 text-white shadow-[0_0_15px_-3px_rgba(217,70,239,0.4)]" : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:border-white/20"}`}>
                          {m === "url" ? "🔗 Link YouTube" : "📁 Upload de arquivo"}
                        </button>
                      ))}
                    </div>

                    {/* Input */}
                    <div>
                      {inputMode === "url" ? (
                        <>
                          <label className="text-xs text-white/60 mb-2 block">Link do YouTube</label>
                          <input type="url" value={url} onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://youtube.com/watch?v=..." disabled={processing}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-fuchsia-400 transition-colors disabled:opacity-50" />
                        </>
                      ) : (
                        <>
                          <label className="text-xs text-white/60 mb-2 block">Arquivo de vídeo <span className="text-white/40">(MP4, MOV, AVI — máx 500 MB)</span></label>
                          <label className={`flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${selectedFile ? "border-purple-500/50 bg-purple-500/5" : "border-white/10 bg-white/5 hover:border-white/20"} ${processing ? "opacity-50 pointer-events-none" : ""}`}>
                            <input type="file" accept="video/*" className="hidden" disabled={processing}
                              onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)} />
                            {selectedFile
                              ? <span className="text-sm text-fuchsia-200 px-4 text-center truncate max-w-full">{selectedFile.name}</span>
                              : <span className="text-sm text-white/50">Clique para selecionar o vídeo</span>}
                          </label>
                        </>
                      )}
                      {urlError && (
                        <div className="mt-2">
                          <p className="text-rose-300 text-xs">{urlError}</p>
                          {urlError.includes("réditos") && (
                            <a href="/#planos" className="text-xs text-fuchsia-300 hover:underline mt-1 inline-block">
                              Ver planos e comprar créditos →
                            </a>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Platforms */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-xs text-white/60">Plataformas</label>
                        {platforms.length > 0 && (() => {
                          const n = platforms.length;
                          const base = n === 1 ? "~1-2 min" : n === 2 ? "~2-3 min" : n === 3 ? "~3-4 min" : "~4-5 min";
                          const color = n === 1 ? "text-green-400" : n === 2 ? "text-yellow-400" : "text-orange-400";
                          return (
                            <span className={`text-xs font-medium flex items-center gap-1 ${color}`}>
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              {base} estimado
                            </span>
                          );
                        })()}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {PLATFORM_OPTIONS.map(p => (
                          <button key={p.id} type="button" onClick={() => togglePlatform(p.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${platforms.includes(p.id) ? "border-fuchsia-400/40 bg-gradient-to-br from-fuchsia-500/20 to-violet-500/20 text-white shadow-[0_0_15px_-3px_rgba(217,70,239,0.4)]" : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:border-white/20"}`}>
                            <span>{p.icon}</span>{p.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Layout do vídeo */}
                    <div>
                      <label className="text-xs text-white/60 mb-3 block">Layout do vídeo</label>
                      <div className="flex gap-2">
                        {([
                          { id: 'crop' as const, label: '✂️ Corte', desc: 'Preenche o frame cortando as bordas' },
                          { id: 'blur' as const, label: '🌫️ Fundo embaçado', desc: 'Vídeo completo com blur atrás' },
                        ]).map(opt => (
                          <button key={opt.id} type="button" onClick={() => setLayout(opt.id)}
                            className={`flex-1 flex flex-col items-center py-3 rounded-xl text-sm font-medium border transition-all ${layout === opt.id ? "border-fuchsia-400/40 bg-gradient-to-br from-fuchsia-500/20 to-violet-500/20 text-white shadow-[0_0_15px_-3px_rgba(217,70,239,0.4)]" : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:border-white/20"}`}>
                            <span className="font-bold text-base">{opt.label}</span>
                            <span className="text-xs text-white/50 mt-0.5 text-center">{opt.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Caption style */}
                    <div>
                      <label className="text-xs text-white/60 mb-3 block">Estilo de legenda</label>
                      <div className="grid grid-cols-2 gap-2">
                        {CAPTION_OPTIONS.map((c, index) => {
                          const p = CAPTION_PREVIEW[c.id];
                          return (
                            <button key={c.id} type="button" onClick={() => setCaptionStyle(c.id)}
                              className={`flex flex-col rounded-xl text-left text-sm border transition-all overflow-hidden ${captionStyle === c.id ? "border-fuchsia-400/40 bg-gradient-to-br from-fuchsia-500/20 to-violet-500/20 text-white shadow-[0_0_15px_-3px_rgba(217,70,239,0.4)]" : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:border-white/20"}`}>
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
                                <span className="text-xs text-white/50 mt-0.5 block">{c.desc}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Caption color */}
                    <div>
                      <label className="text-xs text-white/60 mb-3 block">Cor da legenda</label>
                      <div className="flex gap-2 flex-wrap">
                        {CAPTION_COLORS.map(c => (
                          <button key={c.value} type="button" onClick={() => setCaptionColor(c.value)} title={c.label}
                            className={`w-8 h-8 rounded-full transition-all ${captionColor === c.value ? "ring-2 ring-white ring-offset-2 ring-offset-black scale-110" : "opacity-70 hover:opacity-100"}`}
                            style={{ backgroundColor: c.value }} />
                        ))}
                      </div>
                    </div>

                    {/* Duration */}
                    <div>
                      <label className="text-xs text-white/60 mb-3 block">Duração de cada corte</label>
                      <div className="flex gap-2">
                        {DURATION_OPTIONS.map(d => (
                          <button key={d.value} type="button" onClick={() => setTargetDuration(d.value)}
                            className={`flex-1 flex flex-col items-center py-3 rounded-xl text-sm font-medium border transition-all ${targetDuration === d.value ? "border-fuchsia-400/40 bg-gradient-to-br from-fuchsia-500/20 to-violet-500/20 text-white shadow-[0_0_15px_-3px_rgba(217,70,239,0.4)]" : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:border-white/20"}`}>
                            <span className="font-bold text-base">{d.label}</span>
                            <span className="text-xs text-white/50 mt-0.5 text-center">{d.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Mode */}
                    <div>
                      <label className="text-xs text-white/60 mb-3 block">Modo de corte</label>
                      <div className="flex gap-2">
                        {(["ai", "manual"] as const).map(m => (
                          <button key={m} type="button" onClick={() => setMode(m)}
                            className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all ${mode === m ? "border-fuchsia-400/40 bg-gradient-to-br from-fuchsia-500/20 to-violet-500/20 text-white shadow-[0_0_15px_-3px_rgba(217,70,239,0.4)]" : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:border-white/20"}`}>
                            {m === "ai" ? "🤖 IA escolhe" : "✂️ Dividir igual"}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Clip count */}
                    {!isTrial && (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <label className="text-xs text-white/60">
                            Quantidade de clips <span className="text-white/40">máx {planMaxClips} no seu plano</span>
                          </label>
                          {(() => {
                            const total = maxClips * Math.max(1, platforms.length);
                            const mins = total <= 1 ? "~1-2 min" : total <= 3 ? "~2-4 min" : total <= 6 ? "~4-8 min" : "~8-15 min";
                            const color = total <= 2 ? "text-green-400" : total <= 4 ? "text-yellow-400" : "text-orange-400";
                            return (
                              <span className={`text-xs font-medium flex items-center gap-1 ${color}`}>
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                {mins} total
                              </span>
                            );
                          })()}
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          {Array.from({ length: Math.min(planMaxClips, 5) }, (_, i) => i + 1).map(n => (
                            <button key={n} type="button" onClick={() => setMaxClips(n)}
                              className={`flex-1 min-w-[52px] py-2 rounded-xl text-sm font-bold border transition-all ${maxClips === n ? "border-fuchsia-400/40 bg-gradient-to-br from-fuchsia-500/20 to-violet-500/20 text-white shadow-[0_0_15px_-3px_rgba(217,70,239,0.4)]" : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:border-white/20"}`}>
                              {n}
                            </button>
                          ))}
                          {planMaxClips > 5 && (
                            <button type="button" onClick={() => setMaxClips(planMaxClips)}
                              className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${maxClips === planMaxClips ? "border-fuchsia-400/40 bg-gradient-to-br from-fuchsia-500/20 to-violet-500/20 text-white shadow-[0_0_15px_-3px_rgba(217,70,239,0.4)]" : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:border-white/20"}`}>
                              {planMaxClips} (max)
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Watermark toggle */}
                    {plan !== "trial" && plan !== "gratis" ? (
                      <div className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/5">
                        <div>
                          <span className="text-sm text-white font-medium">Marca d&apos;água</span>
                          <p className="text-xs text-white/50 mt-0.5">Texto &quot;Viraliza Cortes&quot; no vídeo</p>
                        </div>
                        <button type="button" onClick={() => setAddWatermark(w => !w)}
                          className={`relative w-11 h-6 rounded-full transition-all ${addWatermark ? "bg-purple-600" : "bg-white/10"}`}>
                          <span className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all"
                            style={{ left: addWatermark ? "22px" : "2px" }} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 p-3 rounded-xl border border-yellow-500/20 bg-yellow-500/5">
                        <span className="text-yellow-400 text-sm">🏷️</span>
                        <span className="text-xs text-yellow-400/80">Marca d&apos;água incluída no plano. Faça upgrade para remover.</span>
                      </div>
                    )}

                    {/* Captions toggle */}
                    <div className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/5">
                      <div>
                        <span className="text-sm text-white font-medium">Legendas</span>
                        <p className="text-xs text-white/50 mt-0.5">Adicionar legendas automáticas ao vídeo</p>
                      </div>
                      <button type="button" onClick={() => setAddCaptions(c => !c)}
                        className={`relative w-11 h-6 rounded-full transition-all ${addCaptions ? "bg-purple-600" : "bg-white/10"}`}>
                        <span className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all"
                          style={{ left: addCaptions ? "22px" : "2px" }} />
                      </button>
                    </div>

                    <button type="submit" disabled={processing}
                      className="btn-primary w-full py-4 rounded-xl font-bold text-base disabled:opacity-50">
                      {processing ? "Processando..." : `🚀 Gerar ${isTrial ? "clips grátis" : `${maxClips} clip${maxClips > 1 ? "s" : ""}`}`}
                    </button>
                  </form>
                )}

                {/* Processing status */}
                {job && job.status !== "done" && job.status !== "error" && (() => {
                  const STEPS = [
                    { id: "downloading",  icon: "⬇️",  label: "Baixando",    sub: "Obtendo o vídeo do YouTube…" },
                    { id: "transcribing", icon: "🎙️", label: "Transcrevendo", sub: "Convertendo áudio em texto com IA…" },
                    { id: "analyzing",    icon: "🤖",  label: "Analisando",   sub: "IA identificando os melhores momentos virais…" },
                    { id: "processing",   icon: "✂️",  label: "Cortando",     sub: "Gerando seus clips e adicionando legendas…" },
                  ] as const;
                  const ORDER = ["queued","downloading","transcribing","analyzing","processing"];
                  const curIdx = ORDER.indexOf(job.status);
                  const stepIdx = Math.max(0, curIdx - 1); // queued fica no step 0
                  const cur = STEPS[Math.min(stepIdx, STEPS.length - 1)];
                  return (
                    <div className="card-glow rounded-2xl p-6 space-y-5">
                      {/* Stepper */}
                      <div className="flex items-center justify-center gap-0">
                        {STEPS.map((s, i) => {
                          const done = i < stepIdx;
                          const active = i === stepIdx;
                          return (
                            <div key={s.id} className="flex items-center">
                              <div className={`flex flex-col items-center gap-1 transition-all duration-500 ${active ? "scale-110" : ""}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 transition-all duration-500 ${
                                  done   ? "bg-emerald-500/20 border-emerald-400 text-emerald-300" :
                                  active ? "bg-fuchsia-500/20 border-fuchsia-400 shadow-[0_0_12px_rgba(217,70,239,0.6)] animate-pulse" :
                                           "bg-white/5 border-white/15 text-white/30"
                                }`}>
                                  {done ? "✓" : s.icon}
                                </div>
                                <span className={`text-[9px] font-semibold uppercase tracking-wide ${active ? "text-fuchsia-300" : done ? "text-emerald-400" : "text-white/25"}`}>
                                  {s.label}
                                </span>
                              </div>
                              {i < STEPS.length - 1 && (
                                <div className={`w-8 h-[2px] mb-4 rounded-full transition-all duration-700 ${i < stepIdx ? "bg-emerald-400/60" : "bg-white/10"}`} />
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Icon + status */}
                      <div className="text-center space-y-1.5">
                        <div className="text-5xl" style={{ animation: "cpop 1.5s ease-in-out infinite" }}>{cur.icon}</div>
                        <p className="font-bold text-base text-white">{getStatusLabel(job.status)}</p>
                        <p className="text-xs text-white/50">{cur.sub}</p>
                      </div>

                      {/* Progress bar */}
                      <div className="space-y-2">
                        <div className="h-3 bg-white/5 rounded-full overflow-hidden relative">
                          <div
                            className="h-full rounded-full transition-all duration-700 ease-out"
                            style={{
                              width: `${job.progress}%`,
                              background: "linear-gradient(90deg, #a855f7, #d946ef)",
                              boxShadow: "0 0 12px rgba(217,70,239,0.5)",
                            }}
                          />
                        </div>
                        <div className="flex justify-between text-[11px] text-white/40">
                          <span>Processando seu vídeo…</span>
                          <span className="font-bold text-white/60">{job.progress}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Error */}
                {job?.status === "error" && (
                  <div className="rounded-2xl bg-rose-500/10 border border-rose-500/30 p-6 text-center space-y-3">
                    <p className="text-rose-300 font-semibold">❌ Erro no processamento</p>
                    <p className="text-white/60 text-sm">{job.error}</p>
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
                      <button onClick={handleNewVideo} className="text-sm text-fuchsia-300 hover:text-fuchsia-200">
                        + Novo vídeo
                      </button>
                    </div>
                    {isTrial && (
                      <div className="rounded-xl bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-fuchsia-400/30 p-4 text-center">
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
                    }} className="text-xs text-white/40 hover:text-rose-300 transition-colors">
                      Limpar tudo
                    </button>
                  )}
                </div>
                {history.length === 0 ? (
                  <div className="text-center py-16 space-y-3">
                    <div className="text-5xl">📋</div>
                    <p className="text-white/60 text-sm">Nenhum projeto ainda</p>
                    <p className="text-white/40 text-xs">Seus clips gerados aparecem aqui para download posterior</p>
                    <button onClick={() => setView("studio")} className="btn-primary px-6 py-2 rounded-xl text-sm font-semibold mt-2">
                      Gerar primeiro clip →
                    </button>
                  </div>
                ) : (
                  history.map(item => (
                    <div key={item.id} className="bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden">
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-white/50 mb-1">
                              {new Date(item.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                            </p>
                            <p className="text-sm text-white/80 truncate font-mono">{item.url.replace("https://", "").slice(0, 50)}</p>
                          </div>
                          <span className="text-xs px-2.5 py-1 rounded-full bg-fuchsia-500/10 text-fuchsia-200 border border-fuchsia-400/30 font-semibold shrink-0">
                            {item.clipCount} clip{item.clipCount !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <button onClick={() => setExpandedHistory(expandedHistory === item.id ? null : item.id)}
                            className="flex-1 py-2 rounded-xl text-xs font-semibold bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                            {expandedHistory === item.id ? "Ocultar clips" : "Ver clips"}
                          </button>
                          <button onClick={() => { setUrl(item.url); setView("studio"); setInputMode("url"); }}
                            className="flex-1 py-2 rounded-xl text-xs font-semibold bg-fuchsia-500/10 border border-fuchsia-400/30 text-fuchsia-200 hover:bg-fuchsia-500/20 transition-colors">
                            Usar URL →
                          </button>
                        </div>
                      </div>
                      {expandedHistory === item.id && item.clips.length > 0 && (
                        <div className="border-t border-white/10 p-4 space-y-2">
                          {item.clips.map(clip => (
                            <a key={`${clip.clipNumber}-${clip.platform}`}
                              href={getForceDownloadUrl(clip.downloadUrl)} download={clip.fileName}
                              className="flex items-center justify-between py-2 px-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-white/90 truncate">{clip.title || clip.platformLabel}</p>
                                <p className="text-xs text-white/50">{clip.platformLabel} • {clip.duration}s</p>
                              </div>
                              <span className="text-xs text-fuchsia-300 ml-3 shrink-0">⬇️ Baixar</span>
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
                  <p className="text-white/50 text-sm">Canais brasileiros com conteúdo perfeito para cortes virais. Clique em um canal, escolha um vídeo longo e copie a URL para o Studio.</p>
                </div>
                <div className="bg-fuchsia-500/10 border border-fuchsia-400/30 rounded-xl p-3 flex gap-3 items-start">
                  <span className="text-xl">💡</span>
                  <p className="text-xs text-purple-200 leading-relaxed">
                    <strong>Dica:</strong> vídeos longos (30min+) de entrevistas, podcasts e debates geram mais clips virais. Use a IA para ela escolher os melhores momentos automaticamente.
                  </p>
                </div>
                {HUB_DATA.map(section => (
                  <div key={section.category}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">{section.icon}</span>
                      <h3 className="font-semibold text-sm text-white/90">{section.category}</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {section.channels.map(ch => (
                        <div key={ch.name} className="flex items-center justify-between bg-black/30 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600/40 to-blue-600/40 border border-white/10 flex items-center justify-center text-sm font-bold text-white">
                              {ch.name.charAt(0)}
                            </div>
                            <span className="text-sm font-medium text-white/90">{ch.name}</span>
                          </div>
                          <a href={ch.url} target="_blank" rel="noopener noreferrer"
                            className="text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all">
                            Abrir →
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center space-y-2">
                  <p className="text-sm font-semibold">Quer clipar um vídeo específico?</p>
                  <p className="text-xs text-white/50">Cole a URL direto no Studio</p>
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
                  <p className="text-white/50 text-sm">Personalize seus clips com a identidade da sua marca.</p>
                </div>

                <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-5 space-y-4">
                  <div>
                    <label className="text-xs text-white/60 mb-2 block font-semibold">Texto de marca (aparece no final dos clips)</label>
                    <input
                      type="text"
                      value={brandWatermark}
                      onChange={(e) => setBrandWatermark(e.target.value)}
                      placeholder="@seu.perfil ou Nome do Canal"
                      maxLength={40}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-fuchsia-400 transition-colors"
                    />
                    <p className="text-xs text-white/40 mt-1">{brandWatermark.length}/40 caracteres</p>
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
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex gap-3 items-start opacity-60">
                    <span className="text-xl">🖼️</span>
                    <div>
                      <p className="text-sm font-semibold">Logo personalizado</p>
                      <p className="text-xs text-white/50 mt-0.5">Upload da sua logo nos clips — em breve</p>
                    </div>
                    <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-fuchsia-500/10 border border-fuchsia-400/30 text-fuchsia-200 font-semibold tracking-wide">Em breve</span>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex gap-3 items-start opacity-60">
                    <span className="text-xl">🎨</span>
                    <div>
                      <p className="text-sm font-semibold">Paleta de cores da marca</p>
                      <p className="text-xs text-white/50 mt-0.5">Cores personalizadas nas legendas — em breve</p>
                    </div>
                    <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-fuchsia-500/10 border border-fuchsia-400/30 text-fuchsia-200 font-semibold tracking-wide">Em breve</span>
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* Bottom navigation — mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0a0a0a] border-t border-white/10 flex z-50">
        {NAV_ITEMS.map(item => (
          <button key={item.id} onClick={() => setView(item.id)}
            className={`flex-1 flex flex-col items-center py-2.5 gap-0.5 transition-colors ${
              view === item.id ? "text-fuchsia-300" : "text-white/40"
            }`}>
            <span className="text-lg leading-none">{item.icon}</span>
            <span className="text-[9px] font-semibold leading-none">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

// ─── Publish platform config ──────────────────────────────────────────────────

const PUBLISH_PLATFORMS: Record<string, {
  label: string; icon: string; color: string;
  hashtags: string; tip: string; uploadUrl: string;
}> = {
  tiktok: {
    label: "TikTok", icon: "🎵",
    color: "border-pink-500/40 bg-pink-500/10 text-pink-300",
    hashtags: "#viral #fyp #foryoupage #shorts #clip #criadores",
    tip: "Melhor horário: 19h–21h • Adicione música trending • Responda comentários nas primeiras horas",
    uploadUrl: "https://www.tiktok.com/upload",
  },
  instagram: {
    label: "Instagram", icon: "📸",
    color: "border-fuchsia-400/40 bg-fuchsia-500/10 text-fuchsia-200",
    hashtags: "#reels #viral #explorepage #conteudo #criadores #brasil",
    tip: "Melhor horário: 18h–20h • Use localização • Primeiros 3s são decisivos",
    uploadUrl: "https://www.instagram.com/reels/",
  },
  youtube: {
    label: "YT Shorts", icon: "▶️",
    color: "border-red-500/40 bg-red-500/10 text-red-300",
    hashtags: "#shorts #viral #youtube #clip #conteudo",
    tip: "Melhor horário: 15h–21h • Título em caixa alta atrai cliques • Thumbnail importa",
    uploadUrl: "https://studio.youtube.com/",
  },
  facebook: {
    label: "Facebook", icon: "👥",
    color: "border-blue-500/40 bg-blue-500/10 text-blue-300",
    hashtags: "#video #viral #conteudo #clip #reels",
    tip: "Melhor horário: 13h–16h • Grupos temáticos amplificam alcance",
    uploadUrl: "https://www.facebook.com/reels/create",
  },
};

// ─── ClipCard Component ───────────────────────────────────────────────────────

function ClipCard({ clip }: { clip: Clip }) {
  const [playerOpen, setPlayerOpen] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showPublish, setShowPublish] = useState(false);
  const [publishTab, setPublishTab] = useState<keyof typeof PUBLISH_PLATFORMS>("tiktok");
  const [editTitle, setEditTitle] = useState(clip.title);
  const [editHook, setEditHook] = useState(clip.hook || "");
  const [copied, setCopied] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);

  const PLATFORM_ACCENT: Record<string, { border: string; glow: string; badge: string }> = {
    tiktok:           { border: "border-pink-500/30",   glow: "shadow-pink-500/10",   badge: "text-pink-300 bg-pink-500/10 border-pink-500/25" },
    instagram_reels:  { border: "border-fuchsia-400/30", glow: "shadow-fuchsia-500/30", badge: "text-fuchsia-200 bg-fuchsia-500/10 border-fuchsia-400/30" },
    instagram_feed:   { border: "border-fuchsia-400/30", glow: "shadow-fuchsia-500/30", badge: "text-fuchsia-200 bg-fuchsia-500/10 border-fuchsia-400/30" },
    instagram_square: { border: "border-fuchsia-400/30", glow: "shadow-fuchsia-500/30", badge: "text-fuchsia-200 bg-fuchsia-500/10 border-fuchsia-400/30" },
    facebook:         { border: "border-blue-500/30",   glow: "shadow-blue-500/10",   badge: "text-blue-300 bg-blue-500/10 border-blue-500/25" },
    youtube_shorts:   { border: "border-red-500/30",    glow: "shadow-red-500/10",    badge: "text-red-300 bg-red-500/10 border-red-500/25" },
  };
  const accent = PLATFORM_ACCENT[clip.platform] || { border: "border-white/10", glow: "", badge: "text-white/60 bg-white/5 border-white/10" };

  const pub = PUBLISH_PLATFORMS[publishTab];
  const aiHashtags = clip.hashtags && clip.hashtags.trim() ? clip.hashtags : pub.hashtags;
  const fullCaption = `${editTitle}\n\n${editHook ? editHook + "\n\n" : ""}${clip.description ? clip.description + "\n\n" : ""}${aiHashtags}`;

  function copyText(text: string, key: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  async function handleNativeShare() {
    setSharing(true);
    try {
      const videoUrl = getDownloadUrl(clip.downloadUrl);
      if (typeof navigator.canShare === "function") {
        const resp = await fetch(videoUrl);
        const blob = await resp.blob();
        const file = new File([blob], clip.fileName, { type: blob.type || "video/mp4" });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ title: editTitle, text: fullCaption, files: [file] });
          setSharing(false);
          return;
        }
      }
      if (navigator.share) {
        await navigator.share({ title: editTitle, text: fullCaption, url: videoUrl });
      } else {
        alert("Baixe o vídeo e poste manualmente no app.");
      }
    } catch { /* user cancelled */ }
    finally { setSharing(false); }
  }

  return (
    <div className={`rounded-2xl overflow-hidden border shadow-lg transition-all duration-200 ${accent.border} ${accent.glow}`}
      style={{ background: "linear-gradient(160deg, #111118 0%, #0d0d12 100%)" }}>

      {/* ── Mini Player ── */}
      <div className="relative bg-black" style={{ aspectRatio: playerOpen ? undefined : "auto" }}>
        {playerOpen ? (
          <video
            controls
            playsInline
            preload="metadata"
            src={getDownloadUrl(clip.downloadUrl)}
            className="w-full"
            style={{ maxHeight: 320, display: "block", background: "#000" }}
          />
        ) : (
          <button
            onClick={() => setPlayerOpen(true)}
            className="w-full flex items-center justify-center gap-3 py-4 text-sm font-semibold text-white/60 hover:text-white transition-colors"
            style={{ background: "rgba(255,255,255,0.02)" }}
          >
            <span className="w-9 h-9 rounded-full flex items-center justify-center border border-white/15 bg-white/5">▶</span>
            Abrir player
          </button>
        )}
        {playerOpen && (
          <button
            onClick={() => setPlayerOpen(false)}
            className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs text-white/80 hover:text-white transition-colors"
            style={{ background: "rgba(0,0,0,0.7)" }}
            title="Minimizar"
          >✕</button>
        )}
      </div>

      {/* ── Content ── */}
      <div className="p-4 space-y-3">

        {/* Header: platform badge + score + title */}
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[11px] px-2.5 py-0.5 rounded-full border font-bold ${accent.badge}`}>
                {clip.platformLabel}
              </span>
              <span className="text-[11px] text-white/40 font-medium">
                {ASPECT_LABELS[clip.aspectRatio] || clip.aspectRatio} · {clip.duration}s
              </span>
            </div>

            {editing ? (
              <input value={editTitle} onChange={e => setEditTitle(e.target.value)}
                className="w-full bg-white/5 border border-fuchsia-400/40 rounded-lg px-2.5 py-1.5 text-sm font-semibold outline-none text-white" />
            ) : (
              <p className="font-bold text-sm leading-snug text-white/90">{editTitle}</p>
            )}

            {editing ? (
              <textarea value={editHook} onChange={e => setEditHook(e.target.value)} rows={2}
                className="w-full bg-white/5 border border-fuchsia-400/40 rounded-lg px-2.5 py-1.5 text-xs text-white/80 outline-none resize-none"
                placeholder="Hook de abertura..." />
            ) : (
              editHook && (
                <p className="text-xs text-white/50 leading-relaxed line-clamp-2">💬 {editHook}</p>
              )
            )}
          </div>

          {/* Viral score ring */}
          <div className="flex-shrink-0 flex flex-col items-center justify-center w-12 h-12 rounded-full border-2 border-fuchsia-400/40"
            style={{ background: "radial-gradient(circle, rgba(139,43,226,0.15), transparent)" }}>
            <span className="text-base font-black text-fuchsia-200 leading-none">{clip.viralScore}</span>
            <span className="text-[9px] text-white/40 leading-none">/10</span>
          </div>
        </div>

        {/* Action strip */}
        <div className="flex gap-1.5 flex-wrap">
          {[
            { label: editing ? "✓ Salvar" : "✏️ Editar",    active: editing,     onClick: () => setEditing(v => !v),     activeClass: "border-fuchsia-400/40 bg-fuchsia-500/10 text-fuchsia-200" },
            { label: showPublish ? "✕ Publicar" : "🚀 Publicar", active: showPublish, onClick: () => setShowPublish(v => !v), activeClass: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300" },
          ].map(btn => (
            <button key={btn.label} onClick={btn.onClick}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                btn.active ? btn.activeClass : "border-white/10 bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
              }`}>
              {btn.label}
            </button>
          ))}
          <button onClick={() => copyText(editHook || editTitle, "hook")}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/10 bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-all">
            {copied === "hook" ? "✓ Copiado" : "📋 Hook"}
          </button>
        </div>

        {/* Publish panel */}
        {showPublish && (
          <div className="rounded-xl overflow-hidden border border-white/10" style={{ background: "#08080e" }}>
            <div className="flex border-b border-white/10">
              {Object.entries(PUBLISH_PLATFORMS).map(([key, p]) => (
                <button key={key} onClick={() => setPublishTab(key as keyof typeof PUBLISH_PLATFORMS)}
                  className={`flex-1 py-2 text-[10px] font-bold transition-all ${
                    publishTab === key ? "text-white border-b-2 border-fuchsia-400 bg-white/5" : "text-white/40 hover:text-white/60"
                  }`}>
                  {p.icon}<br /><span className="hidden sm:inline">{p.label}</span>
                </button>
              ))}
            </div>
            <div className="p-3 space-y-2.5">
              <p className="text-[11px] text-amber-300/80 leading-relaxed">💡 {pub.tip}</p>
              <div className="rounded-lg p-3 border border-white/10" style={{ background: "rgba(255,255,255,0.02)" }}>
                <p className="text-[10px] text-white/40 mb-1.5 font-bold uppercase tracking-wide">Legenda gerada</p>
                <p className="text-xs text-white/80 whitespace-pre-line leading-relaxed">{fullCaption}</p>
              </div>
              <button onClick={() => copyText(fullCaption, "full")}
                className="w-full py-2 rounded-lg text-xs font-semibold border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-white/80">
                {copied === "full" ? "✓ Copiado!" : "📋 Copiar legenda"}
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={handleNativeShare} disabled={sharing}
                  className="py-2.5 rounded-lg text-xs font-bold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}>
                  {sharing ? "..." : "📤 Compartilhar"}
                </button>
                <a href={pub.uploadUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center py-2.5 rounded-lg text-xs font-bold border border-white/15 bg-white/5 hover:bg-white/10 text-white/80 transition-colors">
                  {pub.icon} Abrir app
                </a>
              </div>
              <p className="text-[10px] text-white/40 text-center">No celular, &quot;Compartilhar&quot; envia o arquivo direto para TikTok, Instagram etc</p>
            </div>
          </div>
        )}

        {/* Download CTA — prominent. Sem target="_blank": o backend manda Content-Disposition: attachment
            via ?download=1, então o browser baixa direto sem abrir nova aba. */}
        <a href={getForceDownloadUrl(clip.downloadUrl)} download={clip.fileName}
          className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-xl font-black text-sm text-white transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ background: "linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)", boxShadow: "0 4px 20px rgba(124,58,237,0.35)" }}>
          ⬇️ Baixar {clip.platformLabel}
        </a>
      </div>
    </div>
  );
}
