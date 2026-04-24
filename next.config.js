/** @type {import('next').NextConfig} */

// ---------------------------------------------------------------------------
// Security headers applied to every response
// ---------------------------------------------------------------------------
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      // Allow inline styles/scripts needed by Next.js and Tailwind
      "style-src 'self' 'unsafe-inline'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      // Supabase, Stripe, WalletConnect, RainbowKit, Base RPC
      'connect-src *',
      "img-src 'self' data: https:",
      "font-src 'self'",
      "frame-ancestors 'none'",
    ].join('; '),
  },
]

const nextConfig = {
  reactStrictMode: true,

  // ---------------------------------------------------------------------------
  // HTTP headers
  // ---------------------------------------------------------------------------
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },

  // ---------------------------------------------------------------------------
  // Webpack customisation
  // ---------------------------------------------------------------------------
  webpack: (config) => {
    // Suppress missing-module warnings from optional RainbowKit/WalletConnect
    // peer dependencies that are only needed in React Native environments.
    config.resolve.fallback = {
      ...config.resolve.fallback,
      '@react-native-async-storage/async-storage': false,
      'pino-pretty': false,
    }
    return config
  },

  // ---------------------------------------------------------------------------
  // Production optimisations
  // ---------------------------------------------------------------------------
  compress: true,

  // Minimise the information exposed in response headers
  poweredByHeader: false,
}

module.exports = nextConfig
