/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['better-sqlite3'],
  experimental: {
    // Server Actions handle every mutation in this app; keep the payload cap
    // modest since audio is uploaded through a dedicated route handler.
    serverActions: { bodySizeLimit: '2mb' },
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), geolocation=(), microphone=(self)' },
        ],
      },
    ];
  },
};

export default nextConfig;
