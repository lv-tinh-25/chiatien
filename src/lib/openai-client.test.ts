/**
 * @jest-environment node
 */

/**
 * Next bundles every server action a route can reach into one chunk, so these
 * two modules are evaluated whenever any action on an expense screen runs —
 * including `setUserLocale` from the header, which has nothing to do with AI.
 * They must therefore survive being imported on a deployment that has left the
 * feature off, which is every deployment with no key.
 *
 * The real SDK is used rather than a mock: its constructor throwing on a
 * missing key is the behaviour under test.
 */
jest.mock('./env', () => ({
  env: {
    OPENAI_API_KEY: undefined,
    OPENAI_BASE_URL: undefined,
    OPENAI_MODEL_CATEGORY_EXTRACT: 'test-model',
    OPENAI_MODEL_RECEIPT_EXTRACT: 'test-model',
  },
}))

describe('the AI server actions with no API key', () => {
  it('imports category extraction without constructing a client', async () => {
    await expect(import('./category-extract')).resolves.toBeDefined()
  })

  it('imports receipt extraction without constructing a client', async () => {
    await expect(import('./receipt-extract')).resolves.toBeDefined()
  })
})
