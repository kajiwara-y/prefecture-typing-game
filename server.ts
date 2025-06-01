// server.ts
import { serve } from '@hono/node-server'
import { existsSync, readFileSync } from 'node:fs'
import { join, extname } from 'node:path'
import { Hono } from 'hono'
import type { Env } from 'hono'

const app = new Hono()

// MIMEタイプヘルパー
const getMimeType = (filepath: string): string => {
  const ext = extname(filepath).toLowerCase()
  const mimeTypes: Record<string, string> = {
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.ico': 'image/x-icon',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml'
  }
  return mimeTypes[ext] || 'application/octet-stream'
}

// favicon.icoの配信
app.get('/favicon.ico', (c) => {
  const filePath = './dist/favicon.ico'
  if (existsSync(filePath)) {
    const file = readFileSync(filePath)
    return new Response(file, {
      headers: { 
        'Content-Type': getMimeType(filePath),
        'Cache-Control': 'public, max-age=3600'
      }
    })
  }
  return c.notFound()
})
// map-full.svgの配信
app.get('/map-full.svg', (c) => {
  const filePath = './dist/map-full.svg'
  if (existsSync(filePath)) {
    const file = readFileSync(filePath)
    return new Response(file, {
      headers: { 
        'Content-Type': getMimeType(filePath),
        'Cache-Control': 'public, max-age=3600'
      }
    })
  }
  return c.notFound()
})

// 静的ファイルの配信
app.get('/static/*', (c) => {
  const requestPath = c.req.path
  const filePath = join('./dist', requestPath)
  
  if (existsSync(filePath)) {
    const file = readFileSync(filePath)
    return new Response(file, {
      headers: { 
        'Content-Type': getMimeType(filePath),
        'Cache-Control': 'public, max-age=3600'
      }
    })
  }
  return c.notFound()
})

// honoxアプリのルートを追加
const honoxModule = await import('./dist/index.js') as { default: Hono<Env> }
const honoxApp = honoxModule.default
app.route('/', honoxApp)

const port = process.env.PORT || 8080
console.log(`🚀 Server is running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port: parseInt(port.toString())
})
