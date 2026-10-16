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
| SEO / analítica | `sitemap.xml`, `robots.txt`, Open Graph (`public/og.png`) y analítica enchufable (GA4 / Plausible / Umami) + atribución UTM |
| Deploy | Instrucciones para Hostinger (Node) |

## 2. Qué NO se transfiere

- **Cuentas de pago** (PayPal, Stripe, Paddle, Lemon Squeezy). Son personales/
  empresariales e **intransferibles**. El comprador crea las suyas.
- **Secretos y credenciales**: `AUTH_SECRET`, SMTP, claves OAuth (Google), etc.
- Cualquier cuenta personal (email `@watusee.fun`, redes, analytics).

> Regla de oro: **nunca** entregues credenciales vivas. El comprador genera las suyas.

### 3.1 Los links se cargan desde la web (panel `/admin`)

No hace falta editar `.env` ni rebuild: en **`/admin`** (menú del avatar, solo
para usuarios con `User.isAdmin = true`) el dueño pega los links de pago, de
donación, de la Print Shop y la config de **analítica**. Se guardan en la tabla
`Setting` y **tienen prioridad** sobre las variables de entorno. Un campo vacío
= se usa el `.env`.

Para dar acceso de admin: `npx prisma studio` → `User` → `isAdmin = true`.

Además de los links, el panel incluye la tarjeta **"Activar plan manualmente"**:
escribís el nombre de usuario, elegís el plan y activás o revocás con un clic.
Sirve para pruebas, cortesías o mientras no estén conectados los webhooks.

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

### 3.2 Activación automática del plan (webhooks)

Los links cobran igual por sí solos, pero para que el plan **se active solo** al
pagar hay que conectar un webhook. La web agrega automáticamente
`client_reference_id` (`<userId>:<plan>:<interval>`) a cada link de checkout, para
que el webhook sepa a quién activarle el plan.

- **Stripe** (recomendado): en el dashboard, *Developers → Webhooks*, endpoint
  `POST https://TU-DOMINIO/api/webhooks/stripe`, y guardar el *signing secret* en
  `STRIPE_WEBHOOK_SECRET`. Eventos: `checkout.session.completed`,
  `customer.subscription.updated`, `customer.subscription.deleted`.
- **Cualquier otro proveedor** (o Zapier / Make): `POST /api/webhooks/generic`
  con la cabecera `x-webhook-secret` igual a `GENERIC_WEBHOOK_SECRET`. Body:
  `{ "plan": "frida", "interval": "monthly", "userId": "<id>" }` (o `"email"`).
  Para cancelar: `{ "action": "cancel", "providerSubscriptionId": "sub_123" }`.

Cada evento se registra en `PaymentEvent` (idempotente por `eventId`) y actualiza
`User` (`plan`, `planStatus`, `planRenewsAt`, `isPatron`) + `Subscription`.
Los secretos de webhook viven en `.env` (no en la tabla `Setting`).

> Para poder vincular el pago a una cuenta, conviene que el usuario esté
> **logueado** al elegir el plan (así el link lleva su `userId`). Si no, se
> intenta resolver por el email de la cuenta.

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

- Definición de productos y links: `lib/merch.ts` (resueltos desde `/admin` o `.env`).
- Bloqueo por plan: `lib/entitlements.ts` (feature `merch.print` → Frida y Da Vinci).
- URLs de pedido (provider-agnostic): panel `/admin`, o `.env` como fallback:
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

### 4.3 SEO y analítica (medir el embudo)

- **SEO**
  - `app/sitemap.ts` → `/sitemap.xml` (rutas públicas; las privadas/gated quedan fuera).
  - `app/robots.ts` → `/robots.txt` (bloquea `/admin`, `/api/`, auth, `/merch`, `/nft`, `/adults`).
  - `app/layout.tsx` → `metadataBase`, Open Graph y Twitter Card. Imagen: `public/og.png` (1200×630).
  - URL canónica: `NEXT_PUBLIC_SITE_URL` (fallback: `AUTH_URL` → `watusee.fun`). Ver `lib/site.ts`.
  - Página por defecto en inglés; el resto de idiomas comparte la misma URL (sin `hreflang` todavía).
- **Analítica** (elegí un proveedor; también se carga desde `/admin`):
  - Google Analytics 4 → `NEXT_PUBLIC_GA4_ID` (`G-XXXXXXXXXX`).
  - Plausible → `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`.
  - Umami → `NEXT_PUBLIC_UMAMI_SRC` + `NEXT_PUBLIC_UMAMI_WEBSITE_ID`.
  - Se inyecta en `components/Analytics.tsx`; sin config no se carga nada.
- **Atribución UTM (first-touch)**: `lib/attribution.ts` guarda el primer toque
  (`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `ref`,
  `landing`, `referrer`) en `localStorage` + cookie, y se asocia al usuario al
  registrarse (`User.signupSource`, JSON acotado). Los registros por OAuth
  (Google) no pasan por `/api/register`, así que quedan sin atribución.

> Para lanzar campañas, usá links con UTM, por ejemplo:
> `https://watusee.fun/?utm_source=tiktok&utm_medium=social&utm_campaign=lanzamiento`

### 4.4 Descargas HD y más imágenes por historia (Frida / Da Vinci)

Dos features de los planes de pago que **ya funcionan** (antes eran solo copy de precios):

- **Descarga (`/api/download/[id]`)**: ruta `app/api/download/[id]/route.ts` (requiere
  sesión; el botón está en `/post/[id]` vía `components/DownloadButton.tsx`).
  - Plan gratis: PNG a **máx. 1080px** con **marca de agua** `watusee.fun`
    (procesado con `sharp`; responde `X-Watusee-Watermarked: 1`).
  - Frida / Da Vinci (feature `download.hd`): archivo **original a resolución completa,
    sin marca de agua** (`X-Watusee-Watermarked: 0`).
  - Acepta `?v=original|interpreted` (por defecto `interpreted`).
- **Más imágenes por historia**: la feature `story.more_images` permite **hasta 6**
  imágenes por historia (plan gratis: 4). Se aplica en
  `app/api/stories/challenge/route.ts` (cuántas devuelve) y `app/api/stories/route.ts`
  (validación 4..máx). La UI está en `app/story/StoryClient.tsx`.
- "Historias ilimitadas" ya era cierto para todos los planes, así que el copy de Frida
  se corrigió a lo que realmente distingue al plan (6 imágenes vs. 4).

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

### 8.1 Deuda técnica conocida (transparencia)

- **Lint limpio**: `npm run lint` termina sin errores. Quedan ~**113 warnings**
  heredados de código antiguo (reglas `no-explicit-any`, `react-hooks/*`,
  `@next/next/no-img-element`). No afectan el build y quedan visibles para
  bajarlos de a poco; las reglas están en `eslint.config.mjs`.
- `npx tsc --noEmit` limpio y `next build` sin errores.
- Base de datos **SQLite**: simple y suficiente hoy. Para escalar (o si hay
  múltiples usuarios concurrentes) conviene migrar a **PostgreSQL**.
- **Pagos**: checkout + activación por webhooks ya implementados; falta cargar
  **URLs reales** (panel `/admin`) y el **signing secret** del proveedor. Sin
  webhooks, se pueden activar planes a mano en `/admin`.
- **Premium gating**: ya se aplica en `/merch`, `/nft`, la descarga HD
  (`/api/download/[id]`) y el nº de imágenes por historia. Conviene extenderlo al
  resto de las features de `lib/entitlements.ts` a medida que se usen.
