import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    globals: true,
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'test/',
        '**/*.d.ts',
        '.next/',
        'dist/',
        'cypress/',
        '**/*.config.*',
        '**/coverage/**'
      ]
    },
    outputFile: {
      junit: './test-results.xml'
    },
    reporters: process.env.CI ? ['verbose', 'junit'] : ['verbose']
  },
  resolve: {
    alias: {
      '@/comp': resolve(__dirname, './lib/comp'),
      '@/util': resolve(__dirname, './lib/util'),
      '@/types': resolve(__dirname, './lib/types'),
    },
  },
})