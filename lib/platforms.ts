export type Platform =
  | "youtube"
  | "instagram"
  | "tiktok"
  | "x"
  | "reddit"
  | "facebook"
  | "threads"
  | "vimeo"
  | "dailymotion";

export const PLATFORMS: { id: Platform; label: string; hosts: RegExp }[] = [
  { id: "youtube", label: "YouTube", hosts: /(^|\.)(youtube\.com|youtu\.be)$/ },
  { id: "instagram", label: "Instagram", hosts: /(^|\.)instagram\.com$/ },
  { id: "tiktok", label: "TikTok", hosts: /(^|\.)tiktok\.com$/ },
  { id: "x", label: "X", hosts: /(^|\.)(x\.com|twitter\.com)$/ },
  { id: "reddit", label: "Reddit", hosts: /(^|\.)(reddit\.com|redd\.it)$/ },
  { id: "facebook", label: "Facebook", hosts: /(^|\.)(facebook\.com|fb\.watch)$/ },
  { id: "threads", label: "Threads", hosts: /(^|\.)threads\.(net|com)$/ },
  { id: "vimeo", label: "Vimeo", hosts: /(^|\.)vimeo\.com$/ },
  { id: "dailymotion", label: "Dailymotion", hosts: /(^|\.)(dailymotion\.com|dai\.ly)$/ },
];

export function detectPlatform(url: string): Platform | null {
  try {
    const host = new URL(url.trim()).hostname.toLowerCase();
    return PLATFORMS.find((p) => p.hosts.test(host))?.id ?? null;
  } catch {
    return null;
  }
}

export function platformLabel(id: Platform) {
  return PLATFORMS.find((p) => p.id === id)?.label ?? id;
}
