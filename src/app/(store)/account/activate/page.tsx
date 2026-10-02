import type { Metadata } from "next";
import SetPasswordClient from "../SetPasswordClient";
import "../../orders/track/track.css";

export const metadata: Metadata = {
  title: "Activate your account · HHARA",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

// Linked from Shopify's email as /account/activate?url={{ customer.account_activation_url | url_encode }}
export default async function Page({ searchParams }: { searchParams: Promise<{ url?: string }> }) {
  const { url } = await searchParams;
  return <SetPasswordClient kind="activate" link={url ?? ""} />;
}
