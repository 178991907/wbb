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

    // 添加对 cloudflare:sockets 的处理
    config.module.rules.push({
      test: /node_modules\/pg-cloudflare/,
      use: 'null-loader',
    });

    return config;
  },
  serverExternalPackages: ['pg', 'pg-native', 'pg-cloudflare'],
};

module.exports = nextConfig; 