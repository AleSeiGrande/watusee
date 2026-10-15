import type { Metadata } from 'next';
import LegalPage from '@/components/LegalPage';

export const metadata: Metadata = {
  title: 'Política de Reembolsos y Cancelación | WatUSee',
  description:
    'Cómo cancelar tus suscripciones Frida y Da Vinci, y la política de reembolsos para planes, donaciones y productos del Print Shop.',
};

export default function RefundPage() {
  return <LegalPage doc="refund" />;
}
