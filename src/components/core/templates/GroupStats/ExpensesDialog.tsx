'use client'

import { Money } from '@/components/core/atoms/Money'
import type { Locale } from '@/i18n/locales'
import type { Currency } from '@/lib/currency'
import { formatDateOnly } from '@/lib/utils'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import type { ReactNode } from 'react'

type Expense = {
  id: string
  title: string
  amount: number
  expenseDate: Date
}

type ExpensesDialogProps = {
  trigger: ReactNode
  title: string
  description: string
  emptyLabel: string
  expenses: Expense[]
  currency: Currency
  locale: Locale
  onOpenChange: (open: boolean) => void
}

export function ExpensesDialog({
  trigger,
  title,
  description,
  emptyLabel,
  expenses,
  currency,
  locale,
  onOpenChange,
}: ExpensesDialogProps) {
  return (
    <DialogPrimitive.Root onOpenChange={onOpenChange}>
      <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-foreground/40" />
        <DialogPrimitive.Content className="fixed top-1/2 left-1/2 z-50 max-h-[80dvh] w-[min(32rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-card border border-border bg-card p-5 shadow-sheet">
          <DialogPrimitive.Title className="text-headline-md text-foreground">
            {title}
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="mt-1 text-body-md text-muted-foreground">
            {description}
          </DialogPrimitive.Description>

          {expenses.length === 0 ? (
            <p className="mt-4 text-body-md text-muted-foreground">
              {emptyLabel}
            </p>
          ) : (
            <ul className="mt-4 flex flex-col">
              {expenses.map((expense) => (
                <li
                  key={expense.id}
                  className="flex items-baseline justify-between gap-3 border-b border-border py-2 last:border-b-0"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-body-lg text-foreground">
                      {expense.title}
                    </span>
                    <span className="block text-body-sm text-muted-foreground">
                      {formatDateOnly(expense.expenseDate, locale, {
                        dateStyle: 'medium',
                      })}
                    </span>
                  </span>
                  <Money
                    amount={expense.amount}
                    currency={currency}
                    locale={locale}
                    className="text-numeric-table-md"
                  />
                </li>
              ))}
            </ul>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
