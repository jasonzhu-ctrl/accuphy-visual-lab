// Share build config (scripts/build-share.mjs): one page, relative paths, one JS and one CSS file to inline.
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './',
  define: { 'import.meta.env.VITE_NO_GATE': JSON.stringify('1'), 'import.meta.env.VITE_DEVICES': JSON.stringify(process.env.VITE_DEVICES || ''), 'import.meta.env.VITE_SCENE': JSON.stringify(process.env.VITE_SCENE || '') }, // no sign-up gate (decision #71); VITE_DEVICES=PLM → Mini-only variant; VITE_SCENE=ice → the ice-fishing page (2026-10-16)
  build: { rollupOptions: { input: 'share/index.html' }, cssCodeSplit: false, chunkSizeWarningLimit: 4000 },
})
