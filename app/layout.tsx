import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Schibsted_Grotesk } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID ?? "yujp824cbt";
const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID ?? "AW-11298597203";

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

export const metadata: Metadata = {
  title: "vidsave: Download YouTube, Instagram, X and Reddit videos",
  description:
    "Paste a link from YouTube, Instagram, X or Reddit and save the video as an MP4. No sign-up.",
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
        {/* Analytics load in production only, so local dev doesn't pollute the data. */}
        {process.env.NODE_ENV === "production" && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
              strategy="afterInteractive"
            />
            <Script id="gtag" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GOOGLE_ADS_ID}');`}
            </Script>
          </>
        )}
        {process.env.NODE_ENV === "production" && (
          <Script id="clarity" strategy="afterInteractive">
            {`(function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${CLARITY_ID}");`}
          </Script>
        )}
      </body>
    </html>
  );
}
