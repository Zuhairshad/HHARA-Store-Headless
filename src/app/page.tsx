import type { Metadata } from "next";
import "./coming-soon.css";

export const metadata: Metadata = {
  title: "HHARA | Coming Soon",
  description: "Something wonderful is on its way. HHARA is coming soon.",
};

export default function ComingSoon() {
  return (
    <main className="cs">
      <img src="/images/hhara-logo.png" alt="HHARA" className="cs-logo" />
      <span className="cs-eyebrow">She is Wonder</span>
      <h1 className="cs-title">Coming <em>Soon</em></h1>
      <p className="cs-lead">
        Something considered is on its way. Four elevated essentials, two timeless colourways — designed for every version of your day.
      </p>
      <p className="cs-contact">hello@hhara.com</p>
    </main>
  );
}
