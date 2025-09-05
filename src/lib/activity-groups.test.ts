import {
  groupActivitiesByDate,
  type ActivityDateGroup,
} from '@/lib/activity-groups'
import dayjs from 'dayjs'

// A Wednesday, so both week buckets sit wholly inside July and every other
// bucket is reachable: this week is the 20th to the 26th, last week the 13th to
// the 19th.
const WEDNESDAY = dayjs('2026-07-22T12:00:00')

const at = (time: string) => ({ time: new Date(time) })

const groupOf = (time: string): ActivityDateGroup =>
  groupActivitiesByDate([at(time)], WEDNESDAY, 1)[0].group

describe('groupActivitiesByDate', () => {
  it('files the same day under today', () => {
    expect(groupOf('2026-07-22T01:00:00')).toBe('today')
  })

  it('files the day before under yesterday', () => {
    expect(groupOf('2026-07-21T23:00:00')).toBe('yesterday')
  })

  it('separates the rest of this week from yesterday', () => {
    expect(groupOf('2026-07-20T09:00:00')).toBe('earlierThisWeek')
  })

  it('files the previous week under last week', () => {
    expect(groupOf('2026-07-15T09:00:00')).toBe('lastWeek')
  })

  it('files an earlier day of the same month separately', () => {
    expect(groupOf('2026-07-05T09:00:00')).toBe('earlierThisMonth')
  })

  it('files the previous month under last month', () => {
    expect(groupOf('2026-06-10T09:00:00')).toBe('lastMonth')
  })

  it('files an earlier month of the same year under earlier this year', () => {
    expect(groupOf('2026-02-15T09:00:00')).toBe('earlierThisYear')
  })

  it('files the previous year under last year', () => {
    expect(groupOf('2025-05-15T09:00:00')).toBe('lastYear')
  })

  it('files anything older under older', () => {
    expect(groupOf('2019-05-15T09:00:00')).toBe('older')
  })

  it('honours a Sunday week start', () => {
    expect(
      groupActivitiesByDate([at('2026-07-19T09:00:00')], WEDNESDAY, 0)[0].group,
    ).toBe('earlierThisWeek')
    expect(
      groupActivitiesByDate([at('2026-07-19T09:00:00')], WEDNESDAY, 1)[0].group,
    ).toBe('lastWeek')
  })

  it('returns the groups in calendar order and drops the empty ones', () => {
    const sections = groupActivitiesByDate(
      [at('2019-01-01T09:00:00'), at('2026-07-22T02:00:00')],
      WEDNESDAY,
      1,
    )
    expect(sections.map((section) => section.group)).toEqual(['today', 'older'])
  })
})
