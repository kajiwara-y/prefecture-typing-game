import build from '@hono/vite-build/cloudflare-workers'
import bunBuild from '@hono/vite-build/bun'
import adapter from '@hono/vite-dev-server/cloudflare'
import tailwindcss from '@tailwindcss/vite'
import honox from 'honox/vite'
import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => {
  if (mode === 'client') {
    return {
      build: {
        rollupOptions: {
          input: {
            client: "./app/client.ts",
            style: "./app/style.css",
          },
          output: {
            dir: "./dist",
            // assetsパスに統一
            entryFileNames: "assets/[name].js",
            assetFileNames: "assets/[name].[ext]",
          },
        },
        copyPublicDir: false,
        minify: true,
      },
      plugins: [tailwindcss()]
    }
  } else if (mode === 'bun') {
    return {
      ssr: {
        external: ['react', 'react-dom']
      },
      plugins: [
        honox(),
        tailwindcss(),
        bunBuild({
          minify: false
        })
      ]
    }
  } else {
    // Cloudflare Workers用設定
    return {
      ssr: {
        external: ['react', 'react-dom']
      },
      plugins: [
        honox({
          devServer: { adapter },
          client: { input: ['./app/style.css'] }
        }),
        tailwindcss(),
        build()
      ]
    }
  }
})
