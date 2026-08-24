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
  experimental: {
    // Every public route here is dynamic (the shared layout reads the session
    // cookie), so by default Next only prefetches each route's shell down to
    // its loading.js and keeps NOTHING in the client cache (`dynamic` default
    // is 0s). That means re-visiting a tab, using back/forward, or hovering a
    // link a second time re-hits the server every time. Giving the client
    // cache a lifetime lets already-fetched RSC payloads be reused, so soft
    // navigations and back/forward feel instant.
    //
    // Trade-off: a viewer who already has a route warm in their tab won't see
    // an admin's brand-new score until the window below elapses (server caches
    // are still busted immediately via updateTag on every mutation). For a
    // public leaderboard a minute or two of client-side staleness is fine.
    staleTimes: {
      dynamic: 120,
      static: 300,
    },
    // Turns `import { Trophy } from 'lucide-react'` into a direct deep import
    // so bundling/compiling only pulls the icons actually used instead of
    // walking the whole icon barrel.
    optimizePackageImports: ['lucide-react'],
  },
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
