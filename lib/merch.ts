// ============================================================================
// Print Shop (merchandising)
// ----------------------------------------------------------------------------
// Productos imprimibles y sus links de pedido. Provider-agnostic: el dueño
// pega las URLs de su socio de impresión (Printful, Gelato, Printify...) desde
// el panel de admin (/admin) o, como fallback, en variables de entorno.
// Sin API, sin backend de pagos físicos.
//
// Fase 2 (pedido automático): reemplazar estos links por una integración con
// la API del proveedor (crear orden). La UI no cambia.
// ----------------------------------------------------------------------------

import { getSettingsMap, resolveKey, SETTING_KEYS } from './settings';

export type MerchProductId = 'tshirt' | 'mug' | 'poster';

export interface MerchProduct {
  id: MerchProductId;
  /** Precio de referencia (placeholder, lo define el proveedor). */
  price: number;
  /** Clave de configuración con el link de pedido de este producto. */
  settingKey: string;
}

export interface ResolvedMerchProduct {
  id: MerchProductId;
  price: number;
  orderUrl: string | null;
}

export const MERCH_PRODUCTS: MerchProduct[] = [
  { id: 'tshirt', price: 24.99, settingKey: SETTING_KEYS.merchTshirt },
  { id: 'mug', price: 14.99, settingKey: SETTING_KEYS.merchMug },
  { id: 'poster', price: 19.99, settingKey: SETTING_KEYS.merchPoster },
];

/**
 * Resuelve los productos con sus links de pedido. Prioriza el panel de admin
 * (/admin) y cae a las variables de entorno. Se ejecuta en el servidor.
 */
export async function getMerchProducts(): Promise<ResolvedMerchProduct[]> {
  const db = await getSettingsMap();
  const partner = resolveKey(SETTING_KEYS.merchPartner, db);
  return MERCH_PRODUCTS.map((product) => ({
    id: product.id,
    price: product.price,
    orderUrl: resolveKey(product.settingKey, db) ?? partner,
  }));
}
