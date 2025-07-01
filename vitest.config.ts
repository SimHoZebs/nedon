import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@/comp': resolve(__dirname, './lib/comp'),
      '@/util': resolve(__dirname, './lib/util'),
      '@/types': resolve(__dirname, './lib/types'),
    },
  },
})