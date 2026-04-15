/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['blob.vercel-storage.com'],
  },
  // Netlify legacy URL support: /nfc/21.html → /nfc/21
  async rewrites() {
    return [
      {
        source: '/nfc/:id.html',
        destination: '/nfc/:id',
      },
    ];
  },
};

module.exports = nextConfig;
