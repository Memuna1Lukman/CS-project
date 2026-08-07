import type { NextConfig } from "next";

// React dev mode needs eval() for hot-reload/error-overlay stack traces;
// production React never calls eval(), so only dev gets the relaxed script-src.
const scriptSrc = process.env.NODE_ENV === 'development' ? "'self' 'unsafe-inline' 'unsafe-eval'" : "'self' 'unsafe-inline'";

const nextConfig: NextConfig = {
  async headers() {
    return [{
      source: '/:path*',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
        { key: 'Content-Security-Policy', value: `default-src 'self'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; script-src ${scriptSrc}; connect-src 'self'; font-src 'self' data:; object-src 'none'` },
      ],
    }];
  },
};

export default nextConfig;
