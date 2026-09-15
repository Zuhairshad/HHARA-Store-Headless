# HHARA SSR Refactor — Phase 0 Notes

## Root Cause of Empty Shell
1. **HharaApp.tsx:5188+ (`"use client"` boundary)** — The entire 5600-line app component is marked `"use client"`, forcing it to hydrate as a React island. This means all heroic imagery, h1 text, products, and navigation render only *after* JavaScript loads and React hydrates.
2. **useState/useEffect hydration mismatch (line 5189–5273)** — 29 useState calls initialize in HharaApp, none SSR-safe. The Home component at line 1906 depends on route state (initialRoute passed from server but overwritten immediately on hydration).
3. **No server component extraction** — Zero async/server-side data transformations happen in page.tsx beyond fetching; all 4-product grid, hero text, and categories are purely client-side render logic.
4. **No mount gates found** — No `useState(false); if (!mounted) return null` guards exist. Hero, testimonials, and product grid render unconditionally once hydrated.

Evidence:
- src/components/HharaApp.tsx:1 declares `"use client"`
- src/app/page.tsx:10-22 async function passes products/cart/customer props to HharaApp but HharaApp immediately re-initializes state
- src/lib/shopify.ts is server-only (async fetch, no "use client"), so it cannot be imported by client component children
- Layout.tsx line 75 has fetchPriority="high" but target image is never in SSR HTML (only preload link)

## Hero in SSR HTML Today?
**Yes, partially in preload metadata only.**
- Byte count: 146,691 bytes
- fetchpriority count: 0 (no `<img>` with fetchpriority attribute in document body)
- h1 content found: `<h1 class="hero-title"` element present in HTML but text node empty (hydrated by React after mount)
- First meaningful paint HTML: Preload link for `/images/hero-banner.png` exists in `<head>` but `<img src="/images/hero-banner.png">` with actual dimensions/alt is rendered only client-side
- Initial body content: `<div class="app">` shell with no hero-media, hero-content, hero-title text—all appended by React hydration

## Mount Gates Found
None. HharaApp component has no `useState(false)` + `if (!mounted)` guards. All components render directly on hydration.

## next/dynamic ssr:false Found
None in src/. No dynamic imports with `{ ssr: false }` anywhere in the codebase.

## State Inventory — HharaApp.tsx

### CART
- Line 5190: `const [shopifyCart, setShopifyCart] = useState<any>(initialCart || null)`
- Line 5191: `const [localCartItems, setLocalCartItems] = useState<any[]>([])`

### AUTH
- Line 5192: `const [customer, setCustomer] = useState<any>(initialCustomer || null)`

### UI-MODAL
- Line 5196: `const [cartOpen, setCartOpen] = useState(false)`
- Line 5197: `const [searchOpen, setSearchOpen] = useState(false)`
- Line 5265: `const [signupPopupOpen, setSignupPopupOpen] = useState(false)`
- Line 2265: `const [writeReviewOpen, setWriteReviewOpen] = useState(false)` (in PDP)
- Line 2314: `const [reelOpen, setReelOpen] = useState(false)` (in PDP)
- Line 1988: `const [openSections, setOpenSections] = useState({...})` (in CollectionPage)
- Line 4505: `const [openSections, setOpenSections] = useState<Set<string>>(new Set())` (in FAQPage)

### ROUTING
- Line 5193: `const [route, setRouteState] = useState(initialRoute || "home")`
- Line 5194: `const [productId, setProductId] = useState("p1")`
- Line 5195: `const [articleId, setArticleId] = useState("j1")`

### DATA
- Line 5198: `const [wishlist, setWishlist] = useState<string[]>([])`
- Line 5199: `const [wishlistLoaded, setWishlistLoaded] = useState(false)`
- Line 5200: `const [selectedColorFilter, setSelectedColorFilter] = useState<string | null>(null)`
- Line 5201: `const [selectedCatFilter, setSelectedCatFilter] = useState<string | null>(null)`
- Line 5202: `const [initialProductColor, setInitialProductColor] = useState<string | null>(null)`
- Line 439: `const [index, setIndex] = useState(0)` (Announce carousel)
- Line 947–952: `[email, setEmail], [hpCompany, setHpCompany], [formTs], [busy, setBusy], [done, setDone], [error, setError]` (Footer newsletter)
- Line 668–674: `[promo, setPromo], [promoBusy], [promoError], [upsellSizes], [upsellColors], [addedUpsellIds], [shipOpen]` (PreCheckoutPage)
- Line 2240–2322: `[color, setColor], [size, setSize], [open], [added], [sizeGuideOpen], [howToMeasureOpen], [sgUnit], [adding], [sizePrompt], [activeShot], [writeReviewOpen], [reviewForm], [recentlyViewed], [reviews], [videoDismissed], [reelOpen], [isPlaying], [isMuted], [progress], [isReelHovered], [bubblePos], [isDragging]` (PDP)
- Line 3605–3612: `[amount], [customAmount], [qty], [recipientName], [recipientEmail], [senderName], [note], [unavailable]` (GiftCardPage)

