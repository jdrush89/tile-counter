import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import { copyFileSync, mkdirSync } from 'node:fs'

import { resolve } from 'path'

const projectRoot = process.env.PROJECT_ROOT || import.meta.dirname
const outputDirectory = resolve(projectRoot, 'dist')

// https://vite.dev/config/
export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'daily-challenge-page',
      closeBundle() {
        const dailyDirectory = resolve(outputDirectory, 'daily')
        mkdirSync(dailyDirectory, { recursive: true })
        copyFileSync(resolve(outputDirectory, 'index.html'), resolve(dailyDirectory, 'index.html'))
      },
    },
  ],
  resolve: {
    alias: {
      '@': resolve(projectRoot, 'src')
    }
  },
});
