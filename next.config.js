/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      "firebase-admin",
      "@google-cloud/firestore",
    ],
  },
};

module.exports = nextConfig;
