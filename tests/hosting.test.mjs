import { spawn, spawnSync } from 'node:child_process'
import { once } from 'node:events'
import { createServer } from 'node:net'
import { test } from 'node:test'
import assert from 'node:assert/strict'

test('production server honors PORT, serves built assets, and preserves 404s', async t => {
  const socket = createServer()
  socket.listen(0, '127.0.0.1')
  await once(socket, 'listening')
  const port = socket.address().port
  await new Promise(resolve => socket.close(resolve))
  const child = spawn(process.execPath, ['--import', '@azure/monitor-opentelemetry/loader', 'server.mjs'], {
    env: { ...process.env, APPLICATIONINSIGHTS_CONNECTION_STRING: '', PORT: String(port) },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  t.after(async () => {
    if (child.exitCode === null) {
      child.kill()
      await once(child, 'exit')
    }
  })
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Server startup timed out')), 10_000)
    let errors = ''
    child.stderr.on('data', chunk => { errors += chunk })
    child.once('error', error => { clearTimeout(timeout); reject(error) })
    child.once('exit', code => { clearTimeout(timeout); reject(new Error(`Server exited ${code}: ${errors}`)) })
    child.stdout.on('data', chunk => {
      if (String(chunk).includes(`listening on port ${port}`)) {
        clearTimeout(timeout)
        resolve()
      }
    })
  })
  const base = `http://127.0.0.1:${port}`
  const root = await fetch(base)
  assert.equal(root.status, 200)
  const html = await root.text()
  assert.match(html, /lang="fi"/)
  assert.match(html, /Kaitajärven keskussairaala/)
  assert.ok(root.headers.get('content-security-policy'))
  const assets = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)]
  assert.ok(assets.length >= 2)
  for (const [, path] of assets) {
    const response = await fetch(`${base}${path}`)
    assert.equal(response.status, 200)
    assert.doesNotMatch(response.headers.get('content-type'), /text\/html/)
  }
  for (const path of ['/assets/missing.js', '/unknown-page']) {
    const response = await fetch(`${base}${path}`)
    assert.equal(response.status, 404)
    assert.doesNotMatch(await response.text(), /<html/)
  }
})

test('invalid PORT fails explicitly', () => {
  const result = spawnSync(process.execPath, ['--import', '@azure/monitor-opentelemetry/loader', 'server.mjs'], {
    env: { ...process.env, APPLICATIONINSIGHTS_CONNECTION_STRING: '', PORT: 'invalid' }, encoding: 'utf8',
  })
  assert.notEqual(result.status, 0)
  assert.match(result.stderr, /PORT must be an integer/)
})
