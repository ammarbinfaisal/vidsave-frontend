import type { Metadata } from "next";
import Downloader from "@/components/Downloader";
import { Shell } from "@/components/SiteChrome";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <Shell>
      <h1 className="font-display text-[clamp(2.3125rem,9vw,4.1875rem)] leading-[1.02] tracking-tight">
        Paste a link.
        <br />
        <span className="text-muted">Keep the video.</span>
      </h1>
      <div className="mt-12">
        <Downloader />
      </div>
    </Shell>
  );
}
