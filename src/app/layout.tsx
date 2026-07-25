import type { Metadata } from "next";
import { Cormorant_Garamond, Montserrat, JetBrains_Mono, Mr_De_Haviland } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-display",
});
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  variable: "--font-sans",
});
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});
const mrDeHaviland = Mr_De_Haviland({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-signature",
});

export const metadata: Metadata = {
  title: "HHARA | She is Wonder",
  description: "Unapologetically You. Four elevated essentials. Two timeless colourways. Designed to move effortlessly through every version of your day.",
  keywords: ["HHARA", "Considered Luxury", "Activewear", "Recycled Performance Wear", "UAE Activewear", "Maison HHARA", "Imara Set", "Dahlia Set"],
  icons: {
    icon: "/images/monkey-logo.jpg",
  },
  openGraph: {
    title: "HHARA | She is Wonder",
    description: "Unapologetically You. Four elevated essentials. Two timeless colourways. Designed to move effortlessly through every version of your day.",
    url: "https://hhara-store-headless.vercel.app",
    siteName: "HHARA",
    images: [
      {
        url: "/images/hero1.jpg",
        width: 1200,
        height: 630,
        alt: "HHARA | She is Wonder Capsule Collection",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HHARA | She is Wonder",
    description: "Unapologetically You. Four elevated essentials. Two timeless colourways. Designed to move effortlessly through every version of your day.",
    images: ["/images/hero1.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${montserrat.variable} ${jetbrains.variable} ${mrDeHaviland.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Montserrat:ital,wght@0,100..700;1,100..700&family=Mr+De+Haviland&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
