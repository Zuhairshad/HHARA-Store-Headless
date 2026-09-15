// No "use client" — this is a React Server Component.
// It renders the above-the-fold hero markup in SSR HTML so the browser
// can paint the LCP image before any JavaScript loads or hydrates.
import Image from "next/image";

// Hardcoded from HHRAA_DATA.HEROES[0] in HharaApp.tsx.
// Must match exactly so React's hydration reconciler can adopt the nodes.
const HERO_TITLE = "She is |Wonder.";
const HERO_SUB =
  "She doesn't wait for wonder - she creates it. Designed for women who move with quiet confidence and purpose.";
const HERO_TONE = "tone-4";

export default function HeroServer() {
  // Replicate the title-splitting logic from HharaApp's Hero function so the
  // rendered markup is structurally identical to what the client will produce.
  const lines = HERO_TITLE.split("\n");

  return (
    <section className="hero" id="server-hero" aria-hidden="false">
      <div className={`hero-media ${HERO_TONE}`}>
        <Image
          src="/images/hero-banner.png"
          alt="Woman wearing the HHARA collection walking by a G-Wagon"
          fill
          className="img-fill hero-image"
          sizes="100vw"
          quality={85}
          priority
        />
      </div>
      <div className="hero-overlay"></div>
      <div className="hero-content">
        <h1 className="hero-title">
          {lines.map((line, i) => {
            const isLastLine = i === lines.length - 1;
            const parts = line.split("|");
            return (
              <span key={i}>
                {parts.map((part, pi) => {
                  const isLastPart = pi === parts.length - 1;
                  return isLastLine && isLastPart ? (
                    <em key={pi}>{part}</em>
                  ) : (
                    <span key={pi}>{part}</span>
                  );
                })}
                {!isLastLine && <br />}
              </span>
            );
          })}
        </h1>
        <p className="hero-sub">{HERO_SUB}</p>
        <div className="hero-ctas">
          {/* CTA button is interactive; it's intentionally omitted here.
              HharaApp renders the full interactive hero after hydration. */}
        </div>
      </div>
    </section>
  );
}
