/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async redirects() {
    return [
      {
        source: '/',
        destination: '/questions',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
