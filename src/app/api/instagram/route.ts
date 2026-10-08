import { NextResponse } from "next/server";

// Latest Instagram posts for the homepage strip, read from a Behold JSON feed (behold.so).
// Set BEHOLD_FEED_URL to the feed link Behold gives you. Without it, or if Behold fails,
// this returns no posts and the homepage keeps showing its built-in photos.
export const revalidate = 3600; // check for new posts at most once an hour

const LIMIT = 6;

type Post = { id: string; image: string; link: string; type: "image" | "video" | "carousel" };

export async function GET() {
  const feedUrl = process.env.BEHOLD_FEED_URL;
  if (!feedUrl) return NextResponse.json({ posts: [] });

  try {
    const res = await fetch(feedUrl, { next: { revalidate } });
    if (!res.ok) throw new Error(`Behold responded ${res.status}`);
    const data = await res.json();
    // Newer Behold feeds wrap posts in { posts: [...] }; older ones are a plain array.
    const raw: any[] = Array.isArray(data) ? data : data?.posts || [];

    const posts: Post[] = raw
      .map((p) => {
        // Videos and reels use their cover image; Behold's resized copies are preferred over the original.
        const image =
          p.sizes?.medium?.mediaUrl ||
          p.sizes?.large?.mediaUrl ||
          (p.mediaType === "VIDEO" ? p.thumbnailUrl : p.mediaUrl) ||
          p.thumbnailUrl;
        const type = p.mediaType === "VIDEO" ? "video" : p.mediaType === "CAROUSEL_ALBUM" ? "carousel" : "image";
        return { id: String(p.id), image, link: p.permalink, type } as Post;
      })
      .filter((p) => p.image && p.link)
      .slice(0, LIMIT);

    return NextResponse.json({ posts });
  } catch (err) {
    console.error("Instagram feed error:", err);
    return NextResponse.json({ posts: [] });
  }
}
