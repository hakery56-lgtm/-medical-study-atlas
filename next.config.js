/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // lets the running app tell when a newer deployment is live (components/UpdateChecker.tsx)
  env: { NEXT_PUBLIC_BUILD_ID: process.env.VERCEL_GIT_COMMIT_SHA || "dev" },
  // basic hardening; a full CSP is skipped until the inline styles / R3F / Supabase sources are mapped
  async headers() {
    return [{
      source: '/:path*',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      ],
    }];
  },
};
module.exports = nextConfig;
