import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: [
      'packages/**/tests/**/*.test.ts',
      'packages/**/src/**/*.test.ts',
      'apps/**/src/**/*.test.ts',
      'tools/**/*.test.ts',
    ],
    environment: 'node',
    testTimeout: 300000,
    hookTimeout: 300000,
  },
});
