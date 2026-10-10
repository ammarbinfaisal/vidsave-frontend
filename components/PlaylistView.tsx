"use client";

import { useEffect, useRef, useState } from "react";
import ProgressBar from "@/components/ProgressBar";
import {
  api,
  focusRing,
  formatDuration,
  formatSize,
  isActive,
  type Job,
  type Playlist,
  type PlaylistEntry,
} from "@/lib/api";

const smallButton = `inline-flex min-h-11 items-center justify-center rounded-md px-4 text-meta font-semibold transition-colors ${focusRing}`;

export default function PlaylistView({
  id,
  playlist,
  onUpdate,
  onReset,
}: {
  id: string;
  playlist: Playlist;
  onUpdate: (job: Job) => void;
  onReset: () => void;
}) {
  // Entries the visitor asked for. The server runs only a few of one
  // playlist's entries at a time, so we hand it more as slots free up.
  const [wanted, setWanted] = useState<Set<string>>(new Set());
  // Entries the server already took. A failed one turns idle again after a
  // minute; this keeps us from retrying it until the visitor asks.
  const [sent, setSent] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const saving = useRef(false);

  const { entries } = playlist;
  const ready = entries.filter((e) => e.status === "done").length;
  const remaining = entries.filter((e) => e.status !== "done" && !wanted.has(e.id));
  const waiting = (e: PlaylistEntry) => wanted.has(e.id) && !sent.has(e.id) && e.status === "idle";

  useEffect(() => {
    const inflight = entries.filter((e) => isActive(e.status)).length;
    const next = entries.filter(waiting);
    if (!next.length || inflight >= playlist.max_inflight || saving.current) return;

    saving.current = true;
    api<Job>(`/api/jobs/${id}/save`, { ids: next.map((e) => e.id) })
      .then((job) => {
        setError(null);
        const taken = job.playlist?.entries.filter((e) => e.status !== "idle").map((e) => e.id) ?? [];
        setSent((s) => new Set([...s, ...taken.filter((x) => wanted.has(x))]));
        onUpdate(job);
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => {
        saving.current = false;
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- waiting() only reads wanted/sent
  }, [entries, wanted, sent, id, playlist.max_inflight, onUpdate]);

  const want = (ids: string[]) => {
    setWanted((w) => new Set([...w, ...ids]));
    setSent((s) => new Set([...s].filter((x) => !ids.includes(x))));
  };

  return (
    <article className="animate-rise border-t border-line pt-6">
      <p className="text-meta font-medium uppercase tracking-[0.08em] text-muted">
        {["Playlist", playlist.uploader].filter(Boolean).join(" · ")}
      </p>
      <p className="mt-1 line-clamp-2 text-lead leading-snug font-semibold">{playlist.title}</p>
      <p className="mt-2 text-meta text-muted">
        {playlist.count && playlist.count > entries.length
          ? `First ${entries.length} of ${playlist.count} videos`
          : `${entries.length} videos`}
        {ready > 0 && ` · ${ready} ready`}
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          disabled={!remaining.length}
          onClick={() => want(remaining.map((e) => e.id))}
          className={`min-h-12 rounded-lg bg-action px-6 font-semibold text-action-ink transition-colors hover:bg-action-hover disabled:opacity-60 ${focusRing}`}
        >
          {remaining.length ? `Save all ${remaining.length}` : "All saved"}
        </button>
        <button
          type="button"
          onClick={onReset}
          className={`min-h-12 rounded-lg px-4 font-medium text-muted hover:text-ink ${focusRing}`}
        >
          Save another
        </button>
      </div>
      {error && (
        <p className="mt-3 text-meta text-error" role="alert">
          {error}
        </p>
      )}

      <ol className="mt-6 divide-y divide-line border-t border-line">
        {entries.map((e) => (
          <Row key={e.id} entry={e} queued={waiting(e)} onSave={() => want([e.id])} />
        ))}
      </ol>
    </article>
  );
}

function Row({
  entry: e,
  queued,
  onSave,
}: {
  entry: PlaylistEntry;
  queued: boolean;
  onSave: () => void;
}) {
  const running = e.status === "running";
  const meta = [formatDuration(e.media?.duration ?? e.duration), formatSize(e.media?.size)]
    .filter(Boolean)
    .join(" · ");

  return (
    <li className="flex items-center gap-3 py-3">
      {e.thumbnail ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={e.thumbnail}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          className="aspect-video w-24 shrink-0 rounded-md bg-sunk object-cover sm:w-28"
        />
      ) : (
        <div className="aspect-video w-24 shrink-0 rounded-md bg-sunk sm:w-28" />
      )}
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-meta leading-snug font-semibold text-ink">{e.title}</p>
        {e.status === "failed" ? (
          <p className="mt-1 line-clamp-2 text-meta text-error">{e.error ?? "Download failed"}</p>
        ) : (
          meta && <p className="mt-1 text-meta text-muted">{meta}</p>
        )}
        {running && e.progress !== undefined && <ProgressBar value={e.progress} className="mt-2" />}
      </div>
      <div className="w-24 shrink-0 text-right text-meta sm:w-28" aria-live="polite">
        {e.status === "done" && e.media ? (
          <a href={e.media.download_url} className={`${smallButton} bg-action text-action-ink hover:bg-action-hover`}>
            Download
          </a>
        ) : running ? (
          <span className="font-medium text-ink">
            {e.progress === undefined ? "Fetching" : `${Math.floor(e.progress * 100)}%`}
          </span>
        ) : e.status === "pending" || queued ? (
          <span className="text-muted">Queued</span>
        ) : e.status === "failed" ? null : (
          <button type="button" onClick={onSave} className={`${smallButton} border border-line text-ink hover:bg-sunk`}>
            Save
          </button>
        )}
      </div>
    </li>
  );
}
