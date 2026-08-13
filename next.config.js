/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV !== 'production'

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
]

// Sending HSTS in dev would pin localhost to https:// in the browser and
// make it unreachable over plain http, so it's production-only.
if (!isDev) {
  securityHeaders.push({
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  })
}

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Hides the dev-mode floating "N" indicator badge (dev-only, never shown
  // in production builds regardless of this setting).
  devIndicators: false,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}

module.exports = nextConfig
