"use client";

import { useState, useEffect, useRef } from "react";
import {
  startProcessing,
  uploadAndProcess,
  getJobStatus,
  getDownloadUrl,
  deleteJob,
  getStatusLabel,
  getAuthToken,
  type Clip,
  type Job,
  type Platform,
} from "@/lib/api";

const PLATFORM_OPTIONS: { id: Platform; label: string; icon: string; color: string }[] = [
  { id: "tiktok", label: "TikTok", icon: "🎵", color: "text-pink-400" },
  { id: "instagram", label: "Instagram", icon: "📸", color: "text-purple-400" },
  { id: "facebook", label: "Facebook", icon: "👥", color: "text-blue-400" },
  { id: "youtube", label: "YT Shorts", icon: "▶️", color: "text-red-400" },
];

const ASPECT_LABELS: Record<string, string> = {
  "9:16": "Vertical",
  "4:5": "Retrato",
  "1:1": "Quadrado",
  "16:9": "Horizontal",
};

export default function AppPage() {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  const [inputMode, setInputMode] = useState<"url" | "upload">("url");
  const [url, setUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [platforms, setPlatforms] = useState<Platform[]>(["tiktok", "instagram"]);
  const [mode, setMode] = useState<"ai" | "manual">("ai");
  const [maxClips, setMaxClips] = useState<1 | 2 | 3>(3);
  const [jobId, setJobId] = useState<string | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [processing, setProcessing] = useState(false);
  const [urlError, setUrlError] = useState("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("viralizaia_token");
    if (saved) setToken(saved);
  }, []);

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
        setJob({ status: "error", progress: 0, clips: [], error: "Conexão perdida com o servidor. Tente novamente." });
      }
    }, 2000);
    return () => clearInterval(pollRef.current!);
  }, [jobId]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError("");
    try {
      const t = await getAuthToken(email);
      setToken(t);
      localStorage.setItem("viralizaia_token", t);
    } catch (err: unknown) {
      setLoginError(err instanceof Error ? err.message : "Erro ao fazer login");
    } finally {
      setLoggingIn(false);
    }
  }

  function handleLogout() {
    setToken(null);
    localStorage.removeItem("viralizaia_token");
  }

  async function handleProcess(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    if (platforms.length === 0) {
      setUrlError("Selecione ao menos uma plataforma.");
      return;
    }
    if (inputMode === "url") {
      if (!url.includes("youtube.com") && !url.includes("youtu.be")) {
        setUrlError("Use um link do YouTube válido.");
        return;
      }
    } else {
      if (!selectedFile) {
        setUrlError("Selecione um arquivo de vídeo.");
        return;
      }
    }
    setUrlError("");
    setProcessing(true);
    setJob(null);
    setJobId(null);
    try {
      let id: string;
      if (inputMode === "url") {
        ({ jobId: id } = await startProcessing(url, platforms, mode, token, maxClips));
      } else {
        ({ jobId: id } = await uploadAndProcess(selectedFile!, platforms, mode, token, maxClips));
      }
      setJobId(id);
      setJob({ status: "queued", progress: 0, clips: [], error: null });
    } catch (err: unknown) {
      setProcessing(false);
      setUrlError(err instanceof Error ? err.message : "Erro ao processar");
    }
  }

  function togglePlatform(p: Platform) {
    setPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  }

  async function handleNewVideo() {
    if (jobId) await deleteJob(jobId);
    setJobId(null);
    setJob(null);
    setUrl("");
    setSelectedFile(null);
    setProcessing(false);
  }

  // LOGIN
  if (!token) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <p className="gradient-text font-extrabold text-2xl mb-1">ViralizaIA</p>
            <p className="text-gray-400 text-sm">Entre com seu e-mail de assinatura</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500 transition-colors"
            />
            {loginError && (
              <p className="text-red-400 text-xs">{loginError}</p>
            )}
            <button
              type="submit"
              disabled={loggingIn}
              className="btn-primary w-full py-3 rounded-xl font-bold text-sm disabled:opacity-50"
            >
              {loggingIn ? "Verificando..." : "Entrar →"}
            </button>
          </form>
          <p className="text-center text-xs text-gray-600 mt-4">
            Ainda não é assinante?{" "}
            <a href="/" className="text-purple-400 hover:underline">
              Ver planos
            </a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808] px-4 py-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <span className="gradient-text font-extrabold text-xl">ViralizaIA</span>
        <button
          onClick={handleLogout}
          className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          Sair
        </button>
      </div>

      {/* Form */}
      {!job && (
        <form onSubmit={handleProcess} className="space-y-6">
          {/* Toggle URL / Upload */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setInputMode("url")}
              className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all ${
                inputMode === "url"
                  ? "border-purple-500/50 bg-purple-500/15 text-white"
                  : "border-white/10 bg-white/5 text-gray-400"
              }`}
            >
              🔗 Link YouTube
            </button>
            <button
              type="button"
              onClick={() => setInputMode("upload")}
              className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all ${
                inputMode === "upload"
                  ? "border-purple-500/50 bg-purple-500/15 text-white"
                  : "border-white/10 bg-white/5 text-gray-400"
              }`}
            >
              📁 Upload de arquivo
            </button>
          </div>

          <div>
            {inputMode === "url" ? (
              <>
                <label className="text-xs text-gray-400 mb-2 block">Link do YouTube</label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  disabled={processing}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500 transition-colors disabled:opacity-50"
                />
              </>
            ) : (
              <>
                <label className="text-xs text-gray-400 mb-2 block">
                  Arquivo de vídeo <span className="text-gray-600">(MP4, MOV, AVI — máx 500 MB)</span>
                </label>
                <label className={`flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                  selectedFile ? "border-purple-500/50 bg-purple-500/5" : "border-white/10 bg-white/5 hover:border-white/20"
                } ${processing ? "opacity-50 pointer-events-none" : ""}`}>
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    disabled={processing}
                    onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                  />
                  {selectedFile ? (
                    <span className="text-sm text-purple-300 px-4 text-center truncate max-w-full">{selectedFile.name}</span>
                  ) : (
                    <span className="text-sm text-gray-500">Clique para selecionar o vídeo</span>
                  )}
                </label>
              </>
            )}
            {urlError && <p className="text-red-400 text-xs mt-1">{urlError}</p>}
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-3 block">Plataformas</label>
            <div className="flex flex-wrap gap-2">
              {PLATFORM_OPTIONS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => togglePlatform(p.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                    platforms.includes(p.id)
                      ? "border-purple-500/50 bg-purple-500/15 text-white"
                      : "border-white/10 bg-white/5 text-gray-400"
                  }`}
                >
                  <span>{p.icon}</span>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-3 block">Modo de corte</label>
            <div className="flex gap-2">
              {(["ai", "manual"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all ${
                    mode === m
                      ? "border-purple-500/50 bg-purple-500/15 text-white"
                      : "border-white/10 bg-white/5 text-gray-400"
                  }`}
                >
                  {m === "ai" ? "🤖 IA escolhe" : "✂️ Dividir igual"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-3 block">
              Quantidade de clips
              <span className="ml-2 text-gray-600">
                {maxClips === 1 ? "⚡ Mais rápido" : maxClips === 2 ? "⚖️ Equilibrado" : "📦 Mais conteúdo"}
              </span>
            </label>
            <div className="flex gap-2">
              {([1, 2, 3] as const).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setMaxClips(n)}
                  className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-all ${
                    maxClips === n
                      ? "border-purple-500/50 bg-purple-500/15 text-white"
                      : "border-white/10 bg-white/5 text-gray-400"
                  }`}
                >
                  {n} {n === 1 ? "clip" : "clips"}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={processing}
            className="btn-primary w-full py-4 rounded-xl font-bold text-base disabled:opacity-50"
          >
            {processing ? "Processando..." : "🚀 Gerar Cortes"}
          </button>
        </form>
      )}

      {/* Status */}
      {job && job.status !== "done" && job.status !== "error" && (
        <div className="card-glow rounded-2xl p-6 text-center space-y-4">
          <div className="text-4xl animate-pulse">
            {job.status === "downloading" ? "⬇️" :
             job.status === "transcribing" ? "🎙️" :
             job.status === "analyzing" ? "🤖" : "✂️"}
          </div>
          <p className="font-semibold">{getStatusLabel(job.status)}</p>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full progress-animated rounded-full transition-all duration-500"
              style={{ width: `${job.progress}%` }}
            />
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
            <h2 className="font-bold text-lg">
              {job.clips.length} clips gerados ✅
            </h2>
            <button
              onClick={handleNewVideo}
              className="text-sm text-purple-400 hover:text-purple-300"
            >
              + Novo vídeo
            </button>
          </div>

          {job.clips.map((clip) => (
            <ClipCard key={`${clip.clipNumber}-${clip.platform}`} clip={clip} />
          ))}
        </div>
      )}
    </div>
  );
}

function ClipCard({ clip }: { clip: Clip }) {
  const platformColors: Record<string, string> = {
    tiktok: "text-pink-400 bg-pink-500/10 border-pink-500/20",
    instagram_reels: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    instagram_feed: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    instagram_square: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    facebook: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    youtube_shorts: "text-red-400 bg-red-500/10 border-red-500/20",
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
          {clip.hook && (
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">💬 {clip.hook}</p>
          )}
        </div>
        <div className="flex-shrink-0 text-center">
          <div className="text-xs text-gray-500 mb-0.5">Viral</div>
          <div className="text-lg font-bold text-purple-400">{clip.viralScore}<span className="text-xs text-gray-600">/10</span></div>
        </div>
      </div>
      <a
        href={getDownloadUrl(clip.downloadUrl)}
        download={clip.fileName}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-semibold hover:bg-white/10 transition-colors"
      >
        ⬇️ Baixar {clip.platformLabel}
      </a>
    </div>
  );
}
