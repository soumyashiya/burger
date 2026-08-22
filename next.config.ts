import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // A production build writes over whatever is in the output directory. If a
  // `next dev` server is serving from that same directory it loses its chunks
  // mid-flight and every route starts 500ing with "Cannot find module".
  // Setting NEXT_DIST_DIR lets a verification build go somewhere harmless:
  //   NEXT_DIST_DIR=.next-verify npm run build
  distDir: process.env.NEXT_DIST_DIR || ".next",
  images: {
    formats: ["image/webp"],
  },
  // Hide Next's dev-only compile/loading badge — it floats over the hero's
  // bottom-left corner and reads as part of the design. Dev only; it never
  // shipped in the production build either way.
  devIndicators: {
    appIsrStatus: false,
    buildActivity: false,
  },
};

export default nextConfig;
