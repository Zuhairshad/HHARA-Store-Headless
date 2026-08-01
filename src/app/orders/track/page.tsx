import type { Metadata } from "next";
import TrackClient from "./TrackClient";
import "./track.css";

export const metadata: Metadata = {
  title: "Track your order · HHARA",
  description: "Look up your HHARA order and follow its journey to your door.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type SearchParams = { order?: string; email?: string };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  return (
    <TrackClient
      initialOrderName={params.order ?? ""}
      initialEmail={params.email ?? ""}
    />
  );
}
