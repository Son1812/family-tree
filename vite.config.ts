import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'
import fs from 'node:fs/promises'
import path from 'node:path'

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    {
      name: 'vite-plugin-local-json-save',
      configureServer(server) {
        const handler = (req: any, res: any) => {
          if (req.method === 'POST') {
            let body = ''
            req.on('data', (chunk: any) => {
              body += chunk
            })
            req.on('end', async () => {
              try {
                const targetFile = path.resolve(process.cwd(), 'public/data/family-tree.json')
                await fs.mkdir(path.dirname(targetFile), { recursive: true })
                const parsed = JSON.parse(body)
                await fs.writeFile(targetFile, JSON.stringify(parsed, null, 2), 'utf-8')
                res.writeHead(200, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify({ success: true, path: 'public/data/family-tree.json' }))
              } catch (err: any) {
                res.writeHead(500, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify({ success: false, error: err.message }))
              }
            })
          } else {
            res.writeHead(405)
            res.end()
          }
        }
        server.middlewares.use('/api/save-tree-json', handler)
      },
      configurePreviewServer(server) {
        const handler = (req: any, res: any) => {
          if (req.method === 'POST') {
            let body = ''
            req.on('data', (chunk: any) => {
              body += chunk
            })
            req.on('end', async () => {
              try {
                const targetFile = path.resolve(process.cwd(), 'public/data/family-tree.json')
                await fs.mkdir(path.dirname(targetFile), { recursive: true })
                const parsed = JSON.parse(body)
                await fs.writeFile(targetFile, JSON.stringify(parsed, null, 2), 'utf-8')
                res.writeHead(200, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify({ success: true, path: 'public/data/family-tree.json' }))
              } catch (err: any) {
                res.writeHead(500, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify({ success: false, error: err.message }))
              }
            })
          } else {
            res.writeHead(405)
            res.end()
          }
        }
        server.middlewares.use('/api/save-tree-json', handler)
      },
    },
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 3000,
    host: true,
  },
})
