import { defineConfig } from 'vite'
import fs from 'node:fs'
import path from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


// dev-only: POST /__snap?name=<file> with a PNG data URL body → reference/engine-compare/<file>.png
// (used by window.__sonarSnap() to save the engine's sonar picture for side-by-side checks)
function snapSaver() {
  return {
    name: 'snap-saver',
    configureServer(server) {
      server.middlewares.use('/__snap', (req, res) => {
        if (req.method !== 'POST') { res.statusCode = 405; return res.end() }
        const name = (new URL(req.url, 'http://x').searchParams.get('name') || 'snap').replace(/[^\w.-]/g, '_')
        let body = ''
        req.on('data', (c) => { body += c })
        req.on('end', () => {
          const dir = path.resolve('reference/engine-compare'); fs.mkdirSync(dir, { recursive: true })
          const file = path.join(dir, name + '.png')
          fs.writeFileSync(file, Buffer.from(body.split(',')[1] || '', 'base64'))
          res.setHeader('content-type', 'text/plain'); res.end(file)
        })
      })
    },
  }
}

export default defineConfig({
  plugins: [snapSaver(), react(), tailwindcss()],
})
