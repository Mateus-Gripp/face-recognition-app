import { spawn, type ChildProcess } from 'node:child_process'
import qrcode from 'qrcode-terminal'
import type { Plugin } from 'vite'

export function cloudflaredTunnel(): Plugin {
  if (process.env.TUNNEL === 'false') {
    return { name: 'cloudflared-tunnel', apply: 'serve' }
  }

  let proc: ChildProcess | null = null

  const cleanup = () => {
    if (proc && !proc.killed) {
      proc.kill('SIGTERM')
      proc = null
    }
  }

  return {
    name: 'cloudflared-tunnel',
    apply: 'serve',
    configureServer(server) {
      server.httpServer?.once('listening', () => {
        const addr = server.httpServer?.address()
        if (!addr || typeof addr === 'string') return
        const port = addr.port

        proc = spawn(
          'cloudflared',
          [
            'tunnel',
            '--url',
            `http://localhost:${port}`,
            '--no-autoupdate',
            '--protocol',
            'http2',
          ],
          { stdio: ['ignore', 'pipe', 'pipe'] },
        )

        let printed = false
        const onData = (chunk: Buffer) => {
          if (printed) return
          const match = chunk.toString().match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/)
          if (!match) return
          printed = true
          const url = match[0]
          const bar = '─'.repeat(60)
          process.stdout.write(
            `\n\x1b[36m${bar}\x1b[0m\n` +
              `  \x1b[1m\x1b[36m🌐 Tunnel:\x1b[0m  \x1b[1m\x1b[32m${url}\x1b[0m\n` +
              `\x1b[36m${bar}\x1b[0m\n\n`,
          )
          qrcode.generate(url, { small: true }, (qr) => {
            process.stdout.write(`${qr}\n`)
          })
        }
        proc.stdout?.on('data', onData)
        proc.stderr?.on('data', onData)

        proc.on('error', (err: NodeJS.ErrnoException) => {
          if (err.code === 'ENOENT') {
            process.stdout.write(
              '\n\x1b[33m⚠️  cloudflared não encontrado no PATH; tunnel desabilitado.\x1b[0m\n\n',
            )
          } else {
            process.stdout.write(`\n\x1b[33m⚠️  cloudflared: ${err.message}\x1b[0m\n\n`)
          }
        })
      })

      server.httpServer?.once('close', cleanup)
      process.once('SIGINT', cleanup)
      process.once('SIGTERM', cleanup)
      process.once('exit', cleanup)
    },
  }
}
