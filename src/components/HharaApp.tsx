"use client";
// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react/no-unescaped-entities */
import React, { useState, useEffect, useRef, useContext, createContext, lazy, Suspense } from "react";
import { addLine as serverAddLine, updateLine as serverUpdateLine, removeLine as serverRemoveLine, applyDiscountCode as serverApplyDiscount } from "@/lib/cart-actions";
import { signIn as serverSignIn, signUp as serverSignUp, signOut as serverSignOut } from "@/lib/customer-actions";
import { subscribeNewsletter as serverSubscribe } from "@/lib/newsletter-actions";
const ImpactMap = lazy(() => import("./ImpactMap"));

const ProductsContext = createContext(null);
const ShopifyCartContext = createContext(null);
const CustomerContext = createContext(null);
const useProducts = () => useContext(ProductsContext) || [];
const useShopifyCart = () => useContext(ShopifyCartContext);
const useCustomer = () => useContext(CustomerContext);

// HHARA storefront - ported from the original React/Babel source to Next.js client component.
// All images served from /public/images/<id>.jpg (extracted from the original bundle).

// === FILE 01-b6b9dc0b-6bb4-4d8a-80b7-a33784b3f496.jsx ===
// ============ ICONS ============
const Icon = {
  Search: () => (
    <svg className="icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"></circle><line x1="16.5" y1="16.5" x2="21" y2="21"></line></svg>
  ),
  Bag: () => (
    <svg className="icon" viewBox="0 0 24 24"><path d="M5 8h14l-1 12H6L5 8z"></path><path d="M9 8V6a3 3 0 0 1 6 0v2"></path></svg>
  ),
  Account: () => (
    <svg className="icon" viewBox="0 0 24 24"><circle cx="12" cy="9" r="3.5"></circle><path d="M5 20c1.5-3.5 4-5 7-5s5.5 1.5 7 5"></path></svg>
  ),
  Heart: () => (
    <svg className="icon" viewBox="0 0 24 24"><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"></path></svg>
  ),
  Close: () => (
    <svg className="icon" viewBox="0 0 24 24"><line x1="5" y1="5" x2="19" y2="19"></line><line x1="19" y1="5" x2="5" y2="19"></line></svg>
  ),
  Plus: () => (
    <svg className="icon" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
  ),
  Minus: () => (
    <svg className="icon" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
  ),
  Arrow: () => (
    <svg className="icon" viewBox="0 0 24 24"><line x1="4" y1="12" x2="20" y2="12"></line><polyline points="14 6 20 12 14 18"></polyline></svg>
  ),
  Chevron: ({ dir = "down" }) => {
    const rot = { down: 0, up: 180, left: 90, right: -90 }[dir] || 0;
    return (
      <svg className="icon" viewBox="0 0 24 24" style={{ transform: `rotate(${rot}deg)` }}><polyline points="6 9 12 15 18 9"></polyline></svg>
    );
  },
  Filter: () => (
    <svg className="icon" viewBox="0 0 24 24"><line x1="4" y1="7" x2="20" y2="7"></line><line x1="6" y1="12" x2="18" y2="12"></line><line x1="9" y1="17" x2="15" y2="17"></line></svg>
  ),
  Grid: () => (
    <svg className="icon" viewBox="0 0 24 24"><rect x="4" y="4" width="7" height="7"></rect><rect x="13" y="4" width="7" height="7"></rect><rect x="4" y="13" width="7" height="7"></rect><rect x="13" y="13" width="7" height="7"></rect></svg>
  ),
  Truck: () => (
    <svg className="icon" viewBox="0 0 24 24"><rect x="2" y="7" width="12" height="10"></rect><path d="M14 10h4l3 3v4h-7"></path><circle cx="6.5" cy="18" r="1.8"></circle><circle cx="17.5" cy="18" r="1.8"></circle></svg>
  ),
  Box: () => (
    <svg className="icon" viewBox="0 0 24 24"><path d="M3 7l9-4 9 4-9 4-9-4z"></path><path d="M3 7v10l9 4 9-4V7"></path></svg>
  ),
  Leaf: () => (
    <svg className="icon" viewBox="0 0 24 24"><path d="M20 4c-9 0-16 5-16 12 0 2 1 4 1 4s7-1 11-5 4-11 4-11z"></path></svg>
  ),
  Menu: () => (
    <svg className="icon" viewBox="0 0 24 24"><line x1="3" y1="8" x2="21" y2="8"></line><line x1="3" y1="16" x2="21" y2="16"></line></svg>
  ),
  Eye: () => (
    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  Person: () => (
    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Reels: () => (
    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="m10 15 5-3-5-3v6Z" />
      <path d="m2 12 5-3" />
      <path d="m22 12-5 3" />
    </svg>
  ),
  Carousel: () => (
    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="16" height="16" rx="2" />
      <path d="M6 2h14a2 2 0 0 1 2 2v14" />
    </svg>
  ),
};

// === FILE 02-72355d57-9aeb-459e-aa3c-d2195cb6f26b.jsx ===
// Image library - using picsum.photos with seeds for reliable, consistent imagery.
// Grayscale + warm overlay (via CSS) gives the cohesive luxury feel.
// All picsum images are free for any use (CC-licensed Unsplash photos).

const IMGS: Record<string, string> = {
  hero1: "/images/tala_hero1_desktop.jpg",
  hero2: "/images/tala_hero2_desktop.jpg",
  hero3: "/images/hero3.png",
  catOuter: "/images/catOuter.jpg",
  catRTW: "/images/catRTW.jpg",
  catAcc: "/images/catAcc.jpg",
  p1a: "/images/p1a.jpg",
  p1b: "/images/p1b.jpg",
  p2a: "/images/p2a.jpg",
  p2b: "/images/p2b.jpg",
  p3a: "/images/p3a.jpg",
  p3b: "/images/p3b.jpg",
  p4a: "/images/p4a.jpg",
  p4b: "/images/p4b.jpg",
  p5a: "/images/p5a.jpg",
  p5b: "/images/p5b.jpg",
  p6a: "/images/p6a.jpg",
  p6b: "/images/p6b.jpg",
  p7a: "/images/p7a.jpg",
  p7b: "/images/p7b.jpg",
  p8a: "/images/p8a.jpg",
  p8b: "/images/p8b.jpg",
  editAtelier: "/images/tala_cocoon_desktop.png",
  atelierHero: "/images/atelierHero.jpg",
  atelierFlorence: "/images/atelierFlorence.jpg",
  atelierCloth: "/images/atelierCloth.jpg",
  atelierVideo: "/images/atelierVideo.jpg",
  lb1: "/images/lb1.jpg",
  lb2: "/images/lb2.jpg",
  lb3: "/images/lb3.jpg",
  lb4: "/images/lb4.jpg",
  lb5: "/images/lb5.jpg",
  lb6: "/images/lb6.jpg",
  lb7: "/images/lb7.jpg",
  lb8: "/images/lb8.jpg",
  lb9: "/images/lb9.jpg",
  j1: "/images/j1.jpg",
  j2: "/images/j2.jpg",
  j3: "/images/j3.jpg",
  j4: "/images/j4.jpg",
  j5: "/images/j5.jpg",
  j6: "/images/j6.jpg",
  jHero: "/images/jHero.jpg",
  jFig1: "/images/jFig1.jpg",
  jFig2: "/images/jFig2.jpg",
  sMilan: "/images/sMilan.jpg",
  sParis: "/images/sParis.jpg",
  sTokyo: "/images/sTokyo.jpg",
  sNY: "/images/sNY.jpg",
  sLondon: "/images/sLondon.jpg",
  sDubai: "/images/sDubai.jpg",
  authMedia: "/images/authMedia.jpg",
  mmShop: "/images/mmShop.jpg",
  mmAtelier: "/images/mmAtelier.jpg"
};


// Free public-domain test video (Big Buck Bunny - used as motion placeholder)
// The video is replaced with a CSS ken-burns image overlay on the hero by default,
// but the URL is available for any video slots that need real motion.
const VIDEOS = {
  // A short, free, public-domain motion loop. If it fails, the poster image shows.
  motion1: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  motion2: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
};


// If the standalone bundler has inlined resources, swap URLs for blob URLs.
// (No-op in dev - window.__resources is undefined.)
// === FILE 03-86b13194-7123-4c2d-b78b-2d8d56c0148a.jsx ===
// HHARA product catalog - 2 capsules, 4 SKUs. Prices/sizes are placeholders until confirmed.
const PRODUCTS = [
  {
    id: "p1",
    name: "Imara Bra",
    cat: "The Imara Set",
    price: 0,
    swatches: [
      { name: "Chicory Coffee", hex: "#3D2B1F" },
      { name: "Olive Green", hex: "#5F6B4F" },
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    tone: "tone-2",
    altTone: "tone-3",
    badge: "New",
    imgKey: "p1",
    tagline: "Sculpted scoop-neck support",
    description: "A refined essential designed for movement, confidence, and everyday elegance.\n\nThe Imara Crisscross Bra embraces your natural shape with a smooth, supportive feel and a flattering fit that moves effortlessly with you. Designed with a balance of comfort and structure, it provides the confidence to flow from mindful workouts to elevated everyday moments.\n\nA timeless piece you'll reach for again and again.",
    details: [
      "Premium recycled performance knit",
      "Brushed-gold low-friction hardware",
      "Hidden internal support band",
      "Machine wash cold · do not tumble dry",
    ],
  },
  {
    id: "p2",
    name: "Imara Legging",
    cat: "The Imara Set",
    price: 0,
    swatches: [
      { name: "Chicory Coffee", hex: "#3D2B1F" },
      { name: "Olive Green", hex: "#5F6B4F" },
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    tone: "tone-1",
    altTone: "tone-6",
    badge: "New",
    imgKey: "p2",
    tagline: "Anatomical high-waist support",
    description: "Precision-engineered 7/8 ankle-skimming crop with our signature anatomical chevron-contoured waistband. Zero-slip high-waisted stabilization, flatlock structural seaming.",
    details: [
      "7/8 ankle-skimming length",
      "Chevron anatomical waistband",
      "Zero-slip stabilization",
      "Machine wash cold · do not tumble dry",
    ],
  },
  {
    id: "p3",
    name: "Dahlia Bra",
    cat: "The Dahlia Set",
    price: 0,
    swatches: [
      { name: "Chicory Coffee", hex: "#3D2B1F" },
      { name: "Olive Green", hex: "#5F6B4F" },
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    tone: "tone-7",
    altTone: "tone-3",
    imgKey: "p3",
    tagline: "Adaptive cross-back design",
    description: "Low-profile cross-back strap construction with custom brushed-gold hardware accents. Medium-impact adaptive support, open-back thermal ventilation, removable contour cups.",
    details: [
      "Cross-back strap architecture",
      "Brushed-gold hardware accents",
      "Removable contour cups",
      "Machine wash cold · do not tumble dry",
    ],
  },
  {
    id: "p4",
    name: "Dahlia Short",
    cat: "The Dahlia Set",
    price: 0,
    swatches: [
      { name: "Chicory Coffee", hex: "#3D2B1F" },
      { name: "Olive Green", hex: "#5F6B4F" },
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    tone: "tone-6",
    altTone: "tone-1",
    imgKey: "p4",
    tagline: "Omnidirectional stretch short",
    description: "High-rise optimization with a 5\" non-restrictive inseam. Omnidirectional 4-way mechanical stretch matrix with targeted muscular stabilization and an integrated secure inner waistband pocket.",
    details: [
      "5\" inseam, high-rise",
      "4-way mechanical stretch",
      "Hidden inner waistband pocket",
      "Machine wash cold · do not tumble dry",
    ],
  },
];

// Name-meaning boxes shown on the PDP, keyed by capsule (product.cat)
const ORIGIN_MEANING = {
  "The Imara Set": {
    word: "Imara",
    tag: "Swahili",
    text: "Imara means strong, firm, resolute - a name carried by those who move through the world with quiet resilience. The Imara Set was made for her.",
    tagline: "Strong • Firm • Resolute",
    subtitle: "Created for the woman who carries her strength with quiet confidence.",
  },
  "The Dahlia Set": {
    word: "Dahlia",
    tag: "Arabic",
    text: "Dahlia means delicate - a name carried by those who move through the world with quiet precision and effortless grace. The Dahlia Set was made for her.",
    tagline: "Gentle • Tender • Delicate",
    subtitle: "Created for the woman who moves with quiet precision and effortless grace.",
  },
};

// Spec-table rows shown on the PDP, keyed by product name
const PRODUCT_SPECS = {
  "Imara Bra": [
    { k: "Support", v: "High-impact scoop-neck structure" },
    { k: "Coverage", v: "Full front coverage, moisture-wicking" },
    { k: "Detail", v: "Brushed-gold structural hardware" },
    { k: "Construction", v: "Hidden support band, capillary ventilation" },
    { k: "Feel", v: "High-density double-knit" },
    { k: "Pair With", v: "Imara Legging" },
  ],
  "Imara Legging": [
    { k: "Support", v: "Zero-slip high-waisted stabilization" },
    { k: "Coverage", v: "7/8 ankle-skimming length" },
    { k: "Detail", v: "Chevron anatomical waistband" },
    { k: "Construction", v: "Flatlock structural seaming" },
    { k: "Feel", v: "Second-skin compression knit" },
    { k: "Pair With", v: "Imara Bra" },
  ],
  "Dahlia Bra": [
    { k: "Support", v: "Medium-impact adaptive structure" },
    { k: "Coverage", v: "Full front coverage, open back" },
    { k: "Detail", v: "Cross-back straps, adjustable" },
    { k: "Construction", v: "Flat seam, no-chafe finish" },
    { k: "Feel", v: "Second-skin compression" },
    { k: "Pair With", v: "Dahlia Short" },
  ],
  "Dahlia Short": [
    { k: "Support", v: "Targeted muscular stabilization" },
    { k: "Coverage", v: "5\" inseam, high-rise" },
    { k: "Detail", v: "Hidden inner waistband pocket" },
    { k: "Construction", v: "Omnidirectional 4-way mechanical stretch" },
    { k: "Feel", v: "Second-skin compression" },
    { k: "Pair With", v: "Dahlia Bra" },
  ],
};

// Tagline fallback for products loaded live from Shopify (which carry no tagline field)
const PRODUCT_TAGLINES = {
  "Imara Bra": "Sculpted scoop-neck support",
  "Imara Legging": "Anatomical high-waist support",
  "Dahlia Bra": "Adaptive cross-back design",
  "Dahlia Short": "Omnidirectional stretch short",
};

// Featured / homepage subsets
const FEATURED_IDS = ["p1", "p2", "p3", "p4"];
const NEW_IDS = ["p1", "p2", "p3", "p4"];

const CATEGORIES = [
  { id: "imara", name: "The Imara Set", count: 2, tone: "tone-3" },
  { id: "dahlia", name: "The Dahlia Set", count: 2, tone: "tone-1" },
];

const HEROES = [
  {
    eyebrow: "",
    title: "She Is |Wonder.",
    sub: "She doesn’t wait for wonder - she creates it. Designed for women who move with quiet confidence and purpose.",
    cta: "explore collection",
    tone: "tone-4",
  },
];

const HHRAA_DATA = { PRODUCTS, FEATURED_IDS, NEW_IDS, CATEGORIES, HEROES };

// === FILE 04-af48d016-3e9e-4c3b-ac6a-19f515101d8e.jsx ===

function Announce() {
  const [index, setIndex] = useState(0);
  const messages = [
    "Free Next Day Delivery in UAE",
    "Free Global Express Shipping Over AED 1,900"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="announce">
      <div className="announce-track" style={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%", position: "relative", height: "100%" }}>
        <span
          key={index}
          style={{
            animation: "announceFade 0.6s ease-in-out forwards",
            display: "inline-block",
            textAlign: "center",
            width: "100%"
          }}
        >
          {messages[index]}
        </span>
      </div>
      <div className="announce-locale">
        <span>EN</span>
        <span>AED</span>
      </div>
    </div>
  );
}

function MegaMenu({ open, onClose, setRoute }) {

  if (!open) return null;
  return (
    <div className={`megamenu ${open ? "open" : ""}`} onMouseLeave={onClose}>
      <div>
        <h6>The Collection</h6>
        <ul>
          <li><a onClick={() => { setRoute("shop"); onClose(); }}>Shop All</a></li>
          <li><a onClick={() => { setRoute("shop"); onClose(); }}>The Imara Set</a></li>
          <li><a onClick={() => { setRoute("shop"); onClose(); }}>The Dahlia Set</a></li>
          <li><a onClick={() => { setRoute("lookbook"); onClose(); }}>The Lookbook</a></li>
        </ul>
      </div>
      <div className="cols">
        <div>
          <h6>The Imara Set</h6>
          <ul>
            <li><a onClick={() => { setRoute("shop"); onClose(); }}>Imara Bra</a></li>
            <li><a onClick={() => { setRoute("shop"); onClose(); }}>Imara Legging</a></li>
            <li><a onClick={() => { setRoute("shop"); onClose(); }}>Shop The Set</a></li>
          </ul>
        </div>
        <div>
          <h6>The Dahlia Set</h6>
          <ul>
            <li><a onClick={() => { setRoute("shop"); onClose(); }}>Dahlia Bra</a></li>
            <li><a onClick={() => { setRoute("shop"); onClose(); }}>Dahlia Short</a></li>
            <li><a onClick={() => { setRoute("shop"); onClose(); }}>Shop The Set</a></li>
          </ul>
        </div>
        <div>
          <h6>Accessories</h6>
          <ul>
            <li><a onClick={() => { setRoute("shop"); onClose(); }}>Socks</a></li>
            <li><a onClick={() => { setRoute("shop"); onClose(); }}>Gift Card</a></li>
          </ul>
        </div>
      </div>
      <div className="feature" onClick={() => { setRoute("shop"); onClose(); }}>
        <img src={IMGS.mmShop} alt="" className="img-fill" />
        <div className="ovr"></div>
        <div className="lbl">
          <div className="e">Now Showing</div>
          <div className="t">The Imara &amp; Dahlia Sets</div>
        </div>
      </div>
    </div>
  );
}

function Header({ route, setRoute, cartCount, openCart, openSearch, wishCount }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const closeTimer = useRef(null);

  const openMenu = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMenuOpen(true);
  };
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMenuOpen(false), 120);
  };

  return (
    <>
      <Announce />
      <header className="header" style={{ position: "sticky" }}>
        <div className="header-inner">
          <button className="mobile-menu-trigger" onClick={() => setMobileMenuOpen(true)}>
            <Icon.Menu />
          </button>
          <nav className="header-nav">
            <button
              className={route === "shop" ? "active" : ""}
              onClick={() => setRoute("shop")}
              onMouseEnter={openMenu}
              onMouseLeave={scheduleClose}
            >
              Shop
            </button>
            <button
              className={route === "lookbook" ? "active" : ""}
              onClick={() => setRoute("lookbook")}
            >
              Lookbook
            </button>
            <button
              className={route === "atelier" ? "active" : ""}
              onClick={() => setRoute("atelier")}
            >
              About Us
            </button>
            <button
              className={route === "stores" ? "active" : ""}
              onClick={() => setRoute("stores")}
            >
              Impact
            </button>
            <button
              className={route === "gift-card" ? "active" : ""}
              onClick={() => setRoute("gift-card")}
            >
              Gift Card
            </button>
          </nav>
          <div className="brandmark" onClick={() => setRoute("home")}>
            <img src="/images/hhara-logo.png" alt="HHARA Wordmark" className="brandmark-text" />
          </div>
          <div className="header-actions">
            <button onClick={openSearch}><Icon.Search /><span>Search</span></button>
            <button onClick={() => setRoute("account")}><Icon.Account /></button>
            <button onClick={() => setRoute("wishlist")} style={{ position: "relative" }}>
              <Icon.Heart />
              {wishCount > 0 && <span className="cart-count">{wishCount}</span>}
            </button>
            <button onClick={openCart}>
              <Icon.Bag />
              <span>Bag</span>
              {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
            </button>
          </div>
        </div>
        <div onMouseEnter={openMenu} onMouseLeave={scheduleClose}>
          <MegaMenu open={menuOpen} onClose={() => setMenuOpen(false)} setRoute={setRoute} />
        </div>
      </header>

      <div className={`mobile-menu-backdrop ${mobileMenuOpen ? "open" : ""}`} onClick={() => setMobileMenuOpen(false)}></div>
      <aside className={`mobile-menu-drawer ${mobileMenuOpen ? "open" : ""}`} aria-hidden={!mobileMenuOpen}>
        <div className="mobile-menu-head">
          <h3>HHARA</h3>
          <button onClick={() => setMobileMenuOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink)", padding: 4 }}>
            <Icon.Close />
          </button>
        </div>
        <div className="mobile-menu-body">
          <nav className="mobile-menu-nav">
            <button
              className={route === "shop" ? "active" : ""}
              onClick={() => { setRoute("shop"); setMobileMenuOpen(false); }}
            >
              Shop All
            </button>
            <button
              className={route === "lookbook" ? "active" : ""}
              onClick={() => { setRoute("lookbook"); setMobileMenuOpen(false); }}
            >
              Lookbook
            </button>
            <button
              className={route === "atelier" ? "active" : ""}
              onClick={() => { setRoute("atelier"); setMobileMenuOpen(false); }}
            >
              About Us
            </button>
            <button
              className={route === "stores" ? "active" : ""}
              onClick={() => { setRoute("stores"); setMobileMenuOpen(false); }}
            >
              Impact
            </button>
            <button
              className={route === "gift-card" ? "active" : ""}
              onClick={() => { setRoute("gift-card"); setMobileMenuOpen(false); }}
            >
              Gift Card
            </button>
          </nav>
        </div>
        <div className="mobile-menu-footer">
          <div className="mobile-menu-locale">
            <span>EN</span>
            <span style={{ opacity: 0.5 }}>|</span>
            <span>AED</span>
          </div>
        </div>
      </aside>

    </>
  );
}

function PreCheckoutPage({ cart, checkoutUrl, updateQty, removeItem, applyDiscount, discountCodes, setRoute, addToCart }) {
  const products = useProducts() as any[];
  const [promo, setPromo] = useState("");
  const [promoBusy, setPromoBusy] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [upsellSizes, setUpsellSizes] = useState<Record<string, string>>({});

  const cartIds = new Set(cart.map((i: any) => i.id));
  const upsells = products.filter((p: any) => !cartIds.has(p.id));

  const activeDiscount = discountCodes?.find((d: any) => d.applicable);
  const subtotal = cart.reduce((a: number, i: any) => a + i.price * i.qty, 0);
  const togo = Math.max(0, 1900 - subtotal);

  const handlePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (promoBusy) return;
    setPromoBusy(true); setPromoError("");
    try { await applyDiscount(promo.trim()); setPromo(""); }
    catch { setPromoError("Invalid or expired code"); }
    finally { setPromoBusy(false); }
  };

  if (cart.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "120px var(--pad)" }}>
        <p style={{ marginBottom: 24, opacity: 0.6 }}>Your bag is empty.</p>
        <button className="btn btn-primary" onClick={() => setRoute("shop")}>Explore the Collection <span className="btn-arrow"><Icon.Arrow /></span></button>
      </div>
    );
  }

  return (
    <div className="pco-wrap">
      {/* ── LEFT: order review ── */}
      <div className="pco-left">
        <div className="pco-left-inner">
          <button className="pco-back" onClick={() => setRoute("shop")}>
            <svg viewBox="0 0 24 24" className="icon"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            Continue Shopping
          </button>
          <h2 className="pco-page-title">Order Review</h2>
          <div className="pco-items">
            {cart.map((item: any) => (
              <div className="pco-item" key={item.key}>
                <div className={`pco-item-thumb ${item.tone}`}>
                  {item.featuredImage
                    ? <img src={item.featuredImage} alt={item.name} className="img-fill" />
                    : <div className="ph">{item.name?.toLowerCase()}</div>}
                </div>
                <div className="pco-item-body">
                  <div className="pco-item-row">
                    <div>
                      <div className="pco-item-name">{item.name}</div>
                      <div className="pco-item-opts">{item.color} · {item.size}</div>
                    </div>
                    <div className="pco-item-price">AED {(item.price * item.qty).toLocaleString()}</div>
                  </div>
                  <div className="pco-item-controls">
                    <div className="qty">
                      <button onClick={() => updateQty(item.key, item.qty - 1)}><Icon.Minus /></button>
                      <span>{item.qty}</span>
                      <button onClick={() => updateQty(item.key, item.qty + 1)}><Icon.Plus /></button>
                    </div>
                    <button className="pco-remove" onClick={() => removeItem(item.key)}>Remove</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT: summary + upsells + trust ── */}
      <div className="pco-right">
        <div className="pco-right-inner">

          {/* Pairs Well With */}
          {upsells.length > 0 && (
            <div className="pco-section">
              <h4 className="pco-section-label">Pairs Well With</h4>
              {upsells.slice(0, 2).map((p: any) => {
                const sel = upsellSizes[p.id] || p.sizes?.[0] || "";
                return (
                  <div className="pco-upsell-item" key={p.id}>
                    <div className={`pco-upsell-thumb ${p.tone}`} onClick={() => setRoute("product", p.id)} style={{ cursor: "pointer" }}>
                      {p.featuredImage?.url
                        ? <img src={p.featuredImage.url} alt={p.name} className="img-fill" />
                        : <div className="ph">{p.name?.toLowerCase()}</div>}
                    </div>
                    <div className="pco-upsell-body">
                      <div className="pco-upsell-name" onClick={() => setRoute("product", p.id)} style={{ cursor: "pointer" }}>{p.name}</div>
                      <div className="pco-upsell-price">AED {p.price?.toLocaleString()}</div>
                      {p.sizes?.length > 0 && (
                        <select className="pco-upsell-size" value={sel} onChange={(e) => setUpsellSizes(prev => ({ ...prev, [p.id]: e.target.value }))}>
                          {p.sizes.map((s: string) => <option key={s} value={s}>{s} · AED {p.price?.toLocaleString()}</option>)}
                        </select>
                      )}
                      <button className="pco-upsell-add" onClick={() => addToCart({ id: p.id, name: p.name, price: p.price, color: p.swatches?.[0]?.name, size: sel, tone: p.tone })}>
                        Add
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Discount code */}
          <div className="pco-section">
            {!activeDiscount ? (
              <form onSubmit={handlePromo} className="pco-promo-form">
                <input type="text" placeholder="Discount Code" value={promo} onChange={(e) => setPromo(e.target.value)} disabled={promoBusy} className="pco-promo-input" />
                <button type="submit" disabled={promoBusy || !promo} className="pco-promo-btn">{promoBusy ? "..." : "Apply"}</button>
              </form>
            ) : (
              <div className="pco-discount-applied">
                <span>Code: <strong>{activeDiscount.code}</strong></span>
                <button onClick={() => applyDiscount("")}>Remove</button>
              </div>
            )}
            {promoError && <div className="pco-promo-error">{promoError}</div>}
          </div>

          {/* Order totals */}
          <div className="pco-summary">
            <div className="pco-summary-row"><span>Subtotal</span><span>AED {subtotal.toLocaleString()}</span></div>
            <div className="pco-summary-row"><span>Shipping</span><span>{togo > 0 ? "Calculated at checkout" : "Complimentary"}</span></div>
            <div className="pco-summary-row pco-total"><span>Total</span><span>AED {subtotal.toLocaleString()}</span></div>
          </div>

          {/* You May Also Like */}
          {upsells.length > 2 && (
            <div className="pco-section">
              <h4 className="pco-section-label">You May Also Like</h4>
              <div className="pco-also-grid">
                {upsells.slice(2, 4).map((p: any) => (
                  <div key={p.id} className="pco-also-card" onClick={() => setRoute("product", p.id)}>
                    <div className={`pco-also-thumb ${p.tone}`}>
                      {p.featuredImage?.url ? <img src={p.featuredImage.url} alt={p.name} className="img-fill" /> : <div className="ph">{p.name?.toLowerCase()}</div>}
                    </div>
                    <div className="pco-also-name">{p.name}</div>
                    <div className="pco-also-price">AED {p.price?.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trust badges */}
          <div className="pco-trust">
            <div className="pco-trust-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="pco-trust-icon"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>
              <div>
                <div className="pco-trust-title">Crafted With Intention</div>
                <div className="pco-trust-body">Conceived in Florence, engineered in the UAE. Every piece is made to outlast trends.</div>
              </div>
            </div>
            <div className="pco-trust-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="pco-trust-icon"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
              <div>
                <div className="pco-trust-title">No Hidden Costs</div>
                <div className="pco-trust-body">Duties & taxes are calculated transparently. No surprise charges on delivery.</div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <button className="btn btn-primary btn-block" disabled={!checkoutUrl} onClick={() => { if (checkoutUrl) window.open(checkoutUrl, "_self"); }}>
            Proceed to Checkout
            <span className="btn-arrow"><Icon.Arrow /></span>
          </button>
          <p className="micro" style={{ textAlign: "center", marginTop: 12 }}>Secure checkout · SSL encrypted</p>
          <div className="pco-checkout-notes" style={{ marginTop: 24, padding: 16, background: "rgba(0,0,0,0.02)", borderRadius: 6, fontSize: 11, lineHeight: "1.6", border: "1px solid rgba(0,0,0,0.05)" }}>
            <div style={{ fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--ink)" }}>Shipping & Returns Summary</div>
            <div style={{ marginBottom: 6 }}>• <strong>UAE Domestic:</strong> Free standard next-day shipping (no minimum). Same-day delivery upgrade available for AED 28 in Dubai, Abu Dhabi, Sharjah, and Ajman only.</div>
            <div style={{ marginBottom: 6 }}>• <strong>GCC:</strong> AED 60 flat shipping, free on orders over AED 1,900. All duties & taxes are covered (DDP) - no fees at delivery.</div>
            <div style={{ marginBottom: 6 }}>• <strong>International:</strong> Flat shipping fee (AED 80 UK/Europe/Rest of World, AED 120 North America), free on orders over AED 1,900. Duties and taxes at destination are the customer's responsibility. PO Box delivery addresses are disabled.</div>
            <div>• <strong>Returns:</strong> Free returns within 14 days for UAE orders only. GCC and international orders are final sale and non-returnable.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CookieBanner({ setRoute }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!localStorage.getItem("hhara_cookie_consent")) setVisible(true);
  }, []);
  if (!visible) return null;
  const accept = () => { localStorage.setItem("hhara_cookie_consent", "accepted"); setVisible(false); };
  const decline = () => { localStorage.setItem("hhara_cookie_consent", "declined"); setVisible(false); };
  return (
    <div className="cookie-banner">
      <p>
        We use cookies to enhance your browsing experience and analyse site traffic. By clicking "Accept", you consent to our use of cookies.{" "}
        <a href="#" onClick={(e) => { e.preventDefault(); setRoute("privacy"); }}>Privacy Policy</a>
      </p>
      <div className="cookie-banner-actions">
        <button className="cookie-decline" onClick={decline}>Decline</button>
        <button className="cookie-accept" onClick={accept}>Accept</button>
      </div>
    </div>
  );
}

function Footer({ setRoute, route = "" }) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || busy) return;
    setBusy(true); setError(null);
    const res = await serverSubscribe(email);
    setBusy(false);
    if (res.ok) setDone(true);
    else setError(res.error || "Subscription failed");
  };
  return (
    <footer className="footer" data-route={route}>
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-brand-logo" onClick={() => setRoute("home")} style={{ cursor: "pointer" }}>
              <img src="/images/monkey-peeking.png" alt="HHARA" className="footer-monkey-logo" />
              <div className="footer-brand-right">
                <img src="/images/Text-PNG-02.png" alt="HHARA" className="footer-wordmark" />
                <div className="footer-brand-desc">
                  <span>Consciously made luxury athleisure.</span>
                  <span>Worn around the world with intent.</span>
                  <span>Every piece does more than dress you.</span>
                </div>
              </div>
            </div>
            <form className="footer-newsletter" onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={done || busy}
                required
              />
              <button type="submit" disabled={done || busy}>
                {done ? "✓" : busy ? "…" : "Subscribe"}
              </button>
            </form>
            {error && <div style={{ marginTop: 8, fontSize: 11, color: "#faa" }}>{error}</div>}
          </div>
          <div className="footer-col">
            <h4>The Collection</h4>
            <ul>
              <li><a onClick={() => setRoute("shop")} style={{ cursor: "pointer" }}>Shop All</a></li>
              <li><a onClick={() => setRoute("shop")} style={{ cursor: "pointer" }}>The Dahlia Set</a></li>
              <li><a onClick={() => setRoute("shop")} style={{ cursor: "pointer" }}>The Imara Set</a></li>
              <li><a onClick={() => setRoute("lookbook")} style={{ cursor: "pointer" }}>The Lookbook</a></li>
              <li><a onClick={() => setRoute("shop")} style={{ cursor: "pointer" }}>Socks</a></li>
              <li><a onClick={() => setRoute("gift-card")} style={{ cursor: "pointer" }}>Gift Card</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Customer Service</h4>
            <ul>
              <li><a onClick={() => setRoute("faq")} style={{ cursor: "pointer" }}>FAQ</a></li>
              <li><a onClick={() => setRoute("shipping")} style={{ cursor: "pointer" }}>Shipping &amp; Delivery</a></li>
              <li><a onClick={() => setRoute("returns")} style={{ cursor: "pointer" }}>Returns &amp; Refunds</a></li>
              <li><a onClick={() => setRoute("size-guide")} style={{ cursor: "pointer" }}>Size Guide</a></li>
              <li><a onClick={() => setRoute("contact")} style={{ cursor: "pointer" }}>Contact</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Information</h4>
            <ul>
              <li><a onClick={() => setRoute("atelier")} style={{ cursor: "pointer" }}>About Us</a></li>
              <li><a onClick={() => setRoute("stores")} style={{ cursor: "pointer" }}>Impact</a></li>
              <li><a onClick={() => setRoute("gift-card")} style={{ cursor: "pointer" }}>Gift Card</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Legal</h4>
            <ul>
              <li><a onClick={() => setRoute("privacy")} style={{ cursor: "pointer" }}>Privacy &amp; Cookie Policy</a></li>
              <li><a onClick={() => setRoute("terms")} style={{ cursor: "pointer" }}>Terms &amp; Conditions</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© HHARA 2026 · UAE · Dahlia Moxie Trading LLC</span>
          <div className="pay">
            <a href="https://www.instagram.com/thisishhara?igsh=MTMxaTRodWM2eDh2ag==" target="_blank" rel="noreferrer">Instagram</a>
            <a href="https://www.tiktok.com/@thisishhara?_r=1&_t=ZS-97MsyT8wQps" target="_blank" rel="noreferrer">TikTok</a>
            <a href="#" target="_blank" rel="noreferrer">Facebook</a>
            <a href="#" target="_blank" rel="noreferrer">Twitter</a>
            <a href="#" target="_blank" rel="noreferrer">LinkedIn</a>
          </div>
        </div>
      </div>
    </footer>
  );
}


// === FILE 05-1ba71939-ee08-44bd-a9c0-607c20b1bd8a.jsx ===

function CartDrawer({ open, onClose, items, updateQty, removeItem, openProduct = null, checkoutUrl, setRoute, discountCodes, applyDiscount }: { open: any; onClose: any; items: any; updateQty: any; removeItem: any; openProduct?: any; checkoutUrl: any; setRoute: any; discountCodes: any; applyDiscount: any }) {
  const [promo, setPromo] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await applyDiscount(promo.trim());
      setPromo("");
    } catch (err) {
      setError("Invalid or expired code");
    } finally {
      setBusy(false);
    }
  };

  const activeDiscount = discountCodes?.find((d: any) => d.applicable);
  const subtotal = items.reduce((a, i) => a + i.price * i.qty, 0);
  const freeThreshold = 1900;
  const progress = Math.min(subtotal / freeThreshold, 1);
  const togo = Math.max(0, freeThreshold - subtotal);

  return (
    <>
      <div className={`cart-backdrop ${open ? "open" : ""}`} onClick={onClose}></div>
      <aside className={`cart-drawer ${open ? "open" : ""}`} aria-hidden={!open}>
        <div className="cart-head">
          <div>
            <h3>The Bag</h3>
          </div>
          <button onClick={onClose}><Icon.Close /></button>
        </div>

        {items.length > 0 && (
          <div className="cart-prog">
            {togo > 0 ? (
              <span>You're <em>AED {togo.toLocaleString()}</em> away from free shipping</span>
            ) : (
              <span>You've unlocked free shipping</span>
            )}
            <div className="bar"><div className="fill" style={{ width: `${progress * 100}%` }}></div></div>
          </div>
        )}

        {items.length === 0 ? (
          <div className="cart-empty">
            <h4>Your bag is empty</h4>
            <p>Begin with a piece from The Imara or Dahlia Set.</p>
            <button className="btn btn-primary" onClick={() => { setRoute?.("shop"); onClose(); }}>
              Explore the Collection
              <span className="btn-arrow"><Icon.Arrow /></span>
            </button>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {items.map((it) => {

                const img = it.featuredImage || (it.id && IMGS[it.id + "a"]);
                return (
                  <div className="cart-item" key={it.key}>
                    <div className={`thumb ${it.tone}`}>
                      {img ? <img src={img} alt="" className="img-fill" /> : <div className="ph">{it.name.toLowerCase()}</div>}
                    </div>
                    <div className="ci-body">
                      <div className="ci-row">
                        <div>
                          <div className="ci-name">{it.name}</div>
                          <div className="ci-opts">{it.color} · {it.size}</div>
                        </div>
                        <div className="ci-price">AED {it.price.toLocaleString()}</div>
                      </div>
                      <div className="ci-controls">
                        <div className="qty">
                          <button onClick={() => updateQty(it.key, it.qty - 1)}><Icon.Minus /></button>
                          <span>{it.qty}</span>
                          <button onClick={() => updateQty(it.key, it.qty + 1)}><Icon.Plus /></button>
                        </div>
                        <button className="cart-remove" onClick={() => removeItem(it.key)}>Remove</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="cart-foot">
              {!activeDiscount ? (
                <form onSubmit={handleApplyPromo} className="promo-form" style={{ display: "flex", gap: 8, margin: "0 0 16px" }}>
                  <input
                    type="text"
                    placeholder="Promo Code"
                    value={promo}
                    onChange={(e) => setPromo(e.target.value)}
                    disabled={busy}
                    style={{ flex: 1, padding: "8px 12px", border: "1px solid var(--line-soft)", background: "transparent", fontSize: 13 }}
                  />
                  <button type="submit" disabled={busy || !promo} className="btn" style={{ padding: "8px 16px", fontSize: 12, minHeight: "unset" }}>
                    {busy ? "Applying..." : "Apply"}
                  </button>
                </form>
              ) : (
                <div className="cart-row discount-row" style={{ display: "flex", justifyContent: "space-between", color: "#7a2e3a", fontSize: 13, margin: "0 0 16px", border: "1px solid var(--line-soft)", padding: "8px 12px" }}>
                  <span>Code Applied: <strong>{activeDiscount.code}</strong></span>
                  <button onClick={() => applyDiscount("")} style={{ background: "none", border: "none", color: "var(--ink-soft)", textDecoration: "underline", fontSize: 12, cursor: "pointer", padding: 0 }}>Remove</button>
                </div>
              )}
              {error && <div style={{ color: "#7a2e3a", fontSize: 12, marginTop: -8, marginBottom: 16 }}>{error}</div>}
              <div className="cart-row">
                <span>Subtotal</span>
                <span>AED {subtotal.toLocaleString()}</span>
              </div>
              <div className="cart-row">
                <span>Shipping</span>
                <span>{togo > 0 ? "Calculated at checkout" : "Complimentary"}</span>
              </div>
              <div className="cart-row total">
                <span>Total</span>
                <span>AED {subtotal.toLocaleString()}</span>
              </div>
              <button
                className="btn btn-primary btn-block"
                disabled={!checkoutUrl}
                onClick={() => {
                  if (checkoutUrl) {
                    setRoute("pre-checkout");
                    onClose();
                  }
                }}
              >
                Review Order
                <span className="btn-arrow"><Icon.Arrow /></span>
              </button>
              <div className="micro">Taxes &amp; duties calculated at checkout · Every purchase helps fund children's education</div>
            </div>
          </>
        )}
      </aside>
    </>
  );
}

// === FILE 06-ce7b1d96-f64b-4723-b417-6dfb0feade07.jsx ===

function ProductCard({ product, onClick }: { product: any; onClick: any }) {

  const imgA = product.imgKey ? IMGS[product.imgKey + "a"] : (product.featuredImage?.url || product.images?.[0]?.url || null);
  const imgB = product.imgKey ? IMGS[product.imgKey + "b"] : (product.images?.[1]?.url || product.featuredImage?.url || null);

  return (
    <div className="pcard" onClick={onClick}>
      <div className="pcard-media">
        {product.badge && (
          <div className={`pcard-badge ${product.badge === "New" ? "new" : ""}`}>{product.badge}</div>
        )}
        <div className={`${product.tone}`} style={{ position: "absolute", inset: 0 }}>
          {imgA && <img src={imgA} alt={product.name} className="img-fill" loading="lazy" />}
        </div>
        <div className={`alt ${product.altTone || product.tone}`} style={{ position: "absolute", inset: 0 }}>
          {imgB && <img src={imgB} alt={product.name} className="img-fill" loading="lazy" />}
        </div>
      </div>
      <div className="pcard-info">
        <div className="pcard-name">{product.name}</div>
        {product.tagline && <div className="pcard-tagline">{product.tagline}</div>}
        <div className="pcard-prices">
          {product.priceWas && <span className="pcard-price-was">AED {product.priceWas.toLocaleString()}</span>}
          <span className={`pcard-price ${product.priceWas ? "pcard-price-sale" : ""}`}>
            AED {product.price.toLocaleString()}
          </span>
        </div>
        <div className="pcard-swatches">
          {product.swatches.slice(0, 4).map((s, i) => (
            <span key={i} className="swatch" style={{ background: s.hex }} title={s.name}></span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Hero({ openShop }) {
  const { HEROES } = HHRAA_DATA;
  const slide = HEROES[0];

  return (
    <section className="hero">
      <div className={`hero-media ${slide.tone}`}>
        <img src="/images/HHara.png" alt="" className="img-fill" />
      </div>
      <div className="hero-overlay"></div>
      <div className="hero-content">
        {slide.eyebrow && <div className="hero-eyebrow">{slide.eyebrow}</div>}
        <h1 className="hero-title">
          {slide.title.split("\n").map((line, i, arr) => {
            const isLastLine = i === arr.length - 1;
            const parts = line.split("|");
            return (
              <span key={i}>
                {parts.map((part, pi) => {
                  const isLastPart = pi === parts.length - 1;
                  return isLastLine && isLastPart ? <em key={pi}>{part}</em> : <span key={pi}>{part}</span>;
                })}
                {!isLastLine && <br />}
              </span>
            );
          })}
        </h1>
        <p className="hero-sub">{slide.sub}</p>
        <div className="hero-ctas">
          <button className="btn btn-light" onClick={openShop}>
            {slide.cta}
            <span className="btn-arrow"><Icon.Arrow /></span>
          </button>
        </div>
      </div>
    </section>
  );
}

function Categories({ onPick }) {
  const { CATEGORIES } = HHRAA_DATA;

  const catImgs: Record<string, string> = { imara: IMGS.catOuter, dahlia: IMGS.catRTW };
  return (
    <section className="section">
      <div className="section-head">
        <div className="section-head-stack">
          <span className="eyebrow">Two Capsules</span>
          <h2 className="section-title">Choose Your Set</h2>
        </div>
        <span className="section-link" onClick={onPick}>Shop The Collection →</span>
      </div>
      <div className="cats">
        {CATEGORIES.map((c) => (
          <div key={c.id} className="cat" onClick={onPick}>
            <div className={`media ${c.tone}`}>
              {catImgs[c.id] && <img src={catImgs[c.id]} alt={c.name} className="img-fill" loading="lazy" />}
            </div>
            <div className="cat-overlay"></div>
            <div className="cat-label">
              <div className="ttl">{c.name}</div>
              <div className="ct">{c.count} pieces</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FeaturedGrid({ setRoute }: { setRoute: (route: string, payload?: any) => void }) {
  return (
    <section className="manifesto-colourways" style={{ paddingTop: "24px", paddingBottom: "60px" }}>
      <span className="eyebrow" style={{ color: "#B8892E", display: "block", textAlign: "center", marginBottom: 16 }}>THE PALETTE</span>
      <h2 className="mc-headline" style={{ marginBottom: 12 }}>
        Timeless<br />
        <em style={{ fontFamily: "var(--display,'Cormorant Garamond',serif)", fontStyle: "italic", fontWeight: 300, color: "#B8892E" }}>Tones.</em>
      </h2>
      <p className="mc-lead" style={{ marginBottom: 40, maxWidth: "640px", textAlign: "center" }}>
        Chicory Coffee and Olive Green. Two signature colorways grounded in raw mineral earth and quiet oases, designed to anchor your movement and your day.
      </p>
      <div className="mc-cards" style={{ cursor: "default" }}>
        <div 
          className="mc-card mc-card-clickable" 
          onClick={() => setRoute("shop", "Chicory Coffee")}
          style={{ textAlign: "left" }}
        >
          <div style={{ width: 60, height: 60, borderRadius: "50%", backgroundColor: "#3D2B1F", border: "1px solid rgba(0,0,0,0.08)", flexShrink: 0 }} />
          <div>
            <h3 style={{ fontFamily: "var(--serif,'Cormorant Garamond',serif)", fontSize: 32, fontWeight: 300, color: "#2A1F14", marginBottom: 4 }}>Chicory Coffee</h3>
            <span className="eyebrow" style={{ letterSpacing: "0.20em", display: "block" }}>Deep Espresso Brown</span>
          </div>
          <p style={{ fontFamily: "var(--sans)", fontSize: 15, lineHeight: 1.85, color: "#7A6555", margin: 0 }}>
            The colour of the first cup. Before the world awakens. Deep, warm, and grounding - a quiet ritual before everything else begins.
          </p>
          <p style={{ fontFamily: "var(--serif,'Cormorant Garamond',serif)", fontStyle: "italic", fontSize: 15, color: "#B8892E", margin: "8px 0 0" }}>
            Her colour. Before the day begins.
          </p>
        </div>
        <div 
          className="mc-card mc-card-clickable" 
          onClick={() => setRoute("shop", "Olive Green")}
          style={{ textAlign: "left" }}
        >
          <div style={{ width: 60, height: 60, borderRadius: "50%", backgroundColor: "#5F6B4F", border: "1px solid rgba(0,0,0,0.08)", flexShrink: 0 }} />
          <div>
            <h3 style={{ fontFamily: "var(--serif,'Cormorant Garamond',serif)", fontSize: 32, fontWeight: 300, color: "#2A1F14", marginBottom: 4 }}>Olive Green</h3>
            <span className="eyebrow" style={{ letterSpacing: "0.20em", display: "block" }}>Deep Olive</span>
          </div>
          <p style={{ fontFamily: "var(--sans)", fontSize: 15, lineHeight: 1.85, color: "#7A6555", margin: 0 }}>
            The colour of quiet resilience. A soft, mineral shade pulled from the heart of the desert oasis. Peaceful, steady, organic - a tone that does not seek attention, yet holds it completely.
          </p>
          <p style={{ fontFamily: "var(--serif,'Cormorant Garamond',serif)", fontStyle: "italic", fontSize: 15, color: "#B8892E", margin: "8px 0 0" }}>
            Grounded in nature. Quietly powerful.
          </p>
        </div>
      </div>
    </section>
  );
}

function Editorial({ openShop }) {
  return (
    <section className="section-full" style={{ padding: 0 }}>
      <div className="editorial" style={{ minHeight: "60vh" }}>
        <div className="editorial-media tone-5">
          <picture style={{ width: "100%", height: "100%" }}>
            <source media="(max-width: 768px)" srcSet="/images/tala_cocoon_mobile.png" />
            <img src="/images/tala_cocoon_desktop.png" alt="HHARA CLOUD" className="img-fill" loading="lazy" />
          </picture>
        </div>
        <div className="editorial-body" style={{ gap: "20px", alignSelf: "center" }}>
          <h2 className="editorial-title" style={{ margin: 0 }}>
            Built to move with <em><span style={{ color: "var(--accent)" }}>every version</span> of you.</em>
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px", margin: "10px 0", maxWidth: "480px" }}>
            <p style={{
              fontFamily: "var(--sans)",
              fontSize: "15px",
              lineHeight: "1.9",
              color: "var(--ink-soft)",
              letterSpacing: "0.04em",
              margin: 0
            }}>
              From the first stretch of morning to the last quiet moment she calls her own, HHARA moves with her - through every version of her day, without asking her to change.
            </p>

            <p style={{
              fontFamily: "var(--display)",
              fontStyle: "italic",
              fontSize: "18px",
              lineHeight: "1.5",
              color: "var(--ink)",
              margin: 0
            }}>
              Morning run to afternoon plans. Yoga to Pilates. Office to dinner. Studio to street.
            </p>

            <p style={{ fontStyle: "italic", color: "var(--accent)", fontWeight: 500, margin: 0 }}>
              No changing in between. Just her.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Marquee() {
  const items = [
    "Fashion with Purpose",
    "Unapologetically You",
    "Sustainable Luxury Athleisure",
    "Every Piece Gives Back",
    "Wonder, Worn.",
    "Imara (Swahili) · Strong • Firm • Resolute",
    "Created for the woman who carries her strength with quiet confidence",
  ];
  const row = (
    <span>
      {items.map((it, i) => (
        <React.Fragment key={i}>
          {it}
          <span className="separator">◆</span>
        </React.Fragment>
      ))}
    </span>
  );
  return (
    <div className="marquee">
      <div className="marquee-track">
        {row}{row}{row}{row}
      </div>
    </div>
  );
}

function Lookbook({ openLookbook }) {

  const tiles = [IMGS.lb1, IMGS.lb2, IMGS.lb3, IMGS.lb4, IMGS.lb5, IMGS.lb6];
  const tones = ["tone-3", "tone-1", "tone-5", "tone-7", "tone-2", "tone-6"];
  const tags = ["Imara Bra", "Imara Legging", "Dahlia Bra", "Dahlia Short", "Chicory Coffee", "Olive Green"];
  return (
    <section className="section">
      <div className="section-head">
        <div className="section-head-stack">
          <span className="eyebrow">The Capsule</span>
          <h2 className="section-title">Wonder, <span style={{ color: "var(--accent)" }}>Worn</span></h2>
        </div>
        <span className="section-link" onClick={openLookbook} style={{ cursor: "pointer" }}>View the Edit →</span>
      </div>
      <div className="lookbook">
        {tones.map((t, i) => (
          <div key={i} className={`lookbook-tile t${i + 1} ${t}`} onClick={openLookbook}>
            {tiles[i] && <img src={tiles[i]} alt={tags[i]} className="img-fill" loading="lazy" />}
            <div className="lk-tag">{tags[i]}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Callouts() {
  const instaImages = [
    { img: IMGS.lb1, icon: "reels", link: "https://www.instagram.com/thisishhara?igsh=MTMxaTRodWM2eDh2ag==" },
    { img: IMGS.lb8, icon: "none", link: "https://www.instagram.com/thisishhara?igsh=MTMxaTRodWM2eDh2ag==" },
    { img: IMGS.lb3, icon: "carousel", link: "https://www.instagram.com/thisishhara?igsh=MTMxaTRodWM2eDh2ag==" },
    { img: IMGS.j4, icon: "reels", link: "https://www.instagram.com/thisishhara?igsh=MTMxaTRodWM2eDh2ag==" },
    { isTextCard: true, title: "AURA", desc: "Our capillary performance fabric: ultra-light, quick-drying, and engineered from regenerative ocean streams.", link: "https://www.instagram.com/thisishhara?igsh=MTMxaTRodWM2eDh2ag==" },
    { img: IMGS.lb2, icon: "reels", link: "https://www.instagram.com/thisishhara?igsh=MTMxaTRodWM2eDh2ag==" }
  ];

  return (
    <section className="section-full" style={{ padding: 0 }}>
      <div className="insta-grid">
        {instaImages.map((card, i) => {
          if (card.isTextCard) {
            return (
              <a key={i} href={card.link} target="_blank" rel="noopener noreferrer" className="insta-text-card">
                <h3>{card.title}</h3>
                <p>{card.desc}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", marginTop: "auto" }}>
                  <span style={{ fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 500, color: "var(--accent)" }}>Read Ethos</span>
                  <span className="insta-icon-badge" style={{ position: "static", color: "var(--accent)" }}><Icon.Reels /></span>
                </div>
              </a>
            );
          }
          return (
            <a key={i} href={card.link} target="_blank" rel="noopener noreferrer" className="insta-card">
              <img src={card.img} alt={`HHARA Lifestyle ${i + 1}`} />
              <div className="insta-card-overlay"></div>
              {card.icon !== "none" && (
                <span className="insta-icon-badge">
                  {card.icon === "reels" ? <Icon.Reels /> : <Icon.Carousel />}
                </span>
              )}
            </a>
          );
        })}
      </div>
    </section>
  );
}

function Newsletter() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || busy) return;
    setBusy(true); setError(null);
    const res = await serverSubscribe(email);
    setBusy(false);
    if (res.ok) setDone(true);
    else setError(res.error || "Subscription failed");
  };
  return (
    <section className="newsletter">
      <div className="newsletter-inner">
        <div className="newsletter-logo">
          <img src="/images/Text-PNG-02.png" alt="HHARA" style={{ height: 30, width: "auto", filter: "brightness(0) invert(1)", opacity: 0.8 }} />
        </div>
        <div className="newsletter-rule" />
        <h2><em>Stay close</em> to the collective.</h2>
        <p>Private dispatches from the HHARA studio: capsule drops, philanthropic updates, and editorial notes. No more than twice a month.</p>
        <form className="newsletter-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={done || busy}
            required
          />
          <button type="submit" disabled={done || busy}>
            {done ? "Thank you ✓" : busy ? "Subscribing…" : "Subscribe"}
          </button>
        </form>
        {error && <div style={{ marginTop: 12, fontSize: 13, color: "#fbb" }}>{error}</div>}
      </div>
    </section>
  );
}

function ManifestoColourways({ ids, openProduct }: { ids: string[]; openProduct: (id: string) => void }) {
  const PRODUCTS = useProducts();
  const list = ids.map((id) => PRODUCTS.find((p) => p.id === id)).filter(Boolean);
  return (
    <section className="manifesto-colourways">
      <span className="eyebrow" style={{ color: "#B8892E", display: "block", textAlign: "center", marginBottom: 16 }}>THE COLLECTION</span>
      <h2 className="mc-headline">
        Unapologetically<br />
        <em style={{ fontFamily: "var(--display,'Cormorant Garamond',serif)", fontStyle: "italic", fontWeight: 300, color: "#B8892E" }}>You.</em>
      </h2>
      <p className="mc-lead">Four elevated essentials. Two timeless colourways. Designed to move effortlessly through every version of your day.</p>
      
      <div className="pgrid" style={{ width: "100%", maxWidth: "var(--maxw)", marginBottom: 48 }}>
        {list.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            onClick={() => openProduct(p.id)}
                     />
        ))}
      </div>

    </section>
  );
}

function Pillars() {
  const pillars = [
    {
      title: "She is seen",
      body: "HHARA names what the world overlooks: the woman who gives everything and asks for nothing.",
    },
    {
      title: "Intentional",
      body: "She does not drift through her days. She inhabits them with purpose, grace and clarity.",
    },
    {
      title: "Every version",
      body: "From the first alarm to the last quiet moment she calls her own. One piece. Every role.",
    },
    {
      title: "Wonder",
      body: "From the Yoruba dialect. Her name. Her nature. She does not have wonder; she is wonder.",
    },
  ];
  return (
    <section className="pillars-section">
      <div className="pillars-container">
        <div className="section-head" style={{ borderBottom: "1px solid rgba(184, 137, 46, 0.12)", paddingBottom: 28, marginBottom: 48 }}>
          <div className="section-head-stack">
            <h2 className="section-title" style={{ color: "#2A1F14", fontWeight: 300 }}>Luxury within<br /><em style={{ color: "var(--accent)" }}>intention.</em></h2>
          </div>
        </div>
        <div className="pillars-grid">
          {pillars.map((p) => (
            <div key={p.title} className="pillar-card">
              <h3 className="pillar-title">{p.title}</h3>
              <p className="pillar-body">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Philanthropy() {
  return (
    <section className="section" style={{ textAlign: "center" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px" }}>
        <span className="eyebrow">Institutional Philanthropy</span>
        <div style={{ fontFamily: "var(--serif, 'Cormorant Garamond', serif)", fontSize: 120, lineHeight: 1, margin: "16px 0 24px" }}>10%</div>
        <p style={{ fontSize: 13, letterSpacing: "0.25em", textTransform: "uppercase", opacity: 0.55, marginBottom: 24 }}>
          Of Gross Revenue, Directed to Social Impact
        </p>
        <p style={{ lineHeight: 1.7, opacity: 0.8 }}>
          Philanthropy isn&apos;t an afterthought; it&apos;s woven directly into our business model.
          Every acquisition funds verified non-profit networks cultivating self-reliance, security,
          and economic independence for women worldwide.
        </p>
      </div>
    </section>
  );
}

function Proclamation() {
  return (
    <section className="section" style={{ textAlign: "center", background: "#F7F3ED", color: "#5C4632" }}>
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "0 24px" }}>
        <p style={{ fontFamily: "var(--serif, 'Cormorant Garamond', serif)", fontStyle: "italic", fontSize: 32, lineHeight: 1.4, color: "#5C4632" }}>
          &ldquo;Silence is the most powerful of powers. It&apos;s the unwavering, measured silence of a woman
          who knows she has left behind her past, and is shaping her future, with absolute purpose.&rdquo;
        </p>
        <p style={{ marginTop: 24, fontSize: 11, letterSpacing: "0.35em", textTransform: "uppercase", color: "var(--accent)" }}>
          HHARA, WONDER, WORN.
        </p>
      </div>
    </section>
  );
}

const TESTIMONIALS = [
  {
    quote: "The Imara set went from morning yoga to a board meeting without a single second glance. I've worn luxury activewear from every label and nothing moves like this. The fabric feels like a second skin and holds its shape through everything.",
    name: "Layla M.",
    location: "Dubai",
    product: "Imara Set · Chicory Coffee",
  },
  {
    quote: "I've been searching for years for something that doesn't ask me to choose between beauty and function. HHARA finally understood what my mornings actually look like. It's the first brand that dressed me for the whole day, not just the gym.",
    name: "Amira K.",
    location: "Abu Dhabi",
    product: "Dahlia Set · Olive Green",
  },
  {
    quote: "The craftsmanship on the Dahlia Bra is extraordinary, soft against the skin but structured where it matters. Six hours later I forgot I was wearing activewear. I've recommended it to every woman in my circle since.",
    name: "Nadia R.",
    location: "London",
    product: "Dahlia Bra · Chicory Coffee",
  },
  {
    quote: "Finally activewear I'm proud to be seen in. The Chicory Coffee colourway is richer and more considered in person than any photograph captures. It photographs beautifully but wearing it is something else entirely.",
    name: "Fatima A.",
    location: "Dubai",
    product: "Imara Legging · Chicory Coffee",
  },
  {
    quote: "Worth every dirham. I bought the Dahlia Short for the gym and I've worn it to dinner twice since. That says everything. It pairs with almost anything and never looks like it's trying too hard.",
    name: "Sara H.",
    location: "Riyadh",
    product: "Dahlia Short · Olive Green",
  },
  {
    quote: "I wore the Imara Set to a gallery opening and three women stopped to ask what I was wearing. HHARA moves with you and speaks for you without trying.",
    name: "Hessa O.",
    location: "Doha",
    product: "Imara Set · Olive Green",
  },
  {
    quote: "The Dahlia Legging is the most precise piece of activewear I own. The waistband doesn't roll, the fabric holds its shape after forty washes. Nothing comes close.",
    name: "Mariam S.",
    location: "Kuwait City",
    product: "Dahlia Legging · Chicory Coffee",
  },
  {
    quote: "I train four days a week and spend the other three in meetings. HHARA is the only thing I own that moves seamlessly between both worlds without compromise.",
    name: "Rania B.",
    location: "Beirut",
    product: "Imara Bra · Olive Green",
  },
  {
    quote: "The Imara Legging has outlasted every other pair I own. Three months of daily wear and it still looks brand new. The fabric is something else entirely.",
    name: "Zara A.",
    location: "Abu Dhabi",
    product: "Imara Legging · Olive Green",
  },
  {
    quote: "I wore the Dahlia Set to a client dinner and not a single person knew it was activewear. That is the whole point, isn't it? HHARA gets it perfectly.",
    name: "Lina M.",
    location: "Beirut",
    product: "Dahlia Set · Chicory Coffee",
  },
  {
    quote: "The waistband on the Imara Legging is the best I have ever worn. No rolling, no digging. Just stays exactly where it should all day long.",
    name: "Nour T.",
    location: "Cairo",
    product: "Imara Legging · Olive Green",
  },
  {
    quote: "Activewear I can wear to the gym, to coffee, and straight into a meeting without a second thought. HHARA solved a problem I didn't know could be solved.",
    name: "Aisha R.",
    location: "Riyadh",
    product: "Imara Set · Olive Green",
  },
];

function Testimonials() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const syncButtons = () => {
    const el = trackRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 2);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
  };

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    syncButtons();
    el.addEventListener("scroll", syncButtons, { passive: true });
    window.addEventListener("resize", syncButtons);
    return () => {
      el.removeEventListener("scroll", syncButtons);
      window.removeEventListener("resize", syncButtons);
    };
  }, []);

  const scroll = (dir: number) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(".review-card");
    const step = card ? card.offsetWidth + 24 : 300;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  return (
    <section className="reviews-section">
      <div className="reviews-header">
        <h2 className="reviews-title">Customer Reviews</h2>
        <div className="reviews-nav">
          <button className="reviews-nav-btn" onClick={() => scroll(-1)} disabled={!canLeft} aria-label="Previous reviews">←</button>
          <button className="reviews-nav-btn" onClick={() => scroll(1)} disabled={!canRight} aria-label="Next reviews">→</button>
        </div>
      </div>
      <div className="reviews-track" ref={trackRef}>
        {TESTIMONIALS.map((t, i) => (
          <div key={i} className="review-card">
            <div className="review-stars">★★★★★</div>
            <blockquote className="review-quote">{t.quote}</blockquote>
            <div className="review-author">{t.name}</div>
            <div className="review-meta">{t.location} · {t.product}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Home(props) {
  return (
    <>
      <Hero openShop={() => props.setRoute("shop")} />
      <ManifestoColourways
        ids={HHRAA_DATA.FEATURED_IDS}
        openProduct={(id) => props.setRoute("product", id)}
      />
      <FeaturedGrid setRoute={props.setRoute} />
      <Editorial openShop={() => props.setRoute("atelier")} />
      <Lookbook openLookbook={() => props.setRoute("lookbook")} />
      <Pillars />
      <Testimonials />
      <Proclamation />
      <Callouts />
    </>
  );
}


// === FILE 07-9214c1d3-74f7-4bc2-bccb-7476bbfce9dc.jsx ===

function CollectionPage({ setRoute, openProduct, initialColorFilter }: { setRoute: any; openProduct: any; initialColorFilter?: string | null }) {
  const PRODUCTS = useProducts();
  const [sort, setSort] = useState("Featured");
  const [descExpanded, setDescExpanded] = useState(false);
  const [filters, setFilters] = useState({
    size: [],
    color: initialColorFilter ? [initialColorFilter] : [], 
    cat: [], 
    price: [] 
  });

  useEffect(() => {
    setFilters(f => ({
      ...f,
      color: initialColorFilter ? [initialColorFilter] : []
    }));
  }, [initialColorFilter]);

  const PRICE_RANGES = [
    { label: "Under AED 500", min: 0, max: 500 },
    { label: "AED 500 – 1,000", min: 500, max: 1000 },
    { label: "AED 1,000 – 2,000", min: 1000, max: 2000 },
    { label: "AED 2,000 and above", min: 2000, max: Infinity },
  ];

  let visible = [...PRODUCTS];
  if (filters.cat.length) visible = visible.filter((p) => filters.cat.includes(p.cat));
  if (filters.size.length) visible = visible.filter((p) => p.sizes.some((s) => filters.size.includes(s)));
  if (filters.color.length) visible = visible.filter((p) => p.swatches.some((s) => filters.color.includes(s.name)));
  if (filters.price.length) {
    visible = visible.filter((p) =>
      filters.price.some((label) => {
        const range = PRICE_RANGES.find((r) => r.label === label);
        return range && p.price >= range.min && p.price < range.max;
      })
    );
  }

  if (sort === "Price, low to high") visible.sort((a, b) => a.price - b.price);
  if (sort === "Price, high to low") visible.sort((a, b) => b.price - a.price);

  // Dynamically extract categories, sizes, and color choices from loaded catalog
  const cats = Array.from(new Set(PRODUCTS.map((p) => p.cat).filter(Boolean))) as string[];
  const sizes = Array.from(new Set(PRODUCTS.flatMap((p) => p.sizes).filter(Boolean))) as string[];

  const colorMap = new Map<string, string>();
  PRODUCTS.flatMap((p) => p.swatches).forEach((s) => {
    if (s.name) colorMap.set(s.name, s.hex || "#888");
  });
  const colorOpts = Array.from(colorMap.entries()).map(([name, hex]) => ({ name, hex }));

  const toggle = (group, val) => {
    setFilters((f) => ({
      ...f,
      [group]: f[group].includes(val) ? f[group].filter((v) => v !== val) : [...f[group], val],
    }));
  };

  const activeFilterCount = filters.cat.length + filters.size.length + filters.color.length + filters.price.length;

  const clearAll = () => setFilters({ size: [], color: [], cat: [], price: [] });

  return (
    <>
      <div className="cph">
        <div className="cph-crumbs">
          <span onClick={() => setRoute("home")} style={{ cursor: "pointer" }}>Home</span>
          <span className="sep">/</span>
          <span>Shop</span>
          <span className="sep">/</span>
          <span>The Collection</span>
        </div>
        <h1>The Collection</h1>
        <div className="cph-desc" style={{ maxWidth: "680px", margin: "16px 0 0", display: "flex", flexDirection: "column", gap: "16px", fontSize: "14px", lineHeight: "1.8", color: "var(--ink-soft)" }}>
          <p style={{ fontFamily: "var(--display)", fontSize: "20px", fontStyle: "italic", color: "var(--accent)", margin: 0 }}>
            Unapologetically You.
          </p>
          <p style={{ fontWeight: 500, color: "var(--ink)" }}>
            Four elevated essentials. Two timeless colourways. Designed to move effortlessly through every version of your day.{" "}
            {!descExpanded && (
              <button onClick={() => setDescExpanded(true)} style={{ fontFamily: "var(--sans)", fontSize: "14px", fontWeight: 500, color: "#B8892E", background: "none", border: "none", cursor: "pointer", padding: 0, textDecoration: "underline", textUnderlineOffset: "3px" }}>
                Read more
              </button>
            )}
          </p>
          {descExpanded && (
            <>
              <p>
                Every piece carries a name with meaning. Each was chosen to celebrate the strength and softness that exist within every woman.
              </p>
              <p style={{ fontSize: "14px", borderTop: "1px solid var(--line-soft)", paddingTop: "12px", marginTop: "8px" }}>
                <strong>Dahlia (Arabic)</strong> — Gentle | Tender | Delicate &nbsp;·&nbsp; <strong>Imara (Swahili)</strong> — Strong | Firm | Resolute &nbsp;·&nbsp; <em>She is both. Always.</em>{" "}
                <button onClick={() => setDescExpanded(false)} style={{ fontFamily: "var(--sans)", fontSize: "14px", fontWeight: 500, color: "#B8892E", background: "none", border: "none", cursor: "pointer", padding: 0, textDecoration: "underline", textUnderlineOffset: "3px" }}>
                  Read less
                </button>
              </p>
            </>
          )}
        </div>
      </div>

      <div className="ctoolbar">
        <div className="ctoolbar-l">
          <button><Icon.Filter /> <span>Filter</span></button>
          <span className="ctoolbar-count">{visible.length} piece{visible.length === 1 ? "" : "s"}</span>
          {activeFilterCount > 0 && (
            <button
              onClick={clearAll}
              style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", textDecoration: "underline", opacity: 0.7 }}
            >
              Clear All ({activeFilterCount})
            </button>
          )}
        </div>
        <div className="ctoolbar-r">
          <span style={{ color: "var(--muted)", fontSize: 13 }}>Sort:</span>
          
          <div className="sort-select-wrapper">
            <select 
              value={sort} 
              onChange={(e) => setSort(e.target.value)}
              className="sort-select"
            >
              {["Featured", "Newest", "Price, low to high", "Price, high to low"].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <Icon.Chevron dir="down" />
          </div>

          <div className="sort-buttons">
            {["Featured", "Newest", "Price, low to high", "Price, high to low"].map((s) => (
              <button
                key={s}
                onClick={() => setSort(s)}
                style={{ opacity: sort === s ? 1 : 0.5 }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="cmain">
        <aside className="cfilters">
          <div className="cfilter">
            <h5>Category <Icon.Chevron /></h5>
            <ul>
              {cats.map((c) => (
                <li key={c}>
                  <label>
                    <input
                      type="checkbox"
                      checked={filters.cat.includes(c)}
                      onChange={() => toggle("cat", c)}
                    />
                    {c}
                  </label>
                </li>
              ))}
            </ul>
          </div>
          <div className="cfilter">
            <h5>Size <Icon.Chevron /></h5>
            <ul style={{ flexDirection: "row", flexWrap: "wrap", gap: "8px" }}>
              {sizes.map((s) => (
                <li key={s}>
                  <button
                    onClick={() => toggle("size", s)}
                    style={{
                      padding: "6px 12px",
                      border: "1px solid var(--line)",
                      fontSize: 12,
                      background: filters.size.includes(s) ? "var(--ink)" : "transparent",
                      color: filters.size.includes(s) ? "var(--bg)" : "var(--ink)",
                    }}
                  >
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="cfilter">
            <h5>Color <Icon.Chevron /></h5>
            <div className="swatch-list">
              {colorOpts.map((c) => (
                <span
                  key={c.name}
                  className={`swatch ${filters.color.includes(c.name) ? "on" : ""}`}
                  style={{ background: c.hex }}
                  title={c.name}
                  onClick={() => toggle("color", c.name)}
                ></span>
              ))}
            </div>
          </div>
          <div className="cfilter">
            <h5>Price <Icon.Chevron /></h5>
            <ul>
              {PRICE_RANGES.map((r) => (
                <li key={r.label}>
                  <label>
                    <input
                      type="checkbox"
                      checked={filters.price.includes(r.label)}
                      onChange={() => toggle("price", r.label)}
                    />
                    {r.label}
                  </label>
                </li>
              ))}
            </ul>
          </div>
        </aside>
        <div className="cgrid">
          {visible.length === 0 ? (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "80px 24px" }}>
              <p style={{ fontFamily: "var(--display)", fontSize: 28, fontWeight: 300, marginBottom: 16 }}>No pieces match your filters</p>
              <p style={{ color: "var(--muted)", marginBottom: 24 }}>Try adjusting your selection or clear all filters.</p>
              <button className="btn btn-outline" onClick={clearAll}>Clear All Filters</button>
            </div>
          ) : (
            visible.map((p) => (
              <ProductCard key={p.id} product={p} onClick={() => openProduct(p.id)} />
            ))
          )}
        </div>
      </div>
    </>
  );
}

// === FILE 08-e9225b26-2c70-44a6-bc85-2bb315cd399e.jsx ===

// Helper sub-components for Product Detail Page (PDP) reviews
function ReviewSlider({ label, value, position }: { label: string, value: string, position: number }) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "6px", color: "var(--ink)" }}>
        <span>{label}</span>
      </div>
      <div style={{ position: "relative", height: "3px", backgroundColor: "#E6DFD5", borderRadius: "2px", margin: "10px 0" }}>
        <div style={{
          position: "absolute",
          top: "-3px",
          left: `${position}%`,
          width: "9px",
          height: "9px",
          borderRadius: "50%",
          backgroundColor: "var(--ink)",
          transform: "translateX(-50%)"
        }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "var(--ink-soft)", marginTop: "6px" }}>
        <span>{value}</span>
      </div>
    </div>
  );
}

function StarRow({ stars, percentage, count }: { stars: number, percentage: number, count: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "12px", color: "var(--ink-soft)" }}>
      <span style={{ minWidth: "24px" }}>{stars}★</span>
      <div style={{ flex: 1, height: "3px", backgroundColor: "#E6DFD5", borderRadius: "2px", position: "relative" }}>
        <div style={{ width: `${percentage}%`, height: "100%", backgroundColor: "var(--ink)", borderRadius: "2px" }} />
      </div>
      <span style={{ minWidth: "12px", textAlign: "right" }}>{count}</span>
    </div>
  );
}

function PDP({ productId, setRoute, addToCart, openProduct, onWishlistToggle, wishlist }) {
  const PRODUCTS = useProducts();
  const product = PRODUCTS.find((p) => p.id === productId) || PRODUCTS[0];
  const wishlisted = wishlist?.includes(product?.id);
  const [color, setColor] = useState(product.swatches[0]);
  const [size, setSize] = useState(null);
  const [open, setOpen] = useState("");
  const [added, setAdded] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [activeShot, setActiveShot] = useState(0);
  const [writeReviewOpen, setWriteReviewOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({ name: "", location: "", rating: 5, quote: "", product: "" });
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);

  // Reviews and Interactive Form States
  const [reviews, setReviews] = useState([
    { id: "r1", name: "Sarah M.", location: "UAE", rating: 5, quote: "Finally a bra that actually holds. Activity is easy, side roll is gone, structured. I wore it straight from class to lunch and felt completely put together.", product: "Imara Bra · Chicory Coffee" },
    { id: "r2", name: "Nour A.", location: "Abu Dhabi", rating: 5, quote: "The fabric is genuinely buttery — I wasn't expecting it to feel this luxurious. The cross-cross back is stunning. Already ordered the legging!", product: "Dahlia Bra · Olive Green" },
    { id: "r3", name: "Layla K.", location: "Riyadh", rating: 4, quote: "Sizing is true to guide. I have a fuller bust and sized up as advised — perfect fit. The Olive Green colour is even more beautiful in person.", product: "Dahlia Bra · Olive Green" },
    { id: "r4", name: "Amira H.", location: "Dubai", rating: 5, quote: "I wore the Imara Set from morning yoga straight to a client lunch. Not once did I feel underdressed. HHARA genuinely gets the way we move through our days.", product: "Imara Set · Chicory Coffee" },
    { id: "r5", name: "Fatima R.", location: "Doha", rating: 5, quote: "The waistband doesn't roll, the fabric doesn't pill, and the colour is even richer in person. Worth every dirham and then some.", product: "Dahlia Legging · Olive Green" },
    { id: "r6", name: "Hessa O.", location: "Kuwait City", rating: 5, quote: "Three months of wear and it still looks brand new. I've stopped buying from everywhere else. HHARA is the only activewear I trust now.", product: "Imara Legging · Chicory Coffee" },
  ]);

  const totalReviews = reviews.length;
  const averageRating = (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1);
  const starsCount = (num: number) => reviews.filter(r => r.rating === num).length;
  const starsPercentage = (num: number) => totalReviews ? (starsCount(num) / totalReviews) * 100 : 0;

  // Floating Video & Reel Player States
  const [videoDismissed, setVideoDismissed] = useState(false);
  const [reelOpen, setReelOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const reelVideoRef = useRef(null);
  const previewVideoRef = useRef(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const [bubblePos, setBubblePos] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragOrigin = useRef({ startX: 0, startY: 0, origX: 0, origY: 0, active: false });
  const didDrag = useRef(false);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragOrigin.current.active) return;
      const dx = e.clientX - dragOrigin.current.startX;
      const dy = e.clientY - dragOrigin.current.startY;
      if (!didDrag.current && Math.abs(dx) < 4 && Math.abs(dy) < 4) return;
      didDrag.current = true;
      setBubblePos({ x: dragOrigin.current.origX + dx, y: dragOrigin.current.origY + dy });
    };
    const onMouseUp = () => {
      dragOrigin.current.active = false;
      setIsDragging(false);
      // reset didDrag after click event fires
      setTimeout(() => { didDrag.current = false; }, 0);
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!dragOrigin.current.active) return;
      const t = e.touches[0];
      const dx = t.clientX - dragOrigin.current.startX;
      const dy = t.clientY - dragOrigin.current.startY;
      didDrag.current = true;
      setBubblePos({ x: dragOrigin.current.origX + dx, y: dragOrigin.current.origY + dy });
    };
    const onTouchEnd = () => {
      dragOrigin.current.active = false;
      setIsDragging(false);
      setTimeout(() => { didDrag.current = false; }, 0);
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  const onBubbleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if ((e.target as HTMLElement).closest(".close-btn")) return;
    const rect = bubbleRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    dragOrigin.current = { startX: clientX, startY: clientY, origX: rect.left, origY: rect.top, active: true };
    setIsDragging(true);
    if (!("touches" in e)) e.preventDefault();
  };

  const videoUrl = product.floatingVideoUrl || "https://videos.pexels.com/video-files/5885664/5885664-sd_360_640_24fps.mp4";

  useEffect(() => {
    setColor(product.swatches[0]);
    setSize(null);
    setAdded(false);
    setReelOpen(false);
    setVideoDismissed(false);
    setActiveShot(0);
    window.scrollTo({ top: 0, behavior: "instant" });

    // Track recently viewed in localStorage (max 8, deduplicated, current product first)
    try {
      const KEY = "hhara_recently_viewed";
      const stored: string[] = JSON.parse(localStorage.getItem(KEY) || "[]");
      const updated = [productId, ...stored.filter((id) => id !== productId)].slice(0, 8);
      localStorage.setItem(KEY, JSON.stringify(updated));
      setRecentlyViewed(updated.filter((id) => id !== productId));
    } catch {}
  }, [productId]);

  // Sync preview play state
  useEffect(() => {
    if (previewVideoRef.current) {
      if (reelOpen) {
        previewVideoRef.current.pause();
      } else {
        previewVideoRef.current.play().catch(() => {});
      }
    }
  }, [reelOpen]);

  const openReel = () => {
    setReelOpen(true);
    setIsPlaying(true);
    setIsMuted(false); // Unmute on click expand
    setProgress(0);
    setTimeout(() => {
      if (reelVideoRef.current) {
        reelVideoRef.current.currentTime = 0;
        reelVideoRef.current.muted = false;
        reelVideoRef.current.play().catch(() => {});
      }
    }, 100);
  };

  const closeReel = () => {
    setReelOpen(false);
    if (reelVideoRef.current) {
      reelVideoRef.current.pause();
    }
  };

  const togglePlay = () => {
    if (!reelVideoRef.current) return;
    if (reelVideoRef.current.paused) {
      reelVideoRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else {
      reelVideoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!reelVideoRef.current) return;
    reelVideoRef.current.muted = !reelVideoRef.current.muted;
    setIsMuted(reelVideoRef.current.muted);
  };

  const handleTimeUpdate = () => {
    if (!reelVideoRef.current) return;
    const duration = reelVideoRef.current.duration;
    if (!duration || isNaN(duration) || !isFinite(duration)) return;
    const pct = (reelVideoRef.current.currentTime / duration) * 100;
    setProgress(pct || 0);
  };

  const handleScrub = (e) => {
    if (!reelVideoRef.current) return;
    const duration = reelVideoRef.current.duration;
    if (!duration || isNaN(duration) || !isFinite(duration)) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newTime = (clickX / width) * duration;
    if (!isNaN(newTime) && isFinite(newTime)) {
      reelVideoRef.current.currentTime = newTime;
      setProgress((clickX / width) * 100);
    }
  };

  const handleAdd = async () => {
    if (!size) {
      if (reelOpen) {
        // Shake the reel's size selector to prompt the user
        const reelSelect = document.querySelector(".reel-cta-card select") as HTMLElement | null;
        if (reelSelect) {
          reelSelect.style.animation = "none";
          // Force reflow
          void reelSelect.offsetHeight;
          reelSelect.style.animation = "shake 0.5s ease";
          reelSelect.style.border = "1.5px solid #c0392b";
          setTimeout(() => {
            if (reelSelect) {
              reelSelect.style.border = "1px solid rgba(42, 31, 20, 0.25)";
              reelSelect.style.animation = "none";
            }
          }, 1200);
        }
      } else {
        const el = document.querySelector(".pdp-sizes");
        if (el) el.classList.add("flash");
        setTimeout(() => {
          const el = document.querySelector(".pdp-sizes");
          if (el) el.classList.remove("flash");
        }, 600);
      }
      return;
    }
    setAdding(true);
    try {
      await addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        color: color.name,
        size,
        tone: product.tone,
      });
      setAdded(true);
      setTimeout(() => setAdded(false), 1800);
    } catch (e) {
      console.error(e);
    } finally {
      setAdding(false);
    }
  };

  // Same capsule partner(s) — e.g. Imara Bra → Imara Legging
  const completeTheLook = PRODUCTS.filter((p) => p.id !== product.id && p.cat === product.cat);
  // Other capsule products — "You may also like"
  const youMayAlsoLike = PRODUCTS.filter((p) => p.cat !== product.cat);

  const origin = ORIGIN_MEANING[product.cat];
  const specs = PRODUCT_SPECS[product.name] || [];
  const tagline = product.tagline || PRODUCT_TAGLINES[product.name];

  return (
    <>
      <div className="pdp">
        <div className="pdp-crumbs">
          <span onClick={() => setRoute("home")} style={{ cursor: "pointer" }}>Home</span>
          <span className="sep">/</span>
          <span onClick={() => setRoute("shop")} style={{ cursor: "pointer" }}>{product.cat}</span>
          <span className="sep">/</span>
          <span>{product.name}</span>
        </div>

        <div className="pdp-main">
          <div className="pdp-gallery">
            {(() => {
              const a = product.imgKey ? IMGS[product.imgKey + "a"] : (product.featuredImage?.url || product.images?.[0]?.url || null);
              const b = product.imgKey ? IMGS[product.imgKey + "b"] : (product.images?.[1]?.url || product.featuredImage?.url || null);
              const shots = [
                { src: a, style: {} },
                { src: b, style: {} },
                { src: a, style: { filter: "brightness(0.92) contrast(1.05)" } },
                { src: b, style: { filter: "brightness(1.06)" } },
              ];
              const main = shots[activeShot] || shots[0];
              return (
                <>
                  <div className={`pdp-gallery-main ${product.tone}`}>
                    {main.src && <img src={main.src} alt="" className="img-fill" style={main.style} />}
                    <div className="pdp-gallery-tag">{product.cat}</div>
                    <div className="pdp-model-spec">Model is 5'9 wearing S</div>
                  </div>
                  <div className="pdp-gallery-thumbs">
                    {shots.map((s, i) => (
                      <button
                        key={i}
                        type="button"
                        className={`pdp-gallery-thumb ${activeShot === i ? "on" : ""}`}
                        onClick={() => setActiveShot(i)}
                      >
                        {s.src && <img src={s.src} alt="" className="img-fill" style={s.style} />}
                      </button>
                    ))}
                  </div>
                </>
              );
            })()}
          </div>

          <div className="pdp-info">
            <div className="pdp-info-cat">{product.cat}</div>
            <h1>{product.name}</h1>
            {tagline && <p className="pdp-tagline">{tagline}</p>}
            <div className="pdp-price">
              {product.priceWas && <span className="was">AED {product.priceWas.toLocaleString()}</span>}
              <span className="now">AED {product.price.toLocaleString()}</span>
              <span style={{ color: "#B8892E", fontSize: "18px", letterSpacing: "3px", marginLeft: "14px", lineHeight: 1 }}>★★★★★</span>
              <span className="pdp-vat-note">+ VAT at checkout</span>
            </div>

            <div className="pdp-divider"></div>

            {origin && (
              <div style={{ marginBottom: "24px" }}>
                <p style={{ fontFamily: "var(--sans)", fontStyle: "italic", fontWeight: 500, fontSize: "14px", color: "var(--ink)", margin: "0 0 6px" }}>
                  {origin.word} ({origin.tag}): {origin.tagline}
                </p>
                <p style={{ fontFamily: "var(--sans)", fontStyle: "italic", fontWeight: 300, fontSize: "12px", color: "var(--ink-soft)", margin: 0, lineHeight: 1.7 }}>
                  {origin.subtitle}
                </p>
              </div>
            )}

            <div className="pdp-option-row">
              <div className="lbl">
                <span>Colour</span>
                <span>{color.name}</span>
              </div>
              <div className="pdp-swatches">
                {product.swatches.map((s) => (
                  <button
                    key={s.name}
                    className={`sw ${color.name === s.name ? "on" : ""}`}
                    style={{ background: s.hex }}
                    onClick={() => setColor(s)}
                    title={s.name}
                  ></button>
                ))}
              </div>
            </div>

            <div style={{ margin: "12px 0 16px" }}>
              <div style={{ fontFamily: "var(--sans)", fontSize: "10px", letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 600, color: "var(--ink)", marginBottom: "6px" }}>Fit</div>
              <ul style={{ margin: 0, paddingLeft: "16px", fontFamily: "var(--sans)", fontSize: "12px", color: "var(--ink-soft)", lineHeight: 1.7 }}>
                <li>True to size, designed for a snug fit with medium-to-high compression.</li>
              </ul>
            </div>

            <div className="pdp-option-row">
              <div className="lbl">
                <span>Size</span>
                <span>Select a size</span>
              </div>
              <div className="pdp-sizes">
                {product.sizes.map((s) => {
                  const variantForSize = product.variants?.find((v: any) => {
                    const opts = Object.fromEntries(v.selectedOptions.map((o: any) => [o.name.toLowerCase(), o.value]));
                    return Object.values(opts).includes(s) && Object.values(opts).includes(color.name);
                  });
                  const outOfStock = variantForSize && !variantForSize.availableForSale;
                  return (
                    <button
                      key={s}
                      className={`${size === s ? "on" : ""} ${outOfStock ? "oos" : ""}`}
                      onClick={() => outOfStock ? null : setSize(s)}
                      disabled={outOfStock}
                      title={outOfStock ? "Sold out" : ""}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
              <span className="help" onClick={() => setSizeGuideOpen(true)} style={{ cursor: "pointer", textDecoration: "underline", fontSize: 11 }}>Not sure? View size guide</span>
            </div>

            <div className="pdp-actions">
              <button className="btn btn-primary btn-block" onClick={handleAdd} disabled={adding}>
                {adding ? (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                    <span className="spinner" style={{ width: 12, height: 12, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }}></span>
                    Adding...
                  </span>
                ) : added ? (
                  "Added to Bag ✓"
                ) : (
                  "Add to Bag"
                )}
              </button>
              <button className="btn btn-outline btn-block" onClick={() => onWishlistToggle?.(product.id)}>
                <Icon.Heart /> {wishlisted ? "Saved to Wishlist" : "Save to Wishlist"}
              </button>
            </div>

            <div className="pdp-trust-row">
              <div className="pdp-trust-item"><Icon.Truck /><span>Free UAE Delivery</span></div>
              <div className="pdp-trust-item"><Icon.Box /><span>Free Returns 14 Days (UAE)</span></div>
              <div className="pdp-trust-item"><Icon.Leaf /><span>Recycled Materials</span></div>
            </div>

            <div className="pdp-description-section" style={{ marginTop: "40px" }}>
              <div className="pdp-section-label">Description</div>
              {(product.description || "Premium recycled performance knit, engineered for movement, structure, and longevity.").split("\n\n").map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            <div className="pdp-accordions" style={{ marginTop: "32px" }}>
              <Accordion title="Fabric & Feel" open={open === "details"} onToggle={() => setOpen(open === "details" ? "" : "details")}>
                <p style={{ marginBottom: "16px", lineHeight: 1.7 }}>Buttery-soft and weightless recycled fabric feels almost like you're wearing nothing at all.</p>
                <p style={{ marginBottom: "20px", fontFamily: "var(--sans)", fontSize: "13px", opacity: 0.8 }}>75% Recycled Nylon · 25% Spandex</p>

                {/* Certifications */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
                  {["OEKO-TEX® STANDARD 100", "GLOBAL RECYCLED STANDARD 4.0"].map((cert) => (
                    <div key={cert} style={{ background: "var(--ink)", padding: "10px 16px", fontFamily: "var(--sans)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "#E8D8C8", textAlign: "center" }}>
                      {cert}
                    </div>
                  ))}
                </div>
                <p style={{ marginBottom: "20px", fontFamily: "var(--sans)", fontSize: "12.5px", lineHeight: 1.75, color: "var(--ink-soft)" }}>
                  Our fabric is certified to OEKO-TEX® Standard 100 — tested against harmful substances and safe for skin contact. Our recycled nylon is independently verified under the Global Recycled Standard 4.0, certified by Intertek.
                </p>

                {/* Fabric property icons */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px 12px", marginTop: "8px" }}>
                  {[
                    {
                      label: "4-Way Stretch",
                      icon: (
                        <svg viewBox="0 0 40 40" fill="none" width="36" height="36">
                          <line x1="20" y1="4" x2="20" y2="36" stroke="#B8892E" strokeWidth="1.5" strokeLinecap="round"/>
                          <line x1="4" y1="20" x2="36" y2="20" stroke="#B8892E" strokeWidth="1.5" strokeLinecap="round"/>
                          <polyline points="16,8 20,4 24,8" stroke="#B8892E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                          <polyline points="16,32 20,36 24,32" stroke="#B8892E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                          <polyline points="8,16 4,20 8,24" stroke="#B8892E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                          <polyline points="32,16 36,20 32,24" stroke="#B8892E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                        </svg>
                      ),
                    },
                    {
                      label: "Body Enhancing",
                      icon: (
                        <svg viewBox="0 0 40 40" fill="none" width="36" height="36">
                          <path d="M20 4 C13 4 10 10 10 16 C10 24 14 32 20 36 C26 32 30 24 30 16 C30 10 27 4 20 4Z" stroke="#B8892E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M15 14 C15 11 17 9 20 9 C23 9 25 11 25 14" stroke="#B8892E" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.6"/>
                        </svg>
                      ),
                    },
                    {
                      label: "Ultra Smooth",
                      icon: (
                        <svg viewBox="0 0 40 40" fill="none" width="36" height="36">
                          <path d="M8 14 Q20 10 32 14" stroke="#B8892E" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                          <path d="M8 20 Q20 16 32 20" stroke="#B8892E" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                          <path d="M8 26 Q20 22 32 26" stroke="#B8892E" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                        </svg>
                      ),
                    },
                    {
                      label: "Excellent Flexibility",
                      icon: (
                        <svg viewBox="0 0 40 40" fill="none" width="36" height="36">
                          <path d="M12 28 C12 20 16 14 20 10" stroke="#B8892E" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                          <path d="M28 28 C28 20 24 14 20 10" stroke="#B8892E" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                          <path d="M10 28 Q20 24 30 28" stroke="#B8892E" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                          <circle cx="20" cy="9" r="2" fill="#B8892E" opacity="0.7"/>
                        </svg>
                      ),
                    },
                    {
                      label: "Breathable",
                      icon: (
                        <svg viewBox="0 0 40 40" fill="none" width="36" height="36">
                          <path d="M20 32 L20 16" stroke="#B8892E" strokeWidth="1.5" strokeLinecap="round"/>
                          <path d="M20 16 C20 16 14 20 10 16 C8 14 10 10 14 12 C12 8 18 6 20 10" stroke="#B8892E" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                          <path d="M20 16 C20 16 26 20 30 16 C32 14 30 10 26 12 C28 8 22 6 20 10" stroke="#B8892E" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.65"/>
                        </svg>
                      ),
                    },
                    {
                      label: "OEKO-TEX",
                      icon: (
                        <svg viewBox="0 0 40 40" fill="none" width="36" height="36">
                          <circle cx="20" cy="20" r="14" stroke="#B8892E" strokeWidth="1.5"/>
                          <polyline points="13,20 18,25 27,14" stroke="#B8892E" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ),
                    },
                  ].map(({ label, icon }) => (
                    <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", textAlign: "center" }}>
                      {icon}
                      <span style={{ fontFamily: "var(--sans)", fontSize: "10px", letterSpacing: "0.10em", textTransform: "uppercase", color: "var(--ink-soft)", lineHeight: 1.3 }}>{label}</span>
                    </div>
                  ))}
                </div>
              </Accordion>
              <Accordion title="Size Guide" open={open === "fit"} onToggle={() => setOpen(open === "fit" ? "" : "fit")}>
                <p>Model is 178cm and wears a size S. Engineered for second-skin compression with 4-way mechanical stretch. We recommend taking your usual size; size down for a closer compression fit.</p>
              </Accordion>
              <Accordion title="Care and Instruction" open={open === "care"} onToggle={() => setOpen(open === "care" ? "" : "care")}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 32px", paddingTop: "4px" }}>
                  {[
                    { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" width="18" height="18"><path d="M3 7h18l-1.5 12H4.5L3 7z"/><path d="M1 7h22"/><path d="M8 12c1-1.5 2-1.5 3 0s2 1.5 3 0"/><path d="M12 5v2"/></svg>, label: "Machine Wash Cold" },
                    { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" width="18" height="18"><line x1="4" y1="4" x2="20" y2="20"/><line x1="20" y1="4" x2="4" y2="20"/><path d="M12 3L3 21h18L12 3z"/></svg>, label: "Do Not Bleach" },
                    { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" width="18" height="18"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2"/></svg>, label: "Tumble Dry Low" },
                    { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" width="18" height="18"><line x1="4" y1="4" x2="20" y2="20"/><line x1="20" y1="4" x2="4" y2="20"/><path d="M5 8h10l2 4H3l2-4z"/><path d="M3 12h18v2H3z"/><circle cx="8" cy="16" r="1.5"/><circle cx="16" cy="16" r="1.5"/></svg>, label: "Do Not Iron" },
                    { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" width="18" height="18"><line x1="4" y1="4" x2="20" y2="20"/><line x1="20" y1="4" x2="4" y2="20"/><circle cx="12" cy="12" r="9"/><text x="9.5" y="16" fontSize="8" fontFamily="sans-serif" fill="currentColor" stroke="none">P</text></svg>, label: "Do Not Dry Clean" },
                    { icon: null, label: "Wash With Like Colors" },
                  ].map(({ icon, label }, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", fontFamily: "var(--sans)", fontSize: "12px", color: "var(--ink-soft)" }}>
                      {icon ? <span style={{ flexShrink: 0, opacity: 0.7 }}>{icon}</span> : <span style={{ width: 18, height: 18, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", opacity: 0.5 }}>·</span>}
                      {label}
                    </div>
                  ))}
                </div>
              </Accordion>
              <Accordion title="Shipping & Returns" open={open === "ship"} onToggle={() => setOpen(open === "ship" ? "" : "ship")}>
                <div style={{ display: "flex", flexDirection: "column", gap: "20px", fontSize: "13px", lineHeight: 1.7 }}>
                  <div>
                    <p style={{ fontFamily: "var(--sans)", fontWeight: 600, fontSize: "13px", marginBottom: "8px", color: "var(--ink)" }}>Complimentary UAE Shipping</p>
                    <ul style={{ paddingLeft: "16px", margin: 0, display: "flex", flexDirection: "column", gap: "4px" }}>
                      <li>Complimentary next-day delivery across the UAE</li>
                      <li>No minimum order</li>
                      <li>Same-day delivery available for <strong>AED 28</strong> in Dubai, Abu Dhabi, Sharjah, and Ajman</li>
                    </ul>
                  </div>
                  <div>
                    <p style={{ fontFamily: "var(--sans)", fontWeight: 600, fontSize: "13px", marginBottom: "8px", color: "var(--ink)" }}>International Delivery</p>
                    <ul style={{ paddingLeft: "16px", margin: 0, display: "flex", flexDirection: "column", gap: "4px" }}>
                      <li>Complimentary Express Shipping on orders over <strong>AED 1,900</strong></li>
                      <li>
                        Flat-rate shipping:
                        <ul style={{ paddingLeft: "16px", marginTop: "4px", display: "flex", flexDirection: "column", gap: "2px" }}>
                          <li>GCC — AED 60</li>
                          <li>UK &amp; Europe — AED 80</li>
                          <li>Rest of World — AED 80</li>
                          <li>North America — AED 120</li>
                        </ul>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <p style={{ fontFamily: "var(--sans)", fontWeight: 600, fontSize: "13px", marginBottom: "8px", color: "var(--ink)" }}>Returns</p>
                    <ul style={{ paddingLeft: "16px", margin: 0, display: "flex", flexDirection: "column", gap: "4px" }}>
                      <li>Complimentary returns within <strong>14 days</strong> for UAE orders</li>
                      <li>GCC and international orders are final sale</li>
                    </ul>
                  </div>
                </div>
              </Accordion>
            </div>

          </div>
        </div>
      </div>

      {completeTheLook.length > 0 && (
        <section className="section" style={{ borderTop: "1px solid var(--line-soft)", paddingTop: "80px" }}>
          <div className="section-head">
            <div className="section-head-stack">
              <h2 className="section-title">Complete the look</h2>
            </div>
          </div>
          <div className="pgrid">
            {completeTheLook.map((p) => (
              <ProductCard key={p.id} product={p} onClick={() => openProduct(p.id)} />
            ))}
          </div>
        </section>
      )}

      {youMayAlsoLike.length > 0 && (
        <section className="section" style={{ borderTop: "1px solid var(--line-soft)", paddingTop: "80px" }}>
          <div className="section-head">
            <div className="section-head-stack">
              <span className="eyebrow">From our other capsule</span>
              <h2 className="section-title">You may also like</h2>
            </div>
          </div>
          <div className="pgrid">
            {youMayAlsoLike.map((p) => (
              <ProductCard key={p.id} product={p} onClick={() => openProduct(p.id)} />
            ))}
          </div>
        </section>
      )}

      {/* WHAT SHE SAYS: REVIEWS SECTION */}
      <section className="reviews-section" style={{ borderTop: "1px solid var(--line-soft)", marginTop: "40px" }}>
        <div className="reviews-header">
          <h2 className="reviews-title" style={{ textAlign: "center", width: "100%", fontSize: "clamp(38px, 5vw, 62px)" }}>What She Says</h2>
          <div className="reviews-nav">
            <button className="reviews-nav-btn" onClick={() => {
              const el = document.querySelector('.pdp-reviews-track');
              if (!el) return;
              const card = el.querySelector<HTMLElement>('.review-card');
              const step = card ? card.offsetWidth + 24 : 300;
              el.scrollBy({ left: -step, behavior: 'smooth' });
            }} aria-label="Previous reviews">←</button>
            <button className="reviews-nav-btn" onClick={() => {
              const el = document.querySelector('.pdp-reviews-track');
              if (!el) return;
              const card = el.querySelector<HTMLElement>('.review-card');
              const step = card ? card.offsetWidth + 24 : 300;
              el.scrollBy({ left: step, behavior: 'smooth' });
            }} aria-label="Next reviews">→</button>
          </div>
        </div>

        {/* Rating summary: avg score · star bars · quality/fit */}
        <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "32px var(--pad)", display: "grid", gridTemplateColumns: "auto 1fr auto", gap: "48px", alignItems: "center", borderBottom: "1px solid var(--line-soft)" }}>
          <div style={{ textAlign: "center", minWidth: "120px" }}>
            <div style={{ fontFamily: "var(--display)", fontSize: "56px", fontWeight: 300, lineHeight: 1, color: "var(--ink)" }}>{averageRating}</div>
            <div style={{ color: "var(--accent)", fontSize: "18px", letterSpacing: "2px", margin: "6px 0" }}>{"★".repeat(Math.round(parseFloat(averageRating)))}</div>
            <div style={{ fontFamily: "var(--sans)", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-soft)" }}>BASED ON {totalReviews} REVIEWS</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {[5,4,3,2,1].map(n => <StarRow key={n} stars={n} percentage={starsPercentage(n)} count={starsCount(n)} />)}
          </div>
          <div style={{ minWidth: "180px" }}>
            <ReviewSlider label="Quality" value="Excellent" position={90} />
            <ReviewSlider label="Fit" value="True to size" position={88} />
          </div>
        </div>

        <div className="reviews-track pdp-reviews-track">
          {reviews.map((r) => (
            <div key={r.id} className="review-card">
              <div className="review-stars">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</div>
              <blockquote className="review-quote">{r.quote}</blockquote>
              <div className="review-author">{r.name}</div>
              <div className="review-meta">{r.location} · {r.product}</div>
            </div>
          ))}
        </div>

        <div style={{ maxWidth: "1000px", margin: "48px auto 0", padding: "0 var(--pad)" }}>
          {!writeReviewOpen ? (
            <div style={{ display: "flex", justifyContent: "center" }}>
              <button className="btn btn-outline" onClick={() => setWriteReviewOpen(true)} style={{ display: "inline-flex", alignItems: "center", gap: "8px", textTransform: "uppercase", letterSpacing: "0.2em", fontSize: "12px", padding: "16px 40px" }}>
                ✦ Write a Review
              </button>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const body = [`Name: ${reviewForm.name}`, `Location: ${reviewForm.location}`, `Rating: ${"★".repeat(reviewForm.rating)}`, `Product: ${reviewForm.product || product.name}`, ``, reviewForm.quote].join("\n");
                window.location.href = `mailto:hello@hhara.com?subject=Product Review – ${encodeURIComponent(reviewForm.product || product.name)}&body=${encodeURIComponent(body)}`;
                setWriteReviewOpen(false);
                setReviewForm({ name: "", location: "", rating: 5, quote: "", product: "" });
              }}
              style={{ backgroundColor: "#FAF7F2", border: "1px solid var(--line-soft)", padding: "40px", marginBottom: "48px", display: "flex", flexDirection: "column", gap: "24px", textAlign: "left" }}
            >
              <h3 style={{ fontFamily: "var(--display)", fontSize: "20px", fontWeight: 300, color: "var(--ink)", margin: 0 }}>Write a Review</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }} className="pdp-review-form-cols">
                <div className="gc-field">
                  <label>Your Name</label>
                  <input type="text" required placeholder="Enter your name" value={reviewForm.name} onChange={e => setReviewForm(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div className="gc-field">
                  <label>Location (e.g. Dubai, UAE)</label>
                  <input type="text" required placeholder="Enter your location" value={reviewForm.location} onChange={e => setReviewForm(p => ({ ...p, location: e.target.value }))} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }} className="pdp-review-form-cols">
                <div className="gc-field">
                  <label>Rating</label>
                  <select value={reviewForm.rating} onChange={e => setReviewForm(p => ({ ...p, rating: parseInt(e.target.value) }))} style={{ width: "100%", padding: "10px 0", border: "none", borderBottom: "1px solid var(--line)", background: "transparent", fontFamily: "var(--sans)", fontSize: "14px", outline: "none", color: "var(--ink)" }}>
                    <option value="5">★★★★★ (5 Stars)</option>
                    <option value="4">★★★★☆ (4 Stars)</option>
                    <option value="3">★★★☆☆ (3 Stars)</option>
                    <option value="2">★★☆☆☆ (2 Stars)</option>
                    <option value="1">★☆☆☆☆ (1 Star)</option>
                  </select>
                </div>
                <div className="gc-field">
                  <label>Product</label>
                  <input type="text" placeholder="e.g. Imara Bra · Chicory Coffee" value={reviewForm.product} onChange={e => setReviewForm(p => ({ ...p, product: e.target.value }))} />
                </div>
              </div>
              <div className="gc-field">
                <label>Your Review</label>
                <textarea rows={4} required placeholder="Tell us what you think about the fabric, fit, and style..." value={reviewForm.quote} onChange={e => setReviewForm(p => ({ ...p, quote: e.target.value }))} />
              </div>
              <div style={{ display: "flex", gap: "16px", marginTop: "8px" }}>
                <button type="submit" className="btn btn-primary" style={{ padding: "16px 32px" }}>Submit Review</button>
                <button type="button" className="btn btn-outline" onClick={() => setWriteReviewOpen(false)} style={{ padding: "16px 32px" }}>Cancel</button>
              </div>
            </form>
          )}
        </div>

      </section>


      {sizeGuideOpen && (
        <>
          <div className="cart-backdrop open" onClick={() => setSizeGuideOpen(false)} style={{ zIndex: 1000 }}></div>
          <aside className="cart-drawer open" style={{ zIndex: 1001, padding: "24px 32px", width: "100%", maxWidth: "480px" }}>
            <div className="cart-head" style={{ marginBottom: 32 }}>
              <h3>Size Guide</h3>
              <button onClick={() => setSizeGuideOpen(false)}><Icon.Close /></button>
            </div>

            <p style={{ fontSize: 14, opacity: 0.7, lineHeight: 1.6, marginBottom: 24 }}>
              Our capsule is engineered for second-skin compression. If you prefer a less restrictive fit, we recommend sizing up.
            </p>

            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, textAlign: "left", marginBottom: 32 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--line-soft)", textTransform: "uppercase", fontSize: 11, letterSpacing: "0.1em" }}>
                  <th style={{ padding: "8px 0" }}>Size</th>
                  <th>Chest (cm)</th>
                  <th>Waist (cm)</th>
                  <th>Hips (cm)</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: "1px solid var(--line-soft)" }}><td style={{ padding: "12px 0" }}><strong>XS</strong> (0–2)</td><td>80–84</td><td>60–64</td><td>86–90</td></tr>
                <tr style={{ borderBottom: "1px solid var(--line-soft)" }}><td style={{ padding: "12px 0" }}><strong>S</strong> (4–6)</td><td>85–89</td><td>65–69</td><td>91–95</td></tr>
                <tr style={{ borderBottom: "1px solid var(--line-soft)" }}><td style={{ padding: "12px 0" }}><strong>M</strong> (8–10)</td><td>90–94</td><td>70–74</td><td>96–100</td></tr>
                <tr style={{ borderBottom: "1px solid var(--line-soft)" }}><td style={{ padding: "12px 0" }}><strong>L</strong> (12–14)</td><td>95–99</td><td>75–79</td><td>101–105</td></tr>
                <tr style={{ borderBottom: "1px solid var(--line-soft)" }}><td style={{ padding: "12px 0" }}><strong>XL</strong> (16)</td><td>100–104</td><td>80–84</td><td>106–110</td></tr>
              </tbody>
            </table>

            <h4 style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 12 }}>How to measure</h4>
            <ul style={{ paddingLeft: 0, listStyle: "none", fontSize: 13, lineHeight: 1.7, opacity: 0.8, display: "flex", flexDirection: "column", gap: 12 }}>
              <li><strong>1. Chest:</strong> Measure around the fullest part of your chest, keeping the tape horizontal.</li>
              <li><strong>2. Waist:</strong> Measure around the narrowest part of your waistline (typically where your body bends side to side).</li>
              <li><strong>3. Hips:</strong> Measure around the fullest part of your hips, keeping your feet together.</li>
            </ul>
          </aside>
        </>
      )}

      {/* Custom Floating Video Bubble */}
      {!videoDismissed && (
        <div
          ref={bubbleRef}
          className={`floating-video-bubble${isDragging ? " dragging" : ""}`}
          onClick={() => { if (!didDrag.current) openReel(); }}
          onMouseDown={onBubbleDragStart}
          onTouchStart={onBubbleDragStart}
          aria-label="Watch styling video"
          style={bubblePos ? { left: bubblePos.x, top: bubblePos.y, bottom: "auto", right: "auto" } : undefined}
        >
          <button
            className="close-btn"
            onClick={(e) => {
              e.stopPropagation();
              setVideoDismissed(true);
            }}
            title="Dismiss video"
            aria-label="Dismiss video"
          >
            ✕
          </button>
          <video
            ref={previewVideoRef}
            src={videoUrl}
            muted
            loop
            playsInline
            autoPlay
          />
          <div className="tooltip">See it on model</div>
        </div>
      )}

      {/* Restore button shown after bubble is dismissed */}
      {videoDismissed && (
        <button
          className="video-bubble-restore"
          onClick={() => setVideoDismissed(false)}
          title="Watch styling video"
          aria-label="Restore styling video"
        >
          <svg viewBox="0 0 24 24" width="11" height="11" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          Video
        </button>
      )}

      {/* Expanded Reel Player Modal & Backdrop */}
      {reelOpen && (
        <>
          <div 
            className="reel-backdrop open" 
            onClick={closeReel}
          />
          <dialog 
            className="reel-dialog open" 
            open
            aria-labelledby="reel-video-title"
          >
            <div className="reel-video-container">
              <div className="reel-header">
                <span id="reel-video-title" className="reel-title">See It In Action</span>
                <button 
                  className="reel-close" 
                  onClick={closeReel}
                  aria-label="Close video player"
                >
                  <Icon.Close />
                </button>
              </div>

              {/* Play / Pause toggle clickable area */}
              <div className="reel-play-overlay" onClick={togglePlay}>
                <div className={`reel-play-icon ${!isPlaying ? "visible" : ""}`}>
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>

              <video
                ref={reelVideoRef}
                src={videoUrl}
                loop
                playsInline
                onTimeUpdate={handleTimeUpdate}
                onClick={togglePlay}
                autoPlay
              />

              {/* Bottom controls: Timeline, Play/Pause toggle, and Volume toggle */}
              <div className="reel-controls-bar">
                <button 
                  className="reel-control-btn" 
                  onClick={togglePlay}
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  )}
                </button>

                <div 
                  className="reel-timeline-wrapper" 
                  onClick={handleScrub}
                  title="Scrub video"
                >
                  <div 
                    className="reel-timeline-fill" 
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <button 
                  className="reel-control-btn" 
                  onClick={toggleMute}
                  aria-label={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? (
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                      <path d="M3.63 3.63L2.22 5.05L7 9.83v4.34a1 1 0 0 0 .55.89l3.74 2.2a1 1 0 0 0 1 .05 1 1 0 0 0 .43-.76v-2.31l3.52 3.52a6.83 6.83 0 0 1-2.24.96v2.02a8.87 8.87 0 0 0 3.66-1.57l2.28 2.28 1.41-1.41L3.63 3.63zM10.72 14H9v-2.28l1.72 1.72V14zM12.72 4.3a1 1 0 0 0-1-.05l-3.23 1.9L9.9 7.57l1.82-1.07v1.89l2 2v-4.3a1 1 0 0 0-.43-.76c-.17-.12-.37-.18-.57-.18zM19 12a6.91 6.91 0 0 1-.74 3.09l1.46 1.46A8.88 8.88 0 0 0 21 12a9 9 0 0 0-6-8.47v2.02A7 7 0 0 1 19 12z"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                      <path d="M5 9v6h4l5 5V4L9 9H5zm11 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM13.5 3.12v2.06c2.89.86 5 3.54 5 6.82s-2.11 5.96-5 6.82v2.06c4-.9 7-4.52 7-8.88s-3-7.98-7-8.88z"/>
                    </svg>
                  )}
                </button>
              </div>

              {/* Conversion-boosting Floating CTA Card */}
              <div className="reel-cta-card">
                <div className="reel-cta-thumb">
                  {product.featuredImage?.url && (
                    <img src={product.featuredImage.url} alt={product.name} />
                  )}
                </div>
                
                <div className="reel-cta-details">
                  <div className="reel-cta-name" title={product.name}>{product.name}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "nowrap" }}>
                    <span className="reel-cta-price">AED {product.price.toLocaleString()}</span>
                    
                    {/* Synchronized Size Selector dropdown inside the Reel player */}
                    {product.sizes && product.sizes.length > 0 && (
                      <select
                        value={size || ""}
                        onChange={(e) => setSize(e.target.value || null)}
                        style={{
                          fontSize: "8.5px",
                          padding: "2px 4px",
                          borderRadius: "4px",
                          border: "1px solid rgba(42, 31, 20, 0.25)",
                          background: "rgba(255,255,255,0.85)",
                          fontFamily: "var(--sans)",
                          outline: "none",
                          cursor: "pointer",
                          color: "#2A1F14",
                          lineHeight: "1",
                        }}
                      >
                        <option value="">Size</option>
                        {product.sizes.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                <button 
                  className="reel-cta-action-btn"
                  onClick={handleAdd}
                  disabled={adding}
                >
                  {adding ? (
                    <span className="spinner" style={{ width: 10, height: 10, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }}></span>
                  ) : added ? (
                    "Added ✓"
                  ) : (
                    "Add to Bag"
                  )}
                </button>
              </div>
            </div>
          </dialog>
        </>
      )}
    </>
  );
}

function Accordion({ title, open, onToggle, children }) {
  const headRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => {
    const top = headRef.current?.getBoundingClientRect().top ?? 0;
    onToggle();
    requestAnimationFrame(() => {
      const newTop = headRef.current?.getBoundingClientRect().top ?? 0;
      window.scrollBy(0, newTop - top);
    });
  };

  return (
    <div className="pdp-accordion">
      <div ref={headRef} className="pdp-accordion-head" onClick={handleToggle}>
        <span>{title}</span>
        <span>{open ? <Icon.Minus /> : <Icon.Plus />}</span>
      </div>
      {open && <div className="pdp-accordion-body">{children}</div>}
    </div>
  );
}

// === FILE 09-718230b5-91da-4f2c-9517-cb0dc01bac28.jsx ===

// ============ ATELIER / ABOUT ============
function AtelierPage({ setRoute }) {

  return (
    <>
      <section className="atelier-hero">
        <img src={IMGS.atelierHero} alt="" className="img-fill motion" />
        <div className="ovr"></div>
        <div className="copy">
          <h1>She is not just enough.<br /><em>She is extraordinary.</em></h1>
        </div>
      </section>

      <section className="atelier-intro" style={{ maxWidth: 840 }}>
        <h2 style={{ fontFamily: "var(--display)", fontSize: "clamp(38px, 4.5vw, 56px)", fontWeight: 300, marginBottom: 24, letterSpacing: "-0.015em", color: "var(--ink)" }}>HHARA <em>(ā-rā)</em></h2>
        <p style={{ fontFamily: "var(--display)", fontSize: "clamp(20px, 2.2vw, 28px)", lineHeight: 1.45, fontStyle: "italic", marginBottom: 32, color: "var(--ink)" }}>
          From the Yoruba dialect. It means wonder. Not the gasp of surprise, but the deep, quiet recognition of something extraordinary that was always there.
        </p>
        <div className="sig" style={{ fontFamily: "var(--display)", fontSize: 24, fontStyle: "italic", color: "var(--accent)", marginBottom: 36 }}>She does not have Wonder. She is Wonder.</div>
        <div>
          <button className="btn btn-primary" onClick={() => setRoute("shop")}>
            Shop the Collection
            <span className="btn-arrow"><Icon.Arrow /></span>
          </button>
        </div>
      </section>

      <section className="atelier-split">
        <div className="media">
          <img src={IMGS.atelierFlorence} alt="" className="img-fill" loading="lazy" />
        </div>
        <div className="body">
          <h2>We&rsquo;ve got your <span style={{ color: "var(--accent)" }}>back</span>,<br /><em>your <span style={{ color: "var(--accent)" }}>legs</span>, And your <span style={{ color: "var(--accent)" }}>day</span>.</em></h2>
          <p>
            What began as a vision for movement has grown into something more - a wardrobe for the woman who is always, quietly, doing everything at once. HHARA was designed to move the way she does: without pause, without compromise.
          </p>
          <p>
            Effortless. Flattering. Considered in every detail. Every fabric is chosen with intention. Every piece is made to move seamlessly through her day.
          </p>
          <p style={{ fontStyle: "italic", color: "var(--accent)", fontWeight: 500, marginTop: 24 }}>
            She shouldn't have to choose. HHARA was built so she never has to.
          </p>
        </div>
      </section>

      <section className="atelier-video">
        <img src={IMGS.atelierVideo} alt="" />
        <video
          src={VIDEOS && VIDEOS.motion2}
          autoPlay muted loop playsInline
          poster={IMGS.atelierVideo}
          onError={(e: any) => { e.target.style.display = "none"; }}
        ></video>
        <div className="vovr"></div>
        <div className="play">
          <svg viewBox="0 0 24 24"><polygon points="6 4 20 12 6 20"></polygon></svg>
        </div>
      </section>

      <section className="atelier-split flip">
        <div className="media">
          <img src={IMGS.atelierCloth} alt="" className="img-fill" loading="lazy" />
        </div>
        <div className="body">
          <h2>She deserves <span style={{ color: "var(--accent)" }}>luxury</span>.<br /><em>And <span style={{ color: "var(--accent)" }}>a planet</span> worth protecting.</em></h2>
          <p>
            We believe she should never have to choose between the two.
          </p>
          <p>
            Our pieces are made from responsibly sourced materials.
          </p>
          <p>
            Thoughtfully crafted, because she - and the planet - deserve both.
          </p>
        </div>
      </section>

      <section className="gives-back-section dark" style={{ padding: "clamp(60px, 8vh, 100px) var(--pad)", backgroundColor: "var(--bark)", textAlign: "center" }}>
        <div className="gives-back-content-width" style={{ maxWidth: 800, margin: "0 auto" }}>
          <blockquote className="gives-back-quote-banner" style={{ fontStyle: "italic", fontSize: 32, lineHeight: 2.2, marginBottom: 16, color: "#FAF7F2", fontFamily: "var(--display)", fontWeight: 300 }}>
            "She moves before the world notices. She carries what others don't see. She is the woman who shows up, for everyone, and still finds a way to show up for herself. HHARA was made for her. From the very first stitch."
          </blockquote>
          <div style={{ marginTop: 24, fontSize: 11, letterSpacing: "0.35em", textTransform: "uppercase", color: "var(--accent)" }}>She is Wonder. She is HHARA.</div>
        </div>
      </section>
    </>
  );
}

const GIFT_CARD_AMOUNTS = [1000, 750, 600, 400];

function GiftCardPage({ setRoute, addToCart, setCartOpen }) {
  const [amount, setAmount] = useState(GIFT_CARD_AMOUNTS[0]);
  const [customAmount, setCustomAmount] = useState("");
  const [qty, setQty] = useState(1);
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [senderName, setSenderName] = useState("");
  const [note, setNote] = useState("");
  const [unavailable, setUnavailable] = useState(false);

  const activeAmount = customAmount ? Math.max(0, parseFloat(customAmount) || 0) : amount;
  const total = activeAmount * qty;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (addToCart) {
      for (let i = 0; i < qty; i++) {
        await addToCart({
          id: "gift-card",
          name: `HHARA Gift Card – AED ${activeAmount}`,
          price: activeAmount,
          color: "-",
          size: "-",
          tone: "tone-4",
          isGiftCard: true,
          recipientName,
          recipientEmail,
          senderName,
          note,
        });
      }
      if (setCartOpen) setCartOpen(true);
    } else {
      setUnavailable(true);
    }
  };

  return (
    <>
      <div className="gc-main">
        {/* Left Column: Image/Placeholder */}
        <div className="gc-gallery">
          <div className="gc-placeholder">
            <div className="gc-placeholder-star">✦</div>
            <div className="gc-placeholder-title">Image Placeholder</div>
            <div className="gc-placeholder-desc">
              Lifestyle or product photo - e.g. model holding the card, or styled flat-lay with the Dahlia / Imara Set
            </div>
          </div>
          <p className="gc-intro-text">
            For the woman who already has everything, and the one still becoming who she's meant to be. Redeemable across every HHARA collection, delivered straight to her inbox.
          </p>

        </div>

        {/* Right Column: Form Info */}
        <div className="gc-info">
          <div className="gc-eyebrow">The HHARA Gift Card</div>
          <h1 className="gc-title">Give her the <span style={{ color: "var(--accent)" }}>beginning</span> of{"\n"}<span style={{ color: "var(--accent)" }}>something</span>.</h1>
          <p className="gc-subtitle">A gift for wherever her day takes her.</p>

          <form onSubmit={handleCheckout} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Amounts Grid */}
            <div className="gc-amounts-grid">
              {GIFT_CARD_AMOUNTS.map((a) => (
                <button
                  key={a}
                  type="button"
                  className={`gc-amount-btn ${!customAmount && amount === a ? "on" : ""}`}
                  onClick={() => {
                    setAmount(a);
                    setCustomAmount("");
                  }}
                >
                  <span style={{ fontFamily: "var(--sans)", fontSize: "10px", fontWeight: 500, letterSpacing: "0.08em", verticalAlign: "middle", marginRight: 4, opacity: 0.7 }}>AED</span>{a}
                </button>
              ))}
            </div>

            {/* Custom Amount Wrapper */}
            <div className="gc-custom-amount-wrapper">
              <span className="gc-custom-amount-symbol">AED</span>
              <input
                className="gc-custom-amount-input"
                type="number"
                min="1"
                placeholder="Enter a custom amount"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
              />
            </div>

            {/* Quantity Selector */}
            <div className="gc-qty-row">
              <label className="gc-qty-label">Quantity</label>
              <div className="gc-qty-selector">
                <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))}>
                  <Icon.Minus />
                </button>
                <span>{qty}</span>
                <button type="button" onClick={() => setQty((q) => q + 1)}>
                  <Icon.Plus />
                </button>
              </div>
            </div>

            {/* Recipient's Name */}
            <div className="gc-field">
              <label>Recipient's Name</label>
              <input
                type="text"
                required
                placeholder="Her name"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
              />
            </div>

            {/* Recipient's Email */}
            <div className="gc-field">
              <label>Recipient's Email</label>
              <input
                type="email"
                required
                placeholder="Where it should arrive"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
              />
            </div>

            {/* Your Name */}
            <div className="gc-field">
              <label>Your Name</label>
              <input
                type="text"
                required
                placeholder="From"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
              />
            </div>

            {/* Personal Note */}
            <div className="gc-field">
              <label style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span>A Personal Note (Optional)</span>
                <span style={{ fontFamily: "var(--sans)", fontSize: 10, fontWeight: 400, letterSpacing: "0.05em", color: "var(--ink-soft)", opacity: 0.7 }}>{note.length}/150</span>
              </label>
              <textarea
                rows={3}
                maxLength={150}
                placeholder="Write a few words for her..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            {/* Checkout Info & Button */}
            <div className="pdp-divider" style={{ margin: "8px 0 0 0" }}></div>
            
            <div className="gc-summary-row">
              <span style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--ink)" }}>Gift card value</span>
              <span style={{ fontSize: 15, fontWeight: 500 }}>${total.toLocaleString()}.00</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button className="btn btn-primary btn-block" type="submit" disabled={activeAmount <= 0}>
                Add to Bag
                <span className="btn-arrow">
                  <Icon.Arrow />
                </span>
              </button>

              {unavailable && (
                <p style={{ fontSize: 13, color: "var(--ink-soft)", textAlign: "center", margin: 0 }}>
                  Gift cards are launching soon. In the meantime, email{" "}
                  <a href="mailto:hello@hhara.com" style={{ textDecoration: "underline" }}>
                    hello@hhara.com
                  </a>{" "}
                  and we'll arrange one for you directly.
                </p>
              )}
              <p style={{ fontSize: 11, color: "var(--ink-soft)", textAlign: "center", opacity: 0.8, margin: 0 }}>
                Delivered instantly by email · Valid for 12 months from the date of purchase · Redeemable on hhara.com
              </p>
            </div>
          </form>
        </div>
      </div>

      <div className="section-head" style={{ maxWidth: "var(--maxw)", margin: "100px auto 20px", padding: "0 var(--pad)" }}>
        <div className="section-head-stack">
          <span className="eyebrow">How It Works</span>
          <h2 className="section-title" style={{ fontWeight: 300 }}>Simple, <em style={{ color: "var(--accent)" }}>by design.</em></h2>
        </div>
      </div>

      <div className="pillars-grid" style={{ maxWidth: "var(--maxw)", margin: "0 auto", padding: "0 var(--pad) 100px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 28 }}>
        {[
          { title: "Choose an amount", body: "Select one of ours, or set your own, whatever feels right for the occasion." },
          { title: "Add her details", body: "Checkout like any other order. We'll deliver it straight to her inbox, with your note attached." },
          { title: "She chooses her piece", body: "Redeemable across every HHARA collection, so she can decide what she needs, in her own time." },
        ].map((card, i) => (
          <div key={i} className="pillar-card">
            <h3 className="pillar-title">{card.title}</h3>
            <p className="pillar-body">{card.body}</p>
          </div>
        ))}
      </div>
    </>
  );
}

const JOURNAL = [
  { id: "j1", title: "From plastic waste to performance grade", excerpt: "Inside the regenerative knit: how ocean and industrial plastic become a sensory-grade fabric.", date: "26 May 2026", cat: "Material Transparency", img: "j1" },
  { id: "j2", title: "On Chicory Coffee and Olive Green", excerpt: "Two colorways, two languages. Choosing pigments that capture mineral earth and inner energy.", date: "14 May 2026", cat: "The Palette", img: "j2" },
  { id: "j3", title: "Why we make only four pieces", excerpt: "The case for minimalist production: fewer SKUs, lower waste, garments engineered to outlast.", date: "02 May 2026", cat: "Our Ethos", img: "j3" },
  { id: "j4", title: "Wonder, Worn", excerpt: "Three women, two sets: the Imara and Dahlia, photographed across the UAE.", date: "21 April 2026", cat: "The Capsule", img: "j4" },
  { id: "j5", title: "Carbon-neutral, from the UAE", excerpt: "How optimised smart-freight from our regional base offsets every single shipment.", date: "08 April 2026", cat: "Circular Luxury", img: "j5" },
  { id: "j6", title: "The 10% directive", excerpt: "Where the philanthropic share goes: women-led literacy, micro-endowments, and clean water alliances.", date: "27 March 2026", cat: "Social Impact", img: "j6" },
];

function JournalIndex({ setRoute, openArticle }) {

  return (
    <>
      <div className="page-head">
        <span className="eyebrow">The Journal</span>
        <h1>Notes <em>from the collective</em></h1>
        <p className="lead">
          Dispatches on regenerative materials, carbon-neutral logistics, the women-led initiatives we fund,
          and the editorial language of the HHARA capsule, published twice monthly, never more.
        </p>
      </div>
      <div className="journal-grid">
        {JOURNAL.map((j) => (
          <div className="journal-card" key={j.id} onClick={() => openArticle(j.id)}>
            <div className="img">
              <img src={IMGS[j.img]} alt={j.title} className="img-fill" loading="lazy" />
            </div>
            <div className="meta">
              <span>{j.cat}</span>
              <span style={{ opacity: 0.5 }}>·</span>
              <span>{j.date}</span>
            </div>
            <h3>{j.title}</h3>
            <p className="ex">{j.excerpt}</p>
            <span className="read">Read the piece</span>
          </div>
        ))}
      </div>
    </>
  );
}

function ArticlePage({ articleId, setRoute, openArticle }) {

  const a = JOURNAL.find((x) => x.id === articleId) || JOURNAL[0];
  return (
    <>
      <section className="article-hero">
        <img src={IMGS.jHero} alt="" className="img-fill motion" />
        <div className="ovr"></div>
        <div className="meta">
          <div className="tags">
            <span>{a.cat}</span>
            <span style={{ opacity: 0.5 }}>·</span>
            <span>{a.date}</span>
            <span style={{ opacity: 0.5 }}>·</span>
            <span>8 minutes</span>
          </div>
          <h1>{a.title.split(" ").slice(0, -2).join(" ")} <em>{a.title.split(" ").slice(-2).join(" ")}</em></h1>
        </div>
      </section>

      <article className="article-body">
        <div className="deck">
          <em>Captured plastic.</em> Re-spun fibre. A high-density double-knit. We trace the regenerative
          journey from waste stream to wearable, and ask why it took us this long.
        </div>

        <p className="dropcap">
          The fibre arrives by container, baled and labelled, sourced from ocean-recovery programs and industrial
          waste streams across three continents. What enters the mill as a polymer sheet leaves it as a yarn
          , a high-density double-knit engineered for moisture management, capillary ventilation, and structured
          recovery. To the eye, it is a sensory-grade textile. To the hand, it weighs almost nothing.
        </p>

        <p>
          Each colourway is calibrated in small batches. Chicory Coffee, a deep, mineral neutral pulled from raw
          earth pigment, is set first; Olive Green, the muted jewel, is reserved for the second pass. Both are
          designed to absorb, not reflect, to be worn quietly, not announced.
        </p>

        <figure>
          <div className="ph" style={{ background: "var(--line-soft)" }}>
            <img src={IMGS.jFig1} alt="" className="img-fill" loading="lazy" />
          </div>
          <figcaption>Recycled performance knit, pre-cut</figcaption>
        </figure>

        <blockquote>
          &ldquo;We are not in the business of seasonal turnover. We are in the business of pieces
          you return to, and pieces that fund the work of women, every time you do.&rdquo;
        </blockquote>

        <h3>The structure</h3>
        <p>
          The Imara framework is cut for compression and elongation, with a chevron-anatomical waistband on the
          legging, zero-slip stabilization, flatlock seams that vanish against skin. The Dahlia framework
          is its counterpoint: cross-back architecture, omnidirectional 4-way stretch, an inner waistband
          pocket sewn into the short. Two perspectives. One uncompromising identity.
        </p>

        <p>
          Both sets share the same hardware language: brushed-gold, low-friction, designed to disappear in
          motion and only resolve at rest. Every component is selected for repair. Every seam is built to
          outlast a single season of wear.
        </p>

        <figure>
          <div className="ph" style={{ background: "var(--line-soft)" }}>
            <img src={IMGS.jFig2} alt="" className="img-fill" loading="lazy" />
          </div>
          <figcaption>Brushed-gold hardware detail, second pass</figcaption>
        </figure>

        <h3>The return</h3>
        <p>
          Each piece is shipped from the UAE on a carbon-neutral freight schedule. 10% of the gross revenue of
          every order routes directly to women-led socio-economic development and education initiatives, the
          philanthropic directive is not an afterthought but the operating model.
        </p>

        <p>
          The garment is built to endure. It will be repaired, returned, re-circulated. And the value
          will be measured not in seasons, but in social impact. This is, we have come to believe, the entire point.
        </p>

        <div className="article-foot">
          <span onClick={() => setRoute("journal")} style={{ cursor: "pointer", borderBottom: "1px solid var(--ink)", paddingBottom: 3 }}>← All Journal entries</span>
          <span onClick={() => openArticle(JOURNAL[(JOURNAL.findIndex(j => j.id === a.id) + 1) % JOURNAL.length].id)} style={{ cursor: "pointer", borderBottom: "1px solid var(--ink)", paddingBottom: 3 }}>Next piece →</span>
        </div>
      </article>

      <section className="section" style={{ borderTop: "1px solid var(--line-soft)", marginTop: 0 }}>
        <div className="section-head">
          <div className="section-head-stack">
            <span className="eyebrow">Continue reading</span>
            <h2 className="section-title">More from the Journal</h2>
          </div>
        </div>
        <div className="journal-grid" style={{ padding: 0 }}>
          {JOURNAL.filter((j) => j.id !== a.id).slice(0, 3).map((j) => (
            <div className="journal-card" key={j.id} onClick={() => openArticle(j.id)}>
              <div className="img">
                <img src={IMGS[j.img]} alt="" className="img-fill" loading="lazy" />
              </div>
              <div className="meta">
                <span>{j.cat}</span>
                <span style={{ opacity: 0.5 }}>·</span>
                <span>{j.date}</span>
              </div>
              <h3>{j.title}</h3>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

// ============ LOOKBOOK FULL ============
function LookbookPage({ setRoute, openProduct }) {

  const PRODUCTS = useProducts();
  return (
    <>
      <div className="page-head">
        <span className="eyebrow">The HHARA Capsule</span>
        <h1>The <em>Lookbook</em></h1>
        <p className="lead">
          Four pieces. Two sets. Two colourways. Styled the way she'd wear them into the world - moving through her day with the same bold intention HHARA was built on. Every look is a starting point, not a rule.
        </p>
      </div>
      <div className="lb-full">
        <div className="lb-row single">
          <div className="lb-tile hero">
            <img src={IMGS.lb9} alt="" className="img-fill" loading="lazy" />
            <div className="ovr"></div>
            <div className="caption">
              <div>The Imara Set</div>
              <div className="ttl">Strength, In Form</div>
            </div>
            <div className="hotspot" style={{ top: "55%", left: "38%" }} onClick={() => openProduct("p1")}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </div>
          </div>
        </div>

        <div className="lb-row cols-2">
          <div className="lb-tile">
            <img src={IMGS.lb1} alt="" className="img-fill" loading="lazy" />
            <div className="ovr"></div>
            <div className="caption"><div className="ttl">Imara Bra</div></div>
            <div className="hotspot" style={{ top: "62%", left: "50%" }} onClick={() => openProduct("p1")}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </div>
          </div>
          <div className="lb-tile">
            <img src={IMGS.lb2} alt="" className="img-fill" loading="lazy" />
            <div className="ovr"></div>
            <div className="caption"><div className="ttl">Imara Legging</div></div>
            <div className="hotspot" style={{ top: "48%", left: "55%" }} onClick={() => openProduct("p2")}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </div>
          </div>
        </div>

        <div className="lb-row cols-3">
          <div className="lb-tile">
            <img src={IMGS.lb3} alt="" className="img-fill" loading="lazy" />
            <div className="ovr"></div>
            <div className="caption"><div className="ttl">Chicory Coffee</div></div>
          </div>
          <div className="lb-tile">
            <img src={IMGS.lb4} alt="" className="img-fill" loading="lazy" />
            <div className="ovr"></div>
            <div className="caption"><div className="ttl">Dahlia Bra</div></div>
            <div className="hotspot" style={{ top: "70%", left: "40%" }} onClick={() => openProduct("p3")}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </div>
          </div>
          <div className="lb-tile">
            <img src={IMGS.lb5} alt="" className="img-fill" loading="lazy" />
            <div className="ovr"></div>
            <div className="caption"><div className="ttl">Olive Green</div></div>
          </div>
        </div>

        <div className="lb-row cols-2-flip">
          <div className="lb-tile">
            <img src={IMGS.lb6} alt="" className="img-fill" loading="lazy" />
            <div className="ovr"></div>
            <div className="caption"><div className="ttl">Dahlia Short</div></div>
            <div className="hotspot" style={{ top: "50%", left: "45%" }} onClick={() => openProduct("p4")}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </div>
          </div>
          <div className="lb-tile">
            <img src={IMGS.lb7} alt="" className="img-fill" loading="lazy" />
            <div className="ovr"></div>
            <div className="caption">
              <div>The Dahlia Set</div>
              <div className="ttl">Grace, In Form</div>
            </div>
            <div className="hotspot" style={{ top: "55%", left: "50%" }} onClick={() => openProduct("p3")}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </div>
          </div>
        </div>

        <div className="lb-row single">
          <div className="lb-tile wide">
            <img src={IMGS.lb8} alt="" className="img-fill" loading="lazy" />
            <div className="ovr"></div>
            <div className="caption">
              <div className="ttl">Considered luxury, around the world.</div>
            </div>
          </div>
        </div>
      </div>

      <section className="section" style={{ borderTop: "1px solid var(--line-soft)" }}>
        <div className="section-head">
          <div className="section-head-stack">
            <span className="eyebrow">Shop the Lookbook</span>
            <h2 className="section-title">The Pieces</h2>
          </div>
          <span className="section-link" onClick={() => setRoute("shop")} style={{ cursor: "pointer" }}>All Pieces →</span>
        </div>
        <div className="pgrid">
          {PRODUCTS.slice(0, 4).map((p) => (
            <ProductCard key={p.id} product={p} onClick={() => openProduct(p.id)} />
          ))}
        </div>
      </section>
    </>
  );
}

function StoresPage({ setRoute }) {
  return (
    <div className="gives-back-container">
      {/* HERO SECTION */}
      <section className="gives-back-hero" style={{
        backgroundImage: "url('/images/gives-back-hero.jpg')", // children/background image placeholder
        backgroundSize: "cover",
        backgroundPosition: "center 20%",
        padding: "120px var(--pad)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "clamp(560px, 78vh, 780px)",
        position: "relative",
        textAlign: "center"
      }}>
        {/* Overlay to ensure text readability */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(42, 31, 20, 0.45)",
          zIndex: 1
        }}></div>

        <div style={{
          position: "absolute",
          left: "var(--pad)",
          bottom: "clamp(48px, 8vh, 96px)",
          zIndex: 2,
          maxWidth: "620px",
          color: "#FAF7F2",
          textAlign: "left"
        }}>
          <h1 style={{
            fontFamily: "var(--display)",
            fontSize: "clamp(48px, 6.5vw, 96px)",
            lineHeight: 0.95,
            letterSpacing: "-0.015em",
            fontWeight: 300,
            color: "#FAF7F2",
            marginBottom: "28px"
          }}>
            She is <em style={{ fontStyle: "italic", color: "#FAF7F2" }}>Wonder.</em>
          </h1>
          <p style={{
            fontFamily: "var(--display)",
            fontSize: "clamp(28px, 4vw, 56px)",
            lineHeight: 1.1,
            fontWeight: 300,
            fontStyle: "italic",
            color: "#FAF7F2",
            margin: 0
          }}>
            Empowering the next generation of wonders.
          </p>
        </div>
      </section>

      {/* IMPACT SPLIT SECTION */}
      <section className="gives-back-section">
        <div className="gives-back-content-width" style={{ textAlign: "center", maxWidth: 820, margin: "0 auto" }}>
          <h2 className="gives-back-headline" style={{ marginBottom: 28 }}>
            Every piece is the beginning of <em>something bigger.</em>
          </h2>
          <p className="gives-back-body" style={{ marginBottom: 0 }}>
            Being seen shouldn't be a privilege. Some children lose their parents. Some lose their homes to conflict. Some are simply born into less than they deserve. Whatever they've lost, we believe their sense of wonder should never be one of those things. That belief is why HHARA gives back locally - funding education for children in orphanages, for those displaced by war, and for those growing up without enough. Not through a foundation. Not as a distant campaign. Child by child, close to home, by design.
          </p>
        </div>
      </section>

      {/* WHAT YOUR PURCHASE SUPPORTS SECTION (Pillars) */}
      <section className="pillars-section" style={{ padding: "80px var(--pad)", backgroundColor: "#F7F3ED" }}>
        <div className="pillars-container">
          <div className="section-head" style={{ borderBottom: "1px solid rgba(184, 137, 46, 0.12)", paddingBottom: 28, marginBottom: 48 }}>
            <div className="section-head-stack">
              <h2 className="section-title" style={{ color: "#2A1F14", fontWeight: 300 }}>What your<br /><em style={{ color: "#B8892E" }}>purchase supports.</em></h2>
            </div>
          </div>
          <div className="pillars-grid">
            {[
              { title: "School Supplies", body: "Books, learning materials and the everyday tools every child needs in the classroom." },
              { title: "Tuition Support", body: "Direct contribution to educational fees, removing barriers to consistent schooling." },
              { title: "Uniforms & Essentials", body: "The basic necessities that allow every child to attend school with dignity." },
              { title: "Long-Term Partnership", body: "Ongoing support, not one-time giving: a relationship that grows as HHARA grows." },
            ].map((p, idx) => (
              <div key={idx} className="pillar-card" style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "flex-start" }}>
                <div style={{ minHeight: "56px", marginBottom: "14px" }}>
                  <h3 className="pillar-title" style={{ marginTop: 0, marginBottom: 0 }}>{p.title}</h3>
                </div>
                <p className="pillar-body" style={{ margin: 0 }}>{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* QUOTE BANNER SECTION (Without brown background) */}
      <section className="gives-back-section" style={{ backgroundColor: "#F7F3ED", textAlign: "center", padding: "80px var(--pad) 120px" }}>
        <div className="gives-back-content-width">
          <blockquote className="gives-back-quote-banner" style={{ color: "var(--ink)", fontFamily: "var(--display)", fontStyle: "italic", fontSize: "clamp(20px, 2.8vw, 26px)", lineHeight: 1.6, maxWidth: 800, margin: "0 auto" }}>
            "We didn't choose the partner with the biggest reach. We chose the ones closest to where we could actually see the difference being made."
          </blockquote>
          <p style={{ marginTop: 24, fontSize: 11, letterSpacing: "0.35em", textTransform: "uppercase", color: "var(--accent)" }}>
            Every Wonder Begins Somewhere
          </p>
        </div>
      </section>

      {/* IMPACT MAP SECTION */}
      <section style={{ backgroundColor: "#3A2416", padding: "clamp(60px, 8vh, 100px) var(--pad)" }}>
        <div className="gives-back-content-width" style={{ maxWidth: 1100 }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <h2 style={{
              fontFamily: "var(--display)",
              fontWeight: 300,
              fontStyle: "italic",
              fontSize: "clamp(32px, 4.5vw, 56px)",
              color: "#F7F3ED",
              lineHeight: 1.1,
              margin: "0 0 20px",
            }}>
              A child in school.
            </h2>
            <p style={{
              color: "rgba(247,243,237,0.55)",
              fontSize: "clamp(13px, 1.1vw, 15px)",
              maxWidth: 520,
              margin: "0 auto",
              lineHeight: 1.75,
              fontWeight: 300,
            }}>
              HHARA is built on circular luxury - beauty that gives back. Our first giving chapter sponsors children's education in Kenya, one purchase at a time.
            </p>
          </div>

          {/* Interactive Leaflet Map */}
          <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid rgba(247,243,237,0.08)", isolation: "isolate" }}>
            <Suspense fallback={<div style={{ width: "100%", height: 460, background: "#1a1510" }} />}>
              <ImpactMap />
            </Suspense>
          </div>

          {/* Statistics Bar */}
          <div className="gives-back-stats-bar-brand" style={{
            borderColor: "rgba(247,243,237,0.1)",
            margin: "48px auto",
          }}>
            <div className="stats-col-brand col-kenya" style={{ borderColor: "rgba(247,243,237,0.1)" }}>
              <span className="stats-num-brand" style={{ color: "#B8892E" }}>Kenya</span>
              <span className="stats-label-brand" style={{ color: "rgba(247,243,237,0.35)" }}>WHERE WE GIVE BACK</span>
            </div>
            <div className="stats-col-brand col-education" style={{ borderColor: "rgba(247,243,237,0.1)" }}>
              <span className="stats-num-brand" style={{ color: "#B8892E" }}>Education</span>
              <span className="stats-label-brand" style={{ color: "rgba(247,243,237,0.35)" }}>OUR FOCUS</span>
            </div>
            <div className="stats-col-brand col-giving" style={{ borderColor: "rgba(247,243,237,0.1)" }}>
              <span className="stats-num-brand" style={{ color: "#B8892E" }}>—</span>
              <span className="stats-label-brand" style={{ color: "rgba(247,243,237,0.35)" }}>KIDS SUPPORTED</span>
            </div>
            <div className="stats-col-brand col-materials" style={{ borderColor: "rgba(247,243,237,0.1)" }}>
              <span className="stats-num-brand" style={{ color: "#B8892E" }}>Per Unit</span>
              <span className="stats-label-brand" style={{ color: "rgba(247,243,237,0.35)" }}>GIVING MODEL</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function AccountPage({
  onAuthenticated,
  setRoute,
  checkoutUrl,
  cartCount,
}: {
  onAuthenticated?: () => void;
  setRoute?: (route: string, payload?: any) => void;
  checkoutUrl?: string;
  cartCount?: number;
}) {
  const customer = useCustomer();
  const [tab, setTab] = useState("signin");
  const [form, setForm] = useState({ email: "", password: "", firstName: "", dob: "", acceptsMarketing: false });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError(null);
    const res = await serverSignIn(form.email, form.password);
    setBusy(false);
    if (!res.ok) { setError(res.error || "Sign in failed"); return; }
    if (onAuthenticated) onAuthenticated();
    window.location.reload();
  };
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError(null);
    const res = await serverSignUp({
      email: form.email, password: form.password,
      firstName: form.firstName, dob: form.dob,
      acceptsMarketing: form.acceptsMarketing,
    });
    setBusy(false);
    if (!res.ok) { setError(res.error || "Sign up failed"); return; }
    if (onAuthenticated) onAuthenticated();
    window.location.reload();
  };
  const handleSignOut = async () => {
    setBusy(true);
    await serverSignOut();
    setBusy(false);
    window.location.reload();
  };

  // Logged-in view → profile + orders
  if (customer) {
    return (
      <div className="auth-wrap">
        <div className="media">
          <img src={IMGS.authMedia} alt="" className="img-fill motion" />
        </div>
        <div className="panel">
          <div className="eyebrow" style={{ marginBottom: 20 }}>Account</div>
          <h1 style={{ fontFamily: "var(--display)", fontSize: 40, fontWeight: 400, letterSpacing: "-0.012em", lineHeight: 1.05, marginBottom: 12 }}>
            Hello, <em>{customer.firstName || customer.email}</em>
          </h1>
          <p style={{ opacity: 0.7, marginBottom: 28 }}>{customer.email}</p>

          <div style={{ marginBottom: 32 }}>
            <button className="btn btn-ghost" onClick={handleSignOut} disabled={busy}>Sign Out</button>
          </div>

          <div className="eyebrow" style={{ marginBottom: 16 }}>Order History</div>
          {customer.orders.length === 0 ? (
            <p style={{ opacity: 0.6, fontSize: 14 }}>No orders yet. Start with The Imara or Dahlia Set.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {customer.orders.map((o: any) => (
                <div key={o.id} style={{ border: "1px solid var(--line-soft)", padding: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <strong>#{o.orderNumber}</strong>
                    <span style={{ opacity: 0.6, fontSize: 13 }}>{new Date(o.processedAt).toLocaleDateString()}</span>
                  </div>
                  <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 8 }}>
                    {o.lineItems.map((l: any) => `${l.quantity}× ${l.title}`).join(" · ")}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                    <span style={{ opacity: 0.7 }}>{o.fulfillmentStatus || "Pending"} · {o.financialStatus || "-"}</span>
                    <strong>{o.totalPrice.currencyCode} {parseFloat(o.totalPrice.amount).toLocaleString()}</strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Logged-out view → sign in / sign up
  return (
    <div className="auth-wrap">
      <div className="media">
        <img src={IMGS.authMedia} alt="" className="img-fill motion" />
      </div>
      <div className="panel">
        <div className="eyebrow" style={{ marginBottom: 20 }}>Account</div>
        <h1 style={{ fontFamily: "var(--display)", fontSize: 48, fontWeight: 400, letterSpacing: "-0.012em", lineHeight: 1.05, marginBottom: 32 }}>
          {tab === "signin" ? "Welcome back" : <>Join the <em>collective</em></>}
        </h1>
        <div className="auth-tabs">
          <button className={tab === "signin" ? "on" : ""} onClick={() => { setTab("signin"); setError(null); }}>Sign In</button>
          <button className={tab === "register" ? "on" : ""} onClick={() => { setTab("register"); setError(null); }}>Create Account</button>
        </div>
        {error && <div style={{ background: "#fde8e8", color: "#7a2e3a", padding: 10, marginTop: 16, fontSize: 13 }}>{error}</div>}
        {tab === "signin" ? (
          <form className="auth-form" onSubmit={handleSignIn}>
            <div className="field">
              <label>Email</label>
              <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
            </div>
            <div className="field">
              <label>Password</label>
              <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
            </div>
            <button className="btn btn-primary btn-block" style={{ marginTop: 12 }} disabled={busy}>
              {busy ? "Signing in…" : "Sign In"}
              <span className="btn-arrow"><Icon.Arrow /></span>
            </button>
            <div style={{ display: "flex", alignItems: "center", margin: "24px 0 16px" }}>
              <div style={{ flex: 1, height: 1, backgroundColor: "var(--line-soft)" }}></div>
              <span style={{ padding: "0 12px", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ink-soft)" }}>or</span>
              <div style={{ flex: 1, height: 1, backgroundColor: "var(--line-soft)" }}></div>
            </div>
            {cartCount && cartCount > 0 ? (
              <button
                type="button"
                className="btn btn-outline btn-block"
                onClick={() => { if (checkoutUrl) window.open(checkoutUrl, "_self"); }}
              >
                Checkout as Guest
                <span className="btn-arrow"><Icon.Arrow /></span>
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-outline btn-block"
                onClick={() => { if (setRoute) setRoute("shop", null); }}
              >
                Continue as Guest
                <span className="btn-arrow"><Icon.Arrow /></span>
              </button>
            )}
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleSignUp}>
            <div className="field">
              <label>First Name</label>
              <input type="text" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} placeholder="First name" />
            </div>
            <div className="field">
              <label>Date of Birth</label>
              <input type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} />
            </div>
            <div className="field">
              <label>Email</label>
              <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
            </div>
            <div className="field">
              <label>Password</label>
              <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="At least 8 characters" />
            </div>
            <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13, color: "var(--ink-soft)", margin: "8px 0" }}>
              <input type="checkbox" checked={form.acceptsMarketing} onChange={(e) => setForm({ ...form, acceptsMarketing: e.target.checked })} />
              Email me HHARA dispatches & capsule drops
            </label>
            <button className="btn btn-primary btn-block" style={{ marginTop: 12 }} disabled={busy}>
              {busy ? "Creating account…" : "Join the Collective"}
              <span className="btn-arrow"><Icon.Arrow /></span>
            </button>
            <div className="auth-foot">By creating an account you accept our Terms and Privacy.</div>
          </form>
        )}
      </div>
    </div>
  );
}

// ============ WISHLIST ============
function WishlistPage({ setRoute, openProduct, wishlist, onWishlistToggle }) {
  const PRODUCTS = useProducts();
  const items = wishlist.map((id) => PRODUCTS.find((p) => p.id === id)).filter(Boolean);
  return (
    <>
      <div className="page-head">
        <span className="eyebrow">Saved</span>
        <h1>Your <em>wishlist</em></h1>
        <p className="lead">A private salon of pieces you've put aside. We'll let you know when sizes return.</p>
      </div>
      {items.length === 0 ? (
        <div className="wish-empty">
          <h2>Nothing saved <em>yet</em></h2>
          <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 28, lineHeight: 1.7 }}>
            Tap the heart on any piece to save it for later. Your selection will appear here, across every device.
          </p>
          <button className="btn btn-primary" onClick={() => setRoute("shop")}>
            Browse the Collection
            <span className="btn-arrow"><Icon.Arrow /></span>
          </button>
        </div>
      ) : (
        <div className="wish-grid">
          {items.map((p) => (
            <div key={p.id} style={{ position: "relative" }}>
              <ProductCard product={p} onClick={() => openProduct(p.id)} />
              <button
                className="wish-remove-btn"
                onClick={() => onWishlistToggle?.(p.id)}
                aria-label="Remove from wishlist"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

// ============ POLICY PAGES ============
function PolicyPage({ title, eyebrow, children, setRoute, headerRight }: { title: string; eyebrow: string; children: React.ReactNode; setRoute: any; headerRight?: React.ReactNode }) {
  return (
    <div className="policy-page">
      <div className="policy-hero">
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <button className="policy-back" onClick={() => setRoute("home")}>← Back</button>
            <span className="eyebrow" style={{ color: "var(--accent)" }}>{eyebrow}</span>
            <h1 className="policy-title">{title}</h1>
          </div>
          {headerRight && <div>{headerRight}</div>}
        </div>
      </div>
      <div className="policy-body">{children}</div>
    </div>
  );
}

function FAQPage({ setRoute }) {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());
  const [openItem, setOpenItem] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const toggleSection = (heading: string) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      if (next.has(heading)) next.delete(heading); else next.add(heading);
      return next;
    });
  };

  const sections = [
    {
      heading: "The Collection",
      items: [
        { q: "How do I know which size to choose?", a: "We carry XS, S, M, L and XL. Visit our Size Guide for detailed measurements. Our pieces fit true to size. If you are between sizes and prefer a snug fit, we recommend sizing down." },
        { q: "Will the colour on my screen match the real item?", a: "We aim to display our colourways as accurately as possible. Slight variations may occur due to lighting and individual screen settings." },
        { q: "How should I care for my HHARA pieces?", a: "Machine wash cold on a gentle cycle. Do not tumble dry. Hang dry. Do not bleach or iron. Wash with similar colours." },
      ],
    },
    {
      heading: "Orders & Payment",
      items: [
        { q: "How do I place an order?", a: "Browse and shop directly on site. Select your size and colourway, add to bag, and proceed to checkout. Payment is processed securely at checkout." },
        { q: "What payment methods do you accept?", a: "We accept all major credit and debit cards. We also offer Tabby and Tamara for buy now, pay later. Split your purchase into instalments at no extra cost. All payments are processed securely at checkout." },
        { q: "Can I modify or cancel my order?", a: "Orders cannot be cancelled or modified once processed. If you need to make a change urgently, please contact us at hello@hhara.com within 24 hours of placing your order." },
        { q: "Will I receive an order confirmation?", a: "Yes. You will receive an order confirmation email immediately after purchase, followed by a dispatch notification with your tracking link once shipped." },
      ],
    },
    {
      heading: "Account & Wishlist",
      items: [
        { q: "Do I need an account to place an order?", a: "No. You can check out as a guest. However, creating an account gives you access to order history, faster checkout, saved addresses, and your personal wishlist." },
        { q: "How do I create an account?", a: "Click Sign In at the top of any page and select Create Account. Enter your name, email address, and a password. You will receive a confirmation email to verify your account." },
        { q: "Can I save pieces to a wishlist?", a: "Yes. Click the wishlist icon on any product to save it for later. Your wishlist is accessible from your account at any time. You will need to be logged in to save and view your wishlist." },
        { q: "What if I forget my password?", a: "Click Forgot Password on the sign-in page. Enter your email address and we will send you a link to reset your password." },
        { q: "Can I update my account details?", a: "Yes. Log in to your account and navigate to Account Settings to update your name, email address, password, or saved delivery addresses." },
      ],
    },
    {
      heading: "Shipping & Delivery",
      items: [
        { q: "Where do you ship?", a: "We ship worldwide: UAE, GCC, and internationally to over 200 countries." },
        { q: "How long does UAE delivery take?", a: "Standard next-day delivery takes 1 day for orders placed before 10:00pm. Same-day delivery is available for Dubai (placed before 3:00pm) and Abu Dhabi, Sharjah, Ajman (placed before 1:00pm)." },
        { q: "What are the UAE delivery charges?", a: "Standard next-day delivery is completely free with no minimum purchase. Same-day delivery upgrade is available at checkout for AED 28." },
        { q: "How long does international delivery take?", a: "GCC: 2–3 business days. UK & Europe: 5–7 business days. North America: 5–7 business days. Rest of World: 7–14 business days. All shipments are subject to customs clearance." },
        { q: "Who pays for customs and duties?", a: "For GCC orders, customs duties and taxes are fully covered by HHARA (Delivered Duty Paid). For other international orders, customs charges and import duties are the customer's responsibility." },
        { q: "How do I track my order?", a: "You will receive a tracking link by email once your order has been dispatched. If you have any issues tracking your order, contact us at hello@hhara.com." },
      ],
    },
    {
      heading: "Returns & Refunds",
      items: [
        { q: "What is your return policy?", a: "We offer free returns within 14 days of delivery for UAE orders only. GCC and international orders are final sale and cannot be returned. Returned items must be unworn, unwashed, and in their original packaging." },
        { q: "How do I start a return?", a: "For UAE orders, email hello@hhara.com with your order number. We will arrange a Quiqup courier to collect the return parcel from your address free of charge." },
        { q: "Can I exchange my order?", a: "For UAE orders, exchanges are available for a different size or colourway, subject to availability. Each item can only be exchanged once." },
        { q: "When will I receive my refund?", a: "Once we receive and inspect your return, refunds are processed within 5–7 business days to your original payment method. Original shipping fees are non-refundable." },
        { q: "Can I return sale items?", a: "No. All items purchased during a sale or marked as final sale are non-returnable and non-refundable." },
      ],
    },
    {
      heading: "Impact",
      items: [
        { q: "What is HHARA Impact?", a: "Giving back is built into the foundation of HHARA. With every purchase, HHARA directly supports orphanages and children in need, beginning in Kenya." },
        { q: "Who does HHARA give to?", a: "We give directly, with no intermediaries. HHARA identifies and supports local orphanages. Our giving partners will be updated over time as our community and impact grow." },
        { q: "How does the giving model work?", a: "A portion of every HHARA purchase goes directly toward our giving commitments. We are intentional about this, just as we are intentional about every other decision we make as a brand." },
        { q: "Where can I learn more about HHARA Impact?", a: "Visit the Impact page on hhara.com for updates on our current giving partners and impact." },
      ],
    },
    {
      heading: "Gift Card",
      items: [
        { q: "How long is the gift card valid?", a: "All HHARA gift cards are valid for 12 months from the date of purchase." },
        { q: "When does the recipient receive the gift card?", a: "Gift cards are delivered instantly to the recipient's email inbox the moment the order is placed — no waiting, no delays." },
        { q: "Can the gift card be used on any item?", a: "Yes. HHARA gift cards are redeemable across every piece in the collection. The recipient chooses what she needs, in her own time." },
      ],
    },
  ];

  const q = search.trim().toLowerCase();
  const words = q.split(/\s+/).filter(Boolean);
  const matchesText = (text: string) => words.every(w => text.toLowerCase().includes(w));
  const visibleSections = q
    ? sections.map(s => ({ ...s, items: s.items.filter(i => matchesText(i.q) || matchesText(i.a)) })).filter(s => s.items.length > 0)
    : sections;

  function renderAnswer(a: string) {
    if (!a.includes("Size Guide")) return a;
    const parts = a.split("Size Guide");
    return <>{parts[0]}<a onClick={() => setRoute("size-guide")} className="faq-link">Size Guide</a>{parts[1]}</>;
  }

  const searchBar = (
    <div className="faq-search-wrap">
      <input
        className="faq-search"
        type="text"
        placeholder="Search questions…"
        value={search}
        onChange={e => { setSearch(e.target.value); setOpenItem(null); }}
      />
    </div>
  );

  return (
    <PolicyPage title="Frequently Asked Questions" eyebrow="Support" setRoute={setRoute} headerRight={searchBar}>
      {visibleSections.map((s) => {
        const isOpen = q ? true : openSections.has(s.heading);
        return (
          <div key={s.heading} className="policy-section">
            <button className="faq-section-btn" onClick={() => toggleSection(s.heading)}>
              <span>{s.heading}</span>
              <span className="faq-chevron">{isOpen ? "−" : "+"}</span>
            </button>
            {isOpen && s.items.map((item) => {
              const itemOpen = q ? true : openItem === item.q;
              return (
                <div key={item.q} className="faq-item">
                  <button className={`faq-q${itemOpen ? " open" : ""}`} onClick={() => setOpenItem(itemOpen ? null : item.q)}>
                    <span>{item.q}</span>
                    <span className="faq-chevron">{itemOpen ? "−" : "+"}</span>
                  </button>
                  {itemOpen && <p className="faq-a">{renderAnswer(item.a)}</p>}
                </div>
              );
            })}
          </div>
        );
      })}
      <div className="policy-contact">
        Still have questions? <a href="mailto:hello@hhara.com">hello@hhara.com</a>
      </div>
    </PolicyPage>
  );
}

function ShippingPage({ setRoute }) {
  return (
    <PolicyPage title="Shipping & Delivery" eyebrow="Customer Service" setRoute={setRoute}>
      <p className="policy-intro">We ship worldwide. Whether you are in Dubai or across the globe, every HHARA order is handled with care and delivered to your door.</p>

      <div className="policy-section">
        <h2 className="policy-section-heading">UAE Delivery</h2>
        <div className="policy-table">
          <div className="policy-table-row"><span>Standard Next Day</span><span>FREE · No Minimum</span></div>
          <div className="policy-table-row"><span>Same Day Delivery</span><span>AED 28 · Upgrade at checkout</span></div>
        </div>
        <p className="policy-note">
          <strong>Standard Next Day:</strong> Free next day delivery to all 7 Emirates (excluding freezones) for orders placed by 10:00pm. Delivery window: 9am–10pm next day.
        </p>
        <p className="policy-note" style={{ marginTop: 8 }}>
          <strong>Same Day Delivery:</strong> Available for Dubai (cut-off 3:00pm) and Abu Dhabi, Sharjah, Ajman (cut-off 1:00pm). Delivery window: 4pm–10pm same day.
        </p>
      </div>

      <div className="policy-section">
        <h2 className="policy-section-heading">GCC Delivery (Delivered Duty Paid)</h2>
        <p className="policy-note">Delivered via Quiqup/Naqel. All duties and taxes are included - no fees at delivery.</p>
        <div className="policy-table">
          <div className="policy-table-row"><span>Saudi Arabia, Kuwait, Bahrain, Qatar, Oman</span><span>AED 60 (Free on orders AED 1,900+) · 2–3 business days</span></div>
        </div>
      </div>

      <div className="policy-section">
        <h2 className="policy-section-heading">International Delivery (Delivered Duty Unpaid)</h2>
        <p className="policy-note">Delivered via Quiqup/DHL. Duties and taxes at destination are the customer's responsibility. PO Box delivery addresses are not supported.</p>
        <div className="policy-table">
          <div className="policy-table-row"><span>UK & Europe (Inc. EU states)</span><span>AED 80 (Free on orders AED 1,900+) · 5–7 business days</span></div>
          <div className="policy-table-row"><span>North America (United States, Canada)</span><span>AED 120 (Free on orders AED 1,900+) · 5–7 business days</span></div>
          <div className="policy-table-row"><span>Rest of World</span><span>AED 80 (Free on orders AED 1,900+) · 7–14 business days</span></div>
        </div>
      </div>

      <div className="policy-section">
        <h2 className="policy-section-heading">Duties & Customs</h2>
        <p>For GCC orders, all customs duties and taxes are fully covered by HHARA at delivery. For all other international orders, any customs charges, import taxes, and clearance fees are the customer's responsibility and are determined by your local customs authority. HHARA is not responsible for delays caused by customs clearance.</p>
      </div>

      <div className="policy-section">
        <h2 className="policy-section-heading">Failed Deliveries</h2>
        <p>Please ensure your delivery address and contact details are accurate at checkout. Our courier will make up to 3 delivery attempts. After 3 failed attempts, the order will be returned to us.</p>
      </div>

      <div className="policy-contact">
        Questions about your delivery? <a href="mailto:hello@hhara.com">hello@hhara.com</a>
      </div>
    </PolicyPage>
  );
}

function ReturnsPage({ setRoute }) {
  return (
    <PolicyPage title="Returns & Refunds" eyebrow="Customer Service" setRoute={setRoute}>
      <p className="policy-intro">We want you to love every piece you receive from HHARA. If something is not right, here is how we make it right.</p>

      <div className="policy-section">
        <h2 className="policy-section-heading">UAE Return Policy</h2>
        <p>We offer <strong>Free returns within 14 days</strong> of delivery for orders within the UAE.</p>
        <p style={{ marginTop: 12 }}>To be eligible for a return, your item must be unworn and unwashed, in its original packaging with all tags attached, and free from perfume, deodorant, or any signs of use. HHARA reserves the right to decline a return if the item does not meet these conditions upon inspection.</p>
      </div>

      <div className="policy-section">
        <h2 className="policy-section-heading">How to Start a Return (UAE)</h2>
        <p>Email us at <a href="mailto:hello@hhara.com">hello@hhara.com</a> with your order number to request a return. Once approved, HHARA will arrange a Quiqup courier to collect the return parcel directly from your address at no cost to you.</p>
      </div>

      <div className="policy-section">
        <h2 className="policy-section-heading">GCC & International Returns</h2>
        <p className="policy-note" style={{ color: "var(--ink)", background: "rgba(0,0,0,0.03)", padding: "16px", borderRadius: "4px" }}>
          <strong>Please note:</strong> We do not accept returns on GCC or international orders. Please consult our size guide before ordering.
        </p>
      </div>

      <div className="policy-section">
        <h2 className="policy-section-heading">Exchanges (UAE Only)</h2>
        <p>Exchanges are available for a different size or colourway, subject to availability. Please mention your preference when submitting your return request. Each item can only be exchanged once.</p>
      </div>

      <div className="policy-section">
        <h2 className="policy-section-heading">Refunds</h2>
        <p>Once we receive and inspect your return, refunds are processed within <strong>5–7 business days</strong> to your original payment method. Original shipping charges, customs, duties, or taxes are non-refundable.</p>
      </div>

      <div className="policy-section">
        <h2 className="policy-section-heading">Non-Returnable Items</h2>
        <ul className="policy-list">
          <li>All GCC and International orders</li>
          <li>Items purchased during a sale or marked as final sale</li>
          <li>Items that have already been exchanged once</li>
          <li>Gift cards</li>
        </ul>
      </div>

      <div className="policy-section">
        <h2 className="policy-section-heading">Cancellations</h2>
        <p>Orders cannot be cancelled once processed. If you need to make a change, contact us at <a href="mailto:hello@hhara.com">hello@hhara.com</a> within 24 hours of placing your order and we will do our best to assist.</p>
      </div>

      <div className="policy-contact">
        Questions? <a href="mailto:hello@hhara.com">hello@hhara.com</a>
      </div>
    </PolicyPage>
  );
}

function SizeGuidePage({ setRoute }) {
  const sizes = [
    { size: "XS", uk: "UK 6", waist: "60–64", hips: "84–88", bust: "76–80" },
    { size: "S",  uk: "UK 8", waist: "65–69", hips: "89–93", bust: "81–85" },
    { size: "M",  uk: "UK 10", waist: "70–74", hips: "94–98", bust: "86–90" },
    { size: "L",  uk: "UK 12", waist: "75–79", hips: "99–103", bust: "91–95" },
    { size: "XL", uk: "UK 14", waist: "80–84", hips: "104–108", bust: "96–100" },
  ];
  return (
    <PolicyPage title="Size Guide" eyebrow="Customer Service" setRoute={setRoute}>
      <p className="policy-intro">Our sizing follows UK standards and is designed to fit true to size. All measurements are body measurements in centimetres, not garment measurements.</p>

      <div className="policy-section">
        <h2 className="policy-section-heading">How to Measure</h2>
        <img src="/images/how-to-measure.jpg" alt="How to Measure — front and side body measurement guide" style={{ width: "100%", display: "block", marginBottom: "24px" }} />
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
          {[
            { label: "Bust", desc: "Wrap the tape around the fullest part of the bust." },
            { label: "Underbust", desc: "Keeping your arms to the side and standing straight, wrap the tape directly under the bust." },
            { label: "Waist", desc: "Tape should be applied to the narrowest portion of the waist." },
            { label: "Hips", desc: "Apply the tape to the hip's fullest part while keeping your feet together." },
            { label: "Inseam", desc: "Measure from the crotch seam down to the bottom of the ankle bone, keeping the tape straight along the inner leg." },
          ].map(({ label, desc }) => (
            <div key={label} style={{ display: "flex", gap: "16px", fontFamily: "var(--sans)", fontSize: "16px", lineHeight: 1.8 }}>
              <span style={{ fontWeight: 700, color: "var(--accent)", minWidth: "100px", flexShrink: 0 }}>{label}</span>
              <span style={{ color: "var(--ink)" }}>{desc}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="policy-section">
        <h2 className="policy-section-heading">How to Choose Your Size</h2>
        <p>Compare your measurements against the table below.</p>
        <div className="size-guide-tips">
          <div className="size-tip"><strong>For a sculpted, close-to-body fit</strong><span>Size down</span></div>
          <div className="size-tip"><strong>For a softer, more relaxed feel</strong><span>Size up</span></div>
        </div>
        <p className="policy-note" style={{ marginTop: 16 }}>Our pieces are designed with a gentle sculpting effect in mind. Supportive without restriction.</p>
      </div>

      <div className="policy-section">
        <h2 className="policy-section-heading">Measurements (cm)</h2>
        <div className="size-table-wrap">
          <table className="size-table">
            <thead>
              <tr>
                <th>Size</th><th>UK</th><th>Waist</th><th>Hips</th><th>Bust</th>
              </tr>
            </thead>
            <tbody>
              {sizes.map((r) => (
                <tr key={r.size}>
                  <td><strong>{r.size}</strong></td>
                  <td>{r.uk}</td>
                  <td>{r.waist}</td>
                  <td>{r.hips}</td>
                  <td>{r.bust}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="policy-contact">
        Not sure which size is right for you? <a href="mailto:hello@hhara.com">hello@hhara.com</a>
      </div>
    </PolicyPage>
  );
}

function PrivacyPage({ setRoute }) {
  return (
    <PolicyPage title="Privacy & Cookie Policy" eyebrow="Legal" setRoute={setRoute}>
      <p className="policy-intro">At HHARA, your trust matters. This policy describes how Dahlia Moxie Trading LLC (trading as HHARA) collects, uses, and protects your personal information when you visit our site or interact with us.</p>

      <div className="policy-section">
        <h2 className="policy-section-heading">Age of Consent</h2>
        <p>You must be at least 18 years old to use our site or make a purchase. By accessing HHARA, you confirm that you meet this requirement.</p>
      </div>

      <div className="policy-section">
        <h2 className="policy-section-heading">Information We Collect</h2>
        <ul className="policy-list">
          <li>Contact details: name, email address, phone number</li>
          <li>Delivery information: shipping address</li>
          <li>Payment information, processed securely by third-party providers</li>
          <li>Order history and size preferences</li>
          <li>Browsing behaviour: products viewed, links clicked, time on site</li>
          <li>Technical data: device type, browser, and IP address</li>
          <li>Information shared with us via social media or direct messages</li>
        </ul>
      </div>

      <div className="policy-section">
        <h2 className="policy-section-heading">How We Use Your Data</h2>
        <ul className="policy-list">
          <li>Process orders, manage payments, and fulfil shipments</li>
          <li>Communicate with you, from delivery updates to new arrivals</li>
          <li>Personalise your experience with relevant content and recommendations</li>
          <li>Analyse trends and improve our collections and website</li>
          <li>Maintain the safety and security of our site</li>
          <li>Comply with our legal obligations under UAE law</li>
        </ul>
      </div>

      <div className="policy-section">
        <h2 className="policy-section-heading">Your Legal Rights</h2>
        <p>Under the UAE PDPL, you have the right to access or correct your personal data, object to or withdraw consent for marketing communications at any time, and request deletion of your data where applicable. To exercise any of these rights, contact us at <a href="mailto:hello@hhara.com">hello@hhara.com</a>.</p>
      </div>

      <div className="policy-section">
        <h2 className="policy-section-heading">Third-Party Sharing</h2>
        <p>We do not sell your personal data. Ever. We may securely share limited data with trusted partners including Shopify (e-commerce and payment), shipping and fulfilment providers, Klaviyo (email communications), analytics providers, and social media platforms where you engage with us directly.</p>
      </div>

      <div className="policy-section">
        <h2 className="policy-section-heading">Cookie Policy</h2>
        <p style={{ marginBottom: 16 }}>Cookies are small text files stored in your browser that help our site recognise your device and deliver more relevant content. We use:</p>
        <ul className="policy-list">
          <li><strong>Essential:</strong> To enable core functions including your cart, account login, and secure checkout.</li>
          <li><strong>Performance & Analytics:</strong> To understand how you use our website so we can continue improving your experience.</li>
          <li><strong>Marketing & Personalisation:</strong> With your consent, to tailor content and recommendations to you.</li>
        </ul>
        <p style={{ marginTop: 16 }}>You can manage or disable cookies at any time through your browser settings. Disabling certain cookies may affect how the website functions.</p>
      </div>

      <div className="policy-section">
        <h2 className="policy-section-heading">Data Security</h2>
        <p>We take reasonable technical and organisational measures to protect your information from unauthorised access, alteration, or misuse. Our site is hosted on Shopify, which is PCI-DSS compliant.</p>
      </div>

      <div className="policy-contact">
        Questions? <a href="mailto:hello@hhara.com">hello@hhara.com</a>
      </div>
    </PolicyPage>
  );
}

function TermsPage({ setRoute }) {
  const clauses = [
    { n: "1", title: "Eligibility", body: "You must be at least 18 years old to make a purchase on our site." },
    { n: "2", title: "Products and Pricing", body: "We make every effort to display colours, fabrics, and pricing accurately. However, slight variations may occur, and we reserve the right to correct errors or decline orders where necessary." },
    { n: "3", title: "Orders and Payment", body: "All orders placed through our website are subject to availability and acceptance. Payment is processed securely at checkout. We accept all major credit and debit cards, as well as Tabby and Tamara for buy now, pay later." },
    { n: "4", title: "Shipping and Delivery", body: "We ship within the UAE and internationally. For delivery timelines and related terms, please refer to our Shipping & Delivery policy." },
    { n: "5", title: "Returns and Exchanges", body: "We offer free returns within 14 days of delivery for UAE orders only. GCC and international orders are final sale and non-returnable. For full conditions and refund details, please refer to our Returns & Refunds policy." },
    { n: "6", title: "Intellectual Property", body: "All content on this website, including text, product descriptions, imagery, brand assets, and design, is the property of Dahlia Moxie Trading LLC (HHARA). No reproduction or use of any content is permitted without prior written consent." },
    { n: "7", title: "Limitation of Liability", body: "To the fullest extent permitted by law, HHARA is not liable for indirect, incidental, or consequential damages arising from the use of our products or website." },
    { n: "8", title: "Governing Law", body: "These terms are governed by the laws of the United Arab Emirates. Any disputes will fall under the jurisdiction of the UAE courts." },
    { n: "9", title: "Changes to These Terms", body: "We may update or amend these terms at any time. Any changes will be reflected on this page with a revised “Last updated” date." },
    { n: "10", title: "Contact", body: "For questions regarding these terms, please contact us at hello@hhara.com." },
  ];
  return (
    <PolicyPage title="Terms & Conditions" eyebrow="Legal" setRoute={setRoute}>
      <p className="policy-intro">Welcome to HHARA. By accessing or using our site and purchasing from us, you agree to the following terms and conditions. Please read them carefully.</p>

      {clauses.map((c) => (
        <div key={c.n} className="policy-section">
          <h2 className="policy-section-heading">{c.n}. {c.title}</h2>
          <p>{c.body}</p>
        </div>
      ))}

      <div className="policy-contact">
        Questions? <a href="mailto:hello@hhara.com">hello@hhara.com</a>
      </div>
    </PolicyPage>
  );
}

function ContactPage({ setRoute }) {
  return (
    <PolicyPage title="Contact Us" eyebrow="Support" setRoute={setRoute}>
      <p className="policy-intro">We are here to assist you with order inquiries, sizing questions, or feedback.</p>
      
      <div className="policy-section">
        <h2 className="policy-section-heading">Email Support</h2>
        <p>For customer service, order changes, returns, or general inquiries, email us at:</p>
        <p style={{ fontSize: "20px", fontWeight: "400", marginTop: "8px", fontFamily: "var(--serif)" }}>
          <a href="mailto:hello@hhara.com" style={{ textDecoration: "underline", color: "var(--ink)" }}>hello@hhara.com</a>
        </p>
        <p style={{ marginTop: "12px" }}>Our team typically responds within 24 hours, Monday to Friday.</p>
      </div>

      <div className="policy-section">
        <h2 className="policy-section-heading">WhatsApp Support</h2>
        <p>For quick assistance, message our support team on WhatsApp:</p>
        <p style={{ fontSize: "20px", fontWeight: "400", marginTop: "8px", fontFamily: "var(--serif)" }}>
          <a href="https://wa.me/971501234567" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline", color: "var(--ink)" }}>
            +971 50 123 4567
          </a>
        </p>
        <p style={{ marginTop: "12px" }}>Available daily from 9:00 AM to 6:00 PM (GST).</p>
      </div>

      <div className="policy-section">
        <h2 className="policy-section-heading">Headquarters</h2>
        <p><strong>Dahlia Moxie Trading LLC</strong></p>
        <p>Business Bay, Dubai, United Arab Emirates</p>
      </div>
    </PolicyPage>
  );
}

// ============ SEARCH OVERLAY ============
function SearchOverlay({ open, onClose, openProduct }) {
  const PRODUCTS = useProducts();
  const [q, setQ] = useState("");

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        const el = document.querySelector(".search-bar input");
        if (el) (el as HTMLElement).focus();
      }, 100);
    } else {
      setQ("");
    }
  }, [open]);

  const results = q.trim() ? PRODUCTS.filter((p) => (p.name + p.cat).toLowerCase().includes(q.toLowerCase())) : PRODUCTS.slice(0, 6);
  const suggestions = ["Imara Bra", "Imara Legging", "Dahlia Bra", "Dahlia Short", "Chicory Coffee"];
  const trending = ["The Imara Set", "The Dahlia Set", "Olive Green"];

  return (
    <div className={`search-overlay ${open ? "open" : ""}`}>
      <div className="search-bar">
        <Icon.Search />
        <input
          placeholder="What are you looking for…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button onClick={onClose}><Icon.Close /></button>
      </div>
      <div className="search-content">
        <div className="search-sugs">
          <h5>Popular</h5>
          <ul>
            {suggestions.map((s) => (
              <li key={s}><a onClick={() => setQ(s)}>{s}</a></li>
            ))}
          </ul>
          <h5>Trending Categories</h5>
          <ul>
            {trending.map((s) => (
              <li key={s}><a onClick={() => setQ(s)}>{s}</a></li>
            ))}
          </ul>
        </div>
        <div>
          <h5 style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 24 }}>
            {q ? `${results.length} results for "${q}"` : "Suggested Pieces"}
          </h5>
          <div className="search-results">
            {results.map((p) => (
              <ProductCard key={p.id} product={p} onClick={() => { openProduct(p.id); onClose(); }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}








const CART_COLOR_NAME_MAP: Record<string, string> = {
  "Bark Oxides": "Chicory Coffee",
  "Zinc Crimson": "Olive Green",
};
const CART_COLOR_REVERSE_MAP: Record<string, string> = {
  "Chicory Coffee": "Bark Oxides",
  "Olive Green": "Zinc Crimson",
};

// === FILE 10-180e2df1-7549-448a-8bbb-f6c3acb791f4.jsx ===

function App({ initialProducts, initialCart, initialCustomer }: { initialProducts?: any[]; initialCart?: any; initialCustomer?: any }) {
  const products = (initialProducts && initialProducts.length) ? initialProducts : PRODUCTS;
  const [shopifyCart, setShopifyCart] = useState<any>(initialCart || null);
  const [localCartItems, setLocalCartItems] = useState<any[]>([]);
  const [customer, setCustomer] = useState<any>(initialCustomer || null);
  const [route, setRouteState] = useState("home");
  const [productId, setProductId] = useState("p1");
  const [articleId, setArticleId] = useState("j1");
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [wishlistLoaded, setWishlistLoaded] = useState(false);
  const [selectedColorFilter, setSelectedColorFilter] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;

    const timer = setTimeout(() => {
      window.scrollTo(0, 0);
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    }, 50);

    return () => clearTimeout(timer);
  }, [route, productId, articleId]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("hhara_wishlist");
      if (raw) setWishlist(JSON.parse(raw));
    } catch { }
    setWishlistLoaded(true);
  }, []);
  useEffect(() => {
    if (!wishlistLoaded) return;
    try { localStorage.setItem("hhara_wishlist", JSON.stringify(wishlist)); } catch { }
  }, [wishlist, wishlistLoaded]);
  const toggleWishlist = (id: string) => {
    setWishlist((w) => w.includes(id) ? w.filter((x) => x !== id) : [...w, id]);
  };

  const [signupPopupOpen, setSignupPopupOpen] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterName, setNewsletterName] = useState("");
  const [newsletterDob, setNewsletterDob] = useState("");
  const [newsletterPhone, setNewsletterPhone] = useState("");
  const [newsletterCountryCode, setNewsletterCountryCode] = useState("+971");
  const [signupStatus, setSignupStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [signupError, setSignupError] = useState("");

  useEffect(() => {
    // If user is already logged in, do not trigger the popup
    if (customer) return;

    // Check if user has already dismissed or signed up
    const hasSeen = localStorage.getItem("hhara_signup_seen");
    if (!hasSeen) {
      const timer = setTimeout(() => {
        setSignupPopupOpen(true);
      }, 6500);
      return () => clearTimeout(timer);
    }
  }, [customer]);

  const handleNewsletterSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupStatus("loading");
    setSignupError("");

    try {
      const cleanPhone = newsletterPhone.trim().replace(/\D/g, "");
      const fullPhone = cleanPhone ? `${newsletterCountryCode}${cleanPhone}` : undefined;
      const res = await serverSubscribe(newsletterEmail, newsletterName, fullPhone, newsletterDob);
      if (res.ok) {
        setSignupStatus("success");
        localStorage.setItem("hhara_signup_seen", "true");
      } else {
        setSignupStatus("error");
        setSignupError(res.error || "Sign up failed");
      }
    } catch (err: any) {
      console.error("Popup newsletter signup error:", err);
      setSignupStatus("error");
      setSignupError(err.message || "An unexpected error occurred");
    }
  };

  const closeSignupPopup = () => {
    setSignupPopupOpen(false);
    localStorage.setItem("hhara_signup_seen", "true");
  };

  const openSignupPopup = () => {
    setSignupPopupOpen(true);
  };

  const setRoute = (r, payload) => {
    setRouteState(r);
    if (r === "product" && payload) setProductId(payload);
    if (r === "article" && payload) setArticleId(payload);
    if (r === "shop") {
      setSelectedColorFilter(payload || null);
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  // Derive cart UI items from the Shopify cart structure
  const cart = [
    ...(shopifyCart?.lines || []).map((line: any) => {
      const productMatch = products.find((p: any) => p.variants?.some((v: any) => v.id === line.merchandise.id));
      const opts = Object.fromEntries(line.merchandise.selectedOptions.map((o: any) => [o.name.toLowerCase(), o.value]));
      return {
        key: line.id,
        lineId: line.id,
        variantId: line.merchandise.id,
        id: productMatch?.id || line.merchandise.product.handle,
        name: line.merchandise.product.title,
        price: parseFloat(line.cost.totalAmount.amount) / Math.max(line.quantity, 1),
        qty: line.quantity,
        color: (() => { const raw = opts.color || opts.colour || opts.colorway || "-"; return CART_COLOR_NAME_MAP[raw] ?? raw; })(),
        size: opts.size || "-",
        tone: productMatch?.tone || "tone-2",
        featuredImage: line.merchandise.image?.url || productMatch?.featuredImage?.url || null,
      };
    }),
    ...localCartItems,
  ];

  const findVariantId = (product: any, color: string, size: string) => {
    if (!product?.variants?.length) return null;
    const rawColor = CART_COLOR_REVERSE_MAP[color] ?? color;
    const match = product.variants.find((v: any) => {
      const opts = Object.fromEntries(v.selectedOptions.map((o: any) => [o.name.toLowerCase(), o.value]));
      const cOk = !color || Object.values(opts).includes(rawColor) || Object.values(opts).includes(color);
      const sOk = !size || Object.values(opts).includes(size);
      return cOk && sOk;
    });
    return match?.id || product.variants[0].id;
  };

  const addToCart = async (item) => {
    if (item.isGiftCard) {
      const localId = `local-gc-${Date.now()}`;
      setLocalCartItems(prev => [...prev, {
        key: localId,
        lineId: localId,
        variantId: null,
        id: "gift-card",
        name: item.name,
        price: item.price,
        qty: 1,
        color: "-",
        size: "-",
        tone: "tone-4",
        featuredImage: null,
        isGiftCard: true,
      }]);
      setCartOpen(true);
      return;
    }
    const product = products.find((p: any) => p.id === item.id);
    const variantId = item.variantId || findVariantId(product, item.color, item.size);
    if (!variantId) {
      console.warn("No variant resolved for", item, "- product:", product?.name, "variants:", product?.variants?.length);
      setCartOpen(true);
      return;
    }
    try {
      const next = await serverAddLine(variantId, 1);
      setShopifyCart(next);
      setCartOpen(true);
    } catch (e) {
      console.error("addToCart failed - variantId:", variantId, e);
      // Cart might be stale; try once more with a fresh cart
      try {
        const retry = await serverAddLine(variantId, 1);
        setShopifyCart(retry);
        setCartOpen(true);
      } catch (e2) {
        console.error("addToCart retry also failed", e2);
      }
    }
  };


  const updateQty = async (lineId: string, qty: number) => {
    if (lineId.startsWith("local-")) {
      if (qty <= 0) setLocalCartItems(prev => prev.filter(i => i.lineId !== lineId));
      else setLocalCartItems(prev => prev.map(i => i.lineId === lineId ? { ...i, qty } : i));
      return;
    }
    try {
      const next = await serverUpdateLine(lineId, qty);
      setShopifyCart(next);
    } catch (e) {
      console.error("updateQty failed", e);
    }
  };
  const removeItem = async (lineId: string) => {
    if (lineId.startsWith("local-")) {
      setLocalCartItems(prev => prev.filter(i => i.lineId !== lineId));
      return;
    }
    try {
      const next = await serverRemoveLine(lineId);
      setShopifyCart(next);
    } catch (e) {
      console.error("removeItem failed", e);
    }
  };

  const applyDiscount = async (code: string) => {
    try {
      const next = await serverApplyDiscount(code);
      setShopifyCart(next);
      return next;
    } catch (e) {
      console.error("applyDiscount failed", e);
      throw e;
    }
  };

  const cartCount = cart.reduce((a: number, i: any) => a + i.qty, 0);
  const openProduct = (id) => setRoute("product", id);
  const openArticle = (id) => setRoute("article", id);

  let body;
  if (route === "shop") {
    body = <CollectionPage setRoute={setRouteState} openProduct={openProduct} initialColorFilter={selectedColorFilter} />;
  } else if (route === "product") {
    body = <PDP productId={productId} setRoute={setRouteState} addToCart={addToCart} openProduct={openProduct} onWishlistToggle={toggleWishlist} wishlist={wishlist} />;
  } else if (route === "atelier") {
    body = <AtelierPage setRoute={setRouteState} />;
  } else if (route === "journal") {
    body = <JournalIndex setRoute={setRouteState} openArticle={openArticle} />;
  } else if (route === "article") {
    body = <ArticlePage articleId={articleId} setRoute={setRouteState} openArticle={openArticle} />;
  } else if (route === "lookbook") {
    body = <LookbookPage setRoute={setRouteState} openProduct={openProduct} />;
  } else if (route === "stores") {
    body = <StoresPage setRoute={setRouteState} />;
  } else if (route === "gift-card") {
    body = <GiftCardPage setRoute={setRouteState} addToCart={addToCart} setCartOpen={setCartOpen} />;
  } else if (route === "account") {
    body = <AccountPage setRoute={setRoute} checkoutUrl={shopifyCart?.checkoutUrl} cartCount={cartCount} />;
  } else if (route === "wishlist") {
    body = <WishlistPage setRoute={setRouteState} openProduct={openProduct} wishlist={wishlist} onWishlistToggle={toggleWishlist} />;
  } else if (route === "faq") {
    body = <FAQPage setRoute={setRouteState} />;
  } else if (route === "shipping") {
    body = <ShippingPage setRoute={setRouteState} />;
  } else if (route === "returns") {
    body = <ReturnsPage setRoute={setRouteState} />;
  } else if (route === "size-guide") {
    body = <SizeGuidePage setRoute={setRouteState} />;
  } else if (route === "privacy") {
    body = <PrivacyPage setRoute={setRouteState} />;
  } else if (route === "terms") {
    body = <TermsPage setRoute={setRouteState} />;
  } else if (route === "contact") {
    body = <ContactPage setRoute={setRouteState} />;
  } else if (route === "pre-checkout") {
    body = <PreCheckoutPage
      cart={cart}
      checkoutUrl={shopifyCart?.checkoutUrl}
      updateQty={updateQty}
      removeItem={removeItem}
      applyDiscount={applyDiscount}
      discountCodes={shopifyCart?.discountCodes}
      setRoute={setRoute}
      addToCart={addToCart}
    />;
  } else {
    body = <Home setRoute={setRoute} />;
  }

  const tweaksUI = (
    <>
      {signupPopupOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#3A2416]/60 backdrop-blur-sm transition-opacity duration-500 animate-fade-in">
          <div className="signup-popup-inner relative text-[#F7F3ED] max-w-6xl w-full shadow-2xl overflow-hidden h-[540px] md:h-[540px]">
            {/* Full-bleed image */}
            <img
              src={IMGS.p1a}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Scrim — transparent left so image breathes, heavy right for form legibility */}
            <div className="absolute inset-0" style={{ background: "linear-gradient(105deg, rgba(42,31,20,0.08) 0%, rgba(42,31,20,0.18) 30%, rgba(42,31,20,0.72) 55%, rgba(42,31,20,0.93) 100%)" }} />
            {/* Bottom fade so left-side text sits cleanly */}
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(42,31,20,0.7) 0%, transparent 45%)" }} />

            {/* Brand block — absolute, sits left of the form with breathing room */}
            <div className="absolute z-[3] pointer-events-none" style={{ right: "460px", top: "50%", transform: "translateY(-50%)" }}>
              <img
                src="/images/hhara-logo.png"
                alt="HHARA"
                style={{ height: "52px", width: "auto", display: "block" }}
              />
              <div style={{
                fontFamily: "var(--font-signature), 'Mr De Haviland', cursive",
                fontSize: "clamp(76px, 8.5vw, 115px)",
                color: "#E8D8C8",
                lineHeight: 0.75,
                letterSpacing: "normal",
                marginLeft: "8px",
                marginTop: "-0.08em",
                marginBottom: "0.25em",
                textTransform: "none",
                WebkitTextStroke: "1.5px #E8D8C8",
                textShadow: "0 0 2px rgba(232,216,200,0.9), 0 0 4px rgba(232,216,200,0.5)",
              }}>Insiders</div>
              <div style={{
                fontFamily: "var(--display)",
                fontStyle: "italic",
                fontWeight: 300,
                fontSize: "clamp(16px, 1.6vw, 21px)",
                color: "rgba(247,243,237,0.85)",
                marginTop: "8px",
                letterSpacing: "0.02em",
                lineHeight: 1.5,
              }}>Where Confidence Comes To Life.</div>
            </div>

            {/* Close Button */}
            <button
              className="absolute top-3 right-3 z-10 p-2 text-[#F7F3ED] hover:opacity-70 transition-opacity"
              onClick={closeSignupPopup}
              aria-label="Close signup invitation"
            >
              <Icon.Close />
            </button>

            {/* Right side — form */}
            <div className="relative z-[2] h-full flex flex-col justify-center items-end py-8 pl-6 pr-12 md:pr-16">
              {signupStatus !== "success" ? (
                <div className="w-full max-w-[300px] text-center">
                  <p className="text-xs md:text-sm text-[#F7F3ED]/80 mb-5 leading-relaxed font-light text-center">
                    Be the first to discover new collections, limited releases, surprise gifts and exclusive stories from the world of HHARA.
                  </p>
                  <form onSubmit={handleNewsletterSignup} className="w-full">
                    {/* 1. First Name */}
                    <input
                      type="text"
                      required
                      placeholder="First Name"
                      value={newsletterName}
                      onChange={(e) => setNewsletterName(e.target.value)}
                      className="w-full bg-[#F7F3ED] text-[#2A1F14] border border-[#F7F3ED]/40 focus:border-[#B8892E] outline-none py-3 px-4 text-sm placeholder-[#7A6555]/60 mb-3 font-light transition-all text-left"
                    />
                    {/* 2. Date of Birth */}
                    <input
                      type="date"
                      required
                      value={newsletterDob}
                      onChange={(e) => setNewsletterDob(e.target.value)}
                      max={new Date().toISOString().split("T")[0]}
                      className="w-full bg-[#F7F3ED] text-[#2A1F14] border border-[#F7F3ED]/40 focus:border-[#B8892E] outline-none py-3 px-4 text-sm mb-3 font-light transition-all [color-scheme:light]"
                    />
                    {/* 3. Phone */}
                    <div className="w-full flex gap-0 mb-3 border border-[#F7F3ED]/40 focus-within:border-[#B8892E] transition-all">
                      <select
                        value={newsletterCountryCode}
                        onChange={(e) => setNewsletterCountryCode(e.target.value)}
                        className="bg-[#F7F3ED] text-[#2A1F14] border-0 border-r border-[#2A1F14]/10 outline-none py-3 px-2 text-sm font-light cursor-pointer shrink-0"
                        style={{ width: "80px" }}
                      >
                        <option value="+971">🇦🇪 +971</option>
                        <option value="+966">🇸🇦 +966</option>
                        <option value="+974">🇶🇦 +974</option>
                        <option value="+965">🇰🇼 +965</option>
                        <option value="+973">🇧🇭 +973</option>
                        <option value="+968">🇴🇲 +968</option>
                        <option value="+44">🇬🇧 +44</option>
                        <option value="+1">🇺🇸 +1</option>
                      </select>
                      <input
                        type="tel"
                        placeholder="Phone Number"
                        value={newsletterPhone}
                        onChange={(e) => setNewsletterPhone(e.target.value)}
                        className="flex-1 min-w-0 bg-[#F7F3ED] text-[#2A1F14] border-0 outline-none py-3 px-3 text-sm placeholder-[#7A6555]/60 font-light text-left"
                      />
                    </div>
                    {/* 4. Email + Join button inline */}
                    <div className="w-full flex gap-0 border border-[#F7F3ED]/40 focus-within:border-[#B8892E] transition-all">
                      <input
                        type="email"
                        required
                        placeholder="Email Address"
                        value={newsletterEmail}
                        onChange={(e) => setNewsletterEmail(e.target.value)}
                        className="flex-1 min-w-0 bg-[#F7F3ED] text-[#2A1F14] border-0 outline-none py-3 px-4 text-sm placeholder-[#7A6555]/60 font-light text-left"
                      />
                      <button
                        type="submit"
                        disabled={signupStatus === "loading"}
                        className="shrink-0 bg-[#2A1F14] text-[#F7F3ED] hover:bg-[#3A2416] transition-all tracking-widest text-[10px] uppercase font-medium disabled:opacity-50 px-4"
                      >
                        {signupStatus === "loading" ? "…" : "Join"}
                      </button>
                    </div>
                  </form>
                  {signupStatus === "error" && (
                    <p className="text-xs text-red-300 mt-3">{signupError}</p>
                  )}
                  <p className="text-[10px] text-[#F7F3ED]/70 mt-4 leading-relaxed text-center">
                    By signing up, you agree to receive marketing emails from HHARA. You can unsubscribe at any time. See our{" "}
                    <button type="button" onClick={() => { closeSignupPopup(); setRoute("privacy", null); }} className="underline hover:text-white">Privacy Policy</button>.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-end text-right max-w-md">
                  <div className="w-10 h-10 rounded-full border border-[#F7F3ED] flex items-center justify-center mb-4">
                    <svg className="w-5 h-5 stroke-[#F7F3ED] fill-none" viewBox="0 0 24 24" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <p className="text-sm text-[#F7F3ED]/90 leading-relaxed font-light">
                    You're on the list. Welcome to HHARA.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Chatpop Icon (only if NOT logged in) */}
      {!customer && (
        <button
          onClick={openSignupPopup}
          className="fixed bottom-6 right-6 z-[99] bg-[#B8892E] text-[#F7F3ED] hover:bg-[#9A721F] p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center border border-[#F7F3ED]/10 group"
          aria-label="Open signup invitation"
        >
          {/* Custom user/signup SVG */}
          <svg 
            className="w-6 h-6 stroke-[#F7F3ED] fill-none" 
            viewBox="0 0 24 24" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          {/* Tooltip on hover */}
          <span className="absolute right-14 bg-[#B8892E] text-[#F7F3ED] text-[10px] uppercase tracking-widest px-3 py-1.5 border border-[#F7F3ED]/10 shadow-lg rounded-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
            Become an Insider
          </span>
        </button>
      )}
    </>
  );

  return (
    <ProductsContext.Provider value={products}>
      <ShopifyCartContext.Provider value={shopifyCart}>
        <CustomerContext.Provider value={customer}>
          <div className="app">
            <Header
              route={route}
              setRoute={setRouteState}
              cartCount={cartCount}
              openCart={() => setCartOpen(true)}
              openSearch={() => setSearchOpen(true)}
              wishCount={wishlist.length}
            />
            <main style={{ flex: 1 }}>
              {body}
            </main>
            <Footer setRoute={setRouteState} route={route} />
            <CartDrawer
              open={cartOpen}
              onClose={() => setCartOpen(false)}
              items={cart}
              updateQty={updateQty}
              removeItem={removeItem}
              checkoutUrl={shopifyCart?.checkoutUrl}
              setRoute={setRouteState}
              discountCodes={shopifyCart?.discountCodes}
              applyDiscount={applyDiscount}
            />
            <SearchOverlay
              open={searchOpen}
              onClose={() => setSearchOpen(false)}
              openProduct={openProduct}
            />
            {tweaksUI}
            <CookieBanner setRoute={setRouteState} />
          </div>
        </CustomerContext.Provider>
      </ShopifyCartContext.Provider>
    </ProductsContext.Provider>
  );
}



export default App;
