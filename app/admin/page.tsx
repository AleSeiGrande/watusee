import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { auth } from '@/auth';
import { isAdmin } from '@/lib/admin';
import { getAdminSettings } from '@/lib/settings';
import AdminSettingsClient from '@/components/AdminSettingsClient';
import AdminGrantPlan from '@/components/AdminGrantPlan';

export const metadata: Metadata = {
  title: 'Admin | WatDuSee',
};

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/admin');
  }

  if (!(await isAdmin(session.user.id))) {
    return (
      <div className="relative min-h-screen bg-black pt-32 pb-20 px-4 sm:px-6 flex items-start justify-center overflow-hidden">
        <div className="pointer-events-none absolute inset-0 flex justify-center">
          <div className="w-[600px] h-[600px] rounded-full bg-red-500/10 blur-[140px]" />
        </div>
        <div className="relative max-w-lg text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl glass-panel border border-dark-glass-border mb-6">
            <ShieldAlert className="w-7 h-7 text-red-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Acceso restringido</h1>
          <p className="text-gray-400 mb-8 leading-relaxed">
            Esta sección es solo para administradores.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full glass-panel border border-dark-glass-border text-white font-semibold hover:border-brand-primary/50 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  const fields = await getAdminSettings();
  return (
    <AdminSettingsClient fields={fields}>
      <AdminGrantPlan />
    </AdminSettingsClient>
  );
}
