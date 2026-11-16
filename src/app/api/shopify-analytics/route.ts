// Monorail proxy for Shopify WPM batch posts.
// Always returns 200 — tracking failures must never affect commerce.
import { NextRequest, NextResponse } from "next/server";

const MONORAIL_URL = "https://monorail-edge.shopifysvc.com/unstable/produce_batch";

const MAX_BODY_BYTES = 64 * 1024;

// Only our own pages post here; a request that names another origin is rejected. (No Origin header = not a browser
// cross-site request, e.g. sendBeacon from the same site on some browsers, so it is allowed.)
function isForeignOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    return new URL(origin).host !== host;
  } catch {
    return true;
  }
}

export async function POST(request: NextRequest) {
  if (isForeignOrigin(request)) return new NextResponse(null, { status: 403 });
  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) return new NextResponse(null, { status: 413 });
  try {
    const body = await request.text();
    if (body.length > MAX_BODY_BYTES) return new NextResponse(null, { status: 413 });
    await fetch(MONORAIL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
  } catch {
    // silently ignore
  }
  return new NextResponse(null, { status: 200 });
}

export async function GET() {
  return new NextResponse(null, { status: 200 });
}
