/**
 * @jest-environment node
 */
import { appRouter } from '@/trpc/routers/_app'

describe('appRouter', () => {
  it('registers every ported procedure', () => {
    expect(Object.keys(appRouter._def.procedures).sort()).toEqual([
      'categories.list',
      'groups.activities.list',
      'groups.balances.forUser',
      'groups.balances.list',
      'groups.create',
      'groups.expenses.create',
      'groups.expenses.delete',
      'groups.expenses.get',
      'groups.expenses.list',
      'groups.expenses.update',
      'groups.get',
      'groups.getDetails',
      'groups.list',
      'groups.stats.categoryExpenses',
      'groups.stats.monthExpenses',
      'groups.stats.overview',
      'groups.update',
    ])
  })
})
