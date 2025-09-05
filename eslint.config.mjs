import nextVitals from 'eslint-config-next/core-web-vitals'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  ...nextVitals,
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'storybook-static/**',
    'playwright-report/**',
    'test-results/**',
    'next-env.d.ts',
    // Prisma 7 emits the generated client here; it ships its own
    // eslint-disable banners and should not be linted as project source.
    'src/generated/**',
  ]),
])
