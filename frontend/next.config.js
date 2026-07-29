/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    return [
      { source: '/api/:path*', destination: `${backendUrl}/api/:path*` },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '0' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'geolocation=(self), camera=(self), microphone=(self)' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              process.env.NODE_ENV === 'production'
                ? "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com"
                : "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https://*.tile.openstreetmap.org https://*.basemaps.cartocdn.com https://unpkg.com https://earthengine.googleapis.com https://*.earthengine.googleapis.com blob:",
              "font-src 'self'",
              "connect-src 'self' https://silenteye.fly.dev wss://silenteye.fly.dev https://api.silenteye.mx wss://api.silenteye.mx https://silenteye-3rrwnq.fly.dev wss://silenteye-3rrwnq.fly.dev https://challenges.cloudflare.com https://*.tile.openstreetmap.org https://*.basemaps.cartocdn.com https://nominatim.openstreetmap.org https://earthengine.googleapis.com https://*.earthengine.googleapis.com",
              "frame-src 'self' https://challenges.cloudflare.com",
              "frame-ancestors 'none'",
            ].join('; '),
          },
        ],
      },
    ];
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || '',
  },
};
