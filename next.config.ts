import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    output: 'export',
    eslint: {
        ignoreDuringBuilds: true, // 忽略 eslint 检查
      },
      typescript: {
        ignoreBuildErrors: true, // 忽略 TypeScript 检查
      }
}

export default nextConfig
