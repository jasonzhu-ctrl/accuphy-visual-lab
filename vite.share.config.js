// Share build config (scripts/build-share.mjs): one page, relative paths, one JS and one CSS file to inline.
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './',
  define: { 'import.meta.env.VITE_NO_GATE': JSON.stringify('1'), 'import.meta.env.VITE_DEVICES': JSON.stringify(process.env.VITE_DEVICES || ''), 'import.meta.env.VITE_SCENE': JSON.stringify(process.env.VITE_SCENE || ''), 'import.meta.env.VITE_LAB': JSON.stringify(process.env.VITE_LAB || ''), 'import.meta.env.VITE_ICE_URL': JSON.stringify(process.env.VITE_ICE_URL || 'https://jasonzhu-ctrl.github.io/accuphy-lab-test/ice/') }, // no sign-up gate (decision #71); VITE_DEVICES=PLM → Mini-only variant; VITE_SCENE=ice → the ice-fishing page (2026-10-16)
  build: { rollupOptions: { input: 'share/index.html' }, cssCodeSplit: false, chunkSizeWarningLimit: 4000, assetsInlineLimit: (file) => !/[\\/]home[\\/][^\\/]+\.(?:jpe?g|png|webp)$/.test(file) }, // imported images become data URIs (one file), except the app Home thumbnails: files beside the page, fetched only when the Home shows (load plan B, 2026-10-27)
})
