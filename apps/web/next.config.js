/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/docs",
        destination: "/getting-started",
        permanent: true,
      },
      {
        source: "/docs/getting-started",
        destination: "/getting-started",
        permanent: true,
      },
      {
        source: "/docs/github-actions",
        destination: "/getting-started#github-actions",
        permanent: true,
      },
      {
        source: "/docs/github-app",
        destination: "/getting-started#github-app",
        permanent: true,
      },
      {
        source: "/docs/ci",
        destination: "/getting-started#github-actions",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
