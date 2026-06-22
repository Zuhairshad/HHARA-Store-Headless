import type { Metadata } from "next";
import { Cormorant_Garamond, Montserrat, JetBrains_Mono } from "next/font/google";
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

export const metadata: Metadata = {
  title: "HHARA | Maison of Considered Luxury",
  description: "Conceived in Florence, engineered in the UAE. High-performance activewear crafted from recycled ocean plastic, designed for longevity.",
  keywords: ["HHARA", "Considered Luxury", "Activewear", "Recycled Performance Wear", "UAE Activewear", "Maison HHARA", "Imara Set", "Dalia Set"],
  openGraph: {
    title: "HHARA | Maison of Considered Luxury",
    description: "Conceived in Florence, engineered in the UAE. High-performance activewear crafted from recycled ocean plastic, designed for longevity.",
    url: "https://hhara-store-headless.vercel.app",
    siteName: "HHARA",
    images: [
      {
        url: "/images/hero1.jpg",
        width: 1200,
        height: 630,
        alt: "HHARA | Maison of Considered Luxury Capsule Collection",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HHARA | Maison of Considered Luxury",
    description: "Conceived in Florence, engineered in the UAE. High-performance activewear crafted from recycled ocean plastic, designed for longevity.",
    images: ["/images/hero1.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${montserrat.variable} ${jetbrains.variable}`}>
      <body>{children}</body>
    </html>
  );
}
