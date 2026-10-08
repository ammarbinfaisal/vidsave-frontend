import type { Platform } from "./platforms";

export type Guide = {
  slug: string;
  platform: Platform;
  /** H1 and the <title> before the site suffix. */
  title: string;
  description: string;
  lede: string;
  placeholder: string;
  /** Short name used in lists and breadcrumbs, e.g. "YouTube Shorts". */
  subject: string;
  steps: string[];
  findLink: { where: string; steps: string[] }[];
  linkFormats: string[];
  notes: string[];
  faqs: { q: string; a: string }[];
};

// Limits enforced by the backend (app/config.py). Keep these in sync.
export const LIMITS = {
  maxHeight: "1080p",
  maxMinutes: 30,
  maxSizeMb: 500,
};

const genericSteps = (what: string, share: string) => [
  `Open the ${what} you want to save and ${share}.`,
  "Paste the link into the box above, or tap Paste if it's already on your clipboard.",
  "Tap Save video. vidsave fetches the video and converts it to MP4, usually in a few seconds.",
  "Tap Download MP4 to save the file to your phone or computer.",
];

const sharedFaqs = [
  {
    q: "Is vidsave free?",
    a: "Yes. There's no sign-up, no app to install and no watermark added by vidsave.",
  },
  {
    q: "Where does the downloaded file go?",
    a: "Your browser saves it like any other download: the Downloads folder on a computer, Files on iPhone (Downloads folder) and the Downloads folder or Files app on Android. From there you can move it to your camera roll or gallery.",
  },
  {
    q: "Is it legal to download videos?",
    a: "It depends on the video and where you live. Downloading your own uploads, or videos the creator lets you reuse, is generally fine. Re-uploading other people's videos without permission usually isn't. When in doubt, ask the creator.",
  },
];

