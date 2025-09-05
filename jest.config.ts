import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({ dir: './' })

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  // Jest's default testMatch would otherwise collect the Playwright specs in
  // e2e/, which only run under `playwright test`.
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/e2e/'],
}

// next/jest owns transformIgnorePatterns, so the ESM-only packages the tRPC
// router pulls in have to be spliced into its allow-list afterwards rather than
// set in the config above.
const withNextJest = createJestConfig(config)

export default async (): Promise<Config> => {
  const resolved = await withNextJest()
  return {
    ...resolved,
    transformIgnorePatterns: (resolved.transformIgnorePatterns ?? []).map(
      (pattern) => pattern.replace('(?!(geist|', '(?!(superjson|nanoid|copy-anything|is-what|geist|'),
    ),
  }
}
