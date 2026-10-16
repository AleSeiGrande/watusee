'use client';

import { useEffect } from 'react';
import { captureAttribution } from '@/lib/attribution';

/** Guarda el primer toque (UTM / referrer) una sola vez por visitante. */
export default function AttributionCapture() {
  useEffect(() => {
    captureAttribution();
  }, []);

  return null;
}
