"use client";
import { useState, useEffect, useCallback } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "https://viralizaia.duckdns.org";

type User = {
  email: string;
  active: boolean;
  plan: string;
  createdAt?: string;
  activatedAt?: string;
  deactivatedAt?: string;
  activatedBy?: string;
  whatsapp?: string;
  name?: string;
  monthlyCredits?: number;
  avulsoCredits?: number;
  totalCreditsUsed?: number;
  credits?: { monthly: number; avulso: number; total: number };
};

type Stats = {
  total: number;
  active: number;
  inactive: number;
  trialUsed: number;
  byPlan: Record<string, number>;
};

const PLANS = ["trial", "gratis", "basico", "pro", "full", "agencia"];
const PLAN_COLORS: Record<string, string> = {
  trial: "text-gray-400", gratis: "text-gray-400",
  basico: "text-blue-400", pro: "text-purple-400",
  full: "text-yellow-400", agencia: "text-emerald-400",
};

export default function AdminPage() {
  const [secret, setSecret] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authErr, setAuthErr] = useState("");
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState("");
  const [filterPlan, setFilterPlan] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [editEmail, setEditEmail] = useState<string | null>(null);
  const [editPlan, setEditPlan] = useState("");
  const [editAvulso, setEditAvulso] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const headers = { "x-admin-secret": secret };

  const fetchStats = useCallback(async () => {
    const r = await fetch(`${API}/api/auth/admin/stats`, { headers });
    if (r.ok) setStats(await r.json());
  }, [secret]);

  const fetchUsers = useCallback(async () => {
    const params = new URLSearchParams({ limit: "200" });
    if (q) params.set("q", q);
    if (filterPlan) params.set("plan", filterPlan);
    if (filterStatus) params.set("status", filterStatus);
    const r = await fetch(`${API}/api/auth/admin/users?${params}`, { headers });
    if (r.ok) { const d = await r.json(); setUsers(d.users); setTotal(d.total); }
  }, [secret, q, filterPlan, filterStatus]);

  async function login() {
    setAuthErr("");
    const r = await fetch(`${API}/api/auth/admin/stats`, { headers: { "x-admin-secret": secret } });
    if (r.ok) { setAuthed(true); }
    else setAuthErr("Senha incorreta");
  }

  useEffect(() => { if (authed) { fetchStats(); fetchUsers(); } }, [authed, fetchStats, fetchUsers]);

  async function updateUser(email: string, patch: Record<string, unknown>) {
    setSaving(true);
    const r = await fetch(`${API}/api/auth/admin/users/${encodeURIComponent(email)}`, {
      method: "PATCH",
      headers: { ...headers, "content-type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (r.ok) {
      setMsg("Salvo ✓");
      setEditEmail(null);
      fetchUsers();
      fetchStats();
      setTimeout(() => setMsg(""), 2000);
    }
    setSaving(false);
  }

  async function deleteUser(email: string) {
    if (!confirm(`Remover ${email}?`)) return;
    await fetch(`${API}/api/auth/admin/users/${encodeURIComponent(email)}`, { method: "DELETE", headers });
    fetchUsers();
    fetchStats();
  }

  if (!authed) return (
    <div className="min-h-screen bg-[#050507] flex items-center justify-center">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 w-80">
        <h1 className="text-xl font-bold text-white mb-6">Admin — Viraliza Cortes</h1>
        <input
          type="password" placeholder="ADMIN_SECRET"
          value={secret} onChange={e => setSecret(e.target.value)}
          onKeyDown={e => e.key === "Enter" && login()}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white text-sm mb-3 outline-none"
        />
        {authErr && <p className="text-red-400 text-sm mb-3">{authErr}</p>}
        <button onClick={login} className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-lg py-2.5 font-semibold text-sm">
          Entrar
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050507] text-white px-6 py-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-purple-400">Painel Admin</h1>
        {msg && <span className="text-green-400 text-sm font-medium">{msg}</span>}
        <button onClick={() => { setAuthed(false); setSecret(""); }} className="text-xs text-gray-500 hover:text-white">Sair</button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
          {[
            { label: "Total",    value: stats.total,    color: "text-white" },
            { label: "Ativos",   value: stats.active,   color: "text-green-400" },
            { label: "Inativos", value: stats.inactive, color: "text-gray-400" },
            { label: "Trial usado", value: stats.trialUsed, color: "text-yellow-400" },
            { label: "Por plano", value: Object.entries(stats.byPlan).map(([p,n]) => `${p}:${n}`).join(" / ") || "—", color: "text-purple-400" },
          ].map(s => (
            <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">{s.label}</p>
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          placeholder="Buscar email…" value={q} onChange={e => setQ(e.target.value)}
          className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white outline-none w-56"
        />
        <select value={filterPlan} onChange={e => setFilterPlan(e.target.value)}
          className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white outline-none">
          <option value="">Todos os planos</option>
          {PLANS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white outline-none">
          <option value="">Todos status</option>
          <option value="active">Ativos</option>
          <option value="inactive">Inativos</option>
        </select>
        <button onClick={fetchUsers} className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-sm font-medium">
          Buscar
        </button>
        <span className="ml-auto text-xs text-gray-500 self-center">{total} usuários</span>
      </div>

      {/* User table */}
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-gray-400 text-xs">
              <th className="text-left px-4 py-3">Email</th>
              <th className="text-left px-4 py-3">Plano</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Cr/Mês</th>
              <th className="text-left px-4 py-3">Cr/Extra</th>
              <th className="text-left px-4 py-3">Usados</th>
              <th className="text-left px-4 py-3">Criado</th>
              <th className="text-left px-4 py-3">WhatsApp</th>
              <th className="text-right px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.email} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-gray-200">{u.email}</td>
                <td className="px-4 py-3">
                  {editEmail === u.email ? (
                    <select value={editPlan} onChange={e => setEditPlan(e.target.value)}
                      className="bg-white/20 border border-white/30 rounded px-2 py-1 text-xs text-white">
                      {PLANS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  ) : (
                    <span className={`font-semibold ${PLAN_COLORS[u.plan] || "text-gray-400"}`}>{u.plan}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.active ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}`}>
                    {u.active ? "ativo" : "inativo"}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs">
                  <span className={(u.monthlyCredits ?? 0) > 0 ? "text-green-400 font-semibold" : "text-gray-500"}>
                    {u.monthlyCredits ?? 0}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs">
                  {editEmail === u.email ? (
                    <input
                      type="number" min="0" value={editAvulso}
                      onChange={e => setEditAvulso(e.target.value)}
                      className="w-16 bg-white/20 border border-white/30 rounded px-1 py-0.5 text-xs text-white"
                    />
                  ) : (
                    <span className={(u.avulsoCredits ?? 0) > 0 ? "text-blue-400 font-semibold" : "text-gray-500"}>
                      {u.avulsoCredits ?? 0}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">{u.totalCreditsUsed ?? 0}</td>
                <td className="px-4 py-3 text-xs text-gray-500">
                  {u.createdAt ? new Date(u.createdAt).toLocaleDateString("pt-BR") : "—"}
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">{u.whatsapp || "—"}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex gap-1.5 justify-end">
                    {editEmail === u.email ? (
                      <>
                        <button disabled={saving}
                          onClick={() => updateUser(u.email, {
                            plan: editPlan,
                            ...(editAvulso !== "" ? { avulsoCredits: parseInt(editAvulso) } : {})
                          })}
                          className="bg-green-600 hover:bg-green-700 disabled:opacity-50 px-2 py-1 rounded text-xs">Salvar</button>
                        <button onClick={() => setEditEmail(null)}
                          className="bg-white/10 hover:bg-white/20 px-2 py-1 rounded text-xs">✕</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => { setEditEmail(u.email); setEditPlan(u.plan); setEditAvulso(String(u.avulsoCredits ?? 0)); }}
                          className="bg-white/10 hover:bg-white/20 px-2 py-1 rounded text-xs">Editar</button>
                        <button onClick={() => updateUser(u.email, { active: !u.active })}
                          className={`px-2 py-1 rounded text-xs ${u.active ? "bg-red-500/20 hover:bg-red-500/40 text-red-400" : "bg-green-500/20 hover:bg-green-500/40 text-green-400"}`}>
                          {u.active ? "Desativar" : "Ativar"}
                        </button>
                        <button onClick={() => deleteUser(u.email)}
                          className="bg-white/5 hover:bg-red-500/20 text-gray-500 hover:text-red-400 px-2 py-1 rounded text-xs">✕</button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={9} className="text-center py-8 text-gray-600">Nenhum usuário encontrado</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
