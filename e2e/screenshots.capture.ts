import { expect, test, type Page } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import * as z from 'zod'

const OUT = join(process.cwd(), 'docs', 'screenshots')

/** The spec's three review widths. */
const WIDTHS = [390, 768, 1440]

const LOCALES = ['vi', 'en-US'] as const

type Screen = { name: string; path: (groupId: string) => string }

const SCREENS: Screen[] = [
  { name: 'group-list', path: () => '/groups' },
  { name: 'group-form', path: () => '/groups/create' },
  { name: 'expenses', path: (id) => `/groups/${id}/expenses` },
  { name: 'expense-form', path: (id) => `/groups/${id}/expenses/create` },
  { name: 'balances', path: (id) => `/groups/${id}/balances` },
  { name: 'stats', path: (id) => `/groups/${id}/stats` },
  { name: 'activity', path: (id) => `/groups/${id}/activity` },
  { name: 'information', path: (id) => `/groups/${id}/information` },
  { name: 'settings', path: () => '/settings' },
]

async function seed(page: Page): Promise<string> {
  await page.goto('/groups/create')
  await expect(
    page.getByRole('button', { name: /Create|Tạo/ }).first(),
  ).toBeVisible({ timeout: 60_000 })

  const create = async (input: unknown, path: string) => {
    const result = await page.request.post(`/api/trpc/${path}?batch=1`, {
      data: { '0': { json: input } },
    })
    expect(result.ok()).toBe(true)
    return result.json()
  }

  const envelope = <T extends z.ZodTypeAny>(json: T) =>
    z.tuple([z.object({ result: z.object({ data: z.object({ json }) }) })])

  const created = envelope(z.object({ groupId: z.string().min(1) })).parse(
    await create(
      {
        groupFormValues: {
          name: 'Chuyến đi Đà Nẵng',
          information: 'Chi phí chuyến đi tháng 3.',
          currency: '₫',
          currencyCode: 'VND',
          participants: [
            { name: 'Linh' },
            { name: 'Minh' },
            { name: 'Trâm' },
            { name: 'Đức' },
          ],
        },
      },
      'groups.create',
    ),
  )
  const groupId = created[0].result.data.json.groupId

  const detail = envelope(
    z.object({
      group: z.object({
        participants: z.array(z.object({ id: z.string(), name: z.string() })),
      }),
    }),
  ).parse(
    await (
      await page.request.get(
        `/api/trpc/groups.get?batch=1&input=${encodeURIComponent(
          JSON.stringify({ '0': { json: { groupId } } }),
        )}`,
      )
    ).json(),
  )
  const participants = detail[0].result.data.json.group.participants
  const idOf = (name: string) =>
    participants.find((participant) => participant.name === name)?.id ?? ''

  // Category ids come from prisma/migrations/*_reduce_categories: 27 Transport,
  // 11 Accommodation, 7 Food, 2 Leisure.
  const expenses = [
    { title: 'Vé máy bay', amount: 6_400_000, paidBy: 'Linh', category: 27 },
    { title: 'Khách sạn', amount: 3_200_000, paidBy: 'Minh', category: 11 },
    {
      title: 'Bữa tối hải sản',
      amount: 1_850_000,
      paidBy: 'Trâm',
      category: 7,
    },
    { title: 'Cà phê', amount: 240_000, paidBy: 'Đức', category: 7 },
    { title: 'Taxi sân bay', amount: 450_000, paidBy: 'Linh', category: 27 },
  ]

  for (const expense of expenses) {
    await create(
      {
        groupId,
        expenseFormValues: {
          expenseDate: new Date().toISOString(),
          title: expense.title,
          category: expense.category,
          amount: expense.amount,
          originalCurrency: '',
          paidBy: idOf(expense.paidBy),
          paidFor: participants.map((participant) => ({
            participant: participant.id,
            shares: 1,
          })),
          splitMode: 'EVENLY',
          saveDefaultSplittingOptions: false,
          isReimbursement: false,
          documents: [],
          notes: '',
          recurrenceRule: 'NONE',
        },
        participantId: idOf(expense.paidBy),
      },
      'groups.expenses.create',
    )
  }

  await page.evaluate(
    ([id, name, participantId]) => {
      window.localStorage.setItem(
        'chiatien.recent-groups',
        JSON.stringify({
          state: {
            groups: [{ id, name }],
            starredIds: [],
            archivedIds: [],
            hydrated: false,
          },
          version: 0,
        }),
      )
      window.localStorage.setItem(
        'chiatien.active-users',
        JSON.stringify({
          state: { activeUsers: { [id]: participantId }, suppressPrompt: true },
          version: 0,
        }),
      )
    },
    [groupId, 'Chuyến đi Đà Nẵng', idOf('Linh')] as const,
  )

  return groupId
}

test('captures the screenshots in docs/screenshots', async ({ page }) => {
  await mkdir(OUT, { recursive: true })
  const groupId = await seed(page)

  for (const locale of LOCALES) {
    await page.context().clearCookies()
    await page
      .context()
      .addCookies([
        { name: 'NEXT_LOCALE', value: locale, url: 'http://localhost:3000' },
      ])

    // Vietnamese is the product's own language, so it is reviewed at every
    // width; English only needs one to prove the fallback renders.
    const widths = locale === 'vi' ? WIDTHS : [1440]

    for (const width of widths) {
      await page.setViewportSize({ width, height: 900 })
      for (const screen of SCREENS) {
        await page.goto(screen.path(groupId))
        await page.waitForLoadState('networkidle')
        await page.screenshot({
          path: join(OUT, `${screen.name}-${locale}-${width}.png`),
          fullPage: true,
        })
      }
    }
  }
})
