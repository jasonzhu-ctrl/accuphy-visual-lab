// Share build config (scripts/build-share.mjs): one page, relative paths, one JS and one CSS file to inline.
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './',
  define: { 'import.meta.env.VITE_NO_GATE': JSON.stringify('1') }, // no sign-up gate in the friends test build (decision #71)
  build: { rollupOptions: { input: 'share/index.html' }, cssCodeSplit: false, chunkSizeWarningLimit: 4000 },
})
