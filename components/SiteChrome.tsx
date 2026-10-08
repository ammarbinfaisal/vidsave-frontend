import Link from "next/link";
import { focusRing } from "./Downloader";
import { GUIDES } from "@/lib/guides";

export function SiteHeader() {
  return (
    <header className="flex items-baseline justify-between pt-6 pb-16 sm:pt-8 sm:pb-24">
      <Link href="/" className={`rounded-sm text-body font-semibold tracking-tight ${focusRing}`}>
        vidsave
      </Link>
      <nav className="flex items-baseline gap-5 text-meta text-muted">
        <Link href="/guides" className={`rounded-sm hover:text-ink ${focusRing}`}>
          Guides
        </Link>
        <span className="hidden sm:inline">Free · no sign-up</span>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line py-8 text-meta text-muted">
      <h2 className="font-medium uppercase tracking-[0.08em]">How-to guides</h2>
      <ul className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
        {GUIDES.map((g) => (
          <li key={g.slug}>
            <Link href={`/guides/${g.slug}`} className={`rounded-sm hover:text-ink ${focusRing}`}>
              {g.title}
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-8">
        Saved files are kept for 6 days. Only download videos you have the right to keep.
      </p>
    </footer>
  );
}

/** Page frame shared by every route: centered column, header, footer. */
export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 sm:px-8">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
