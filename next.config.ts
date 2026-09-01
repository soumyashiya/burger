import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/webp"],
  },
  // Hide Next's dev-only compile/loading badge — it floats over the hero's
  // bottom-left corner and reads as part of the design. Dev only; it never
  // shipped in the production build either way.
  // The old `buildActivity` / `appIsrStatus` keys were deprecated in 15.5 and
  // are no longer configurable; `false` is the replacement for hiding it.
  devIndicators: false,
};

export default nextConfig;
