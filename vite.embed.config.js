// Embed build config (scripts/build-embed.mjs, decision #142): share/embed.jsx as one ES module exporting mount(),
// one CSS file, every imported image inlined. Library mode leaves process.env alone, so React's NODE_ENV is set here.
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './',
  define: { 'process.env.NODE_ENV': JSON.stringify('production'), 'import.meta.env.VITE_NO_GATE': JSON.stringify('1'), 'import.meta.env.VITE_DEVICES': JSON.stringify(''), 'import.meta.env.VITE_SCENE': JSON.stringify('') }, // no sign-up gate from the Lab (#139: the Klaviyo chat decides the funnel)
  build: { lib: { entry: 'share/embed.jsx', formats: ['es'], fileName: 'lab-app', cssFileName: 'lab-app' }, cssCodeSplit: false, chunkSizeWarningLimit: 4000, assetsInlineLimit: 10_000_000 },
})
