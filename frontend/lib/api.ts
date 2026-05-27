const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export type Platform = "tiktok" | "instagram" | "facebook" | "youtube";
export type ProcessMode = "ai" | "manual";

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

export async function startProcessing(
  url: string,
  platforms: Platform[],
  mode: ProcessMode = "ai",
  token: string
): Promise<{ jobId: string }> {
  const res = await fetch(`${API_URL}/api/video/process`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ url, platforms, mode }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Erro desconhecido" }));
    throw new Error(err.error || "Erro ao iniciar processamento");
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
    queued: "Na fila...",
    downloading: "Baixando vídeo...",
    transcribing: "Transcrevendo áudio...",
    analyzing: "IA analisando melhores momentos...",
    processing: "Gerando cortes...",
    done: "Pronto!",
    error: "Erro no processamento",
  };
  return labels[status] || status;
}

export async function getAuthToken(email: string): Promise<string> {
  const res = await fetch(`${API_URL}/api/auth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Assinatura não encontrada" }));
    throw new Error(err.error);
  }

  const data = await res.json();
  return data.token;
}
