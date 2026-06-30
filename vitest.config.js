import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['**/*.spec.js', '**/*.test.js'],
    exclude: ['node_modules', 'dist'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      all: true,
      include: ['src/**/*.js'],
      exclude: [
        'src/**/*.spec.js',
        'src/**/*.test.js',
        'src/**/__tests__/**'
      ],
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80
    }
  }
});
