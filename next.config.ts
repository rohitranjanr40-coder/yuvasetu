
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/main-stream',
        permanent: true,
      },
      {
        source: '/shorts',
        destination: '/main-stream',
        permanent: true,
      },
      {
        source: '/children/reels',
        destination: '/children',
        permanent: true,
      },
      {
        source: '/educational/reels',
        destination: '/educational',
        permanent: true,
      },
      {
        source: '/farmer/reels',
        destination: '/farmer',
        permanent: true,
      },
      {
        source: '/membership',
        destination: '/main-stream/membership',
        permanent: true,
      }
    ]
  },
};

export default nextConfig;
