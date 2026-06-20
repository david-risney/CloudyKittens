/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    target: 'es2022',
  },
  test: {
    globals: true,
    environmentMatchGlobs: [
      ['tests/ui/**', 'jsdom'],
      ['tests/unit/**', 'node'],
    ],
    include: ['tests/**/*.test.ts'],
  },
});
