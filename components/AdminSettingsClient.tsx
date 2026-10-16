'use client';

import { useMemo, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CreditCard,
  Heart,
  Shirt,
  BarChart3,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RotateCcw,
} from 'lucide-react';
import type { AdminSettingField, SettingGroup } from '@/lib/settings';

const GROUPS: {
  id: SettingGroup;
  title: string;
  desc: string;
  Icon: typeof CreditCard;
}[] = [
  {
    id: 'checkout',
    title: 'Links de pago (planes)',
    desc: 'Stripe Payment Link, Paddle, Lemon Squeezy… Pegá la URL de checkout de cada plan.',
    Icon: CreditCard,
  },
  {
    id: 'donate',
    title: 'Donaciones (Mecenas)',
    desc: 'PayPal.me, Buy Me a Coffee, Ko-fi… El botón "Mecenas" lleva acá.',
    Icon: Heart,
  },
  {
    id: 'merch',
    title: 'Print Shop (pedidos)',
    desc: 'Link de tu socio de impresión por producto. El genérico se usa como fallback.',
    Icon: Shirt,
  },
  {
    id: 'analytics',
    title: 'Analítica (tráfico y campañas)',
    desc: 'Pegá el ID de tu proveedor para medir visitas y el tráfico de TikTok. Podés usar uno o varios.',
    Icon: BarChart3,
  },
];

const SOURCE_BADGE: Record<AdminSettingField['source'], { label: string; className: string }> = {
  db: { label: 'Panel', className: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  env: { label: '.env', className: 'bg-sky-500/15 text-sky-300 border-sky-500/30' },
  none: { label: 'Sin definir', className: 'bg-white/5 text-gray-400 border-white/10' },
};

export default function AdminSettingsClient({
  fields,
  children,
}: {
  fields: AdminSettingField[];
  children?: ReactNode;
}) {
  const router = useRouter();
  const [rows, setRows] = useState<AdminSettingField[]>(fields);
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(fields.map((f) => [f.key, f.value]))
  );
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const dirty = useMemo(
    () => rows.some((r) => (values[r.key] ?? '') !== r.value),
    [rows, values]
  );

  const setValue = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setStatus('idle');
  };

  const handleSave = async () => {
    setSaving(true);
    setStatus('idle');
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ values }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus('error');
        setMessage(typeof data?.error === 'string' ? data.error : 'No se pudo guardar');
        return;
      }
      const next: AdminSettingField[] = Array.isArray(data.settings) ? data.settings : rows;
      setRows(next);
      setValues(Object.fromEntries(next.map((f) => [f.key, f.value])));
      setStatus('saved');
      setMessage('Cambios guardados');
      router.refresh();
    } catch {
      setStatus('error');
      setMessage('Error de red');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-black pt-28 pb-32 px-4 sm:px-6 overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center">
        <div className="w-[700px] h-[700px] rounded-full bg-brand-primary/10 blur-[150px]" />
      </div>

      <div className="relative max-w-3xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Configuración de pagos, Print Shop y analítica
          </h1>
          <p className="text-gray-400 leading-relaxed">
            Estos links se guardan en la base de datos y tienen prioridad sobre las variables de
            entorno. Dejá un campo vacío para volver al valor de <code>.env</code> (o para no mostrar
            link, si no hay ninguno definido).
          </p>
          <div className="flex flex-wrap gap-4 mt-4 text-sm">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1.5 text-brand-accent hover:text-white transition"
            >
              Ver planes <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/merch"
              className="inline-flex items-center gap-1.5 text-brand-accent hover:text-white transition"
            >
              Ver Print Shop <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </header>

        <div className="space-y-8">
          {GROUPS.map(({ id, title, desc, Icon }) => {
            const group = rows.filter((f) => f.group === id);
            if (group.length === 0) return null;
            return (
              <section
                key={id}
                className="glass-panel rounded-2xl p-5 sm:p-6 border border-dark-glass-border/50"
              >
                <div className="flex items-start gap-3 mb-5">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl glass-panel border border-white/10 shrink-0">
                    <Icon className="w-5 h-5 text-brand-accent" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">{title}</h2>
                    <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {group.map((field) => {
                    const badge = SOURCE_BADGE[field.source];
                    return (
                      <div key={field.key}>
                        <div className="flex items-center justify-between gap-3 mb-1.5">
                          <label htmlFor={field.key} className="text-sm font-medium text-gray-200">
                            {field.label}
                          </label>
                          <span
                            className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border ${badge.className}`}
                          >
                            {badge.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            id={field.key}
                            type={field.inputType}
                            inputMode={field.inputType === 'url' ? 'url' : 'text'}
                            value={values[field.key] ?? ''}
                            onChange={(e) => setValue(field.key, e.target.value)}
                            placeholder={field.fromEnv ?? (field.inputType === 'url' ? 'https://…' : '')}
                            className="w-full rounded-xl bg-white/5 border border-white/10 focus:border-brand-primary/60 focus:ring-2 focus:ring-brand-primary/20 outline-none px-3 py-2.5 text-sm text-white placeholder:text-gray-600 transition"
                          />
                          {values[field.key] ? (
                            <button
                              type="button"
                              onClick={() => setValue(field.key, '')}
                              title="Vaciar (volver al valor de .env)"
                              className="shrink-0 p-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          ) : null}
                        </div>
                        {field.hint ? (
                          <p className="text-xs text-gray-500 mt-1">{field.hint}</p>
                        ) : null}
                        {field.source === 'env' && field.fromEnv ? (
                          <p className="text-xs text-sky-300/80 mt-1 truncate">
                            Usando .env: {field.fromEnv}
                          </p>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        {children}
      </div>

      {/* Barra de guardado */}
      <div className="fixed bottom-0 inset-x-0 z-20 border-t border-white/10 bg-black/80 backdrop-blur">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="min-h-[20px] text-sm">
            {status === 'saved' ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-300">
                <CheckCircle2 className="w-4 h-4" /> {message}
              </span>
            ) : status === 'error' ? (
              <span className="inline-flex items-center gap-1.5 text-red-300">
                <AlertCircle className="w-4 h-4" /> {message}
              </span>
            ) : dirty ? (
              <span className="text-amber-300">Tenés cambios sin guardar</span>
            ) : (
              <span className="text-gray-600">Todo guardado</span>
            )}
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !dirty}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold text-sm transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
