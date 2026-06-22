const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://viralizaia.duckdns.org";

export type Platform = "tiktok" | "instagram" | "facebook" | "youtube";
export type ProcessMode = "ai" | "manual";
export type CaptionStyle = "tiktok" | "hormozi" | "dark" | "clean" | "opensans" | "ubuntu" | "montserrat" | "neon";
export type Plan = "trial" | "gratis" | "basico" | "pro" | "full" | "agencia";

export interface Credits {
  monthly: number;
  avulso: number;
  total: number;
}

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
  credits?: Credits;
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

export async function getTrialToken(email: string, name?: string): Promise<AuthResult> {
  const res = await fetch(`${API_URL}/api/auth/trial`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, name }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Erro ao iniciar teste gratuito" }));
    throw new Error(err.error);
  }
  return res.json();
}

export async function getOAuthToken(email: string): Promise<AuthResult> {
  const res = await fetch(`${API_URL}/api/auth/oauth-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Erro ao fazer login" }));
    throw new Error(err.error);
  }
  return res.json();
}

export async function saveWhatsapp(email: string, phone: string, token: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/auth/whatsapp`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ email, phone }),
  });
  if (!res.ok) throw new Error("Erro ao salvar WhatsApp");
}

export async function checkEmail(email: string): Promise<{ active: boolean; plan: Plan; trialAvailable: boolean }> {
  const res = await fetch(`${API_URL}/api/auth/check/${encodeURIComponent(email)}`);
  if (!res.ok) return { active: false, plan: "trial", trialAvailable: true };
  return res.json();
}

export async function fetchCredits(email: string): Promise<Credits> {
  const res = await fetch(`${API_URL}/api/auth/credits/${encodeURIComponent(email)}`);
  if (!res.ok) return { monthly: 0, avulso: 0, total: 0 };
  return res.json();
}

export async function startProcessing(
  url: string,
  platforms: Platform[],
  mode: ProcessMode = "ai",
  token: string,
  maxClips: number = 3,
  captionStyle: CaptionStyle = "tiktok",
  targetDuration: number = 60,
  captionColor: string = "#FFFFFF",
  addWatermark: boolean = true
): Promise<{ jobId: string }> {
  const res = await fetch(`${API_URL}/api/video/process`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ url, platforms, mode, maxClips, captionStyle, targetDuration, captionColor, addWatermark }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Erro ao processar" }));
    throw new Error(err.error);
  }
  return res.json();
}

export async function uploadAndProcess(
  file: File,
  platforms: Platform[],
  mode: ProcessMode = "ai",
  token: string,
  maxClips: number = 3,
  captionStyle: CaptionStyle = "tiktok",
  targetDuration: number = 60,
  captionColor: string = "#FFFFFF",
  addWatermark: boolean = true
): Promise<{ jobId: string }> {
  const formData = new FormData();
  formData.append("video", file);
  formData.append("platforms", JSON.stringify(platforms));
  formData.append("mode", mode);
  formData.append("maxClips", String(maxClips));
  formData.append("captionStyle", captionStyle);
  formData.append("targetDuration", String(targetDuration));
  formData.append("captionColor", captionColor);
  formData.append("addWatermark", String(addWatermark));
  const res = await fetch(`${API_URL}/api/video/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Erro no upload" }));
    throw new Error(err.error);
  }
  return res.json();
}

export async function getJobStatus(jobId: string): Promise<Job> {
  const res = await fetch(`${API_URL}/api/video/status/${jobId}`);
  if (!res.ok) throw new Error("Erro ao verificar status");
  return res.json();
}

export function getDownloadUrl(downloadUrl: string): string {
  if (downloadUrl.startsWith("http")) return downloadUrl;
  return `${API_URL}${downloadUrl}`;
}

// Acrescenta ?download=1 para o backend responder com Content-Disposition: attachment,
// forçando o browser a baixar direto em vez de abrir o vídeo na aba (mesmo cross-origin).
export function getForceDownloadUrl(downloadUrl: string): string {
  const url = getDownloadUrl(downloadUrl);
  return url + (url.includes("?") ? "&" : "?") + "download=1";
}

export async function deleteJob(jobId: string): Promise<void> {
  await fetch(`${API_URL}/api/video/job/${jobId}`, { method: "DELETE" });
}

export async function checkIn(token: string): Promise<{ ok: boolean; message: string; credits?: Credits }> {
  const res = await fetch(`${API_URL}/api/auth/checkin`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Erro no check-in");
  return res.json();
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    queued: "Na fila...",
    downloading: "Baixando vídeo...",
    transcribing: "Transcrevendo áudio...",
    analyzing: "IA analisando momentos virais...",
    processing: "Gerando cortes...",
    done: "Pronto!",
    error: "Erro",
  };
  return labels[status] || status;
}
