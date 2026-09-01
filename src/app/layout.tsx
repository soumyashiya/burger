import type { Metadata, Viewport } from "next";
import { Anton, Archivo } from "next/font/google";
import SmoothScroll from "@/components/SmoothScroll";
import "./globals.css";

/** Headline face. One weight only — never apply font-600/700 to it. */
const anton = Anton({
  subsets: ["latin"],
  weight: ["400"],
  // `-src` suffix: `--font-anton` is the Tailwind theme key in globals.css, so
  // the raw family has to live under a different name or the two recurse.
  variable: "--font-anton-src",
  display: "swap",
});

/** Everything else: UI chrome, tracked micro-labels and body copy. */
const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-archivo-src",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BRENN — THE STACK",
  description:
    "Flame-forged, dry-aged and stacked by hand. BRENN builds one burger and builds it properly.",
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${anton.variable} ${archivo.variable}`}>
      <body>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
