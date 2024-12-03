import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/FlatEarthProject/',  // replace with your repository name
  build: {
    outDir: 'dist',  // Ensure the build outputs to 'dist' folder
  },
  plugins: [react()],
})
