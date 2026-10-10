import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Schibsted_Grotesk } from "next/font/google";
import Script from "next/script";
import ClarityInit from "@/components/ClarityInit";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID ?? "yujp824cbt";
const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID ?? "AW-11298597203";
const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "G-7K925NQSX2";
const APITINY_SITE_ID = process.env.NEXT_PUBLIC_APITINY_SITE_ID ?? "6ac9e49530bf8787784530f9";

// Editorial grotesque for the interface; an italic serif only for the headline.
// The pairing works by extreme contrast rather than shared structure.
const grotesk = Schibsted_Grotesk({
  variable: "--font-grotesk",
  subsets: ["latin"],
});

const serif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: "400",
  style: "italic",
});

const DESCRIPTION =
  "Paste a link from YouTube, Instagram, TikTok, X, Reddit or Vimeo and save the video as an MP4. Free, no sign-up.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "vidsave: Download YouTube, Instagram, TikTok, X, Reddit and Vimeo videos",
    template: "%s | vidsave",
  },
  description: DESCRIPTION,
  openGraph: { siteName: "vidsave", type: "website", description: DESCRIPTION },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f1ea" },
    { media: "(prefers-color-scheme: dark)", color: "#161412" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${grotesk.variable} ${serif.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        {children}
        {/* Ads and analytics load in production only, so local dev doesn't pollute the data. */}
        {process.env.NODE_ENV === "production" && (
          <>
            <Script
              src="https://cdn.apitiny.net/scripts/v2.0/main.js"
              data-site-id={APITINY_SITE_ID}
              data-test-mode="false"
              strategy="afterInteractive"
            />
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
              strategy="afterInteractive"
            />
            <Script id="gtag" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GOOGLE_ADS_ID}');
              gtag('config', '${GA_ID}');`}
            </Script>
            <ClarityInit projectId={CLARITY_ID} />
          </>
        )}
      </body>
    </html>
  );
}
