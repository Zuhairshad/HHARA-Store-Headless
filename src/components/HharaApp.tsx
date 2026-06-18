"use client";
// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react/no-unescaped-entities */
import React, { useState, useEffect, useRef, useContext, createContext } from "react";
import { addLine as serverAddLine, updateLine as serverUpdateLine, removeLine as serverRemoveLine } from "@/lib/cart-actions";
import { signIn as serverSignIn, signUp as serverSignUp, signOut as serverSignOut } from "@/lib/customer-actions";
import { subscribeNewsletter as serverSubscribe } from "@/lib/newsletter-actions";

const ProductsContext = createContext(null);
const ShopifyCartContext = createContext(null);
const CustomerContext = createContext(null);
const useProducts = () => useContext(ProductsContext) || [];
const useShopifyCart = () => useContext(ShopifyCartContext);
const useCustomer = () => useContext(CustomerContext);

// HHARA storefront — ported from the original React/Babel source to Next.js client component.
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
};

// === FILE 02-72355d57-9aeb-459e-aa3c-d2195cb6f26b.jsx ===
// Image library — using picsum.photos with seeds for reliable, consistent imagery.
// Grayscale + warm overlay (via CSS) gives the cohesive luxury feel.
// All picsum images are free for any use (CC-licensed Unsplash photos).

