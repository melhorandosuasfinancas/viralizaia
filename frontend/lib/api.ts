const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://viralizaia.duckdns.org";

export type Platform = "tiktok" | "instagram" | "facebook" | "youtube";
export type ProcessMode = "ai" | "manual";
export type CaptionStyle = "tiktok" | "hormozi" | "dark" | "clean";
export type Plan = "trial" | "starter" | "pro";

export interface Clip {
  clipNumber: number;
  platform: string;
  platformLabel: string;
  title: string;
  hook: string;
  viralScore: number;
  duration: number;
  fileName: string;
  downloadUrl: string;
  aspectRatio: string;
}

export interface Job {
  status: "queued" | "downloading" | "transcribing" | "analyzing" | "processing" | "done" | "error";
  progress: number;
  clips: Clip[];
  error: string | null;
}

export interface AuthResult {
  token: string;
  plan: Plan;
  maxClips: number;
  isTrial?: boolean;
}

export async function getAuthToken(email: string): Promise<AuthResult> {
  const res = await fetch(`${API_URL}/api/auth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Assinatura não encontrada" }));
    throw new Error(err.error);
  }

  return res.json();
}

export async function getTrialToken(email: string): Promise<AuthResult> {
  const res = await fetch(`${API_URL}/api/auth/trial`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Erro ao iniciar teste gratuito" }));
    throw new Error(err.error);
  }

  return res.json();
}

export async function checkEmail(email: string): Promise<{ active: boolean; plan: Plan; trialAvailable: boolean }> {
  const res = await fetch(`${API_URL}/api/auth/check/${encodeURIComponent(email)}`);
  if (!res.ok) return { active: false, plan: "trial", trialAvailable: true };
  return res.json();
}

export async function startProcessing(
  url: string,
  platforms: Platform[],
  mode: ProcessMode = "ai",
  token: string,
  maxClips: number = 3,
  captionStyle: CaptionStyle = "tiktok"
): Promise<{ jobId: string }> {
  const res = await fetch(`${API_URL}/api/video/process`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ url, platforms, mode, maxClips, captionStyle }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Erro desconhecido" }));
    throw new Error(err.error || "Erro ao iniciar processamento");
  }

  return res.json();
}

export async function uploadAndProcess(
  file: File,
  platforms: Platform[],
  mode: ProcessMode = "ai",
  token: string,
  maxClips: number = 3,
  captionStyle: CaptionStyle = "tiktok"
): Promise<{ jobId: string }> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("platforms", JSON.stringify(platforms));
  formData.append("mode", mode);
  formData.append("maxClips", String(maxClips));
  formData.append("captionStyle", captionStyle);

  const res = await fetch(`${API_URL}/api/video/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Erro desconhecido" }));
    throw new Error(err.error || "Erro ao fazer upload");
  }

  return res.json();
}

export async function getJobStatus(jobId: string): Promise<Job> {
  const res = await fetch(`${API_URL}/api/video/status/${jobId}`);
  if (!res.ok) throw new Error("Job não encontrado");
  return res.json();
}

export async function deleteJob(jobId: string): Promise<void> {
  await fetch(`${API_URL}/api/video/job/${jobId}`, { method: "DELETE" });
}

export function getDownloadUrl(downloadUrl: string): string {
  return `${API_URL}${downloadUrl}`;
}

export function getStatusLabel(status: Job["status"]): string {
  const labels: Record<Job["status"], string> = {
    queued:      "Na fila...",
    downloading: "Baixando vídeo...",
    transcribing:"Transcrevendo áudio...",
    analyzing:   "IA analisando melhores momentos...",
    processing:  "Gerando cortes com legendas...",
    done:        "Pronto!",
    error:       "Erro no processamento",
  };
  return labels[status] || status;
}
