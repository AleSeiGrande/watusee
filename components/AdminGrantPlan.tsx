'use client';

import { useState } from 'react';
import { UserCog, Loader2, CheckCircle2, AlertCircle, Ban, Save } from 'lucide-react';

const PLANS = [
  { id: 'frida', label: 'Frida (Creador)' },
  { id: 'davinci', label: 'Da Vinci (Estudio)' },
  { id: 'mecenas', label: 'Mecenas (Patrón)' },
];

type Status = { kind: 'idle' | 'ok' | 'error'; message: string };

export default function AdminGrantPlan() {
  const [username, setUsername] = useState('');
  const [plan, setPlan] = useState('frida');
  const [interval, setInterval] = useState('monthly');
  const [busy, setBusy] = useState<'activate' | 'cancel' | null>(null);
  const [status, setStatus] = useState<Status>({ kind: 'idle', message: '' });

  const send = async (action: 'activate' | 'cancel') => {
    if (!username.trim()) {
      setStatus({ kind: 'error', message: 'Escribí un usuario' });
      return;
    }
    setBusy(action);
    setStatus({ kind: 'idle', message: '' });
    try {
      const res = await fetch('/api/admin/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), action, plan, interval }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus({ kind: 'error', message: typeof data?.error === 'string' ? data.error : 'No se pudo aplicar' });
        return;
      }
      setStatus({
        kind: 'ok',
        message:
          action === 'cancel'
            ? `Plan revocado a "${data.username}"`
            : `Plan ${plan} activado a "${data.username}"`,
      });
    } catch {
      setStatus({ kind: 'error', message: 'Error de red' });
    } finally {
      setBusy(null);
    }
  };

  return (
    <section className="glass-panel rounded-2xl p-5 sm:p-6 border border-dark-glass-border/50 mt-8">
      <div className="flex items-start gap-3 mb-5">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl glass-panel border border-white/10 shrink-0">
          <UserCog className="w-5 h-5 text-brand-accent" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">Activar plan manualmente</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Para pruebas, cortesías, o si todavía no conectaste los webhooks. Busca al usuario por su
            nombre exacto.
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="sm:col-span-1">
          <label htmlFor="grant-username" className="block text-sm font-medium text-gray-200 mb-1.5">
            Usuario
          </label>
          <input
            id="grant-username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setStatus({ kind: 'idle', message: '' });
            }}
            placeholder="username"
            className="w-full rounded-xl bg-white/5 border border-white/10 focus:border-brand-primary/60 focus:ring-2 focus:ring-brand-primary/20 outline-none px-3 py-2.5 text-sm text-white placeholder:text-gray-600 transition"
          />
        </div>
        <div>
          <label htmlFor="grant-plan" className="block text-sm font-medium text-gray-200 mb-1.5">
            Plan
          </label>
          <select
            id="grant-plan"
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
            className="w-full rounded-xl bg-white/5 border border-white/10 focus:border-brand-primary/60 outline-none px-3 py-2.5 text-sm text-white transition"
          >
            {PLANS.map((p) => (
              <option key={p.id} value={p.id} className="bg-black">
                {p.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="grant-interval" className="block text-sm font-medium text-gray-200 mb-1.5">
            Período
          </label>
          <select
            id="grant-interval"
            value={interval}
            onChange={(e) => setInterval(e.target.value)}
            className="w-full rounded-xl bg-white/5 border border-white/10 focus:border-brand-primary/60 outline-none px-3 py-2.5 text-sm text-white transition"
          >
            <option value="monthly" className="bg-black">Mensual</option>
            <option value="yearly" className="bg-black">Anual</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mt-5">
        <button
          type="button"
          onClick={() => send('activate')}
          disabled={busy !== null}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold text-sm transition disabled:opacity-40"
        >
          {busy === 'activate' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Activar plan
        </button>
        <button
          type="button"
          onClick={() => send('cancel')}
          disabled={busy !== null}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/10 text-gray-300 hover:text-white hover:border-white/20 text-sm font-semibold transition disabled:opacity-40"
        >
          {busy === 'cancel' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />}
          Revocar
        </button>

        {status.kind === 'ok' ? (
          <span className="inline-flex items-center gap-1.5 text-sm text-emerald-300">
            <CheckCircle2 className="w-4 h-4" /> {status.message}
          </span>
        ) : status.kind === 'error' ? (
          <span className="inline-flex items-center gap-1.5 text-sm text-red-300">
            <AlertCircle className="w-4 h-4" /> {status.message}
          </span>
        ) : null}
      </div>
    </section>
  );
}
