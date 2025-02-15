import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "./",
  build: {
    outDir: "dist",
  },
  server:{
    proxy:{
      '/api':{
        target:'http://api.play-book.xyz:7000/',
        changeOrigin: true,
        secure:false
      }
    }
  }
})
