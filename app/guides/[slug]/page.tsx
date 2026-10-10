import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Downloader, { focusRing } from "@/components/Downloader";
import JsonLd from "@/components/JsonLd";
import { Shell } from "@/components/SiteChrome";
import { GUIDES, getGuide } from "@/lib/guides";
import { platformLabel } from "@/lib/platforms";
import { SITE_URL } from "@/lib/site";

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: PageProps<"/guides/[slug]">): Promise<Metadata> {
  const guide = getGuide((await params).slug);
  if (!guide) return {};
  const path = `/guides/${guide.slug}`;
  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: path },
    openGraph: { title: guide.title, description: guide.description, url: path, type: "article" },
  };
}

const eyebrow = "text-meta font-medium uppercase tracking-[0.08em] text-muted";
const h2 = "mt-16 text-title leading-tight font-semibold tracking-tight";

export default async function GuidePage({ params }: PageProps<"/guides/[slug]">) {
  const guide = getGuide((await params).slug);
  if (!guide) notFound();

  const url = `${SITE_URL}/guides/${guide.slug}`;
  const related = [
    ...GUIDES.filter((g) => g.slug !== guide.slug && g.platform === guide.platform),
    ...GUIDES.filter((g) => g.platform !== guide.platform),
  ].slice(0, 4);

  return (
    <Shell>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "vidsave", item: SITE_URL },
                { "@type": "ListItem", position: 2, name: "Guides", item: `${SITE_URL}/guides` },
                { "@type": "ListItem", position: 3, name: guide.subject, item: url },
              ],
            },
            {
              "@type": "HowTo",
              name: guide.title,
              description: guide.description,
              tool: { "@type": "HowToTool", name: "vidsave" },
              step: guide.steps.map((text, i) => ({
                "@type": "HowToStep",
                position: i + 1,
                text,
              })),
            },
            {
              "@type": "FAQPage",
              mainEntity: guide.faqs.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            },
          ],
        }}
      />

      <nav aria-label="Breadcrumb" className={eyebrow}>
        <Link href="/guides" className={`rounded-sm hover:text-ink ${focusRing}`}>
          Guides
        </Link>
        <span aria-hidden> / </span>
        <span>{platformLabel(guide.platform)}</span>
      </nav>

      <h1 className="mt-4 font-display text-[clamp(2.3125rem,8vw,3.5rem)] leading-[1.04] tracking-tight">
        {guide.title}
      </h1>
      <p className="mt-6 max-w-[34rem] text-lead leading-relaxed text-muted">{guide.lede}</p>

      <div className="mt-10">
        <Downloader placeholder={guide.placeholder} />
      </div>

      <article className="max-w-[36rem] text-body leading-relaxed">
        <h2 className={h2}>Step by step</h2>
        <ol className="mt-6 space-y-5">
          {guide.steps.map((step, i) => (
            <li key={i} className="flex gap-4">
              <span
                aria-hidden
                className="font-display text-title leading-none text-action tabular-nums"
              >
                {i + 1}
              </span>
              <span className="pt-1">{step}</span>
            </li>
          ))}
        </ol>

        <h2 className={h2}>Where to find the link</h2>
        <div className="mt-6 space-y-8">
          {guide.findLink.map((group) => (
            <section key={group.where}>
              <h3 className="font-semibold">{group.where}</h3>
              <ol className="mt-2 list-decimal space-y-1 pl-5 marker:text-muted">
                {group.steps.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
            </section>
          ))}
        </div>

        <h2 className={h2}>Links that work</h2>
        <ul className="mt-6 flex flex-wrap gap-2">
          {guide.linkFormats.map((f) => (
            <li key={f}>
              <code className="rounded-md bg-sunk px-2 py-1 text-meta">{f}</code>
            </li>
          ))}
        </ul>

        <h2 className={h2}>Good to know</h2>
        <ul className="mt-6 space-y-3">
          {guide.notes.map((n) => (
            <li key={n} className="border-l-2 border-line pl-4">
              {n}
            </li>
          ))}
          <li className="border-l-2 border-line pl-4">
            Every download is an MP4 file, which plays on any phone or computer.
          </li>
        </ul>

        <h2 className={h2}>Questions</h2>
        <dl className="mt-6 space-y-8">
          {guide.faqs.map((f) => (
            <div key={f.q}>
              <dt>
                <h3 className="font-semibold">{f.q}</h3>
              </dt>
              <dd className="mt-2 text-muted">{f.a}</dd>
            </div>
          ))}
        </dl>
      </article>

      <aside className="mt-20">
        <h2 className={eyebrow}>More guides</h2>
        <ul className="mt-4 divide-y divide-line border-y border-line">
          {related.map((g) => (
            <li key={g.slug}>
              <Link
                href={`/guides/${g.slug}`}
                className={`flex items-baseline justify-between gap-4 py-4 hover:text-action ${focusRing}`}
              >
                <span className="font-medium">{g.title}</span>
                <span aria-hidden className="text-muted">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </aside>
    </Shell>
  );
}
