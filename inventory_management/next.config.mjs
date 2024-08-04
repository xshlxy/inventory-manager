/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        GOOGLE_CLOUD_API_KEY: process.env.GOOGLE_CLOUD_API_KEY,
      },
};

export default nextConfig;
