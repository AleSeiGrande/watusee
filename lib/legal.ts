// ============================================================================
// Contenido legal (Términos, Privacidad, Reembolsos)
// ----------------------------------------------------------------------------
// Texto en EN y ES. Los demás idiomas de la app caen a EN (fallback del i18n).
// NOTA: es una base razonable para SaaS/suscripciones + app social con UGC y
// sección 18+. Conviene que un profesional lo revise según tu jurisdicción,
// sobre todo la ley aplicable y el tratamiento de datos (GDPR/CCPA/etc.).
// Recordá reemplazar el email de contacto por el real del proyecto.
// ============================================================================

export type LegalLang = 'en' | 'es';
export type LegalDocId = 'terms' | 'privacy' | 'refund';

export interface LegalSection {
  heading: string;
  body: string[];
}

export interface LegalDoc {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}

/** Email de contacto legal. Cambialo por el real. */
export const LEGAL_CONTACT_EMAIL = 'hola@watusee.fun';

export const LEGAL_DOCS: Record<LegalDocId, Record<LegalLang, LegalDoc>> = {
  // -------------------------------------------------------------------------
  terms: {
    en: {
      title: 'Terms & Conditions',
      updated: 'Last updated: October 15, 2026',
      intro:
        'Welcome to WatUSee. These Terms & Conditions ("Terms") govern your use of the website watusee.fun and the WatUSee application (the "Service"). By creating an account or using the Service, you accept these Terms. If you do not agree, please do not use the Service.',
      sections: [
        {
          heading: '1. Description of the Service',
          body: [
            'WatUSee is a social and games web app built around pareidolia: users upload or create images, mark the shapes they "see", publish them and share them. The Service also includes mini-games and themed sections.',
            'The Service offers free features and paid features (the Frida and Da Vinci plans), as well as voluntary donations (Mecenas) and physical printed products (Print Shop).',
          ],
        },
        {
          heading: '2. Accounts',
          body: [
            'To create content or play you need an account (username and password, and optionally sign-in with Google). You are responsible for keeping your credentials safe and for all activity under your account.',
            'You must be at least the minimum age required in your country, or have the consent of a parent or guardian. We may suspend or close accounts that violate these Terms.',
          ],
        },
        {
          heading: '3. Your content',
          body: [
            'You keep ownership of the images and content you upload ("Your Content").',
            'By publishing, you grant us a non-exclusive, worldwide, royalty-free licence to host, display, reproduce and share Your Content within the Service (for example in the feed or in remixes) for the purpose of operating and promoting the Service.',
            'You are responsible for having the rights to what you upload and for ensuring it is not illegal and does not infringe third-party rights.',
          ],
        },
        {
          heading: '4. Prohibited content and conduct',
          body: [
            'You may not publish illegal content, any sexual content involving minors, violent or harassing content, content that infringes copyright, or other people\'s personal data without consent.',
            'You may not use the Service for unlawful purposes, attempt to breach its security, scrape or automate access without permission, harass other users or impersonate others.',
          ],
        },
        {
          heading: '5. Plans and payments',
          body: [
            'Paid plans (Frida and Da Vinci) are billed recurrently (monthly or yearly) through our payment provider (Stripe). Subscriptions renew automatically unless you cancel before the next billing cycle.',
            'You can cancel at any time; access continues until the end of the period already paid. Prices may change, and we will notify you before any change applies to your subscription.',
          ],
        },
        {
          heading: '6. Donations (Mecenas)',
          body: [
            'Donations are voluntary and do not grant paid features. They are non-refundable except where required by law.',
          ],
        },
        {
          heading: '7. Merchandise (Print Shop)',
          body: [
            'Physical products are produced and shipped by print-on-demand partners (for example Printful, Gelato or Printify), which may have their own terms. Refunds or replacements for defective products are handled according to the partner\'s policy and our Refund Policy.',
          ],
        },
        {
          heading: '8. Adults (18+) section',
          body: [
            'The Service includes an "Adults" section intended for people aged 18 or older. By accessing it you confirm that you are of legal age. We may apply age controls and remove content at our discretion.',
          ],
        },
        {
          heading: '9. Intellectual property',
          body: [
            'The WatUSee name, logo, design and software are owned by the operator of the Service and are protected by applicable law. These Terms do not grant you any rights over them beyond using the Service as intended.',
          ],
        },
        {
          heading: '10. Suspension and termination',
          body: [
            'We may suspend or terminate your account if you breach these Terms. You may close your account at any time by contacting us.',
          ],
        },
        {
          heading: '11. Disclaimers and limitation of liability',
          body: [
            'The Service is provided "as is". To the extent permitted by law, we do not guarantee uninterrupted availability or freedom from errors, and we are not liable for indirect damages arising from your use of the Service.',
            'Nothing in these Terms limits any consumer rights you may have under mandatory law in your country.',
          ],
        },
        {
          heading: '12. Changes to these Terms',
          body: [
            'We may update these Terms. We will publish the updated date and, if changes are material, we will notify you.',
          ],
        },
        {
          heading: '13. Governing law and contact',
          body: [
            'These Terms are governed by the laws applicable in the operator\'s jurisdiction, without prejudice to mandatory consumer protections in your country of residence.',
            'Questions? Contact us at ' + LEGAL_CONTACT_EMAIL + ' or through the contact form on the About page.',
          ],
        },
      ],
    },
    es: {
      title: 'Términos y Condiciones',
      updated: 'Última actualización: 15 de octubre de 2026',
      intro:
        'Bienvenido a WatUSee. Estos Términos y Condiciones ("Términos") rigen tu uso del sitio watusee.fun y de la aplicación WatUSee (el "Servicio"). Al crear una cuenta o usar el Servicio, aceptás estos Términos. Si no estás de acuerdo, no uses el Servicio.',
      sections: [
        {
          heading: '1. Descripción del Servicio',
          body: [
            'WatUSee es una aplicación social y de juegos basada en la pareidolia: los usuarios suben o crean imágenes, marcan las formas que "ven", las publican y las comparten. El Servicio también incluye minijuegos y secciones temáticas.',
            'El Servicio ofrece funciones gratuitas y funciones de pago (los planes Frida y Da Vinci), además de donaciones voluntarias (Mecenas) y productos físicos impresos (Print Shop).',
          ],
        },
        {
          heading: '2. Cuentas',
          body: [
            'Para crear contenido o jugar necesitás una cuenta (usuario y contraseña, y opcionalmente inicio de sesión con Google). Sos responsable de cuidar tus credenciales y de toda la actividad de tu cuenta.',
            'Debés tener al menos la edad mínima exigida en tu país, o contar con el consentimiento de un padre, madre o tutor. Podemos suspender o cerrar cuentas que incumplan estos Términos.',
          ],
        },
        {
          heading: '3. Tu contenido',
          body: [
            'Conservás la titularidad de las imágenes y el contenido que subís ("Tu Contenido").',
            'Al publicar, nos otorgás una licencia no exclusiva, mundial y gratuita para alojar, mostrar, reproducir y compartir Tu Contenido dentro del Servicio (por ejemplo en el feed o en remixes) con el fin de operar y dar a conocer el Servicio.',
            'Sos responsable de tener los derechos sobre lo que subís y de que no sea ilegal ni vulnere derechos de terceros.',
          ],
        },
        {
          heading: '4. Contenido y conducta prohibidos',
          body: [
            'No podés publicar contenido ilegal, contenido sexual con menores, contenido violento o de acoso, contenido que infrinja derechos de autor, ni datos personales de terceros sin consentimiento.',
            'No podés usar el Servicio con fines ilícitos, intentar vulnerar su seguridad, extraer datos o automatizar el acceso sin permiso, acosar a otros usuarios ni suplantar identidades.',
          ],
        },
        {
          heading: '5. Planes y pagos',
          body: [
            'Los planes de pago (Frida y Da Vinci) se facturan de forma recurrente (mensual o anual) a través de nuestro proveedor de pagos (Stripe). Las suscripciones se renuevan automáticamente salvo que las canceles antes del siguiente ciclo.',
            'Podés cancelar en cualquier momento; el acceso se mantiene hasta el final del período ya pagado. Los precios pueden cambiar y te avisaremos antes de que un cambio se aplique a tu suscripción.',
          ],
        },
        {
          heading: '6. Donaciones (Mecenas)',
          body: [
            'Las donaciones son voluntarias y no otorgan funciones de pago. No son reembolsables, salvo que la ley exija lo contrario.',
          ],
        },
        {
          heading: '7. Merchandising (Print Shop)',
          body: [
            'Los productos físicos se fabrican y envían mediante socios de impresión bajo demanda (por ejemplo Printful, Gelato o Printify), que pueden tener sus propios términos. Los reembolsos o reposiciones por productos defectuosos se rigen por la política del socio y por nuestra Política de Reembolsos.',
          ],
        },
        {
          heading: '8. Sección Adults (18+)',
          body: [
            'El Servicio incluye una sección "Adults" destinada a personas mayores de 18 años. Al acceder declarás ser mayor de edad. Podemos aplicar controles de edad y retirar contenido a nuestro criterio.',
          ],
        },
        {
          heading: '9. Propiedad intelectual',
          body: [
            'El nombre, el logo, el diseño y el software de WatUSee pertenecen al titular del Servicio y están protegidos por la legislación aplicable. Estos Términos no te otorgan derechos sobre ellos más allá del uso previsto del Servicio.',
          ],
        },
        {
          heading: '10. Suspensión y terminación',
          body: [
            'Podemos suspender o cerrar tu cuenta si incumplís estos Términos. Podés cerrar tu cuenta cuando quieras escribiéndonos.',
          ],
        },
        {
          heading: '11. Exención de garantías y responsabilidad',
          body: [
            'El Servicio se ofrece "tal cual". En la medida en que lo permita la ley, no garantizamos disponibilidad ininterrumpida ni ausencia de errores, y no somos responsables por daños indirectos derivados del uso del Servicio.',
            'Nada en estos Términos limita los derechos que la ley te otorgue como consumidor.',
          ],
        },
        {
          heading: '12. Cambios en los Términos',
          body: [
            'Podemos actualizar estos Términos. Publicaremos la fecha de la última actualización y, si los cambios son importantes, te avisaremos.',
          ],
        },
        {
          heading: '13. Ley aplicable y contacto',
          body: [
            'Estos Términos se rigen por la legislación aplicable en la jurisdicción del titular del Servicio, sin perjuicio de las normas de protección al consumidor de tu país.',
            'Consultas: escribinos a ' + LEGAL_CONTACT_EMAIL + ' o por el formulario en /about.',
          ],
        },
      ],
    },
  },

  // -------------------------------------------------------------------------
  privacy: {
    en: {
      title: 'Privacy Policy',
      updated: 'Last updated: October 15, 2026',
      intro:
        'This policy explains what personal data we collect, how we use it and what rights you have. The data controller is the operator of WatUSee ("we", "us").',
      sections: [
        {
          heading: '1. Data we collect',
          body: [
            'Account data: username, email, password (encrypted), profile picture, and date of birth if you provide it.',
            'Content: images you upload, drawings, comments, reactions and other activity.',
            'Usage data: pages viewed, games played, and technical data such as device and browser.',
            'Payment data: handled by our payment provider (Stripe). We do not store your card details.',
          ],
        },
        {
          heading: '2. How we use your data',
          body: [
            'To operate the Service, show your content, personalise your experience, process payments, send you notifications and respond to your requests.',
            'For security, abuse prevention and improving the product.',
          ],
        },
        {
          heading: '3. Legal bases',
          body: [
            'We process data to perform our contract with you (providing the Service), based on your consent (for example notifications), and on our legitimate interests (security and product improvement). Where required, we rely on your consent for analytics and can withdraw it at any time.',
          ],
        },
        {
          heading: '4. Who we share data with',
          body: [
            'Service providers that help us run the app: hosting, email, analytics and payments (Stripe).',
            'Print-on-demand partners (Printful/Gelato/Printify) only when you order a physical product, with the shipping data needed to fulfil the order.',
            'We do not sell your personal data.',
          ],
        },
        {
          heading: '5. Cookies and analytics',
          body: [
            'We use cookies and similar technologies to keep you logged in and to measure usage (analytics). You can control cookies in your browser settings.',
          ],
        },
        {
          heading: '6. Retention',
          body: [
            'We keep your data while your account is active and for as long as needed to comply with legal obligations.',
          ],
        },
        {
          heading: '7. Your rights',
          body: [
            'You can request access, correction, deletion or portability of your data, and object to certain processing. To exercise these rights, email us at ' + LEGAL_CONTACT_EMAIL + '.',
          ],
        },
        {
          heading: '8. Minors',
          body: [
            'The Service is not intended for children below the minimum age in your country without the consent of a parent or guardian. The Adults section is for users 18 or older.',
          ],
        },
        {
          heading: '9. Security',
          body: [
            'We apply reasonable measures such as password encryption and access controls. No system is completely secure, so please use a strong, unique password.',
          ],
        },
        {
          heading: '10. International transfers',
          body: [
            'Your data may be processed in other countries by our providers, always with the safeguards required by applicable law.',
          ],
        },
        {
          heading: '11. Changes',
          body: [
            'We may update this policy and will publish the updated date here.',
          ],
        },
        {
          heading: '12. Contact',
          body: ['Questions about privacy? Email us at ' + LEGAL_CONTACT_EMAIL + '.'],
        },
      ],
    },
    es: {
      title: 'Política de Privacidad',
      updated: 'Última actualización: 15 de octubre de 2026',
      intro:
        'Esta política explica qué datos personales recopilamos, cómo los usamos y qué derechos tenés. El responsable del tratamiento es el titular de WatUSee ("nosotros").',
      sections: [
        {
          heading: '1. Datos que recopilamos',
          body: [
            'Datos de cuenta: nombre de usuario, email, contraseña (cifrada), imagen de perfil y fecha de nacimiento si la proporcionás.',
            'Contenido: imágenes que subís, dibujos, comentarios, reacciones y demás actividad.',
            'Datos de uso: páginas visitadas, juegos jugados y datos técnicos como dispositivo y navegador.',
            'Datos de pago: los gestiona nuestro proveedor de pagos (Stripe). No almacenamos los datos de tu tarjeta.',
          ],
        },
        {
          heading: '2. Cómo usamos tus datos',
          body: [
            'Para operar el Servicio, mostrar tu contenido, personalizar tu experiencia, procesar pagos, enviarte notificaciones y responder tus consultas.',
            'Para seguridad, prevención de abuso y mejora del producto.',
          ],
        },
        {
          heading: '3. Base legal',
          body: [
            'Tratamos datos para ejecutar el contrato con vos (prestarte el Servicio), con tu consentimiento (por ejemplo, notificaciones) y por interés legítimo (seguridad y mejora del producto). Cuando la ley lo exige, usamos tu consentimiento para analítica y podés retirarlo en cualquier momento.',
          ],
        },
        {
          heading: '4. Con quién compartimos datos',
          body: [
            'Proveedores que nos ayudan a operar la app: hosting, email, analítica y pagos (Stripe).',
            'Socios de impresión bajo demanda (Printful/Gelato/Printify) solo cuando pedís un producto físico, con los datos de envío necesarios para cumplir el pedido.',
            'No vendemos tus datos personales.',
          ],
        },
        {
          heading: '5. Cookies y analítica',
          body: [
            'Usamos cookies y tecnologías similares para mantener tu sesión iniciada y medir el uso (analítica). Podés controlar las cookies desde la configuración de tu navegador.',
          ],
        },
        {
          heading: '6. Conservación',
          body: [
            'Conservamos tus datos mientras tu cuenta esté activa y durante el tiempo necesario para cumplir obligaciones legales.',
          ],
        },
        {
          heading: '7. Tus derechos',
          body: [
            'Podés solicitar acceso, corrección, eliminación o portabilidad de tus datos, y oponerte a ciertos tratamientos. Para ejercerlos, escribinos a ' + LEGAL_CONTACT_EMAIL + '.',
          ],
        },
        {
          heading: '8. Menores',
          body: [
            'El Servicio no está destinado a menores de la edad mínima de tu país sin el consentimiento de un padre, madre o tutor. La sección Adults es para mayores de 18 años.',
          ],
        },
        {
          heading: '9. Seguridad',
          body: [
            'Aplicamos medidas razonables, como cifrado de contraseñas y control de acceso. Ningún sistema es totalmente seguro, así que usá una contraseña fuerte y única.',
          ],
        },
        {
          heading: '10. Transferencias internacionales',
          body: [
            'Tus datos pueden procesarse en otros países a través de nuestros proveedores, siempre con las garantías que exige la legislación aplicable.',
          ],
        },
        {
          heading: '11. Cambios',
          body: ['Podemos actualizar esta política y publicaremos la fecha de la última actualización.'],
        },
        {
          heading: '12. Contacto',
          body: ['¿Dudas sobre privacidad? Escribinos a ' + LEGAL_CONTACT_EMAIL + '.'],
        },
      ],
    },
  },

  // -------------------------------------------------------------------------
  refund: {
    en: {
      title: 'Refund & Cancellation Policy',
      updated: 'Last updated: October 15, 2026',
      intro:
        'We want the experience to be clear. This policy applies to subscriptions, donations and physical products.',
      sections: [
        {
          heading: '1. Subscriptions (Frida / Da Vinci)',
          body: [
            'Subscriptions renew automatically (monthly or yearly). You can cancel at any time and your access will continue until the end of the period already paid; after that it will not renew.',
          ],
        },
        {
          heading: '2. Subscription refunds',
          body: [
            'If it is your first purchase, you may request a refund within 14 days of the purchase (EU consumer right and similar policies). After that period, billing cycles already started are non-refundable, unless the law requires otherwise.',
            'If a technical problem prevented you from using your plan, contact us and we will review it.',
          ],
        },
        {
          heading: '3. Donations',
          body: [
            'Donations are voluntary and non-refundable, except where required by law or in the case of a billing error.',
          ],
        },
        {
          heading: '4. Physical products (Print Shop)',
          body: [
            'Physical products are made and shipped by a print-on-demand partner. If a product arrives damaged or with a print defect, contact us within 30 days with photos and we will replace it or refund it. Returns for size or change of mind may depend on the partner.',
          ],
        },
        {
          heading: '5. How to request',
          body: [
            'Email us at ' + LEGAL_CONTACT_EMAIL + ' with your account email and the payment receipt or reference. We will respond within a reasonable time.',
          ],
        },
        {
          heading: '6. Contact',
          body: ['Questions about refunds? Email us at ' + LEGAL_CONTACT_EMAIL + '.'],
        },
      ],
    },
    es: {
      title: 'Política de Reembolsos y Cancelación',
      updated: 'Última actualización: 15 de octubre de 2026',
      intro:
        'Queremos que la experiencia sea clara. Esta política aplica a las suscripciones, las donaciones y los productos físicos.',
      sections: [
        {
          heading: '1. Suscripciones (Frida / Da Vinci)',
          body: [
            'Las suscripciones se renuevan automáticamente (mensual o anual). Podés cancelar en cualquier momento y tu acceso continuará hasta el final del período ya pagado; después no se renovará.',
          ],
        },
        {
          heading: '2. Reembolsos de suscripción',
          body: [
            'Si es tu primera compra, podés pedir el reembolso dentro de los 14 días posteriores a la compra (derecho del consumidor de la UE y políticas similares). Pasado ese plazo, los períodos ya iniciados no son reembolsables, salvo que la ley exija lo contrario.',
            'Si un problema técnico te impidió usar tu plan, escribinos y lo evaluamos.',
          ],
        },
        {
          heading: '3. Donaciones',
          body: [
            'Las donaciones son voluntarias y no reembolsables, salvo que la ley lo exija o ante un error de cobro.',
          ],
        },
        {
          heading: '4. Productos físicos (Print Shop)',
          body: [
            'Los productos físicos los fabrica y envía un socio de impresión bajo demanda. Si un producto llega dañado o con defecto de impresión, escribinos dentro de los 30 días con fotos y lo reponemos o reembolsamos. Los cambios por talle o cambio de opinión pueden depender del socio.',
          ],
        },
        {
          heading: '5. Cómo solicitarlo',
          body: [
            'Escribinos a ' + LEGAL_CONTACT_EMAIL + ' con el email de tu cuenta y el comprobante o referencia de pago. Responderemos en un plazo razonable.',
          ],
        },
        {
          heading: '6. Contacto',
          body: ['¿Dudas sobre reembolsos? Escribinos a ' + LEGAL_CONTACT_EMAIL + '.'],
        },
      ],
    },
  },
};
