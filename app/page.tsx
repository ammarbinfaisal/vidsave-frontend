"use client";

import { useEffect, useRef, useState } from "react";

// Trailing slashes would produce "//api/jobs", which 404s.
const API = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080").replace(/\/+$/, "");

type Platform = "youtube" | "instagram" | "x" | "reddit";

type Media = {
  title: string;
  thumbnail?: string;
  duration?: number;
  uploader?: string;
  platform: Platform;
  size?: number;
  download_url: string;
};

type Job = {
  id: string;
  status: "pending" | "running" | "done" | "failed";
  error?: string;
  media?: Media;
};

const PLATFORMS: { id: Platform; label: string; hosts: RegExp }[] = [
  { id: "youtube", label: "YouTube", hosts: /(^|\.)(youtube\.com|youtu\.be)$/ },
  { id: "instagram", label: "Instagram", hosts: /(^|\.)instagram\.com$/ },
  { id: "x", label: "X", hosts: /(^|\.)(x\.com|twitter\.com)$/ },
  { id: "reddit", label: "Reddit", hosts: /(^|\.)(reddit\.com|redd\.it)$/ },
];

const STEPS = ["Queued", "Fetching", "Ready"] as const;

function detectPlatform(url: string): Platform | null {
  try {
    const host = new URL(url.trim()).hostname.toLowerCase();
    return PLATFORMS.find((p) => p.hosts.test(host))?.id ?? null;
  } catch {
    return null;
  }
}

