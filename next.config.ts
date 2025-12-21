import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
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
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'wallpapercave.com',
        pathname: '/**',
      },
    ],
  },

  // ✅ moved out of experimental (IMPORTANT)
  serverExternalPackages: ['genkit', '@genkit-ai/googleai'],
};

export default nextConfig;
