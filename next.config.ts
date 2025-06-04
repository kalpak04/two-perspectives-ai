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
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'miro.medium.com',
        port: '',
        pathname: '/**',
      },
    ],
    // Fix Windows path length issues in development, optimize for production
    unoptimized: process.env.NODE_ENV === 'development' && process.platform === 'win32',
    // Disable image cache only in Windows development
    minimumCacheTTL: process.env.NODE_ENV === 'development' && process.platform === 'win32' ? 0 : 60,
  },
  // Experimental features to help with Windows compatibility
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  // Optimize for Vercel deployment
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