const IMGS: Record<string,string> = {
  hero1: "/images/hero1.jpg",
  hero2: "/images/hero2.jpg",
  hero3: "/images/hero3.jpg",
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
  editAtelier: "/images/editAtelier.jpg",
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


// Free public-domain test video (Big Buck Bunny — used as motion placeholder)
// The video is replaced with a CSS ken-burns image overlay on the hero by default,
// but the URL is available for any video slots that need real motion.
const VIDEOS = {
  // A short, free, public-domain motion loop. If it fails, the poster image shows.
  motion1: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  motion2: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
};


// If the standalone bundler has inlined resources, swap URLs for blob URLs.
// (No-op in dev — window.__resources is undefined.)
// === FILE 03-86b13194-7123-4c2d-b78b-2d8d56c0148a.jsx ===
// HHARA product catalog — 2 capsules, 4 SKUs. Prices/sizes are placeholders until confirmed.
const PRODUCTS = [
  {
    id: "p1",
    name: "Imara Bra",
    cat: "The Imara Set",
    price: 0,
    swatches: [
      { name: "Bark Oxides", hex: "#5C4632" },
      { name: "Zinc Crimson", hex: "#7A2E3A" },
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    tone: "tone-2",
    altTone: "tone-3",
    badge: "New",
    imgKey: "p1",
    description: "Sculpted scoop-neck architecture with brushed-gold structural hardware. High-density double-knit with moisture-wicking construction, hidden ergonomic support band, and capillary ventilation channels.",
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
      { name: "Bark Oxides", hex: "#5C4632" },
      { name: "Zinc Crimson", hex: "#7A2E3A" },
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    tone: "tone-1",
    altTone: "tone-6",
    badge: "New",
    imgKey: "p2",
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
    name: "Dalia Bra",
    cat: "The Dalia Set",
    price: 0,
    swatches: [
      { name: "Bark Oxides", hex: "#5C4632" },
      { name: "Zinc Crimson", hex: "#7A2E3A" },
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    tone: "tone-7",
    altTone: "tone-3",
    imgKey: "p3",
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
    name: "Dalia Short",
    cat: "The Dalia Set",
    price: 0,
    swatches: [
      { name: "Bark Oxides", hex: "#5C4632" },
      { name: "Zinc Crimson", hex: "#7A2E3A" },
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    tone: "tone-6",
    altTone: "tone-1",
    imgKey: "p4",
    description: "High-rise optimization with a 5\" non-restrictive inseam. Omnidirectional 4-way mechanical stretch matrix with targeted muscular stabilization and an integrated secure inner waistband pocket.",
    details: [
      "5\" inseam, high-rise",
      "4-way mechanical stretch",
      "Hidden inner waistband pocket",
      "Machine wash cold · do not tumble dry",
    ],
  },
];

// Featured / homepage subsets
const FEATURED_IDS = ["p1", "p2", "p3", "p4"];
const NEW_IDS = ["p1", "p2", "p3", "p4"];

const CATEGORIES = [
  { id: "imara", name: "The Imara Set", count: 2, tone: "tone-3" },
  { id: "dalia", name: "The Dalia Set", count: 2, tone: "tone-1" },
];

const HEROES = [
  {
    eyebrow: "Sustainable Luxury Athleisure · Designed in the UAE",
    title: "She Is\nWonder.",
    sub: "She walks through the world before anyone else will — with quiet, untapped resilience. HHARA is designed to the last detail for her, and unapologetic in the process. Elegant, purposeful, and sustainable by design.",
    cta: "Explore the Collection",
    tone: "tone-4",
  },
  {
    eyebrow: "The Imara Set",
    title: "Strength,\nIn Form.",
    sub: "Scoop-neck architecture and a 7/8 chevron-waisted legging. Imara — from the Swahili — strong, firm, resolute. Not the performance of strength. The real thing.",
    cta: "Shop The Imara Set",
    tone: "tone-5",
  },
  {
    eyebrow: "The Dalia Set",
    title: "Softness,\nIn Motion.",
    sub: "A cross-back bra and high-rise short, engineered for unconstrained movement. Dalia — from the Arabic — gentle, tender, delicate. The quiet strength of a woman with nothing left to prove.",
    cta: "Shop The Dalia Set",
    tone: "tone-3",
  },
];

const HHRAA_DATA = { PRODUCTS, FEATURED_IDS, NEW_IDS, CATEGORIES, HEROES };

// === FILE 04-af48d016-3e9e-4c3b-ac6a-19f515101d8e.jsx ===

function Announce() {
  return (
    <div className="announce">
      <div className="announce-track">
        <span>Complimentary Global Shipping From UAE</span>
        <span className="announce-dot"></span>
        <span>10% Of Every Acquisition Funds Women-Led Initiatives</span>
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
          <li><a onClick={() => { setRoute("shop"); onClose(); }}>The Dalia Set</a></li>
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
          <h6>The Dalia Set</h6>
          <ul>
            <li><a onClick={() => { setRoute("shop"); onClose(); }}>Dalia Bra</a></li>
            <li><a onClick={() => { setRoute("shop"); onClose(); }}>Dalia Short</a></li>
            <li><a onClick={() => { setRoute("shop"); onClose(); }}>Shop The Set</a></li>
          </ul>
        </div>
        <div>
          <h6>Our Ethos</h6>
          <ul>
            <li><a onClick={() => { setRoute("atelier"); onClose(); }}>The HHARA Brief</a></li>
            <li><a onClick={() => { setRoute("atelier"); onClose(); }}>Material Transparency</a></li>
            <li><a onClick={() => { setRoute("atelier"); onClose(); }}>Social Impact · 10%</a></li>
            <li><a onClick={() => { setRoute("atelier"); onClose(); }}>Carbon-Neutral Transit</a></li>
          </ul>
        </div>
      </div>
      <div className="feature" onClick={() => { setRoute("shop"); onClose(); }}>
        <img src={IMGS.mmShop} alt="" className="img-fill" />
        <div className="ovr"></div>
        <div className="lbl">
          <div className="e">Now Showing</div>
          <div className="t">The Imara &amp; Dalia Sets</div>
        </div>
      </div>
    </div>
  );
}

function Header({ route, setRoute, cartCount, openCart, openSearch, wishCount }) {
  const [menuOpen, setMenuOpen] = useState(false);
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
              Our Ethos
            </button>
            <button
              className={route === "journal" || route === "article" ? "active" : ""}
              onClick={() => setRoute("journal")}
            >
              Journal
            </button>
            <button
              className={route === "stores" ? "active" : ""}
              onClick={() => setRoute("stores")}
            >
              Impact
            </button>
          </nav>
          <div className="brandmark" onClick={() => setRoute("home")}>HHARA</div>
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
    </>
  );
}

function Footer({ setRoute }) {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="brandmark">HHARA</div>
            <p>Sustainable luxury athleisure. Designed in the UAE. Worn around the world with intent. Every piece gives back.</p>
          </div>
          <div className="footer-col">
            <h4>The Collection</h4>
            <ul>
              <li><a onClick={() => setRoute("shop")} style={{ cursor: "pointer" }}>Shop All</a></li>
              <li><a onClick={() => setRoute("shop")} style={{ cursor: "pointer" }}>The Imara Set</a></li>
              <li><a onClick={() => setRoute("shop")} style={{ cursor: "pointer" }}>The Dalia Set</a></li>
              <li><a onClick={() => setRoute("lookbook")} style={{ cursor: "pointer" }}>The Lookbook</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Corporate Responsibility</h4>
            <ul>
              <li><a onClick={() => setRoute("atelier")} style={{ cursor: "pointer" }}>The HHARA Ethos</a></li>
              <li><a onClick={() => setRoute("atelier")} style={{ cursor: "pointer" }}>Material Transparency</a></li>
              <li><a onClick={() => setRoute("atelier")} style={{ cursor: "pointer" }}>Social Impact · 10%</a></li>
              <li><a onClick={() => setRoute("atelier")} style={{ cursor: "pointer" }}>Carbon-Neutral Transit</a></li>
              <li><a onClick={() => setRoute("journal")} style={{ cursor: "pointer" }}>Journal</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Support</h4>
            <ul>
              <li><a href="#">Tailored Fit Analysis</a></li>
              <li><a href="#">Regional Logistics</a></li>
              <li><a href="#">International Duties &amp; Customs</a></li>
              <li><a href="#">Care Guide</a></li>
              <li><a href="mailto:contact@hhara.com">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© HHARA Brands 2026 — UAE · Fashion with purpose. Every piece gives back.</span>
          <div className="pay">
            <a href="https://instagram.com/hharabrands" target="_blank" rel="noreferrer">Instagram</a>
            <a href="https://tiktok.com/@hharabrands" target="_blank" rel="noreferrer" style={{ marginLeft: 16 }}>TikTok</a>
          </div>
        </div>
      </div>
    </footer>
  );
}


// === FILE 05-1ba71939-ee08-44bd-a9c0-607c20b1bd8a.jsx ===

function CartDrawer({ open, onClose, items, updateQty, removeItem, openProduct, checkoutUrl, setRoute }) {
  const subtotal = items.reduce((a, i) => a + i.price * i.qty, 0);
  const freeThreshold = 800;
  const progress = Math.min(subtotal / freeThreshold, 1);
  const togo = Math.max(0, freeThreshold - subtotal);

  return (
    <>
      <div className={`cart-backdrop ${open ? "open" : ""}`} onClick={onClose}></div>
      <aside className={`cart-drawer ${open ? "open" : ""}`} aria-hidden={!open}>
        <div className="cart-head">
          <div>
            <h3>The Bag<span className="ct">{items.length} item{items.length === 1 ? "" : "s"}</span></h3>
          </div>
          <button onClick={onClose}><Icon.Close /></button>
        </div>

        {items.length > 0 && (
          <div className="cart-prog">
            {togo > 0 ? (
              <span>You are <em>AED {togo.toLocaleString()}</em> away from complimentary shipping</span>
            ) : (
              <span>Complimentary shipping unlocked</span>
            )}
            <div className="bar"><div className="fill" style={{ width: `${progress * 100}%` }}></div></div>
          </div>
        )}

        {items.length === 0 ? (
          <div className="cart-empty">
            <h4>Your bag is empty</h4>
            <p>Begin with a piece from The Imara or Dalia Set.</p>
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
                onClick={() => { if (checkoutUrl) window.location.href = checkoutUrl; }}
              >
                Proceed to Checkout
                <span className="btn-arrow"><Icon.Arrow /></span>
              </button>
              <div className="micro">Taxes &amp; duties calculated at checkout · 10% of every order funds women-led initiatives</div>
            </div>
          </>
        )}
      </aside>
    </>
  );
}

// === FILE 06-ce7b1d96-f64b-4723-b417-6dfb0feade07.jsx ===

function ProductCard({ product, onClick, onQuickAdd }) {

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
        <div className="pcard-quickadd" onClick={(e) => { e.stopPropagation(); onQuickAdd && onQuickAdd(product); }}>
          <button className="btn">Quick Add</button>
        </div>
      </div>
      <div className="pcard-info">
        <div className="pcard-cat">{product.cat}</div>
        <div className="pcard-name">{product.name}</div>
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

  const heroImgs = [IMGS.hero1, IMGS.hero2, IMGS.hero3];
  const [idx, setIdx] = useState(0);
  const slide = HEROES[idx];

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % HEROES.length), 7000);
    return () => clearInterval(t);
  }, [HEROES.length]);

  return (
    <section className="hero">
      <div className={`hero-media ${slide.tone}`} key={idx}>
        {heroImgs[idx] && (
          <img src={heroImgs[idx]} alt="" className="img-fill motion" />
        )}
      </div>
      <div className="hero-overlay"></div>
      <div className="hero-content">
        <div className="hero-eyebrow">{slide.eyebrow}</div>
        <h1 className="hero-title">
          {slide.title.split("\n").map((line, i, arr) => (
            <span key={i}>
              {i === arr.length - 1 ? <em>{line}</em> : line}
              {i < arr.length - 1 && <br />}
            </span>
          ))}
        </h1>
        <p className="hero-sub">{slide.sub}</p>
        <div className="hero-ctas">
          <button className="btn btn-light" onClick={openShop}>
            {slide.cta}
            <span className="btn-arrow"><Icon.Arrow /></span>
          </button>
        </div>
      </div>
      <div className="hero-pagination">
        {HEROES.map((h, i) => (
          <button key={i} className={i === idx ? "active" : ""} onClick={() => setIdx(i)}>
            <span className="num">0{i + 1}</span>
            <span className="dash"></span>
          </button>
        ))}
      </div>
    </section>
  );
}

