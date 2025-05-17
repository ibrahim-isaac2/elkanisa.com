/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // إضافة إعادة التوجيه لدعم تقنية History API
  async rewrites() {
    return [
      {
        source: '/:path*',
        destination: '/',
        has: [
          {
            type: 'header',
            key: 'x-nextjs-data',
            value: { notPresent: true }
          }
        ]
      }
    ];
  }
};

export default nextConfig;
