/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // Apply these headers to all routes in your application
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'no-referrer-when-downgrade',
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), microphone=()',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://gowrapavan.netlify.app http://localhost:5173",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;