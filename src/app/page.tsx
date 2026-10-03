import type { Metadata } from "next";
import Image from "next/image";
import { ComingSoonForm } from "./ComingSoonForm";
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE } from "@/lib/seo";
import "./coming-soon.css";

export const metadata: Metadata = {
  title: DEFAULT_TITLE,
  description: DEFAULT_DESCRIPTION,
  alternates: { canonical: "/" },
  robots: { index: true, follow: false },
};

export default function ComingSoon() {
  return (
    <div className="cs-page">
      <div className="cs-bar cs-tracked">Arriving October 2026</div>

      <header className="cs-header">
        <span className="cs-left cs-tagline">Unapologetically<br /><em>You.</em></span>
        <img src="/images/hhara-logo.png" alt="HHARA" className="cs-logo" width={400} height={73} />
        <a className="cs-right cs-tracked" href="https://instagram.com/thisishhara" target="_blank" rel="noopener">@thisishhara</a>
      </header>

      <main className="cs-main">
        <div className="cs-image">
          <Image
            src="/images/IMG_5275.jpeg"
            alt="HHARA campaign image"
            fill
            priority
            fetchPriority="high"
            sizes="(max-width: 900px) 100vw, 60vw"
            quality={75}
            className="cs-image-img"
          />
        </div>
        <section className="cs-content">
          <div className="cs-rule" aria-hidden="true" />
          <p className="cs-eyebrow cs-tracked">Coming soon</p>
          <h1 className="cs-title">She is wonder.<br />She is HHARA.</h1>
          <p className="cs-about">Elevated athleisure essentials for women who move with quiet confidence and purpose.</p>
          <ComingSoonForm />
        </section>
      </main>

      <footer className="cs-footer">
        <span>© 2026 HHARA</span>
        <span className="cs-certs">GRS Certified &nbsp;·&nbsp; OEKO-TEX Standard 100 &nbsp;·&nbsp; Complimentary next-day delivery in the UAE</span>
        <nav className="cs-social" aria-label="Social">
          <a href="https://instagram.com/thisishhara" target="_blank" rel="noopener">Instagram</a>
          <a href="https://www.tiktok.com/@thisishhara" target="_blank" rel="noopener">TikTok</a>
        </nav>
      </footer>
    </div>
  );
}