export const GUIDES: Guide[] = [
  {
    slug: "how-to-download-youtube-videos",
    platform: "youtube",
    subject: "YouTube videos",
    title: "How to download YouTube videos",
    description:
      "Save any public YouTube video as an MP4 in up to 1080p. Copy the link, paste it into vidsave and download. Works on iPhone, Android and desktop.",
    lede: "Copy the video's link, paste it below and you'll have an MP4 in a few seconds. No app, no account.",
    placeholder: "https://youtube.com/watch?v=…",
    steps: genericSteps("YouTube video", "copy its link"),
    findLink: [
      { where: "In the YouTube app", steps: ["Tap Share under the video.", "Tap Copy link."] },
      {
        where: "On a computer",
        steps: [
          "Copy the address from your browser's address bar while the video is open.",
          "Or right-click the video and choose Copy video URL.",
        ],
      },
    ],
    linkFormats: [
      "youtube.com/watch?v=…",
      "youtu.be/…",
      "youtube.com/shorts/…",
      "m.youtube.com/watch?v=…",
    ],
    notes: [
      `Videos are saved in the best quality available up to ${LIMITS.maxHeight}, as MP4 with sound.`,
      `Videos longer than ${LIMITS.maxMinutes} minutes, live streams, private videos and members-only videos can't be saved.`,
      "Timestamps in the link (like &t=90) are ignored; you always get the whole video.",
    ],
    faqs: [
      {
        q: "Can I download a whole YouTube playlist?",
        a: "Not at the moment. vidsave saves one video at a time. If you paste a playlist link that also contains a video, you'll get that video.",
      },
      {
        q: "Why does a YouTube video sometimes fail?",
        a: "YouTube occasionally limits automated downloads. Wait a minute and try again; most videos go through on a second try.",
      },
      ...sharedFaqs,
    ],
  },
  {
    slug: "how-to-download-youtube-shorts",
    platform: "youtube",
    subject: "YouTube Shorts",
    title: "How to download YouTube Shorts",
    description:
      "Download YouTube Shorts as vertical MP4 videos with sound. Copy the Short's link, paste it into vidsave and save it to your phone.",
    lede: "Shorts save as full-quality vertical MP4s. Copy the link from the Share menu and paste it here.",
    placeholder: "https://youtube.com/shorts/…",
    steps: genericSteps("Short", "copy its link from the Share menu"),
    findLink: [
      {
        where: "In the YouTube app",
        steps: ["While the Short is playing, tap Share (the arrow on the right).", "Tap Copy link."],
      },
      { where: "On a computer", steps: ["Copy the youtube.com/shorts/… address from the address bar."] },
    ],
    linkFormats: ["youtube.com/shorts/…", "youtu.be/…"],
    notes: [
      "Shorts keep their vertical 9:16 shape, so they're ready to share in Stories or Reels.",
      `Quality goes up to ${LIMITS.maxHeight}, depending on what the creator uploaded.`,
    ],
    faqs: [
      {
        q: "Will the Short have sound?",
        a: "Yes. Audio and video are combined into a single MP4.",
      },
      ...sharedFaqs,
    ],
  },
  {
    slug: "how-to-download-instagram-videos",
    platform: "instagram",
    subject: "Instagram videos",
    title: "How to download Instagram videos",
    description:
      "Save videos from public Instagram posts and Reels as MP4. Copy the post link, paste it into vidsave and download. No login needed.",
    lede: "Works with any public post or Reel. Copy the link from Instagram, paste it below and download the MP4.",
    placeholder: "https://www.instagram.com/p/…",
    steps: genericSteps("Instagram post", "copy its link"),
    findLink: [
      {
        where: "In the Instagram app",
        steps: [
          "Tap the paper-plane icon under the post (or ⋯ in the top corner).",
          "Tap Copy link.",
        ],
      },
      { where: "On instagram.com", steps: ["Open the post and copy the address from the address bar."] },
    ],
    linkFormats: ["instagram.com/p/…", "instagram.com/reel/…", "instagram.com/tv/…"],
    notes: [
      "Only public accounts work. Posts from private accounts can't be fetched without logging in, and vidsave never asks for your password.",
      "If a post has several videos (a carousel), the first video is saved.",
      "Stories and highlights aren't supported.",
    ],
    faqs: [
      {
        q: "Can I download Instagram Stories?",
        a: "No. Stories require being logged in to Instagram, so vidsave can't fetch them.",
      },
      {
        q: "Does the person get notified when I download their video?",
        a: "No. vidsave reads the public post the same way a browser does; Instagram doesn't notify anyone.",
      },
      ...sharedFaqs,
    ],
  },
  {
    slug: "how-to-download-instagram-reels",
    platform: "instagram",
    subject: "Instagram Reels",
    title: "How to download Instagram Reels",
    description:
      "Download Instagram Reels as MP4 with audio. Copy the Reel link, paste it into vidsave and save it to your camera roll.",
    lede: "Copy a Reel's link, paste it below and save it as an MP4 with the original audio.",
    placeholder: "https://www.instagram.com/reel/…",
    steps: genericSteps("Reel", "copy its link"),
    findLink: [
      {
        where: "In the Instagram app",
        steps: ["Tap the paper-plane icon on the right side of the Reel.", "Tap Copy link."],
      },
      { where: "On instagram.com", steps: ["Open the Reel and copy the instagram.com/reel/… address."] },
    ],
    linkFormats: ["instagram.com/reel/…", "instagram.com/reels/…", "instagram.com/p/…"],
    notes: [
      "Reels from public accounts only.",
      "The saved file keeps the Reel's vertical format and original audio.",
    ],
    faqs: [
      {
        q: "How do I get the Reel into my camera roll on iPhone?",
        a: "After tapping Download MP4, open the Files app, find the video in Downloads, tap Share and choose Save Video.",
      },
      ...sharedFaqs,
    ],
  },
  {
    slug: "how-to-download-tiktok-videos",
    platform: "tiktok",
    subject: "TikTok videos",
    title: "How to download TikTok videos",
    description:
      "Save TikTok videos as MP4. Copy the video link from TikTok's Share menu, paste it into vidsave and download. Short vm.tiktok.com links work too.",
    lede: "Paste a TikTok link, including the short ones from the Share menu, and download the video as an MP4.",
    placeholder: "https://www.tiktok.com/@user/video/…",
    steps: genericSteps("TikTok", "copy its link"),
    findLink: [
      {
        where: "In the TikTok app",
        steps: ["Tap Share (the arrow on the right).", "Tap Copy link."],
      },
      { where: "On tiktok.com", steps: ["Open the video and copy the address from the address bar."] },
    ],
    linkFormats: ["tiktok.com/@user/video/…", "vm.tiktok.com/…", "vt.tiktok.com/…", "tiktok.com/t/…"],
    notes: [
      "Public videos only. Private videos and videos limited to friends can't be saved.",
      "Photo slideshows aren't videos, so they can't be saved as MP4.",
    ],
    faqs: [
      {
        q: "Do the short vm.tiktok.com links work?",
        a: "Yes. Paste them exactly as TikTok gives them to you.",
      },
      ...sharedFaqs,
    ],
  },
  {
    slug: "how-to-download-twitter-videos",
    platform: "x",
    subject: "X (Twitter) videos",
    title: "How to download X (Twitter) videos",
    description:
      "Download videos and GIFs from X (formerly Twitter) as MP4. Copy the post link, paste it into vidsave and save it. Works with x.com and twitter.com links.",
    lede: "Copy the post's link, paste it below and download the video or GIF as an MP4.",
    placeholder: "https://x.com/user/status/…",
    steps: genericSteps("post", "copy its link"),
    findLink: [
      {
        where: "In the X app",
        steps: ["Tap the Share icon under the post.", "Tap Copy link."],
      },
      { where: "On x.com", steps: ["Click the post to open it, then copy the address from the address bar."] },
    ],
    linkFormats: ["x.com/user/status/…", "twitter.com/user/status/…", "mobile.twitter.com/…"],
    notes: [
      "GIFs on X are really short videos, so they download as MP4 files.",
      "If a post has more than one video, the first one is saved.",
      "Posts from protected accounts can't be saved.",
    ],
    faqs: [
      {
        q: "Do old twitter.com links still work?",
        a: "Yes. twitter.com and x.com links both work.",
      },
      ...sharedFaqs,
    ],
  },
  {
    slug: "how-to-download-reddit-videos",
    platform: "reddit",
    subject: "Reddit videos",
    title: "How to download Reddit videos",
    description:
      "Download Reddit videos with sound as a single MP4. Copy the post link, paste it into vidsave and download. Works with share links from the Reddit app.",
    lede: "Reddit stores video and sound separately. vidsave joins them into one MP4 so your download isn't silent.",
    placeholder: "https://www.reddit.com/r/…/comments/…",
    steps: genericSteps("Reddit post", "copy its link"),
    findLink: [
      { where: "In the Reddit app", steps: ["Tap Share under the post.", "Tap Copy link."] },
      { where: "On reddit.com", steps: ["Open the post and copy the address from the address bar."] },
    ],
    linkFormats: ["reddit.com/r/…/comments/…", "reddit.com/r/…/s/… (app share links)", "redd.it/…", "old.reddit.com/…"],
    notes: [
      "The video's sound is merged in automatically.",
      "Only videos uploaded to Reddit work. If a post links to YouTube or another site, open that link and paste it here instead.",
      "Posts from private or quarantined subreddits can't be saved.",
    ],
    faqs: [
      {
        q: "Why do other Reddit downloads have no sound?",
        a: "Reddit serves the audio as a separate file. Tools that only grab the video stream end up silent. vidsave downloads both and combines them.",
      },
      ...sharedFaqs,
    ],
  },
  {
    slug: "how-to-download-vimeo-videos",
    platform: "vimeo",
    subject: "Vimeo videos",
    title: "How to download Vimeo videos",
    description:
      "Download public Vimeo videos as MP4 in up to 1080p. Copy the vimeo.com link, paste it into vidsave and save the file.",
    lede: "Paste any public Vimeo link, including unlisted links you've been sent, and download it as an MP4.",
    placeholder: "https://vimeo.com/…",
    steps: genericSteps("Vimeo video", "copy its link"),
    findLink: [
      {
        where: "On vimeo.com",
        steps: ["Open the video and copy the address from the address bar.", "Or click Share and copy the link."],
      },
    ],
    linkFormats: ["vimeo.com/123456789", "vimeo.com/123456789/abcdef1234 (unlisted)", "player.vimeo.com/video/…"],
    notes: [
      `Quality goes up to ${LIMITS.maxHeight}.`,
      "Some Vimeo videos are DRM-protected or password-protected. Those can't be downloaded.",
      "Videos that only play when embedded on a specific website may not work.",
    ],
    faqs: [
      {
        q: "Can I download an unlisted Vimeo video?",
        a: "Yes, if you have the full link including the code after the video number (vimeo.com/123456789/abcdef1234).",
      },
      ...sharedFaqs,
    ],
  },
];

export function getGuide(slug: string) {
  return GUIDES.find((g) => g.slug === slug);
}