### PRESENTATIONAL
- Line 476: `const [imgIndex, setImgIndex] = useState(0)` (MegaMenu)
- Line 539–541: `[menuOpen], [mobileMenuOpen], [scrolled]` (Header)
- Line 1853–1854: `[canLeft], [canRight]` (Testimonials)
- Line 1930–1932: `[sort], [descExpanded], [filters]` (CollectionPage)
- Line 2298: `const [reviews, setReviews] = useState([...])` (PDP hardcoded reviews)
- Line 3488: `const [inView, setInView] = useState(false)` (AtelierVideoSection)
- Line 5083: `const [q, setQ] = useState("")` (SearchOverlay)

### USEEFFECTS
- Line 5204–5233: Route change tracking, scroll-to-top (depends on window/document)
- Line 5235–5241: URL history management (depends on window.location)
- Line 5243–5249: Wishlist localStorage hydration
- Line 5251–5256: Windows OS detection (navigator.userAgent)
- Line 5257–5260: Wishlist localStorage persistence
- Line 5276–5290: Signup popup auto-show timer
- Line 5371–5390: Cart visibility sync with DOM mutations

## Route Branches (setRoute values)

| Route | JSX Line Range | Component |
|-------|----------------|-----------|
| `"shop"` | 5560–5561 | CollectionPage |
| `"product"` | 5562–5563 | PDP (ProductDetailPage) |
| `"atelier"` | 5564–5565 | AtelierPage |
| `"journal"` | 5566–5567 | JournalIndex |
| `"article"` | 5568–5569 | ArticlePage |
| `"lookbook"` | 5570–5571 | LookbookPage |
| `"stores"` | 5572–5573 | StoresPage |
| `"gift-card"` | 5574–5575 | GiftCardPage |
| `"account"` | 5576–5577 | AccountPage |
| `"wishlist"` | 5578–5579 | WishlistPage |
| `"faq"` | 5580–5581 | FAQPage |
| `"shipping"` | 5582–5583 | ShippingPage |
| `"returns"` | 5584–5585 | ReturnsPage |
| `"size-guide"` | 5586–5587 | SizeGuidePage |
| `"privacy"` | 5588–5589 | PrivacyPage |
| `"terms"` | 5590–5591 | TermsPage |
| `"contact"` | 5592–5593 | ContactPage |
| `"pre-checkout"` | 5594–5604 | PreCheckoutPage |
| `"home"` (default) | 5606 | Home |

## Pure Presentational Sections (no hooks/handlers)

1. **Icon object (lines 30–100)** — Stateless SVG icon definitions only
2. **Hero (lines 1343–1388)** — No useState/useEffect, no event handlers beyond `onClick={openShop}`, pure JSX layout
3. **Categories (lines 1390–1410)** — No hooks, single onClick handler delegated to parent
4. **FeaturedGrid (lines 1419–1475)** — No state, maps HHRAA_DATA.FEATURED_IDS and props.openProduct
5. **Editorial (lines 1477–1528)** — No hooks, static text + image + button with delegated onClick
6. **Callouts (lines 1607–1630)** — No state, no events, pure UI cards
7. **Pillars (lines 1542–1580)** — No state, maps static array of pillar objects
8. **Proclamation (lines 1582–1605)** — No state, no events, static heading + tagline
9. **StoresPage (lines 4205–4244)** — Maps static HHRAA_DATA.STORES, renders Leaflet map (map interactivity is Leaflet-managed, not React)
10. **ShippingPage (lines 4180–4203)** — No state, static FAQ list, no event handlers
11. **ReturnsPage (lines 4155–4178)** — No state, static content
12. **PrivacyPage (lines 4135–4153)** — No state, static text
13. **TermsPage (lines 4105–4133)** — No state, static text
14. **ContactPage (lines 4088–4103)** — No state, static contact form (form submission delegated)
15. **Marquee (lines 1532–1540)** — No hooks, CSS animation only

