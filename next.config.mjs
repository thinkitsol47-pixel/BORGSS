/**
 * Build output goes to `.next-build` rather than `.next`.
 *
 * Two dev servers that share one build directory will corrupt each other:
 * when one exits it cleans the directory out from under the other, which
 * then fails mid-request with "Cannot read properties of undefined
 * (reading 'clientModules')" or starts returning 404s.
 *
 * Set BORJSS_DIST_SUFFIX to give a throwaway server its own directory,
 * e.g. `BORJSS_DIST_SUFFIX=check npx next dev -p 3099`.
 */

const isDev = process.env.NODE_ENV === "development";
const distSuffix = process.env.BORJSS_DIST_SUFFIX
  ? `-${process.env.BORJSS_DIST_SUFFIX}`
  : "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: `.next-build${distSuffix}`,
  // Next rewrites tsconfig's `include` to point at its own generated types.
  // A throwaway server would therefore add a path to a directory that is
  // deleted afterwards, leaving the editor reporting missing files — so give
  // those runs their own scratch tsconfig and leave the real one alone.
  ...(distSuffix
    ? { typescript: { tsconfigPath: `tsconfig.build${distSuffix}.json` } }
    : {}),
  // Double-invoking every render is a useful production-correctness check but
  // roughly doubles compile work, which is painful on this synced-folder disk.
  reactStrictMode: !isDev,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      // add your S3 / R2 / Supabase storage host here later
      // { protocol: "https", hostname: "cdn.blueoceanresearchjournal.org" },
    ],
  },
  async redirects() {
    return [
      { source: "/current", destination: "/issues/current", permanent: true },
      { source: "/archive", destination: "/issues", permanent: true },
    ];
  },

  webpack(config, { dev }) {
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        aggregateTimeout: 400,
        ignored: ["**/node_modules/**", "**/.next-build*/**", "**/.git/**"],
      };
    }
    return config;
  },
};

export default nextConfig;
