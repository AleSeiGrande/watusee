'use client';

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Download, ShoppingBag, Upload, Sparkles, ImageIcon } from 'lucide-react';
import { useT } from '@/lib/i18n/context';
import type { MerchProductId, ResolvedMerchProduct } from '@/lib/merch';

export interface Creation {
  id: string;
  title: string;
  image: string;
}

interface MerchClientProps {
  creations: Creation[];
  products: ResolvedMerchProduct[];
  currency: string;
}

const PRINT_AREA: Record<MerchProductId, { left: string; top: string; width: string; height: string }> = {
  tshirt: { left: '35%', top: '30%', width: '30%', height: '30%' },
  mug: { left: '30%', top: '36%', width: '36%', height: '30%' },
  poster: { left: '20%', top: '18%', width: '60%', height: '64%' },
};

function ProductShape({ product }: { product: MerchProductId }) {
  if (product === 'tshirt') {
    return (
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <path
          d="M35 14 L20 21 L9 39 L21 45 L28 36 L28 84 Q50 89 72 84 L72 36 L79 45 L91 39 L80 21 L65 14 Q50 23 35 14 Z"
          fill="#1b1b2e"
          stroke="rgba(224,223,255,0.18)"
          strokeWidth="1.2"
        />
      </svg>
    );
  }

  if (product === 'mug') {
    return (
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid meet">
        <path d="M74 40 a10 10 0 0 1 0 20" fill="none" stroke="rgba(224,223,255,0.25)" strokeWidth="4" />
        <rect
          x="22"
          y="26"
          width="52"
          height="50"
          rx="6"
          fill="#1b1b2e"
          stroke="rgba(224,223,255,0.18)"
          strokeWidth="1.2"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid meet">
      <rect
        x="14"
        y="12"
        width="72"
        height="76"
        rx="4"
        fill="#1b1b2e"
        stroke="rgba(224,223,255,0.18)"
        strokeWidth="1.2"
      />
      <rect x="20" y="18" width="60" height="64" rx="2" fill="none" stroke="rgba(224,223,255,0.1)" strokeWidth="0.8" />
    </svg>
  );
}

function formatPrice(currency: string, value: number): string {
  return `${currency}${Number.isInteger(value) ? value : value.toFixed(2)}`;
}

export default function MerchClient({ creations, products, currency }: MerchClientProps) {
  const t = useT();
  const [image, setImage] = useState<string | null>(creations[0]?.image ?? null);
  const [productId, setProductId] = useState<MerchProductId>(products[0]?.id ?? 'tshirt');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const product = useMemo(
    () => products.find((p) => p.id === productId) ?? products[0],
    [products, productId],
  );

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => setImage((event.target?.result as string) ?? null);
    reader.readAsDataURL(file);
  };

  const area = PRINT_AREA[productId];

  return (
    <div className="relative min-h-screen bg-black pt-24 pb-20 px-4 sm:px-6 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 flex justify-center">
        <div className="w-[680px] h-[680px] rounded-full bg-brand-primary/10 blur-[140px]" />
      </div>

      <div className="relative max-w-6xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel mb-6">
            <Sparkles className="w-4 h-4 text-brand-accent" />
            <span className="text-xs font-semibold tracking-wide text-gray-300 uppercase">
              {t('merch.badge')}
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            {t('merch.title')}
          </h1>
          <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            {t('merch.subtitle')}
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
          {/* Preview */}
          <div className="glass-panel rounded-3xl border border-dark-glass-border p-6 sm:p-8">
            <div className="relative w-full max-w-xs mx-auto aspect-square">
              <ProductShape product={productId} />
              {image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={image}
                  alt=""
                  className="absolute object-cover rounded-md shadow-lg"
                  style={{ left: area.left, top: area.top, width: area.width, height: area.height }}
                />
              )}
            </div>

            {/* Product tabs */}
            <div className="grid grid-cols-3 gap-2 mt-8">
              {products.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setProductId(p.id)}
                  className={`flex flex-col items-center gap-1 px-3 py-3 rounded-2xl border text-xs font-semibold transition-colors ${
                    p.id === productId
                      ? 'border-brand-primary bg-brand-primary/10 text-white'
                      : 'border-dark-glass-border text-gray-400 hover:text-white hover:border-brand-primary/40'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  {t(`merch.${p.id}`)}
                </button>
              ))}
            </div>

            <p className="text-center text-xs text-gray-500 mt-4">
              {t('merch.priceFrom', { price: formatPrice(currency, product?.price ?? 0) })}
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-col gap-6">
            {/* Image picker */}
            <div className="glass-panel rounded-3xl border border-dark-glass-border p-6 sm:p-7">
              <h2 className="text-white font-bold mb-1">{t('merch.step1')}</h2>
              <p className="text-gray-500 text-xs mb-4">{t('merch.selectHint')}</p>

              {creations.length === 0 ? (
                <p className="text-gray-400 text-sm mb-4">{t('merch.noImages')}</p>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-4">
                  {creations.map((creation) => (
                    <button
                      key={creation.id}
                      onClick={() => setImage(creation.image)}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                        image === creation.image
                          ? 'border-brand-primary'
                          : 'border-transparent hover:border-brand-primary/40'
                      }`}
                      title={creation.title}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={creation.image} alt={creation.title} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-dark-glass-border text-gray-400 hover:text-white hover:border-brand-primary/50 transition-colors text-sm"
              >
                <Upload className="w-4 h-4" />
                {t('merch.upload')}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            </div>

            {/* Product info + actions */}
            <div className="glass-panel rounded-3xl border border-dark-glass-border p-6 sm:p-7">
              <h2 className="text-white font-bold mb-1">{t('merch.product')}</h2>
              <p className="text-gray-400 text-sm mb-5">
                <span className="text-white font-semibold">{t(`merch.${productId}`)}</span>
                {' · '}
                {t(`merch.${productId}.desc`)}
              </p>

              {!image ? (
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <ImageIcon className="w-4 h-4" />
                  {t('merch.selectHint')}
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href={image}
                    download={`watusee-${productId}.png`}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-full bg-dark-surface border border-dark-glass-border text-white font-semibold text-sm hover:border-brand-primary transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    {t('merch.download')}
                  </a>

                  {product?.orderUrl ? (
                    <a
                      href={product.orderUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-full bg-brand-primary hover:bg-brand-primary/90 text-white font-bold text-sm transition-all hover-lift"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      {t('merch.order')}
                    </a>
                  ) : (
                    <Link
                      href="/contact"
                      className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-full bg-brand-primary/80 hover:bg-brand-primary text-white font-bold text-sm transition-all hover-lift"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      {t('merch.order')}
                    </Link>
                  )}
                </div>
              )}

              <p className="text-xs text-gray-500 mt-4">
                {product?.orderUrl ? t('merch.howto') : t('merch.soon')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
