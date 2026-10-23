'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Download, Loader2 } from 'lucide-react';
import T from './T';

/**
 * Botón de descarga de una creación.
 * `hd` lo decide el servidor según los permisos del usuario:
 *  - false (plan gratis): descarga con marca de agua + aviso de mejora.
 *  - true  (Frida/Da Vinci): descarga en HD sin marca de agua.
 */
export default function DownloadButton({ postId, hd }: { postId: string; hd: boolean }) {
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  const handleDownload = async () => {
    if (busy) return;
    setBusy(true);
    setFailed(false);
    try {
      const res = await fetch(`/api/download/${postId}`);
      if (!res.ok) throw new Error(String(res.status));
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `watdusee-${postId}${hd ? '-hd' : ''}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setFailed(true);
    }
    setBusy(false);
  };

  return (
    <div className="flex flex-col items-center gap-1.5">
      <button
        type="button"
        onClick={handleDownload}
        disabled={busy}
        className={`inline-flex items-center gap-2 px-5 py-3 rounded-full font-semibold text-sm border transition-all disabled:opacity-50 ${
          hd
            ? 'bg-gradient-to-r from-amber-500 to-brand-primary text-white border-transparent hover:scale-105'
            : 'bg-zinc-800/70 text-gray-200 border-dark-glass-border hover:border-brand-primary/40'
        }`}
      >
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
        <T id={hd ? 'post.download.hd' : 'post.download'} />
      </button>
      {!hd && (
        <Link href="/pricing" className="text-[11px] text-brand-accent hover:underline text-center max-w-[16rem]">
          <T id="post.download.upgrade" />
        </Link>
      )}
      {failed && (
        <span className="text-[11px] text-red-400">
          <T id="post.download.error" />
        </span>
      )}
    </div>
  );
}
