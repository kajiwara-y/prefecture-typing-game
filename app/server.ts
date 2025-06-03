import { showRoutes } from 'hono/dev'
import { createApp } from 'honox/server'
import { cache } from 'hono/cache'

const app = createApp()

// SVGファイルのキャッシュミドルウェア
app.get('/map-full.svg', cache({
  cacheName: 'svg-cache',
  cacheControl: 'public, max-age=31536000, immutable',
}))

showRoutes(app)

export default app
