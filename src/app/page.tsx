import type { Metadata } from "next";
import { ComingSoonForm } from "./ComingSoonForm";
import "./coming-soon.css";

export const metadata: Metadata = {
  title: "HHARA — Coming Soon",
  description: "She is wonder. She is HHARA. Arriving October 2026.",
  alternates: { canonical: "/" },
  robots: { index: true, follow: false },
};

export default function ComingSoon() {
  return (
    <div className="cs-page">
      <div className="cs-bar cs-tracked">Arriving October 2026</div>

      <header className="cs-header">
        <span className="cs-left cs-tagline">Unapologetically<br /><em>You.</em></span>
        <img src="/images/hhara-logo.png" alt="HHARA" className="cs-logo" />
        <a className="cs-right cs-tracked" href="https://instagram.com/thisishhara" target="_blank" rel="noopener">@thisishhara</a>
      </header>

      <main className="cs-main">
        <div className="cs-image" role="img" aria-label="HHARA campaign image" />
        <section className="cs-content">
          <div className="cs-rule" aria-hidden="true" />
          <p className="cs-eyebrow cs-tracked">Coming soon</p>
          <h1 className="cs-title">She is wonder.<br />She is HHARA.</h1>
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
