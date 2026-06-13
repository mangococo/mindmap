import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig({
  base: '/mindmap/',
  plugins: [
    react(),
    tailwindcss(),
    ...(process.env.BUILD_SINGLE ? [viteSingleFile()] : []),
  ],
})
