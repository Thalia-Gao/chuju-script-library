/**
 * Jscbc: Next.js 配置，允许导入 markdown 并设置必要 headers
 */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    mdxRs: false
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(md|markdown)$/i,
      type: 'asset/source'
    });
    return config;
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' }
        ]
      }
    ];
  }
};

module.exports = nextConfig; 