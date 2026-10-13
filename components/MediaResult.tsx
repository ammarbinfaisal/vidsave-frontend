import {
  downloadLabel,
  focusRing,
  formatDuration,
  formatSize,
  type Media,
  type MediaItem,
} from "@/lib/api";
import { platformLabel } from "@/lib/platforms";

const KIND_NOUN = { video: "video", audio: "audio file", image: "photo" } as const;

/** "3 photos, 2 videos" */
function countItems(items: MediaItem[]) {
  const counts = new Map<MediaItem["kind"], number>();
  for (const it of items) counts.set(it.kind, (counts.get(it.kind) ?? 0) + 1);
  return [...counts]
    .map(([kind, n]) => `${n} ${KIND_NOUN[kind]}${n === 1 ? "" : "s"}`)
    .join(", ");
}

export default function MediaResult({ media, onReset }: { media: Media; onReset: () => void }) {
  const items = media.items;
  return (
    <article className="animate-rise border-t border-line pt-6">
      <div className="flex gap-4">
        {media.thumbnail && (
          // Platform thumbnails come from many hosts and expire, so skip next/image.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={media.thumbnail}
            alt=""
            referrerPolicy="no-referrer"
            className="aspect-[3/4] w-24 shrink-0 rounded-md bg-sunk object-cover sm:w-28"
          />
        )}
        <div className="min-w-0">
          <p className="line-clamp-3 text-lead leading-snug font-semibold">{media.title}</p>
          <p className="mt-2 text-meta text-muted">
            {[
              platformLabel(media.platform),
              media.uploader,
              items ? countItems(items) : formatDuration(media.duration),
              formatSize(media.size),
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
      </div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <a
          href={media.download_url}
          className={`inline-flex min-h-12 items-center justify-center rounded-lg bg-action px-6 font-semibold text-action-ink transition-colors hover:bg-action-hover ${focusRing}`}
        >
          {items ? `Download all (${media.ext?.toUpperCase()})` : downloadLabel(media.ext)}
        </a>
        <button
          type="button"
          onClick={onReset}
          className={`min-h-12 rounded-lg px-4 font-medium text-muted hover:text-ink ${focusRing}`}
        >
          Save another
        </button>
      </div>

      {items && (
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((it, i) => (
            <li key={it.download_url} className="flex flex-col gap-2">
              <ItemPreview item={it} />
              <a
                href={it.download_url}
                aria-label={`Download ${KIND_NOUN[it.kind]} ${i + 1}`}
                className={`inline-flex min-h-11 items-center justify-center rounded-md border border-line text-meta font-semibold text-ink transition-colors hover:bg-sunk ${focusRing}`}
              >
                {downloadLabel(it.ext)}
                {it.size ? <span className="ml-1.5 font-normal text-muted">{formatSize(it.size)}</span> : null}
              </a>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

function ItemPreview({ item }: { item: MediaItem }) {
  // Photos preview from our own copy; platform thumbnails expire quickly.
  const src = item.kind === "image" ? item.download_url : item.thumbnail;
  return (
    <div className="relative aspect-square overflow-hidden rounded-md bg-sunk">
      {src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" loading="lazy" referrerPolicy="no-referrer" className="size-full object-cover" />
      )}
      {item.kind !== "image" && (
        <span className="absolute bottom-1.5 left-1.5 rounded bg-ink/75 px-1.5 py-0.5 text-meta font-medium text-paper">
          {item.kind === "audio" ? "Audio" : "Video"}
          {item.duration ? ` · ${formatDuration(item.duration)}` : ""}
        </span>
      )}
    </div>
  );
}
