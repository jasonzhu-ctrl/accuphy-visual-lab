// Share build config (scripts/build-share.mjs): one page, relative paths, one JS and one CSS file to inline.
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './',
  build: { rollupOptions: { input: 'share/index.html' }, cssCodeSplit: false, chunkSizeWarningLimit: 4000 },
})
