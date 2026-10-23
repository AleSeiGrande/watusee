import type { Metadata } from 'next';
import LegalPage from '@/components/LegalPage';

export const metadata: Metadata = {
  title: 'Términos y Condiciones | WatDuSee',
  description:
    'Términos y Condiciones de uso de WatDuSee: cuentas, contenido, planes Frida y Da Vinci, donaciones, merchandising y sección Adults.',
};

export default function TermsPage() {
  return <LegalPage doc="terms" />;
}
