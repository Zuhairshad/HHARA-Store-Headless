// Monorail proxy for Shopify WPM batch posts.
// Always returns 200 — tracking failures must never affect commerce.
import { NextRequest, NextResponse } from "next/server";

const MONORAIL_URL = "https://monorail-edge.shopifysvc.com/unstable/produce_batch";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
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
