import type { Metadata } from "next";
import Link from "next/link";
import { focusRing } from "@/components/Downloader";
import { Shell } from "@/components/SiteChrome";
import { GUIDES } from "@/lib/guides";
import { platformLabel } from "@/lib/platforms";

export const metadata: Metadata = {
  title: "How to download videos: guides for every platform",
  description:
    "Step-by-step guides to downloading videos from YouTube, Instagram, TikTok, X (Twitter), Reddit and Vimeo as MP4.",
  alternates: { canonical: "/guides" },
};

export default function GuidesIndex() {
  return (
    <Shell>
      <h1 className="font-display text-[clamp(2.3125rem,8vw,3.5rem)] leading-[1.04] tracking-tight">
        Download guides
      </h1>
      <p className="mt-6 max-w-[34rem] text-lead leading-relaxed text-muted">
        Where to find the link on each platform, which links work and what can’t be saved.
      </p>

      <ul className="mt-12 divide-y divide-line border-y border-line">
        {GUIDES.map((g) => (
          <li key={g.slug}>
            <Link
              href={`/guides/${g.slug}`}
              className={`group block py-6 ${focusRing}`}
            >
              <span className="text-meta font-medium uppercase tracking-[0.08em] text-muted">
                {platformLabel(g.platform)}
              </span>
              <span className="mt-1 block text-lead font-semibold group-hover:text-action">
                {g.title}
              </span>
              <span className="mt-2 block text-muted">{g.description}</span>
            </Link>
          </li>
        ))}
      </ul>
    </Shell>
  );
}
