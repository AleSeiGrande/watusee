# HANDOVER — Traspaso de WatUSee (watusee.fun)

Checklist para transferir la app a un nuevo dueño y para que el comprador
la ponga a andar en minutos. Pensado para acompañar una venta de activo
(dominio + producto). Ver también `README.md` y `.env.example`.

---

## 1. Qué incluye la venta (activos)

| Activo | Detalle |
|---|---|
| Dominio | `watusee.fun` (transferir por escrow / registrador) |
| Código | Repositorio completo (Next.js 16 + React 19) |
| Base de datos | Esquema Prisma (`prisma/schema.prisma`) + datos existentes (opcional) |
| Marca | Logos (`public/logo.png`, `favicon.png`), paleta, textos |
| i18n | 6 idiomas: en, es, it, ko, ru, zh |
| Monetización | Página `/pricing` lista (planes + Mecenas), provider-agnostic |
| Deploy | Instrucciones para Hostinger (Node) |

## 2. Qué NO se transfiere

- **Cuentas de pago** (PayPal, Stripe, Paddle, Lemon Squeezy). Son personales/
  empresariales e **intransferibles**. El comprador crea las suyas.
- **Secretos y credenciales**: `AUTH_SECRET`, SMTP, claves OAuth (Google), etc.
- Cualquier cuenta personal (email `@watusee.fun`, redes, analytics).

> Regla de oro: **nunca** entregues credenciales vivas. El comprador genera las suyas.

---

## 3. Cómo activar los pagos (5 minutos)

La app usa **links de checkout hospedados**. No requiere backend de pagos.

1. El comprador crea un link por plan y período en su proveedor:
   - **Stripe Payment Links**, o
   - **Paddle** / **Lemon Squeezy** (merchant of record: ellos gestionan IVA/impuestos).
2. Pega cada URL en `.env` (ver `.env.example`):
   ```
   NEXT_PUBLIC_CHECKOUT_FRIDA_MONTHLY="https://..."
   NEXT_PUBLIC_CHECKOUT_FRIDA_YEARLY="https://..."
   NEXT_PUBLIC_CHECKOUT_DAVINCI_MONTHLY="https://..."
   NEXT_PUBLIC_CHECKOUT_DAVINCI_YEARLY="https://..."
   ```
3. **Plan Mecenas** (donación voluntaria): pegar su link propio.
   ```
   NEXT_PUBLIC_DONATE_URL="https://paypal.me/usuario"   # o Buy Me a Coffee / Ko-fi
   ```
   Mecenas es ingreso 100% marginal: sin costo operativo. Buen argumento de venta.

Si una URL queda vacía, el botón muestra "próximamente" y lleva a contacto.
La app **no se rompe**.

## 4. Personalización (sin tocar la UI)

- Planes, precios y features: `lib/plans.ts` (única fuente de verdad).
- Traducciones de la página: `lib/i18n/en.ts` y `lib/i18n/es.ts` (claves `pricing.*`).
- Bloqueo de features premium: `lib/entitlements.ts` (ej. `puzzle.dual`).
- Moneda: constante `CURRENCY` en `lib/plans.ts`.
- Página de apoyo/Mecenas: `app/support/page.tsx` (lista a los usuarios con
  `isPatron = true`). Footer con enlace "Apoyar": `components/Footer.tsx`.

### 4.1 Print Shop / Merch (feature de Frida y Da Vinci)

La app incluye una tienda (`/merch`) donde el miembro elige una de sus creaciones
y la ve en una **playera, taza o póster**, con descarga en HD y botón de pedido.

- Definición de productos y links: `lib/merch.ts`.
- Bloqueo por plan: `lib/entitlements.ts` (feature `merch.print` → Frida y Da Vinci).
- URLs de pedido (provider-agnostic) en `.env`:
  ```
  NEXT_PUBLIC_MERCH_TSHIRT_URL=""
  NEXT_PUBLIC_MERCH_MUG_URL=""
  NEXT_PUBLIC_MERCH_POSTER_URL=""
  NEXT_PUBLIC_MERCH_PARTNER_URL=""   # fallback genérico
  ```
  Si están vacías, el botón "Pedir" lleva al formulario de contacto ("próximamente").
- **Fase 2 (opcional)**: reemplazar los links por la API del proveedor (Printful,
  Gelato, Printify) para crear la orden automáticamente. La UI no cambia.

### 4.2 NFT / Prestige Gallery (Da Vinci · EN CONSTRUCCIÓN)

La ruta `/nft` muestra las creaciones del miembro como **coleccionables** con
**prestigio** y **valor estimado**, calculados a partir de métricas reales
(likes, reacciones, comentarios, compartidos y remixes).

- Estado actual: **vista previa / en construcción**. No hay blockchain ni wallets.
- Bloqueo por plan: `lib/entitlements.ts` (feature `nft.prestige` → solo Da Vinci).
- El puntaje de prestigio se calcula en `app/nft/page.tsx` (pesos editables).
- Métrica pendiente: **visitas** (no existe campo `views` en `Post` todavía).
- Fase 2 sugerida: motor de puntaje persistido + acuñado on-chain + marketplace.

## 5. Puesta en marcha (comprador)

```
npm install
cp .env.example .env      # completar valores
npx prisma db push        # crea/actualiza la base de datos
npm run build
npm start                 # o: node start.js  (entrada para Hostinger)
```

## 6. Seguridad — rotar TODO antes de entregar

- [ ] `AUTH_SECRET` (nuevo, largo y aleatorio)
- [ ] Credenciales SMTP (usar una cuenta del comprador)
- [ ] OAuth Google: crear credenciales nuevas o revocar las actuales
- [ ] Base de datos: si se transfiere `dev.db`, quitar datos sensibles si hace falta
- [ ] Revocar accesos de hosting/FTP/DNS viejos al cerrar la venta
- [ ] Rotar cualquier token/API key que haya quedado en el historial

## 7. Secuencia sugerida de la venta (escrow)

1. Acordar precio y qué se incluye (esta lista).
2. Firmar un acuerdo simple de compraventa de activos.
3. El comprador deposita en **escrow** (Escrow.com; Sedo/Dan.com para el dominio).
4. Transferir en este orden: repositorio (código) → base de datos → dominio (código EPP/EPP code).
5. El escrow libera el pago al confirmar la transferencia.
6. Dar soporte post-venta acordado (ej. 7–30 días) por escrito.

## 8. Due diligence — puntos que revisará el comprador

- [ ] Repo sin secretos (`.env` ignorado).
- [ ] Sin dependencias abandonadas ni vulnerabilidades críticas (`npm audit`).
- [ ] Lint/build limpios (ver sección 8 bis).
- [ ] Términos y política de privacidad (especialmente por la sección Adults 18+).
- [ ] Titularidad de la marca y del dominio verificable.
- [ ] Estado de la base de datos y backups.

### 7.b Deuda técnica conocida (transparencia)

- **Lint limpio**: `npm run lint` termina sin errores. Quedan ~**113 warnings**
  heredados de código antiguo (reglas `no-explicit-any`, `react-hooks/*`,
  `@next/next/no-img-element`). No afectan el build y quedan visibles para
  bajarlos de a poco; las reglas están en `eslint.config.mjs`.
- `npx tsc --noEmit` limpio y `next build` sin errores.
- Base de datos **SQLite**: simple y suficiente hoy. Para escalar (o si hay
  múltiples usuarios concurrentes) conviene migrar a **PostgreSQL**.
