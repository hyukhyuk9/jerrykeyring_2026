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
      {
        source: '/player',
        destination: '/app/player.html',
      },
      {
        source: '/admin',
        destination: '/app/admin.html',
      },
      {
        source: '/sample',
        destination: '/app/sample_index.html',
      },
      {
        source: '/sample/player',
        destination: '/app/player.html?id=sample',
      },
    ];
  },
};

module.exports = nextConfig;

import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
