// ============================================================================
// Print Shop (merchandising)
// ----------------------------------------------------------------------------
// Productos imprimibles y sus links de pedido. Provider-agnostic: el dueño
// pega las URLs de su socio de impresión (Printful, Gelato, Printify...) en
// las variables de entorno. Sin API, sin backend de pagos físicos.
//
// Fase 2 (pedido automático): reemplazar estos links por una integración con
// la API del proveedor (crear orden). La UI no cambia.
// ----------------------------------------------------------------------------

export type MerchProductId = 'tshirt' | 'mug' | 'poster';

export interface MerchProduct {
  id: MerchProductId;
  /** Precio de referencia (placeholder, lo define el proveedor). */
  price: number;
  /** Variable de entorno con el link de pedido de este producto. */
  envUrl?: string;
}

export interface ResolvedMerchProduct {
  id: MerchProductId;
  price: number;
  orderUrl: string | null;
}

/** Link genérico de socio, usado cuando un producto no tiene URL propia. */
export const MERCH_PARTNER_ENV = 'NEXT_PUBLIC_MERCH_PARTNER_URL';

export const MERCH_PRODUCTS: MerchProduct[] = [
  { id: 'tshirt', price: 24.99, envUrl: 'NEXT_PUBLIC_MERCH_TSHIRT_URL' },
  { id: 'mug', price: 14.99, envUrl: 'NEXT_PUBLIC_MERCH_MUG_URL' },
  { id: 'poster', price: 19.99, envUrl: 'NEXT_PUBLIC_MERCH_POSTER_URL' },
];

function readEnv(key?: string): string | null {
  if (!key) return null;
  const value = process.env[key];
  return value && value.trim().length > 0 ? value.trim() : null;
}

export function getMerchProducts(): ResolvedMerchProduct[] {
  const partner = readEnv(MERCH_PARTNER_ENV);
  return MERCH_PRODUCTS.map((product) => ({
    id: product.id,
    price: product.price,
    orderUrl: readEnv(product.envUrl) ?? partner,
  }));
}
