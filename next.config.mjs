/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  transpilePackages: ["mui-one-time-password-input"],
  basePath: "/bsoft",
  images: {
    domains: ["i.pravatar.cc", "picsum.photos", "192.168.1.126", "192.168.1.130"],
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/login",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
