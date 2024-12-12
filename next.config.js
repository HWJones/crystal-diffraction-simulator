/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/crystal-diffraction-simulator',
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