function Categories({ onPick }) {
  const { CATEGORIES } = HHRAA_DATA;

  const catImgs: Record<string, string> = { imara: IMGS.catOuter, dalia: IMGS.catRTW };
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

function FeaturedGrid({ ids, title, eyebrow, link, openProduct, quickAdd }) {
  const PRODUCTS = useProducts();
  const list = ids.map((id) => PRODUCTS.find((p) => p.id === id)).filter(Boolean);
  return (
    <section className="section">
      <div className="section-head">
        <div className="section-head-stack">
          <span className="eyebrow">{eyebrow}</span>
          <h2 className="section-title">{title}</h2>
        </div>
        <span className="section-link">{link} →</span>
      </div>
      <div className="pgrid">
        {list.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            onClick={() => openProduct(p.id)}
            onQuickAdd={quickAdd}
          />
        ))}
      </div>
    </section>
  );
}

function Editorial({ openShop }) {

  return (
    <section className="section-full" style={{ padding: 0 }}>
      <div className="editorial">
        <div className="editorial-media tone-5">
          {IMGS.editAtelier && <img src={IMGS.editAtelier} alt="Atelier" className="img-fill" loading="lazy" />}
        </div>
        <div className="editorial-body">
          <div className="eyebrow editorial-eyebrow">The HHARA Brief</div>
          <h2 className="editorial-title">Fashion<br /><em>with purpose.</em></h2>
          <p>
            We capture global plastic waste streams and convert them into high-performance,
            sensory-grade fabrics — engineered in the UAE for an intentional woman. Low-batch,
            low-waste, made to outlast a season. Every piece gives back.
          </p>
          <div>
            <button className="btn btn-ghost" style={{ color: "var(--ink)", borderColor: "var(--ink)" }} onClick={openShop}>
              Read Our Ethos
              <span className="btn-arrow"><Icon.Arrow /></span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Marquee() {
  const items = [
    "Wonder Worn Intentionally",
    "Global Shipping From UAE",
    "Purpose-Driven Design",
    "Empowering the Feminine Collective",
    "Premium Recycled Fabrication",
    "Every Acquisition Initiates Social Impact",
  ];
  const row = (
    <span>
      {items.map((it, i) => (
        <React.Fragment key={i}>
          {it}
          <span className="dot"></span>
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
  const tags = ["Imara Bra", "Imara Legging", "Dalia Bra", "Dalia Short", "Bark Oxides", "Zinc Crimson"];
  return (
    <section className="section">
      <div className="section-head">
        <div className="section-head-stack">
          <span className="eyebrow">The Capsule</span>
          <h2 className="section-title">Worn Intentionally</h2>
        </div>
        <span className="section-link" onClick={openLookbook} style={{ cursor: "pointer" }}>View the Edit →</span>
      </div>
      <div className="lookbook">
        {tones.map((t, i) => (
          <div key={i} className={`lookbook-tile t${i + 1} ${t}`} onClick={openLookbook}>
            {tiles[i] && <img src={tiles[i]} alt={tags[i]} className="img-fill" loading="lazy" />}
            <div className="lk-tag">{String(i + 1).padStart(2, "0")} — {tags[i]}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Callouts() {
  return (
    <section className="section-full" style={{ padding: 0 }}>
      <div className="callouts">
        <div className="callout">
          <div className="ico"><Icon.Truck /></div>
          <div className="callout-ttl">Carbon-Neutral Transit</div>
          <div className="callout-body">Optimised smart-freight from our UAE base — global shipping calibrated to offset every order.</div>
        </div>
        <div className="callout">
          <div className="ico"><Icon.Box /></div>
          <div className="callout-ttl">Designed To Outlast</div>
          <div className="callout-body">Low-batch, low-waste production. Engineered for repeated wear, repair, and return.</div>
        </div>
        <div className="callout">
          <div className="ico"><Icon.Leaf /></div>
          <div className="callout-ttl">Regenerative Textures</div>
          <div className="callout-body">Recycled ocean and industrial plastic — re-spun into high-performance, sensory-grade fabric.</div>
        </div>
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
        <h2><em>Stay close</em> to the collective.</h2>
        <p>Private dispatches from the HHARA studio — capsule drops, philanthropic updates, and editorial notes. No more than twice a month.</p>
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

function VideoFeature({ onCta }) {


  return (
    <section className="section-full" style={{ padding: 0 }}>
      <div className="video-feature">
        <img src={IMGS.atelierVideo} alt="" className="motion" />
        <video
          src={VIDEOS.motion1}
          autoPlay
          muted
          loop
          playsInline
          poster={IMGS.atelierVideo}
          onError={(e) => { e.target.style.display = "none"; }}
        ></video>
        <div className="ovr"></div>
        <div className="copy">
          <div className="e">Material Transparency</div>
          <h3>From plastic waste<br/>to <em>performance grade.</em></h3>
          <p>Ocean and industrial plastic, regenerated into a recycled performance knit. Watch how the fibre becomes the garment.</p>
          <button className="btn btn-light" onClick={onCta}>
            See The Process
            <span className="btn-arrow"><Icon.Arrow /></span>
          </button>
        </div>
      </div>
    </section>
  );
}

function Manifesto({ onShop }: { onShop: () => void }) {
  return (
    <section className="section">
      <div className="section-head" style={{ justifyContent: "center", textAlign: "center" }}>
        <div className="section-head-stack" style={{ alignItems: "center" }}>
          <span className="eyebrow">The Collection Manifesto</span>
          <h2 className="section-title">Two Perspectives.<br/>One Uncompromising Identity.</h2>
        </div>
      </div>
      <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center", padding: "0 24px 12px" }}>
        <p style={{ lineHeight: 1.7, opacity: 0.8 }}>
          An elegant capsule of four essential technical pieces. Inspired by two signature tonal palettes,
          designed to move with every aspect of her modern routine. Each silhouette is named in the African
          or Arabic language — <em>Dalia</em>, from the Arabic, a deliberate softness and grace; <em>Imara</em>,
          from the Swahili, an indomitable structure and conviction. She doesn&apos;t choose between them. She embodies both.
        </p>
        <button className="btn btn-primary" style={{ marginTop: 24 }} onClick={onShop}>View All Formations</button>
      </div>
    </section>
  );
}

function Pillars() {
  const pillars = [
    {
      n: "01",
      title: "Regenerative Textures",
      body: "We capture global plastic waste streams and convert them into high-performance, sensory-grade sportswear fabrics — superior to traditional nylon.",
    },
    {
      n: "02",
      title: "Carbon-Neutral Transit",
      body: "Our UAE base ships strategically across the region and beyond. Optimised smart-freight strategies offset the carbon footprint of every order.",
    },
    {
      n: "03",
      title: "Social Equity Investment",
      body: "10% of all gross revenue is directed to women-led socio-economic development and education initiatives around the world.",
    },
    {
      n: "04",
      title: "Minimalist Production",
      body: "No seasonal overproduction. Intentional low-batch manufacturing — low waste, high process efficiency, designed for longevity.",
    },
  ];
  return (
    <section className="section">
      <div className="section-head">
        <div className="section-head-stack">
          <span className="eyebrow">The Four Pillars</span>
          <h2 className="section-title">Circular Luxury,<br/>Engineered.</h2>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24, padding: "0 24px" }}>
        {pillars.map((p) => (
          <div key={p.n} style={{ padding: "32px 24px", border: "1px solid rgba(0,0,0,0.08)" }}>
            <div style={{ fontSize: 11, letterSpacing: "0.3em", opacity: 0.55, marginBottom: 16 }}>{p.n}</div>
            <h3 style={{ fontFamily: "var(--serif, 'Cormorant Garamond', serif)", fontSize: 22, marginBottom: 12 }}>{p.title}</h3>
            <p style={{ fontSize: 14, lineHeight: 1.65, opacity: 0.75 }}>{p.body}</p>
          </div>
        ))}
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
    <section className="section" style={{ textAlign: "center" }}>
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "0 24px" }}>
        <p style={{ fontFamily: "var(--serif, 'Cormorant Garamond', serif)", fontStyle: "italic", fontSize: 32, lineHeight: 1.4 }}>
          &ldquo;Silence is the most powerful of powers. It&apos;s the unwavering, measured silence of a woman
          who knows she has left behind her past, and is shaping her future, with absolute purpose.&rdquo;
        </p>
        <p style={{ marginTop: 24, fontSize: 11, letterSpacing: "0.35em", textTransform: "uppercase", opacity: 0.55 }}>
          — The HHARA Collective
        </p>
      </div>
    </section>
  );
}

function Home(props) {
  return (
    <>
      <Hero openShop={() => props.setRoute("shop")} />
      <Marquee />
      <Manifesto onShop={() => props.setRoute("shop")} />
      <Categories onPick={() => props.setRoute("shop")} />
      <FeaturedGrid
        ids={HHRAA_DATA.FEATURED_IDS}
        title="The Capsule"
        eyebrow="Four Pieces · Two Sets"
        link="Shop All"
        openProduct={(id) => props.setRoute("product", id)}
        quickAdd={props.quickAdd}
      />
      <Editorial openShop={() => props.setRoute("atelier")} />
      <Pillars />
      <VideoFeature onCta={() => props.setRoute("atelier")} />
      <FeaturedGrid
        ids={HHRAA_DATA.NEW_IDS}
        title="Worn Intentionally"
        eyebrow="Bark Oxides &amp; Zinc Crimson"
        link="See The Colorways"
        openProduct={(id) => props.setRoute("product", id)}
        quickAdd={props.quickAdd}
      />
      <Philanthropy />
      <Lookbook openLookbook={() => props.setRoute("lookbook")} />
      <Proclamation />
      <Callouts />
      <Newsletter />
    </>
  );
}


// === FILE 07-9214c1d3-74f7-4bc2-bccb-7476bbfce9dc.jsx ===

function CollectionPage({ setRoute, openProduct, quickAdd }) {
  const PRODUCTS = useProducts();
  const [sort, setSort] = useState("Featured");
  const [filters, setFilters] = useState({ size: [], color: [], cat: [] });

  let visible = [...PRODUCTS];
  if (filters.cat.length) visible = visible.filter((p) => filters.cat.includes(p.cat));
  if (filters.size.length) visible = visible.filter((p) => p.sizes.some((s) => filters.size.includes(s)));
  if (filters.color.length) visible = visible.filter((p) => p.swatches.some((s) => filters.color.includes(s.name)));

  if (sort === "Price, low to high") visible.sort((a, b) => a.price - b.price);
  if (sort === "Price, high to low") visible.sort((a, b) => b.price - a.price);

  const cats = ["The Imara Set", "The Dalia Set"];
  const sizes = ["XS", "S", "M", "L", "XL"];
  const colorOpts = [
    { name: "Bark Oxides", hex: "#5C4632" },
    { name: "Zinc Crimson", hex: "#7A2E3A" },
  ];

  const toggle = (group, val) => {
    setFilters((f) => ({
      ...f,
      [group]: f[group].includes(val) ? f[group].filter((v) => v !== val) : [...f[group], val],
    }));
  };

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
        <p className="cph-desc">
          Four essential technical pieces — two capsules. Designed in the UAE,
          engineered in recycled performance fabrics. Worn intentionally; every acquisition gives back.
        </p>
      </div>

      <div className="ctoolbar">
        <div className="ctoolbar-l">
          <button><Icon.Filter /> <span>Filter</span></button>
          <span className="ctoolbar-count">{visible.length} pieces</span>
        </div>
        <div className="ctoolbar-r">
          <span style={{ color: "var(--muted)" }}>Sort:</span>
          {["Featured", "Newest", "Price, low to high", "Price, high to low"].map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              style={{ opacity: sort === s ? 1 : 0.5, fontWeight: sort === s ? 500 : 400 }}
            >
              {s}
            </button>
          ))}
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
              <li><label><input type="checkbox" /> Under AED 500</label></li>
              <li><label><input type="checkbox" /> AED 500 — 1,000</label></li>
              <li><label><input type="checkbox" /> AED 1,000 — 2,000</label></li>
              <li><label><input type="checkbox" /> AED 2,000 and above</label></li>
            </ul>
          </div>
        </aside>
        <div className="cgrid">
          {visible.map((p) => (
            <ProductCard key={p.id} product={p} onClick={() => openProduct(p.id)} onQuickAdd={quickAdd} />
          ))}
        </div>
      </div>
    </>
  );
}

// === FILE 08-e9225b26-2c70-44a6-bc85-2bb315cd399e.jsx ===

function PDP({ productId, setRoute, addToCart, openProduct, onWishlistToggle, wishlist }) {
  const PRODUCTS = useProducts();
  const product = PRODUCTS.find((p) => p.id === productId) || PRODUCTS[0];
  const wishlisted = wishlist?.includes(product?.id);
  const [color, setColor] = useState(product.swatches[0]);
  const [size, setSize] = useState(null);
  const [open, setOpen] = useState("details");
  const [added, setAdded] = useState(false);

  React.useEffect(() => {
    setColor(product.swatches[0]);
    setSize(null);
    setAdded(false);
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [productId]);

  const handleAdd = () => {
    if (!size) {
      const el = document.querySelector(".pdp-sizes");
      if (el) el.classList.add("flash");
      setTimeout(() => {
        const el = document.querySelector(".pdp-sizes");
        if (el) el.classList.remove("flash");
      }, 600);
      return;
    }
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      color: color.name,
      size,
      tone: product.tone,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const related = PRODUCTS.filter((p) => p.id !== product.id && p.cat === product.cat).slice(0, 4);
  const fallback = PRODUCTS.filter((p) => p.id !== product.id).slice(0, 4);
  const list = related.length >= 3 ? related : fallback;

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
              return (
                <>
                  <div className={`shot wide ${product.tone}`}>
                    {a && <img src={a} alt="" className="img-fill" />}
                  </div>
                  <div className={`shot ${product.altTone || product.tone}`}>
                    {b && <img src={b} alt="" className="img-fill" />}
                  </div>
                  <div className={`shot ${product.tone}`}>
                    {a && <img src={a} alt="" className="img-fill" style={{ filter: "brightness(0.92) contrast(1.05)" }} />}
                  </div>
                  <div className={`shot ${product.altTone || product.tone}`}>
                    {b && <img src={b} alt="" className="img-fill" style={{ filter: "brightness(1.06)" }} />}
                  </div>
                  <div className={`shot wide ${product.tone}`}>
                    <img src={IMGS.editAtelier} alt="" className="img-fill" />
                  </div>
                </>
              );
            })()}
          </div>

          <div className="pdp-info">
            <div className="cat">{product.cat}</div>
            <h1>{product.name}</h1>
            <div className="pdp-price">
              {product.priceWas && <span className="was">AED {product.priceWas.toLocaleString()}</span>}
              <span className="now">AED {product.price.toLocaleString()}</span>
            </div>
            <div className="pdp-rating">
              <span className="stars">★ ★ ★ ★ ★</span>
              <span>4.9 — 124 reviews</span>
            </div>

            <div className="pdp-divider"></div>

            <div className="pdp-option-row">
              <div className="lbl">
                <span>Colour — <span style={{ color: "var(--muted)" }}>{color.name}</span></span>
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

            <div className="pdp-option-row">
              <div className="lbl">
                <span>Size {size && <span style={{ color: "var(--muted)" }}>— {size}</span>}</span>
                <span className="help">Size guide</span>
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
            </div>

            <div className="pdp-actions">
              <div className="pdp-actions-row">
                <button className="btn btn-primary" onClick={handleAdd}>
                  {added ? "Added to Bag ✓" : `Add to Bag — AED ${product.price.toLocaleString()}`}
                </button>
                <button className="pdp-iconbtn" onClick={() => onWishlistToggle?.(product.id)} title="Save to wishlist"><Icon.Heart /></button>
              </div>
              <button className="btn" style={{ borderColor: "var(--ink)" }} onClick={() => onWishlistToggle?.(product.id)}>
                {wishlisted ? "Saved ✓" : "Add to Wishlist"}
              </button>
            </div>

            <div className="pdp-meta">
              <div className="row"><Icon.Truck /><span>Carbon-neutral global shipping from the UAE — 3–5 business days</span></div>
              <div className="row"><Icon.Box /><span>Free returns within 30 days · 10% of every order funds women-led initiatives</span></div>
            </div>

            <div className="pdp-accordions">
              <Accordion title="Details & Composition" open={open === "details"} onToggle={() => setOpen(open === "details" ? "" : "details")}>
                <p>{product.description || "Premium recycled performance knit, engineered for movement, structure, and longevity."}</p>
                <ul>
                  {(product.details || ["Premium recycled performance fabric", "Brushed-gold low-friction hardware", "Designed in the UAE", "Machine wash cold · do not tumble dry"]).map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </Accordion>
              <Accordion title="Fit & Sizing" open={open === "fit"} onToggle={() => setOpen(open === "fit" ? "" : "fit")}>
                <p>Model is 178cm and wears a size S. Engineered for second-skin compression with 4-way mechanical stretch. We recommend taking your usual size; size down for a closer compression fit.</p>
              </Accordion>
              <Accordion title="Care" open={open === "care"} onToggle={() => setOpen(open === "care" ? "" : "care")}>
                <p>Machine wash cold with like colours. Do not tumble dry, do not bleach, do not iron. Lay flat to dry to preserve the recycled performance knit.</p>
              </Accordion>
              <Accordion title="Shipping & Returns" open={open === "ship"} onToggle={() => setOpen(open === "ship" ? "" : "ship")}>
                <p>Complimentary global shipping from the UAE on orders over AED 800. Carbon-neutral express delivery within 3–5 business days. Returns accepted within 30 days in original condition; we provide a prepaid label.</p>
              </Accordion>
            </div>
          </div>
        </div>
      </div>

      <section className="section">
        <div className="section-head">
          <div className="section-head-stack">
            <span className="eyebrow">You may also like</span>
            <h2 className="section-title">Complete the look</h2>
          </div>
        </div>
        <div className="pgrid">
          {list.map((p) => (
            <ProductCard key={p.id} product={p} onClick={() => openProduct(p.id)} />
          ))}
        </div>
      </section>
    </>
  );
}

function Accordion({ title, open, onToggle, children }) {
  return (
    <div className="pdp-accordion">
      <div className="pdp-accordion-head" onClick={onToggle}>
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
          <div className="eyebrow" style={{ color: "var(--bg)", opacity: 0.85, marginBottom: 24 }}>The HHARA Ethos</div>
          <h1>Designed in the UAE.<br /><em>Worn intentionally,</em><br />around the world.</h1>
        </div>
      </section>

      <section className="atelier-intro">
        <p>
          HHARA was founded on the conviction that performance and intention can coexist —
          that an athleisure capsule can be <em>technical</em>, <em>circular</em>, and <em>genuinely useful</em>.
          Four pieces, two capsules, one uncompromising identity. Every acquisition gives back.
        </p>
        <div className="sig">— The HHARA Collective</div>
      </section>

      <section className="atelier-split">
        <div className="media">
          <img src={IMGS.atelierFlorence} alt="" className="img-fill" loading="lazy" />
        </div>
        <div className="body">
          <div className="eyebrow" style={{ marginBottom: 18 }}>Pillar One — Regenerative Textures</div>
          <h2>Plastic waste, <em>re-spun.</em></h2>
          <p>
            We capture ocean and industrial plastic waste streams and convert them into high-density double-knit
            performance fabrics — with moisture-wicking construction and capillary ventilation channels.
          </p>
          <p>
            The result is a sensory-grade material that outperforms traditional nylon, with a fraction of the
            footprint. Premium recycled, never compromised.
          </p>
        </div>
      </section>

      <section className="atelier-split flip">
        <div className="media">
          <img src={IMGS.atelierCloth} alt="" className="img-fill" loading="lazy" />
        </div>
        <div className="body">
          <div className="eyebrow" style={{ marginBottom: 18 }}>Pillar Two — Minimalist Production</div>
          <h2>Fewer pieces, <em>made well.</em></h2>
          <p>
            No seasonal overproduction. Intentional low-batch manufacturing — calibrated for low resource waste
            and high process efficiency. We make what is needed; we make it to outlast.
          </p>
          <p>
            Our base in the UAE ships strategically across the region and beyond. Optimised smart-freight
            offsets the carbon footprint of every order.
          </p>
        </div>
      </section>

      <section className="atelier-video">
        <img src={IMGS.atelierVideo} alt="" />
        <video
          src={VIDEOS && VIDEOS.motion2}
          autoPlay muted loop playsInline
          poster={IMGS.atelierVideo}
          onError={(e) => { e.target.style.display = "none"; }}
        ></video>
        <div className="vovr"></div>
        <div className="cap">A film — 04:12</div>
        <div className="play">
          <svg viewBox="0 0 24 24"><polygon points="6 4 20 12 6 20"></polygon></svg>
        </div>
      </section>

      <section className="craft-grid">
        <div className="craft-item">
          <div className="n">01</div>
          <h4>Regenerative Textures</h4>
          <p>Recycled ocean and industrial plastic — re-spun into a high-density double-knit performance fabric.</p>
        </div>
        <div className="craft-item">
          <div className="n">02</div>
          <h4>Carbon-Neutral Transit</h4>
          <p>Our UAE base ships strategically with optimised smart-freight, calibrated to offset the carbon footprint of every order.</p>
        </div>
        <div className="craft-item">
          <div className="n">03</div>
          <h4>Social Equity Investment</h4>
          <p>10% of all gross revenue is directed to women-led socio-economic development and education initiatives.</p>
        </div>
        <div className="craft-item">
          <div className="n">04</div>
          <h4>Minimalist Production</h4>
          <p>No seasonal overproduction. Low-batch, low-waste manufacturing designed for longevity.</p>
        </div>
      </section>

      <section className="numbers">
        <div className="n">
          <div className="big"><em>10%</em></div>
          <div className="lbl">Of revenue to social impact</div>
        </div>
        <div className="n">
          <div className="big"><em>4</em></div>
          <div className="lbl">Essential technical pieces</div>
        </div>
        <div className="n">
          <div className="big"><em>2</em></div>
          <div className="lbl">Signature colorways</div>
        </div>
        <div className="n">
          <div className="big">∞</div>
          <div className="lbl">Worn intentionally</div>
        </div>
      </section>

      <section className="newsletter">
        <div className="newsletter-inner">
          <h2><em>Join</em> the collective.</h2>
          <p>Private dispatches from the HHARA studio — capsule drops, philanthropic updates, and editorial notes.</p>
          <div style={{ marginTop: 36 }}>
            <button className="btn btn-light" onClick={() => setRoute("stores")}>
              See Our Impact
              <span className="btn-arrow"><Icon.Arrow /></span>
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

// ============ JOURNAL ============
const JOURNAL = [
  { id: "j1", title: "From plastic waste to performance grade", excerpt: "Inside the regenerative knit — how ocean and industrial plastic become a sensory-grade fabric.", date: "26 May 2026", cat: "Material Transparency", img: "j1" },
  { id: "j2", title: "On Bark Oxides and Zinc Crimson", excerpt: "Two colorways, two languages. Choosing pigments that capture mineral earth and inner energy.", date: "14 May 2026", cat: "The Palette", img: "j2" },
  { id: "j3", title: "Why we make only four pieces", excerpt: "The case for minimalist production — fewer SKUs, lower waste, garments engineered to outlast.", date: "02 May 2026", cat: "Our Ethos", img: "j3" },
  { id: "j4", title: "Worn intentionally", excerpt: "Three women, two sets — the Imara and Dalia, photographed across the UAE.", date: "21 April 2026", cat: "The Capsule", img: "j4" },
  { id: "j5", title: "Carbon-neutral, from the UAE", excerpt: "How optimised smart-freight from our regional base offsets every single shipment.", date: "08 April 2026", cat: "Circular Luxury", img: "j5" },
  { id: "j6", title: "The 10% directive", excerpt: "Where the philanthropic share goes — women-led literacy, micro-endowments, and clean water alliances.", date: "27 March 2026", cat: "Social Impact", img: "j6" },
];

function JournalIndex({ setRoute, openArticle }) {

  return (
    <>
      <div className="page-head">
        <span className="eyebrow">The Journal</span>
        <h1>Notes <em>from the collective</em></h1>
        <p className="lead">
          Dispatches on regenerative materials, carbon-neutral logistics, the women-led initiatives we fund,
          and the editorial language of the HHARA capsule — published twice monthly, never more.
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
          journey from waste stream to wearable — and ask why it took us this long.
        </div>

        <p className="dropcap">
          The fibre arrives by container, baled and labelled, sourced from ocean-recovery programs and industrial
          waste streams across three continents. What enters the mill as a polymer sheet leaves it as a yarn
          — a high-density double-knit engineered for moisture management, capillary ventilation, and structured
          recovery. To the eye, it is a sensory-grade textile. To the hand, it weighs almost nothing.
        </p>

        <p>
          Each colourway is calibrated in small batches. Bark Oxides — a deep, mineral neutral pulled from raw
          earth pigment — is set first; Zinc Crimson, the muted jewel, is reserved for the second pass. Both are
          designed to absorb, not reflect — to be worn quietly, not announced.
        </p>

        <figure>
          <div className="ph" style={{ background: "var(--line-soft)" }}>
            <img src={IMGS.jFig1} alt="" className="img-fill" loading="lazy" />
          </div>
          <figcaption>Recycled performance knit, pre-cut</figcaption>
        </figure>

        <blockquote>
          &ldquo;We are not in the business of seasonal turnover. We are in the business of pieces
          you return to — and pieces that fund the work of women, every time you do.&rdquo;
        </blockquote>

        <h3>The structure</h3>
        <p>
          The Imara framework is cut for compression and elongation — a chevron-anatomical waistband on the
          legging, zero-slip stabilization, flatlock seams that vanish against skin. The Dalia framework
          is its counterpoint: cross-back architecture, omnidirectional 4-way stretch, an inner waistband
          pocket sewn into the short. Two perspectives. One uncompromising identity.
        </p>

        <p>
          Both sets share the same hardware language — brushed-gold, low-friction, designed to disappear in
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
          every order routes directly to women-led socio-economic development and education initiatives — the
          philanthropic directive is not an afterthought but the operating model.
        </p>

        <p>
          The garment will be worn intentionally. It will be repaired, returned, re-circulated. And the value
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
          Four pieces. Two sets. Two colorways. Photographed across the UAE with no styling beyond the fabric itself.
          Click any look to shop the piece within.
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
            <div className="caption"><div className="ttl">01 — Imara Bra</div></div>
            <div className="hotspot" style={{ top: "62%", left: "50%" }} onClick={() => openProduct("p1")}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </div>
          </div>
          <div className="lb-tile">
            <img src={IMGS.lb2} alt="" className="img-fill" loading="lazy" />
            <div className="ovr"></div>
            <div className="caption"><div className="ttl">02 — Imara Legging</div></div>
            <div className="hotspot" style={{ top: "48%", left: "55%" }} onClick={() => openProduct("p2")}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </div>
          </div>
        </div>

        <div className="lb-row cols-3">
          <div className="lb-tile">
            <img src={IMGS.lb3} alt="" className="img-fill" loading="lazy" />
            <div className="ovr"></div>
            <div className="caption"><div className="ttl">Bark Oxides</div></div>
          </div>
          <div className="lb-tile">
            <img src={IMGS.lb4} alt="" className="img-fill" loading="lazy" />
            <div className="ovr"></div>
            <div className="caption"><div className="ttl">03 — Dalia Bra</div></div>
            <div className="hotspot" style={{ top: "70%", left: "40%" }} onClick={() => openProduct("p3")}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </div>
          </div>
          <div className="lb-tile">
            <img src={IMGS.lb5} alt="" className="img-fill" loading="lazy" />
            <div className="ovr"></div>
            <div className="caption"><div className="ttl">Zinc Crimson</div></div>
          </div>
        </div>

        <div className="lb-row cols-2-flip">
          <div className="lb-tile">
            <img src={IMGS.lb6} alt="" className="img-fill" loading="lazy" />
            <div className="ovr"></div>
            <div className="caption"><div className="ttl">04 — Dalia Short</div></div>
            <div className="hotspot" style={{ top: "50%", left: "45%" }} onClick={() => openProduct("p4")}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </div>
          </div>
          <div className="lb-tile">
            <img src={IMGS.lb7} alt="" className="img-fill" loading="lazy" />
            <div className="ovr"></div>
            <div className="caption"><div className="ttl">The Dalia Set</div></div>
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
              <div>The HHARA Capsule</div>
              <div className="ttl">Worn intentionally, around the world.</div>
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

// ============ IMPACT ============
const IMPACT_DIRECTIVES = [
  { title: "Digital Literacy & Education", body: "We fund modernised digital literacy programs and localised educational initiatives — including women's bootcamps across emerging markets.", img: "sMilan" },
  { title: "Female-Led Artisan Circles", body: "Direct micro-endowments helping female-led artisan circles and sustainable agricultural cooperatives expand internationally.", img: "sParis" },
  { title: "Clean Water Alliances", body: "Cross-border water resource alliances to restore infrastructure and long-term access for women and girls worldwide.", img: "sTokyo" },
  { title: "Socio-Economic Independence", body: "Verified non-profit networks cultivating self-reliance, security, and economic independence for women across regions.", img: "sNY" },
  { title: "Carbon-Neutral Logistics", body: "Investment into optimised smart-freight from our UAE base — calibrated to offset the footprint of every shipment.", img: "sLondon" },
  { title: "Circular Sourcing Reporting", body: "Transparent material reporting on regenerative textile sourcing — ocean and industrial plastic recovery audited annually.", img: "sDubai" },
];

function StoresPage({ setRoute }) {

  return (
    <>
      <div className="page-head">
        <span className="eyebrow">Institutional Philanthropy</span>
        <h1>Where the <em>10% goes</em></h1>
        <p className="lead">
          Philanthropy is not an afterthought; it is the operating model. Ten percent of all gross revenue is directed
          to verified non-profit networks cultivating self-reliance, security, and economic independence for women worldwide.
        </p>
      </div>
      <section className="section" style={{ textAlign: "center", padding: "16px 24px 48px" }}>
        <div style={{ fontFamily: "var(--serif, 'Cormorant Garamond', serif)", fontSize: 160, lineHeight: 1, margin: "0 0 16px" }}>10%</div>
        <p style={{ fontSize: 13, letterSpacing: "0.3em", textTransform: "uppercase", opacity: 0.55 }}>Of Gross Revenue · Directed to Social Impact</p>
      </section>
      <div className="stores-list">
        {IMPACT_DIRECTIVES.map((d) => (
          <div className="store-card" key={d.title}>
            <div className="img">
              <img src={IMGS[d.img]} alt={d.title} className="img-fill" loading="lazy" />
            </div>
            <div className="body">
              <div className="city">{d.title}</div>
              <div className="addr">{d.body}</div>
              <div className="hours">Active directive</div>
              <div className="acts">
                <a onClick={() => setRoute("journal")} style={{ cursor: "pointer" }}>Read the report</a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ============ ACCOUNT / LOGIN ============
function AccountPage({ onAuthenticated }: { onAuthenticated?: () => void }) {
  const customer = useCustomer();
  const [tab, setTab] = useState("signin");
  const [form, setForm] = useState({ email: "", password: "", firstName: "", lastName: "", acceptsMarketing: false });
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
      firstName: form.firstName, lastName: form.lastName,
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
            <p style={{ opacity: 0.6, fontSize: 14 }}>No orders yet — start with The Imara or Dalia Set.</p>
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
                    <span style={{ opacity: 0.7 }}>{o.fulfillmentStatus || "Pending"} · {o.financialStatus || "—"}</span>
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
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleSignUp}>
            <div className="field">
              <label>First Name</label>
              <input type="text" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} placeholder="Your given name" />
            </div>
            <div className="field">
              <label>Last Name</label>
              <input type="text" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} placeholder="Your family name" />
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
function WishlistPage({ setRoute, openProduct, wishlist, quickAdd }) {
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
            <ProductCard key={p.id} product={p} onClick={() => openProduct(p.id)} onQuickAdd={quickAdd} />
          ))}
        </div>
      )}
    </>
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
        if (el) el.focus();
      }, 100);
    } else {
      setQ("");
    }
  }, [open]);

  const results = q.trim() ? PRODUCTS.filter((p) => (p.name + p.cat).toLowerCase().includes(q.toLowerCase())) : PRODUCTS.slice(0, 6);
  const suggestions = ["Imara Bra", "Imara Legging", "Dalia Bra", "Dalia Short", "Bark Oxides"];
  const trending = ["The Imara Set", "The Dalia Set", "Zinc Crimson"];

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








// === FILE 10-180e2df1-7549-448a-8bbb-f6c3acb791f4.jsx ===

function App({ initialProducts, initialCart, initialCustomer }: { initialProducts?: any[]; initialCart?: any; initialCustomer?: any }) {
  const products = (initialProducts && initialProducts.length) ? initialProducts : PRODUCTS;
  const [shopifyCart, setShopifyCart] = useState<any>(initialCart || null);
  const [customer, setCustomer] = useState<any>(initialCustomer || null);
  const [route, setRouteState] = useState("home");
  const [productId, setProductId] = useState("p1");
  const [articleId, setArticleId] = useState("j1");
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [wishlistLoaded, setWishlistLoaded] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("hhara_wishlist");
      if (raw) setWishlist(JSON.parse(raw));
    } catch {}
    setWishlistLoaded(true);
  }, []);
  useEffect(() => {
    if (!wishlistLoaded) return;
    try { localStorage.setItem("hhara_wishlist", JSON.stringify(wishlist)); } catch {}
  }, [wishlist, wishlistLoaded]);
  const toggleWishlist = (id: string) => {
    setWishlist((w) => w.includes(id) ? w.filter((x) => x !== id) : [...w, id]);
  };

  const setRoute = (r, payload) => {
    setRouteState(r);
    if (r === "product" && payload) setProductId(payload);
    if (r === "article" && payload) setArticleId(payload);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  // Derive cart UI items from the Shopify cart structure
  const cart = (shopifyCart?.lines || []).map((line: any) => {
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
      color: opts.color || opts.colour || opts.colorway || "—",
      size: opts.size || "—",
      tone: productMatch?.tone || "tone-2",
      featuredImage: line.merchandise.image?.url || productMatch?.featuredImage?.url || null,
    };
  });

  const findVariantId = (product: any, color: string, size: string) => {
    if (!product?.variants?.length) return null;
    const match = product.variants.find((v: any) => {
      const opts = Object.fromEntries(v.selectedOptions.map((o: any) => [o.name.toLowerCase(), o.value]));
      const cOk = !color || Object.values(opts).includes(color);
      const sOk = !size || Object.values(opts).includes(size);
      return cOk && sOk;
    });
    return match?.id || product.variants[0].id;
  };

  const addToCart = async (item) => {
    const product = products.find((p: any) => p.id === item.id);
    const variantId = item.variantId || findVariantId(product, item.color, item.size);
    if (!variantId) {
      console.warn("No variant resolved for", item);
      setCartOpen(true);
      return;
    }
    try {
      const next = await serverAddLine(variantId, 1);
      setShopifyCart(next);
      setCartOpen(true);
    } catch (e) {
      console.error("addToCart failed", e);
    }
  };

  const quickAdd = (product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      color: product.swatches?.[0]?.name,
      size: product.sizes?.[0],
      tone: product.tone,
    });
  };

  const updateQty = async (lineId: string, qty: number) => {
    try {
      const next = await serverUpdateLine(lineId, qty);
      setShopifyCart(next);
    } catch (e) {
      console.error("updateQty failed", e);
    }
  };
  const removeItem = async (lineId: string) => {
    try {
      const next = await serverRemoveLine(lineId);
      setShopifyCart(next);
    } catch (e) {
      console.error("removeItem failed", e);
    }
  };

  const cartCount = cart.reduce((a: number, i: any) => a + i.qty, 0);
  const openProduct = (id) => setRoute("product", id);
  const openArticle = (id) => setRoute("article", id);

  let body;
  if (route === "shop") {
    body = <CollectionPage setRoute={setRouteState} openProduct={openProduct} quickAdd={quickAdd} />;
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
  } else if (route === "account") {
    body = <AccountPage />;
  } else if (route === "wishlist") {
    body = <WishlistPage setRoute={setRouteState} openProduct={openProduct} wishlist={wishlist} quickAdd={quickAdd} />;
  } else {
    body = <Home setRoute={setRoute} quickAdd={quickAdd} />;
  }

  const tweaksUI = null;

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
          <Footer setRoute={setRouteState} />
          <CartDrawer
            open={cartOpen}
            onClose={() => setCartOpen(false)}
            items={cart}
            updateQty={updateQty}
            removeItem={removeItem}
            checkoutUrl={shopifyCart?.checkoutUrl}
            setRoute={setRouteState}
          />
          <SearchOverlay
            open={searchOpen}
            onClose={() => setSearchOpen(false)}
            openProduct={openProduct}
          />
          {tweaksUI}
        </div>
      </CustomerContext.Provider>
      </ShopifyCartContext.Provider>
    </ProductsContext.Provider>
  );
}



export default App;
