/** @type {import('next').NextConfig} */
const nextConfig = {
  // Externalize packages that should not be bundled
  serverExternalPackages: ['pdf-lib', 'mysql2'],
};

export default nextConfig;
