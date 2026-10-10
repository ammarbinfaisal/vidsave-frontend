"use client";

import { useEffect, useRef, useState } from "react";
import PlaylistView from "@/components/PlaylistView";
import ProgressBar from "@/components/ProgressBar";
import {
  api,
  focusRing,
  formatDuration,
  formatProgress,
  formatSize,
  isActive,
  watchJob,
  type Job,
} from "@/lib/api";
import { PLATFORMS, detectPlatform, platformLabel } from "@/lib/platforms";

export { focusRing };

const STEPS = ["Queued", "Fetching", "Ready"] as const;

export default function Downloader({
  placeholder = "https://youtube.com/watch?v=…",
}: {
  placeholder?: string;
}) {
  const [url, setUrl] = useState("");
  const [job, setJob] = useState<Job | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const stopRef = useRef<(() => void) | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const detected = detectPlatform(url);
  const working = submitting || isActive(job?.status);
  const done = job?.status === "done" && !!job.media;
  const playlist = job?.status === "done" ? job.playlist : undefined;
  const step = submitting || job?.status === "pending" ? 0 : job?.status === "running" ? 1 : 2;

  useEffect(() => () => stopRef.current?.(), []);

  function watch(id: string) {
    stopRef.current?.();
    stopRef.current = watchJob(id, setJob, setError);
  }

  async function start(link: string) {
    stopRef.current?.();
    stopRef.current = null;
    setError(null);
    setJob(null);
    setSubmitting(true);
    try {
      const data = await api<Job>("/api/jobs", { url: link });
      setJob(data);
      // Playlists stay watched after listing, so their entries update live.
      if (isActive(data.status) || data.kind === "playlist") watch(data.id);
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
    stopRef.current?.();
    stopRef.current = null;
    setJob(null);
    setError(null);
    setUrl("");
    inputRef.current?.focus();
  }

  const failure = error ?? (job?.status === "failed" ? job.error ?? "Download failed" : null);

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          start(url);
        }}
      >
        <label htmlFor="url" className="text-meta font-medium uppercase tracking-[0.08em] text-muted">
          Video or playlist link
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
              placeholder={placeholder}
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
              done || playlist
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

      <section aria-live="polite" className="mt-10 empty:hidden">
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
                {i === 1 && i === step && formatProgress(job?.progress)}
              </li>
            ))}
          </ol>
        )}
        {working && job?.progress !== undefined && <ProgressBar value={job.progress} className="mt-4" />}

        {failure && (
          <div className="animate-rise rounded-lg bg-error-bg px-4 py-3 text-error" role="alert">
            <p className="font-semibold">Couldn’t save this one</p>
            <p className="mt-1 text-meta leading-relaxed">{failure}</p>
          </div>
        )}

        {playlist && job && <PlaylistView id={job.id} playlist={playlist} onUpdate={setJob} onReset={reset} />}

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
                <p className="line-clamp-3 text-lead leading-snug font-semibold">{job.media.title}</p>
                <p className="mt-2 text-meta text-muted">
                  {[
                    platformLabel(job.media.platform),
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
    </div>
  );
}
