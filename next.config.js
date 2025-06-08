/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        child_process: false,
        'pg-native': false,
        'pg-cloudflare': false,
        'pg-connection-string': false,
      };
    }
    return config;
  },
  serverExternalPackages: ['pg', 'pg-native', 'pg-cloudflare'],
};

module.exports = nextConfig; 