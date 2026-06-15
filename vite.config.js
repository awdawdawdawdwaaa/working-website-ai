import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  assetsInclude: ['**/*.glb', '**/*.gltf', '**/*.fbx'],
  build: {
    rollupOptions: {
      input: {
        index: 'index.html',
      },
      output: {
        manualChunks: {
          three: ['three'],
          r3f: ['@react-three/fiber', '@react-three/drei'],
        }
      }
    }
  }
})
