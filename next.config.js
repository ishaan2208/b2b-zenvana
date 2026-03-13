/** @type {import('next').NextConfig} */
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000'
let backendHost = 'localhost'
try {
  backendHost = new URL(backendUrl).hostname
} catch {
  backendHost = 'localhost'
}

const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: backendHost },
      { protocol: 'http', hostname: backendHost },
    ],
  },
}

module.exports = nextConfig
