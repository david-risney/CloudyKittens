import { defineConfig } from 'vitest/config';

// Dev-only test runner config. The game itself ships as plain static files
// (index.html + src/**/*.js) and needs no build step to run in a browser.
export default defineConfig({
  test: {
    globals: true,
    environmentMatchGlobs: [
      ['tests/ui/**', 'jsdom'],
      ['tests/unit/**', 'node'],
    ],
    include: ['tests/**/*.test.js'],
  },
});
