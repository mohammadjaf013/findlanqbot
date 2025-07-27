/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://bot-api.finlandq.com',
  },
  async rewrites() {
    // در production، API calls به backend Vercel redirect می‌شن
    return [
      {
        source: '/api/:path*',
        destination: process.env.NEXT_PUBLIC_API_URL 
          ? `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`
          : 'https://bot-api.finlandq.com/api/:path*',
      },
    ]
  },
}

module.exports = nextConfig 