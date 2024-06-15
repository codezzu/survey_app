/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NODE_ENV === 'development' 
          ? 'http://localhost:4000/:path*' 
          : 'https://anket-sitesi.vercel.app/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
