import type { Metadata } from "next";
import { GIFT_CARDS_ENABLED } from "./gift-card";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.hhara.com").replace(/\/$/, "");

// Until launch, the store is reachable but hidden from search engines.
// Set NEXT_PUBLIC_SITE_LAUNCHED="true" on launch day to let it be indexed.
export const IS_LAUNCHED = process.env.NEXT_PUBLIC_SITE_LAUNCHED === "true";

export const SITE_NAME = "HHARA";
export const DEFAULT_TITLE = "HHARA | Luxury Women's Athleisure from the UAE";
export const DEFAULT_DESCRIPTION =
  "HHARA is a luxury women's athleisure label from the UAE. Shop the Imara and Dahlia sets in Chicory Brown and Olive, made in certified recycled fabric.";

// Who operates the brand. Stating it everywhere (schema, footer) is what separates HHARA from similarly named brands.
export const LEGAL_NAME = "Dahlia Moxie Trading LLC";
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const BRAND_ID = `${SITE_URL}/#brand`;
export const DEFAULT_OG_IMAGE = "/images/og-image.jpg";

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
export const PRIVATE_PATHS = ["/api/", "/account", "/orders", "/wishlist", "/pre-checkout"];

type PageSeo = { title: string; description: string; noindex?: boolean };

export const PAGES: Record<string, PageSeo> = {
  "/": {
    title: DEFAULT_TITLE,
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
  "/about-us": {
    title: "About HHARA — Luxury Women's Athleisure from the UAE",
    description:
      "HHARA is a luxury women's athleisure label from the UAE, by Dahlia Moxie Trading LLC: recycled knits, minimal production, garments made to outlast trends.",
  },
  "/social-impact": {
    title: "Social Impact | HHARA",
    description: "How HHARA gives back: our social impact commitments and the communities we support.",
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
    title: "Returns & Refunds | HHARA",
    description: "How to return your HHARA order and get a refund.",
  },
  "/contact": {
    title: "Contact | HHARA",
    description: "Get in touch with HHARA client care for orders, sizing and press.",
  },
  "/gift-card": {
    title: "Gift Cards | HHARA",
    description: "Give the gift of wonder. HHARA digital gift cards for luxury activewear.",
    noindex: !GIFT_CARDS_ENABLED,
  },
  "/privacy": { title: "Privacy Policy | HHARA", description: "How HHARA collects, uses and protects your data." },
  "/terms": { title: "Terms of Service | HHARA", description: "The terms that govern purchases from HHARA." },
  "/account": { title: "My Account | HHARA", description: "Your HHARA account.", noindex: true },
  "/orders/track": { title: "Track Your Order | HHARA", description: "Track your HHARA order.", noindex: true },
  "/wishlist": { title: "Wishlist | HHARA", description: "Your saved HHARA pieces.", noindex: true },
  "/pre-checkout": { title: "Your Bag | HHARA", description: "Review your HHARA bag before checkout.", noindex: true },
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

// Facts still to add once the client confirms them: foundingDate, founder, full address,
// contactPoint, vatID (UAE TRN) and the trade licence number. Never publish placeholders.
export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      // Google recommends OnlineStore (a subtype of Organization) for ecommerce sites
      "@type": "OnlineStore",
      "@id": ORGANIZATION_ID,
      name: SITE_NAME,
      legalName: LEGAL_NAME,
      // Never add misspellings or other brands' names here: that would tell Google they are the same brand
      alternateName: ["HHARA Athleisure", "HHARA Activewear", "This is HHARA"],
      url: `${SITE_URL}/`,
      logo: `${SITE_URL}/images/hhara-logo.png`,
      image: `${SITE_URL}${DEFAULT_OG_IMAGE}`,
      slogan: "She is Wonder",
      description: DEFAULT_DESCRIPTION,
      disambiguatingDescription:
        "HHARA, spelled H-H-A-R-A, is an independent luxury athleisure label based in the United Arab Emirates and sold at hhara.com.",
      address: { "@type": "PostalAddress", addressCountry: "AE" },
      areaServed: "AE",
      brand: { "@id": BRAND_ID },
      // Official profiles, so Google ties them to this brand (and not to other businesses called HHARA)
      sameAs: [
        "https://www.instagram.com/thisishhara",
        "https://www.tiktok.com/@thisishhara",
        "https://www.facebook.com/hharabrands",
        "https://www.linkedin.com/company/thisishhara",
        "https://x.com/thisishhara",
      ],
    },
    {
      "@type": "Brand",
      "@id": BRAND_ID,
      name: SITE_NAME,
      url: `${SITE_URL}/`,
      logo: `${SITE_URL}/images/hhara-logo.png`,
      slogan: "She is Wonder",
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: SITE_NAME,
      alternateName: ["HHARA Official Store", "hhara.com"],
      url: `${SITE_URL}/`,
      inLanguage: "en",
      publisher: { "@id": ORGANIZATION_ID },
    },
  ],
};
