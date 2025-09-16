import { groupIdFromUrl } from './group-url'

describe('groupIdFromUrl', () => {
  it.each([
    ['https://chiatien.app/groups/abc123/expenses', 'abc123'],
    ['https://chiatien.app/groups/abc123', 'abc123'],
    ['/groups/abc123/balances', 'abc123'],
    ['abc123', 'abc123'],
    ['  abc123  ', 'abc123'],
  ])('reads %s as %s', (input, expected) => {
    expect(groupIdFromUrl(input)).toBe(expected)
  })

  it('stops at a query string or a fragment', () => {
    expect(groupIdFromUrl('/groups/abc123?ref=share')).toBe('abc123')
    expect(groupIdFromUrl('/groups/abc123#top')).toBe('abc123')
  })

  it.each(['', '   ', 'https://example.com/', 'not a link'])(
    'rejects %p',
    (input) => {
      expect(groupIdFromUrl(input)).toBeNull()
    },
  )
})
