/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // إضافة إعادة التوجيه لدعم تقنية History API
  async rewrites() {
    return [
      {
        source: '/:path*',
        destination: '/',
      }
    ];
  }
};

export default nextConfig;
