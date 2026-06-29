import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { cloudflaredTunnel } from './vite-plugin-tunnel'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), cloudflaredTunnel()],
  server: {
    port: 3000,
    allowedHosts: ['.trycloudflare.com'],
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('proxyReq', (_proxyReq, req) => {
            const time = new Date().toLocaleTimeString('pt-BR')
            process.stdout.write(`[web] ${time} ${req.method} ${req.url} → api\n`)
          })
          proxy.on('proxyRes', (proxyRes, req) => {
            const time = new Date().toLocaleTimeString('pt-BR')
            const s = proxyRes.statusCode ?? 0
            const color = s >= 500 ? '\x1b[31m' : s >= 400 ? '\x1b[33m' : '\x1b[32m'
            process.stdout.write(`[web] ${time} ${req.method} ${req.url} ← ${color}${s}\x1b[0m\n`)
          })
          proxy.on('error', (err, req) => {
            const time = new Date().toLocaleTimeString('pt-BR')
            process.stdout.write(
              `[web] ${time} \x1b[31mPROXY ERROR\x1b[0m ${req.method} ${req.url}: ${err.message}\n`,
            )
          })
        },
      },
    },
  },
})
