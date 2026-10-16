import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Providers from "@/components/Providers";
import Analytics from "@/components/Analytics";
import AttributionCapture from "@/components/AttributionCapture";
import { auth } from "@/auth";
import { getAnalyticsConfig, type AnalyticsConfig } from "@/lib/settings";
import {
  SITE_NAME,
  SITE_TAGLINE,
  SITE_DESCRIPTION,
  SITE_LOCALE,
} from "@/lib/site";
import { getRequestSiteUrl } from "@/lib/site-url";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = await getRequestSiteUrl();
  return {
    metadataBase: new URL(siteUrl),
    title: `${SITE_NAME} | ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    applicationName: SITE_NAME,
    keywords: [
      "pareidolia",
      "WatUSee",
      "social network",
      "brain games",
      "optical illusions",
      "creativity",
      "see the unseen",
    ],
    alternates: {
      canonical: "/",
    },
    icons: {
      icon: [{ url: '/favicon.png', sizes: '32x32', type: 'image/png' }],
      apple: '/logo.png',
    },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: SITE_LOCALE,
      url: "/",
      title: `${SITE_NAME} | ${SITE_TAGLINE}`,
      description: SITE_DESCRIPTION,
      images: [
        {
          url: "/og.png",
          width: 1200,
          height: 630,
          alt: `${SITE_NAME} — ${SITE_TAGLINE}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${SITE_NAME} | ${SITE_TAGLINE}`,
      description: SITE_DESCRIPTION,
      images: ["/og.png"],
    },
  };
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

async function loadAnalytics(): Promise<AnalyticsConfig> {
  try {
    return await getAnalyticsConfig();
  } catch {
    return { ga4Id: null, plausibleDomain: null, umamiSrc: null, umamiWebsiteId: null };
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const analytics = await loadAnalytics();
  return (
    <html
      lang="en"
      className={`${inter.variable} dark antialiased h-full`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground selection:bg-brand-primary/30 selection:text-white">
        <Providers session={session}>
          <Navbar />
          <main className="flex-1 flex flex-col w-full">
            {children}
          </main>
          <Footer />
          <AttributionCapture />
          <Analytics config={analytics} />
        </Providers>
      </body>
    </html>
  );
}

