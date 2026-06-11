"use client";

import { useState, useEffect, useRef } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import {
  startProcessing,
  uploadAndProcess,
  getJobStatus,
  getDownloadUrl,
  deleteJob,
  getStatusLabel,
  getAuthToken,
  getTrialToken,
  getOAuthToken,
  saveWhatsapp,
  type Clip,
  type Job,
  type Platform,
  type CaptionStyle,
  type Plan,
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
  tiktok:     { text: "palavra viral", color: "#fff", textShadow: "-2px -2px 0 #000,2px -2px 0 #000,-2px 2px 0 #000,2px 2px 0 #000", bg: "transparent", fontFamily: "sans-serif", anim: "cpop" },
  hormozi:    { text: "IMPACTO!", color: "#FFBF00", textShadow: "-2px -2px 0 #000,2px -2px 0 #000,-2px 2px 0 #000,2px 2px 0 #000", bg: "transparent", fontFamily: "sans-serif", anim: "czoom" },
  dark:       { text: "fácil de ler", color: "#fff", textShadow: "none", bg: "rgba(0,0,0,0.65)", fontFamily: "sans-serif", anim: "cslide" },
  clean:      { text: "texto suave", color: "#f0f0f0", textShadow: "1px 1px 3px rgba(0,0,0,0.9)", bg: "transparent", fontFamily: "sans-serif", anim: "cfade" },
  opensans:   { text: "moderno", color: "#fff", textShadow: "-2px -2px 0 #000,2px -2px 0 #000,-2px 2px 0 #000,2px 2px 0 #000", bg: "transparent", fontFamily: "'Open Sans',sans-serif", anim: "cpop" },
  ubuntu:     { text: "arredondado", color: "#fff", textShadow: "-2px -2px 0 #7C3AED,2px -2px 0 #7C3AED,-2px 2px 0 #7C3AED,2px 2px 0 #7C3AED", bg: "transparent", fontFamily: "'Ubuntu',sans-serif", anim: "czoom" },
  montserrat: { text: "premium", color: "#fff", textShadow: "-2px -2px 0 #000,2px -2px 0 #000,-2px 2px 0 #000,2px 2px 0 #000", bg: "transparent", fontFamily: "Montserrat,sans-serif", anim: "cslide" },
  neon:       { text: "brilho MAX!", color: "#00FFFF", textShadow: "0 0 8px #00FFFF,0 0 16px #00FFFF,-1px -1px 0 #000,1px 1px 0 #000", bg: "transparent", fontFamily: "sans-serif", anim: "cpop" },
};

const DURATION_OPTIONS = [
  { value: 30, label: "30 seg", desc: "Clips rápidos • TikTok viral" },
  { value: 60, label: "1 min",  desc: "Duração padrão • completo" },
  { value: 90, label: "1:30",   desc: "Clips extensos • podcasts" },
];

const PLAN_MAX_CLIPS: Record<Plan, number> = { trial: 2, gratis: 2, basico: 10, pro: 20, full: 50, agencia: 100 };

const ASPECT_LABELS: Record<string, string> = {
  "9:16": "Vertical",
  "4:5":  "Retrato",
  "1:1":  "Quadrado",
  "16:9": "Horizontal",
};