function formatDuration(s?: number) {
  if (!s) return null;
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.round(s % 60)).padStart(2, "0")}`;
}

function formatSize(b?: number) {
  if (!b) return null;
  return b > 1e9 ? `${(b / 1e9).toFixed(1)} GB` : `${(b / 1e6).toFixed(1)} MB`;
}

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action";

export default function Home() {
  const [url, setUrl] = useState("");
  const [job, setJob] = useState<Job | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const detected = detectPlatform(url);
  const working = submitting || job?.status === "pending" || job?.status === "running";
  const done = job?.status === "done" && !!job.media;
  const step = submitting || job?.status === "pending" ? 0 : job?.status === "running" ? 1 : 2;

  useEffect(() => () => {
    if (pollRef.current) clearTimeout(pollRef.current);
  }, []);

  function poll(id: string, delay = 1000) {
    pollRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`${API}/api/jobs/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail ?? "Lost track of this download");
        setJob(data);
        if (data.status === "pending" || data.status === "running") {
          poll(id, Math.min(delay * 1.5, 5000));
        }
      } catch (e) {
        setError((e as Error).message);
      }
    }, delay);
  }

  async function start(link: string) {
    if (pollRef.current) clearTimeout(pollRef.current);
    setError(null);
    setJob(null);
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/api/jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: link }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail ?? "Something went wrong");
      setJob(data);
      if (data.status === "pending" || data.status === "running") poll(data.id);
    } catch (e) {
      setError(
        e instanceof TypeError ? "Can't reach the server. Try again in a moment." : (e as Error).message,
      );
    } finally {
      setSubmitting(false);
    }
  }

  // Most people arrive with a link already copied, so one tap should do it all.
  async function pasteAndGo() {
    try {
      const text = (await navigator.clipboard.readText()).trim();
      if (!text) throw new Error();
      setUrl(text);
      if (detectPlatform(text)) start(text);
      else inputRef.current?.focus();
    } catch {
      inputRef.current?.focus();
    }
  }

  function reset() {
    setJob(null);
    setError(null);
    setUrl("");
    inputRef.current?.focus();
  }

  const failure = error ?? (job?.status === "failed" ? job.error ?? "Download failed" : null);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 sm:px-8">
      <header className="flex items-baseline justify-between pt-6 pb-16 sm:pt-8 sm:pb-24">
        <span className="text-body font-semibold tracking-tight">vidsave</span>
        <span className="text-meta text-muted">Free · no sign-up</span>
      </header>

      <main className="flex-1">
        <h1 className="font-display text-[clamp(2.3125rem,9vw,4.1875rem)] leading-[1.02] tracking-tight">
          Paste a link.
          <br />
          <span className="text-muted">Keep the video.</span>
        </h1>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            start(url);
          }}
          className="mt-12"
        >
          <label htmlFor="url" className="text-meta font-medium uppercase tracking-[0.08em] text-muted">
            Video link
          </label>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <div className="flex min-w-0 flex-1 items-center rounded-lg border border-line bg-paper shadow-(--shadow) transition-colors focus-within:border-action">
              <input
                ref={inputRef}
                id="url"
                type="url"
                inputMode="url"
                autoComplete="off"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=…"
                className="min-w-0 flex-1 bg-transparent px-4 py-3 text-body outline-none placeholder:text-muted/70"
              />
              {!url && (
                <button
                  type="button"
                  onClick={pasteAndGo}
                  className={`mr-1.5 min-h-11 rounded-md px-3 text-meta font-semibold uppercase tracking-[0.08em] text-action hover:bg-sunk ${focusRing}`}
                >
                  Paste
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={working}
              className={`min-h-12 rounded-lg px-6 font-semibold transition-colors active:translate-y-px disabled:cursor-wait disabled:opacity-60 ${
                // Once a file is ready, Download is the one primary action on the page.
                done
                  ? "border border-line text-ink hover:bg-sunk"
                  : "bg-action text-action-ink hover:bg-action-hover"
              } ${focusRing}`}
            >
              {working ? "Saving…" : "Save video"}
            </button>
          </div>

          <p className="mt-4 text-meta text-muted">
            Works with{" "}
            {PLATFORMS.map((p, i) => (
              <span key={p.id}>
                <span
                  className={
                    detected === p.id
                      ? "font-semibold text-ink underline decoration-action decoration-2 underline-offset-4"
                      : undefined
                  }
                >
                  {p.label}
                </span>
                {i < PLATFORMS.length - 1 && <span aria-hidden> · </span>}
              </span>
            ))}
          </p>
        </form>

        <section aria-live="polite" className="mt-12 pb-16">
          {working && (
            <ol className="flex gap-6 text-meta font-medium uppercase tracking-[0.08em]">
              {STEPS.map((label, i) => (
                <li
                  key={label}
                  aria-current={i === step ? "step" : undefined}
                  className={`flex items-center gap-2 ${i <= step ? "text-ink" : "text-muted/60"}`}
                >
                  <span
                    className={`size-2 rounded-full ${
                      i < step ? "bg-ink" : i === step ? "animate-pulse-dot bg-action" : "bg-line"
                    }`}
                  />
                  {label}
                </li>
              ))}
            </ol>
          )}

          {failure && (
            <div className="animate-rise rounded-lg bg-error-bg px-4 py-3 text-error" role="alert">
              <p className="font-semibold">Couldn’t save this one</p>
              <p className="mt-1 text-meta leading-relaxed">{failure}</p>
            </div>
          )}

          {done && job?.media && (
            <article className="animate-rise border-t border-line pt-6">
              <div className="flex gap-4">
                {job.media.thumbnail && (
                  // Platform thumbnails come from many hosts and expire, so skip next/image.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={job.media.thumbnail}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="aspect-[3/4] w-24 shrink-0 rounded-md bg-sunk object-cover sm:w-28"
                  />
                )}
                <div className="min-w-0">
                  <h2 className="line-clamp-3 text-lead leading-snug font-semibold">
                    {job.media.title}
                  </h2>
                  <p className="mt-2 text-meta text-muted">
                    {[
                      PLATFORMS.find((p) => p.id === job.media!.platform)?.label,
                      job.media.uploader,
                      formatDuration(job.media.duration),
                      formatSize(job.media.size),
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <a
                  href={job.media.download_url}
                  className={`inline-flex min-h-12 items-center justify-center rounded-lg bg-action px-6 font-semibold text-action-ink transition-colors hover:bg-action-hover ${focusRing}`}
                >
                  Download MP4
                </a>
                <button
                  type="button"
                  onClick={reset}
                  className={`min-h-12 rounded-lg px-4 font-medium text-muted hover:text-ink ${focusRing}`}
                >
                  Save another
                </button>
              </div>
            </article>
          )}
        </section>
      </main>

      <footer className="border-t border-line py-6 text-meta text-muted">
        Saved files are kept for 6 days. Only download videos you have the right to keep.
      </footer>
    </div>
  );
}
