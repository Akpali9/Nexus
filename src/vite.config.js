import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
 plugins: [react({
    include: "**/*.{js,jsx}"  // ensure .js files are processed with JSX
  })],
})
