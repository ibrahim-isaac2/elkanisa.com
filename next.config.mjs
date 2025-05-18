/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // إضافة إعادة التوجيه لدعم تقنية History API وروابط الترانيم
  async rewrites() {
    return [
      {
        source: '/:path*',
        destination: '/',
      },
      {
        source: '/hymns/:slug*',
        destination: '/',
      }
    ];
  }
};

export default nextConfig;