export default function AppPage() {
  const { data: session, status: sessionStatus } = useSession();

  const [step, setStep] = useState<"login" | "register" | "app">("login");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [plan, setPlan] = useState<Plan>("trial");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [isTrial, setIsTrial] = useState(false);

  // WhatsApp registration
  const [whatsapp, setWhatsapp] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [registering, setRegistering] = useState(false);
  const [pendingToken, setPendingToken] = useState<string | null>(null);
  const [pendingPlan, setPendingPlan] = useState<Plan>("trial");
  const [pendingEmail, setPendingEmail] = useState("");

  const [inputMode, setInputMode] = useState<"url" | "upload">("url");
  const [url, setUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [platforms, setPlatforms] = useState<Platform[]>(["tiktok", "instagram"]);
  const [mode, setMode] = useState<"ai" | "manual">("ai");
  const [maxClips, setMaxClips] = useState(3);
  const [captionStyle, setCaptionStyle] = useState<CaptionStyle>("tiktok");
  const [targetDuration, setTargetDuration] = useState(60);

  const [jobId, setJobId] = useState<string | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [processing, setProcessing] = useState(false);
  const [urlError, setUrlError] = useState("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const planMaxClips = PLAN_MAX_CLIPS[plan] || 15;

  // Restore saved session from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("viralizaia_token");
    const savedPlan = localStorage.getItem("viralizaia_plan") as Plan | null;
    const savedEmail = localStorage.getItem("viralizaia_email");
    if (saved) {
      setToken(saved);
      if (savedPlan) setPlan(savedPlan);
      if (savedEmail) setEmail(savedEmail);
      setStep("app");
    }
  }, []);

  // Auto-login after Google OAuth
  useEffect(() => {
    if (sessionStatus === "authenticated" && session?.user?.email && step === "login" && !loggingIn) {
      handleOAuthLogin(session.user.email);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionStatus, session]);

  // Poll job status
  useEffect(() => {
    if (!jobId) return;
    pollRef.current = setInterval(async () => {
      try {
        const status = await getJobStatus(jobId);
        setJob(status);
        if (status.status === "done" || status.status === "error") {
          clearInterval(pollRef.current!);
          setProcessing(false);
        }
      } catch {
        clearInterval(pollRef.current!);
        setProcessing(false);
        setJob({ status: "error", progress: 0, clips: [], error: "Conexão perdida. Tente novamente." });
      }
    }, 2000);
    return () => clearInterval(pollRef.current!);
  }, [jobId]);

  // ── OAuth auto-login ──
  async function handleOAuthLogin(oauthEmail: string) {
    setLoggingIn(true);
    setLoginError("");
    try {
      const result = await getOAuthToken(oauthEmail);
      const hasWhatsapp = localStorage.getItem("viralizaia_whatsapp");
      if (!hasWhatsapp) {
        setPendingToken(result.token);
        setPendingPlan(result.plan);
        setPendingEmail(oauthEmail);
        setStep("register");
      } else {
        finishLogin(result.token, result.plan, oauthEmail, result.isTrial || false);
      }
    } catch (err: unknown) {
      setLoginError(err instanceof Error ? err.message : "Erro ao fazer login com OAuth");
    } finally {
      setLoggingIn(false);
    }
  }

  // ── Email login ──
  async function handleLogin(e: React.FormEvent, useTrial = false) {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError("");
    try {
      const result = useTrial ? await getTrialToken(email) : await getAuthToken(email);
      const hasWhatsapp = localStorage.getItem("viralizaia_whatsapp");
      if (!hasWhatsapp) {
        setPendingToken(result.token);
        setPendingPlan(result.plan);
        setPendingEmail(email);
        setStep("register");
      } else {
        finishLogin(result.token, result.plan, email, result.isTrial || false);
      }
    } catch (err: unknown) {
      setLoginError(err instanceof Error ? err.message : "Erro ao fazer login");
    } finally {
      setLoggingIn(false);
    }
  }

  // ── WhatsApp registration ──
  async function handleRegisterWhatsapp() {
    const digits = whatsapp.replace(/\D/g, "");
    if (digits.length < 10) { setRegisterError("Digite um número válido com DDD"); return; }
    setRegistering(true);
    setRegisterError("");
    try {
      await saveWhatsapp(pendingEmail, digits, pendingToken!);
      localStorage.setItem("viralizaia_whatsapp", digits);
      finishLogin(pendingToken!, pendingPlan, pendingEmail, false);
    } catch (err: unknown) {
      setRegisterError(err instanceof Error ? err.message : "Erro ao salvar WhatsApp");
    } finally {
      setRegistering(false);
    }
  }

  function finishLogin(tok: string, p: Plan, loginEmail: string, trial: boolean) {
    setToken(tok);
    setPlan(p);
    setIsTrial(trial);
    setEmail(loginEmail);
    localStorage.setItem("viralizaia_token", tok);
    localStorage.setItem("viralizaia_plan", p);
    localStorage.setItem("viralizaia_email", loginEmail);
    setStep("app");
  }

  function handleLogout() {
    setToken(null);
    localStorage.removeItem("viralizaia_token");
    localStorage.removeItem("viralizaia_plan");
    localStorage.removeItem("viralizaia_email");
    setStep("login");
    setJob(null);
    setJobId(null);
    if (sessionStatus === "authenticated") signOut({ redirect: false });
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
        ({ jobId: id } = await startProcessing(url, platforms, mode, token, clipsToRequest, captionStyle, targetDuration));
      } else {
        ({ jobId: id } = await uploadAndProcess(selectedFile!, platforms, mode, token, clipsToRequest, captionStyle, targetDuration));
      }
      setJobId(id);
      setJob({ status: "queued", progress: 0, clips: [], error: null });
    } catch (err: unknown) {
      setProcessing(false);
      setUrlError(err instanceof Error ? err.message : "Erro ao processar");
    }
  }

  function togglePlatform(p: Platform) {
    setPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  }

  async function handleNewVideo() {
    if (jobId) await deleteJob(jobId);
    setJobId(null);
    setJob(null);
    setUrl("");
    setSelectedFile(null);
    setProcessing(false);
  }

  // ── TELA DE LOGIN ──────────────────────────────────────────────────────────
  if (step === "login") {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <p className="gradient-text font-extrabold text-2xl mb-1">Viraliza Cortes</p>
            <p className="text-gray-400 text-sm">Cortes virais com IA em segundos</p>
          </div>

          {/* Social Login */}
          <div className="space-y-3 mb-5">
            <button
              onClick={() => signIn("google", { callbackUrl: "/app" })}
              disabled={loggingIn}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-xl font-bold text-sm bg-white text-gray-900 hover:bg-gray-100 transition-all disabled:opacity-50"
            >
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
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#080808] px-3 text-xs text-gray-600">ou entre com e-mail</span>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500 transition-colors"
            />
            {loginError && <p className="text-red-400 text-xs">{loginError}</p>}
            <button
              type="submit"
              disabled={loggingIn}
              className="btn-primary w-full py-3 rounded-xl font-bold text-sm disabled:opacity-50"
            >
              {loggingIn ? "Verificando..." : "Entrar com assinatura →"}
            </button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
            <div className="relative flex justify-center"><span className="bg-[#080808] px-3 text-xs text-gray-600">ou</span></div>
          </div>

          <button
            onClick={(e) => {
              if (email.includes("@")) handleLogin(e as unknown as React.FormEvent, true);
              else setLoginError("Digite seu e-mail primeiro.");
            }}
            disabled={loggingIn}
            className="w-full py-3 rounded-xl font-bold text-sm border border-purple-500/40 text-purple-300 hover:bg-purple-500/10 transition-all disabled:opacity-50"
          >
            🎁 Testar 2 clips grátis
          </button>
          <p className="text-center text-xs text-gray-600 mt-2">Sem cartão • Resultado em minutos</p>

          <p className="text-center text-xs text-gray-600 mt-6">
            Ainda não é assinante?{" "}
            <a href="/" className="text-purple-400 hover:underline">Ver planos</a>
          </p>
        </div>
      </div>
    );
  }

  // ── TELA DE CADASTRO (WhatsApp) ────────────────────────────────────────────
  if (step === "register") {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">📱</div>
            <p className="font-extrabold text-xl mb-2">Quase pronto!</p>
            <p className="text-gray-400 text-sm leading-relaxed">
              Adicione seu WhatsApp para receber uma mensagem quando seus clips ficarem prontos.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 mb-2 block">WhatsApp (com DDD)</label>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="(11) 99999-9999"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500 transition-colors"
              />
              <p className="text-xs text-gray-600 mt-1">Você vai receber aviso quando os cortes ficarem prontos ✅</p>
            </div>

            {registerError && <p className="text-red-400 text-xs">{registerError}</p>}

            <button
              onClick={handleRegisterWhatsapp}
              disabled={registering}
              className="btn-primary w-full py-3 rounded-xl font-bold text-sm disabled:opacity-50"
            >
              {registering ? "Salvando..." : "Confirmar e entrar →"}
            </button>

            <button
              onClick={() => {
                localStorage.setItem("viralizaia_whatsapp", "skip");
                finishLogin(pendingToken!, pendingPlan, pendingEmail, false);
              }}
              className="w-full py-2 text-xs text-gray-600 hover:text-gray-400 transition-colors"
            >
              Pular por enquanto
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── TELA DO APP ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#080808] px-4 py-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <span className="gradient-text font-extrabold text-xl">Viraliza Cortes</span>
        <div className="flex items-center gap-3">
          {isTrial && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-300 border border-yellow-500/20">
              Teste grátis — 1 clip
            </span>
          )}
          {!isTrial && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/20 capitalize">
              {plan} — até {planMaxClips} clips
            </span>
          )}
          <button onClick={handleLogout} className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
            Sair
          </button>
        </div>
      </div>

      {!job && (
        <form onSubmit={handleProcess} className="space-y-5">
          {/* Toggle URL / Upload */}
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
                <label className="text-xs text-gray-400 mb-2 block">
                  Arquivo de vídeo <span className="text-gray-600">(MP4, MOV, AVI — máx 500 MB)</span>
                </label>
                <label className={`flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${selectedFile ? "border-purple-500/50 bg-purple-500/5" : "border-white/10 bg-white/5 hover:border-white/20"} ${processing ? "opacity-50 pointer-events-none" : ""}`}>
                  <input type="file" accept="video/*" className="hidden" disabled={processing}
                    onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)} />
                  {selectedFile
                    ? <span className="text-sm text-purple-300 px-4 text-center truncate max-w-full">{selectedFile.name}</span>
                    : <span className="text-sm text-gray-500">Clique para selecionar o vídeo</span>}
                </label>
              </>
            )}
            {urlError && <p className="text-red-400 text-xs mt-1">{urlError}</p>}
          </div>

          {/* Plataformas */}
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

          <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@700&family=Ubuntu:wght@700&display=swap');
            @keyframes cpop {
              0%,6% { opacity:0; transform:scale(0.7); }
              14%,78% { opacity:1; transform:scale(1); }
              88%,100% { opacity:0; transform:scale(1); }
            }
            @keyframes czoom {
              0%,6% { opacity:0; transform:scale(0.3); }
              16%,78% { opacity:1; transform:scale(1); }
              88%,100% { opacity:0; transform:scale(1); }
            }
            @keyframes cslide {
              0%,6% { opacity:0; transform:translateY(10px); }
              14%,78% { opacity:1; transform:translateY(0); }
              88%,100% { opacity:0; transform:translateY(0); }
            }
            @keyframes cfade {
              0%,8% { opacity:0; }
              16%,80% { opacity:1; }
              90%,100% { opacity:0; }
            }
          `}</style>
          {/* Estilo de legenda */}
          <div>
            <label className="text-xs text-gray-400 mb-3 block">Estilo de legenda</label>
            <div className="grid grid-cols-2 gap-2">
              {CAPTION_OPTIONS.map((c, index) => {
                const p = CAPTION_PREVIEW[c.id];
                return (
                  <button key={c.id} type="button" onClick={() => setCaptionStyle(c.id)}
                    className={`flex flex-col rounded-xl text-left text-sm border transition-all overflow-hidden ${captionStyle === c.id ? "border-purple-500/50 bg-purple-500/15 text-white" : "border-white/10 bg-white/5 text-gray-400"}`}>
                    {/* Mini animated preview */}
                    <div className="w-full h-10 flex items-center justify-center" style={{ background: "#080808" }}>
                      <span style={{
                        color: p.color,
                        textShadow: p.textShadow,
                        fontFamily: p.fontFamily,
                        fontWeight: 700,
                        fontSize: "11px",
                        background: p.bg,
                        padding: p.bg !== "transparent" ? "1px 7px" : "0",
                        borderRadius: p.bg !== "transparent" ? "3px" : "0",
                        animation: `${p.anim} 2.8s ease-in-out ${index * 0.35}s infinite`,
                        display: "inline-block",
                      }}>
                        {p.text}
                      </span>
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

          {/* Duração dos cortes */}
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

          {/* Modo de corte */}
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

          {/* Quantidade de clips */}
          {!isTrial && (
            <div>
              <label className="text-xs text-gray-400 mb-3 block">
                Quantidade de clips
                <span className="ml-2 text-gray-600">máx {planMaxClips} no seu plano</span>
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
            {processing ? "Processando..." : `🚀 Gerar ${isTrial ? "1 clip grátis" : `${maxClips} clip${maxClips > 1 ? "s" : ""}`}`}
          </button>
        </form>
      )}

      {/* Status */}
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

      {/* Erro */}
      {job?.status === "error" && (
        <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-6 text-center space-y-3">
          <p className="text-red-400 font-semibold">❌ Erro no processamento</p>
          <p className="text-gray-400 text-sm">{job.error}</p>
          <button onClick={handleNewVideo} className="btn-primary px-6 py-2 rounded-xl text-sm font-bold">
            Tentar novamente
          </button>
        </div>
      )}

      {/* Resultados */}
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
              <p className="text-sm font-semibold text-white mb-1">Gostou? Assine para gerar até 40 clips por vídeo 🚀</p>
              <a href="/#planos" className="inline-block mt-2 btn-primary px-6 py-2 rounded-full text-sm font-bold">
                Ver planos a partir de R$19,90
              </a>
            </div>
          )}

          {job.clips.map(clip => (
            <ClipCard key={`${clip.clipNumber}-${clip.platform}`} clip={clip} />
          ))}
        </div>
      )}
    </div>
  );
}

function ClipCard({ clip }: { clip: Clip }) {
  const platformColors: Record<string, string> = {
    tiktok:           "text-pink-400 bg-pink-500/10 border-pink-500/20",
    instagram_reels:  "text-purple-400 bg-purple-500/10 border-purple-500/20",
    instagram_feed:   "text-purple-400 bg-purple-500/10 border-purple-500/20",
    instagram_square: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    facebook:         "text-blue-400 bg-blue-500/10 border-blue-500/20",
    youtube_shorts:   "text-red-400 bg-red-500/10 border-red-500/20",
  };

  const colorClass = platformColors[clip.platform] || "text-gray-400 bg-white/5 border-white/10";

  return (
    <div className="bg-[#0f0f0f] border border-white/8 rounded-2xl p-4 space-y-3">
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
          <p className="font-semibold text-sm leading-snug">{clip.title}</p>
          {clip.hook && <p className="text-xs text-gray-400 mt-1 leading-relaxed">💬 {clip.hook}</p>}
        </div>
        <div className="flex-shrink-0 text-center">
          <div className="text-xs text-gray-500 mb-0.5">Viral</div>
          <div className="text-lg font-bold text-purple-400">{clip.viralScore}<span className="text-xs text-gray-600">/10</span></div>
        </div>
      </div>
      <a href={getDownloadUrl(clip.downloadUrl)} download={clip.fileName} target="_blank" rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-semibold hover:bg-white/10 transition-colors">
        ⬇️ Baixar {clip.platformLabel}
      </a>
    </div>
  );
}
