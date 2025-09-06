import { avatarInitials } from './avatar'

describe('avatarInitials', () => {
  it('takes the first letter', () => {
    expect(avatarInitials('Minh', ['Minh', 'Lan'])).toBe('M')
  })

  it('adds a second letter only to break a tie', () => {
    const group = ['Tuấn', 'Thảo']
    expect(avatarInitials('Tuấn', group)).toBe('T')
    expect(avatarInitials('Thảo', group)).toBe('TH')
  })

  it('gives the short form to whoever comes first in the list', () => {
    const group = ['Thảo', 'Tuấn']
    expect(avatarInitials('Thảo', group)).toBe('T')
    expect(avatarInitials('Tuấn', group)).toBe('TU')
  })

  it('keeps the whole grapheme when a diacritic follows', () => {
    expect(avatarInitials('Đức', ['Đức', 'Dũng'])).toBe('Đ')
  })

  it('takes the first letter when no peers are given', () => {
    expect(avatarInitials('Hương')).toBe('H')
  })

  it('falls back to a placeholder for an empty name', () => {
    expect(avatarInitials('', [''])).toBe('?')
  })
})
