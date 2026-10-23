import type { Metadata } from 'next';
import LegalPage from '@/components/LegalPage';

export const metadata: Metadata = {
  title: 'Política de Privacidad | WatDuSee',
  description:
    'Cómo WatDuSee recopila, usa y protege tus datos personales, y cómo ejercer tus derechos de privacidad.',
};

export default function PrivacyPage() {
  return <LegalPage doc="privacy" />;
}
