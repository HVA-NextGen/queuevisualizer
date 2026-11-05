import { recordServerError, shutdownTelemetry } from './telemetry.mjs'
import { access } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const { default: express } = await import('express')
const dist = fileURLToPath(new URL('./dist/', import.meta.url))
await access(`${dist}index.html`)
const port = Number(process.env.PORT ?? 3000)
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be an integer between 1 and 65535')
}

const app = express()
app.disable('x-powered-by')
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader('Content-Security-Policy', "default-src 'self'; style-src 'self'; img-src 'self' data:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'")
  next()
})
app.use(express.static(dist))
app.use((req, res) => {
  console.warn(`Not found: ${req.method} ${req.path}`)
  res.status(404).type('text').send('Sivua ei löytynyt.')
})
app.use((error, _req, res, _next) => {
  console.error('Static server error:', error)
  recordServerError(error)
  res.status(500).type('text').send('Palvelinvirhe.')
})

const server = app.listen(port, '0.0.0.0', () => console.info(`Dashboard listening on port ${port}`))
server.on('error', error => {
  console.error('Could not start dashboard server:', error)
  recordServerError(error)
  process.exitCode = 1
})

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, () => {
    server.close(async error => {
      if (error) {
        console.error('Server shutdown failed:', error)
        recordServerError(error)
        process.exitCode = 1
      }
      await shutdownTelemetry()
    })
  })
}
