import type { Metadata } from "next";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://hhara-store-headless.vercel.app").replace(/\/$/, "");

// Until launch, store pages stay reachable (e.g. for payment-provider review) but are
// hidden from search engines; only the coming-soon page at "/" is indexable.
// Set NEXT_PUBLIC_SITE_LAUNCHED="true" on launch day.
export const IS_LAUNCHED = process.env.NEXT_PUBLIC_SITE_LAUNCHED === "true";

export const SITE_NAME = "HHARA";
export const DEFAULT_DESCRIPTION =
  "Unapologetically You. Four elevated essentials. Two timeless colourways. Designed to move effortlessly through every version of your day.";
export const DEFAULT_OG_IMAGE = "/images/lucy-home-hero.png";

export const KEYWORDS = [
  "HHARA",
  "luxury activewear",
  "women's activewear UAE",
  "activewear Dubai",
  "sustainable activewear",
  "recycled performance wear",
  "considered luxury",
  "matching workout set",
  "leggings and sports bra set",
  "Imara Set",
  "Dahlia Set",
  "Maison HHARA",
];

// Pages that should never be indexed (customer-specific or utility).
export const PRIVATE_PATHS = ["/api/", "/account", "/orders", "/wishlist"];

type PageSeo = { title: string; description: string; noindex?: boolean };

export const PAGES: Record<string, PageSeo> = {
  "/home": {
    title: "HHARA | Luxury Women's Activewear, Designed in the UAE",
    description: DEFAULT_DESCRIPTION,
  },
  "/shop": {
    title: "Shop Luxury Activewear Sets | HHARA",
    description:
      "Shop the HHARA capsule: the Imara and Dahlia sets in Chicory Brown and Olive. Recycled performance fabric, sculpting fit, made to outlast.",
  },
  "/lookbook": {
    title: "Lookbook — She is Wonder | HHARA",
    description: "The HHARA She is Wonder campaign. The Imara and Dahlia sets, photographed across the UAE.",
  },
  "/journal": {
    title: "The Journal | HHARA",
    description:
      "Stories on material transparency, circular luxury and the women behind HHARA — from recycled knits to our 10% social impact directive.",
  },
  "/atelier": {
    title: "The Atelier — How HHARA Is Made",
    description:
      "Inside the HHARA atelier: regenerative recycled knits, minimal production and garments engineered to outlast trends.",
  },
  "/stores": {
    title: "Stores & Stockists | HHARA",
    description: "Where to find HHARA luxury activewear.",
  },
  "/size-guide": {
    title: "Size Guide | HHARA Activewear",
    description: "Find your HHARA fit. Measurements for the Imara and Dahlia leggings, bras and sets.",
  },
  "/faq": {
    title: "FAQ | HHARA",
    description: "Answers on HHARA orders, sizing, fabric care, shipping across the UAE and returns.",
  },
  "/shipping": {
    title: "Shipping & Delivery | HHARA",
    description: "Carbon-neutral shipping from our UAE base. Delivery times, costs and tracking for HHARA orders.",
  },
  "/returns": {
    title: "Returns & Exchanges | HHARA",
    description: "How to return or exchange your HHARA order.",
  },
  "/contact": {
    title: "Contact | HHARA",
    description: "Get in touch with HHARA client care for orders, sizing and press.",
  },
  "/gift-card": {
    title: "Gift Cards | HHARA",
    description: "Give the gift of wonder. HHARA digital gift cards for luxury activewear.",
  },
  "/privacy": { title: "Privacy Policy | HHARA", description: "How HHARA collects, uses and protects your data." },
  "/terms": { title: "Terms of Service | HHARA", description: "The terms that govern purchases from HHARA." },
  "/account": { title: "My Account | HHARA", description: "Your HHARA account.", noindex: true },
  "/orders/track": { title: "Track Your Order | HHARA", description: "Track your HHARA order.", noindex: true },
  "/wishlist": { title: "Wishlist | HHARA", description: "Your saved HHARA pieces.", noindex: true },
};

export function pageMetadata(path: keyof typeof PAGES): Metadata {
  const page = PAGES[path];
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: path },
    openGraph: {
      title: page.title,
      description: page.description,
      url: path,
      siteName: SITE_NAME,
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: page.title }],
      type: "website",
    },
    twitter: { card: "summary_large_image", title: page.title, description: page.description },
    ...(page.noindex ? { robots: { index: false, follow: false } } : {}),
  };
}

export const JOURNAL_ARTICLES = [
  { id: "j1", title: "From plastic waste to performance grade", excerpt: "Inside the regenerative knit: how ocean and industrial plastic become a sensory-grade fabric.", date: "2026-05-26" },
  { id: "j2", title: "On Chicory Brown and Olive", excerpt: "Two colorways, two languages. Choosing pigments that capture mineral earth and inner energy.", date: "2026-05-14" },
  { id: "j3", title: "Why we make only four pieces", excerpt: "The case for minimalist production: fewer SKUs, lower waste, garments engineered to outlast.", date: "2026-05-02" },
  { id: "j4", title: "Wonder, Worn", excerpt: "Three women, two sets: the Imara and Dahlia, photographed across the UAE.", date: "2026-04-21" },
  { id: "j5", title: "Carbon-neutral, from the UAE", excerpt: "How optimised smart-freight from our regional base offsets every single shipment.", date: "2026-04-08" },
  { id: "j6", title: "The 10% directive", excerpt: "Where the philanthropic share goes: women-led literacy, micro-endowments, and clean water alliances.", date: "2026-03-27" },
];

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/images/hhara-logo.png`,
      slogan: "She is Wonder",
      description: DEFAULT_DESCRIPTION,
      sameAs: ["https://instagram.com/thisishhara"],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: SITE_URL,
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
  ],
};