*Candidates for Server Component extraction:* Hero, Editorial, Marquee, Pillars, Proclamation, Callouts, Testimonials (if review data becomes static/server-fetched), Shipping/Returns/Privacy/Terms/Contact pages.

## Shopify lib server-safe?
**Yes.** src/lib/shopify.ts contains only async functions (shopifyFetch, getProducts, cartCreate, etc.) that use `fetch()` and environment variables. No "use client", no browser-only APIs. Can be imported and called from server components or Server Actions. All functions are exportable to RSC consumers.

However, shopify.ts itself has no "use client" declaration—it is a pure server utility module and therefore safe for server-side imports.

## Build Output Summary
```
Route (app)                                 Size  First Load JS
┌ ƒ /                                    51.9 kB         163 kB
├ ○ /_not-found                            991 B         103 kB
├ ƒ /api/revalidate                        133 B         103 kB
├ ƒ /api/shopify/auth                      133 B         103 kB
├ ƒ /api/shopify/callback                  133 B         103 kB
├ ƒ /api/shopify/installed                 133 B         103 kB
└ ƒ /orders/track                        4.74 kB         113 kB
+ First Load JS shared by all             102 kB
  ├ chunks/255-0c31e5db41cac595.js       46.2 kB
  ├ chunks/4bd1b696-c023c6e3521b1417.js  54.2 kB
  └ other shared chunks (total)          1.95 kB

○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand
```

Root page `/` is **Dynamic (ƒ)**, not prerendered. First Load JS is 163 kB, of which 102 kB is shared React runtime + vendor code.

## Curl Findings
- Byte count: 146,691 bytes total SSR HTML
- fetchpriority count: 0 (no img elements with fetchpriority in document body)
- h1 content found: `<h1 class="hero-title">` tag present but empty until React hydration
- hero-banner string: Found in preload link (`imageSrcSet="/_next/image?url=%2Fimages%2Fhero-banner.png..."`) but actual img element is client-rendered
- Product data: All 4 products serialized as JSON in `<script>` tag at end of body (hydration payload)

## Critical Findings for Phase 1

**Blocker: `"use client"` at top of HharaApp.tsx forces entire 5600-line component tree into client-side render.** This is the single root cause of the empty shell. Until this boundary is moved down to individual interactive components (e.g., ProductCard, Cart, AccountPage), the hero, testimonials, featured grid, and all static sections will remain hydration-only.

**Secondary blocker: initialRoute prop passed to HharaApp but immediately overwritten.** Page.tsx passes initialRoute via props, but HharaApp.tsx:5193 re-initializes route state to `initialRoute || "home"`. This causes hydration mismatch if Next.js router changed the URL between server render and client hydration.

**Opportunity: 15 of 40+ page sections have zero state and zero event handlers (Hero, Editorial, Pillars, static pages).** These are candidates for Server Component extraction and can remove 50+ KB of client JS.

**No next/dynamic ssr:false usage.** The repo has no opt-out CSR boundaries using Next.js dynamic imports—only the global "use client" boundary.

---

## Phase 1 Recommendations

1. **Remove `"use client"` from HharaApp.tsx** and create a new `HharaAppClient.tsx` wrapper that contains only interactive state (cart, auth, modals, filters). Import this from page.tsx.

2. **Extract 15 pure presentational components** into server components or async/static JSX:
   - Hero → Hero.server.tsx (renders with initial products passed from page.tsx)
   - Pillars, Proclamation, Editorial, Callouts, Marquee → Static or server-fetched
   - Shipping, Returns, Privacy, Terms, Contact → Server Route Segment, not client state

3. **Move route state to URL search params** instead of useState. Replace `setRoute("shop")` with `router.push("/?r=shop")` and hydrate route from searchParams in page.tsx.

4. **Create async Server Action for hero title/subtitle data** so Hero component receives pre-rendered text, not re-fetching on mount.

5. **Preload hero image in layout.tsx with `<Image>` component** instead of `<link rel="preload">` so Next.js can optimizeSize and inject fetchpriority="high" automatically.

Phase 0 is **complete and blocking Phase 1 start**.
