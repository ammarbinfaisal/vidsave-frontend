import type { Platform } from "@/lib/platforms";

// Trailing slashes would produce "//api/jobs", which 404s.
export const API = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080").replace(/\/+$/, "");

export type Status = "pending" | "running" | "done" | "failed";

export type Media = {
  title: string;
  thumbnail?: string;
  duration?: number;
  uploader?: string;
  platform: Platform;
  size?: number;
  download_url: string;
};

export type PlaylistEntry = {
  id: string;
  url: string;
  title: string;
  duration?: number;
  thumbnail?: string;
  status: Status | "idle";
  error?: string;
  progress?: number;
  media?: Media;
};

export type Playlist = {
  title: string;
  uploader?: string;
  platform: Platform;
  count?: number;
  max_inflight: number;
  entries: PlaylistEntry[];
};

export type Job = {
  id: string;
  kind?: "video" | "playlist";
  status: Status;
  error?: string;
  progress?: number;
  media?: Media;
  playlist?: Playlist;
};

export const isActive = (s?: string) => s === "pending" || s === "running";

export async function api<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method: body === undefined ? "GET" : "POST",
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail ?? "Something went wrong");
  return data;
}

const isFinal = (j: Job) => j.kind !== "playlist" && !isActive(j.status);

/**
 * Follow a job live. The server pushes a fresh snapshot over a WebSocket on
 * every change (download progress ticks about once a second). A video's
 * socket closes once it's done or failed; a playlist's stays open until
 * stop(). If sockets keep failing (strict proxies, flaky mobile networks),
 * fall back to polling.
 */
export function watchJob(
  id: string,
  onUpdate: (job: Job) => void,
  onError: (message: string) => void,
): () => void {
  let stopped = false;
  let ws: WebSocket | null = null;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let failures = 0;

  const update = (job: Job) => {
    if (stopped) return;
    onUpdate(job);
    if (isFinal(job)) stopped = true;
  };

  const poll = async (delay = 1000) => {
    timer = setTimeout(async () => {
      if (stopped) return;
      try {
        update(await api<Job>(`/api/jobs/${id}`));
        if (!stopped) poll(Math.min(delay * 1.5, 4000));
      } catch (e) {
        onError((e as Error).message || "Lost track of this download");
      }
    }, delay);
  };

  const connect = () => {
    ws = new WebSocket(`${API.replace(/^http/, "ws")}/api/jobs/${id}/ws`);
    ws.onmessage = (ev) => {
      failures = 0;
      update(JSON.parse(ev.data));
    };
    ws.onclose = () => {
      if (stopped) return;
      if (++failures >= 3) poll();
      else timer = setTimeout(connect, 1000 * failures);
    };
  };

  connect();
  return () => {
    stopped = true;
    clearTimeout(timer);
    ws?.close();
  };
}

export function formatDuration(s?: number) {
  if (!s) return null;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = String(Math.round(s % 60)).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${sec}` : `${m}:${sec}`;
}

export function formatSize(b?: number) {
  if (!b) return null;
  return b > 1e9 ? `${(b / 1e9).toFixed(1)} GB` : `${(b / 1e6).toFixed(1)} MB`;
}

export const formatProgress = (p?: number) => (p === undefined ? "" : ` ${Math.floor(p * 100)}%`);

export const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action";
