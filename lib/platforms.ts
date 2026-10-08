export type Platform = "youtube" | "instagram" | "tiktok" | "x" | "reddit" | "vimeo";

export const PLATFORMS: { id: Platform; label: string; hosts: RegExp }[] = [
  { id: "youtube", label: "YouTube", hosts: /(^|\.)(youtube\.com|youtu\.be)$/ },
  { id: "instagram", label: "Instagram", hosts: /(^|\.)instagram\.com$/ },
  { id: "tiktok", label: "TikTok", hosts: /(^|\.)tiktok\.com$/ },
  { id: "x", label: "X", hosts: /(^|\.)(x\.com|twitter\.com)$/ },
  { id: "reddit", label: "Reddit", hosts: /(^|\.)(reddit\.com|redd\.it)$/ },
  { id: "vimeo", label: "Vimeo", hosts: /(^|\.)vimeo\.com$/ },
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
