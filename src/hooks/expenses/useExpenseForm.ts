'use client'

import { useCurrentGroup } from '@/hooks/groups/useCurrentGroup'
import { useExpenseCurrencyConversion } from '@/hooks/expenses/useExpenseCurrencyConversion'
import { useExpenseSplitBalancing } from '@/hooks/expenses/useExpenseSplitBalancing'
import { getCurrency } from '@/lib/currency'
import { reconcileSplittingOptions } from '@/lib/expense-defaults'
import { toExpensePayload } from '@/lib/expense-payload'
import {
  expenseFormSchema,
  type ExpenseFormInput,
  type ExpenseFormValues,
} from '@/lib/schemas'
import { amountAsDecimal } from '@/lib/utils'
import { useSplittingOptionsStore } from '@/stores/useSplittingOptionsStore'
import { trpc } from '@/trpc/client'
import type { AppRouterOutput } from '@/trpc/routers/_app'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useForm, useWatch } from 'react-hook-form'

type Expense = AppRouterOutput['groups']['expenses']['get']['expense']

export function useExpenseForm(expense?: Expense) {
  const { groupId, group, locale, currency, activeUserId } = useCurrentGroup()
  const router = useRouter()
  const utils = trpc.useUtils()
  const remember = useSplittingOptionsStore((state) => state.remember)
  const rememberedOptions = useSplittingOptionsStore(
    (state) => state.byGroup[groupId] ?? null,
  )

  const groupCurrency = currency ?? getCurrency('', locale, 'Custom')
  const isCreate = expense === undefined

  const createExpense = trpc.groups.expenses.create.useMutation()
  const updateExpense = trpc.groups.expenses.update.useMutation()
  const deleteExpense = trpc.groups.expenses.delete.useMutation()

  const participants = group?.participants ?? []
  const remembered = reconcileSplittingOptions(rememberedOptions, participants)

  const defaults: ExpenseFormInput = expense
    ? {
        expenseDate: expense.expenseDate,
        title: expense.title,
        category: expense.categoryId,
        amount: amountAsDecimal(expense.amount, groupCurrency),
        originalAmount:
          expense.originalAmount === null
            ? ''
            : amountAsDecimal(
                expense.originalAmount,
                getCurrency(expense.originalCurrency ?? '', locale, 'Custom'),
              ),
        originalCurrency: expense.originalCurrency ?? '',
        conversionRate:
          expense.conversionRate === null ? '' : Number(expense.conversionRate),
        paidBy: expense.paidById,
        paidFor: expense.paidFor.map(({ participantId, shares }) => ({
          participant: participantId,
          shares:
            expense.splitMode === 'BY_AMOUNT'
              ? String(amountAsDecimal(shares, groupCurrency))
              : String(shares / 100),
        })),
        splitMode: expense.splitMode,
        saveDefaultSplittingOptions: false,
        isReimbursement: expense.isReimbursement,
        documents: expense.documents,
        notes: expense.notes ?? '',
        recurrenceRule: expense.recurrenceRule ?? 'NONE',
      }
    : {
        expenseDate: new Date(),
        title: '',
        category: 0,
        amount: '',
        originalAmount: '',
        originalCurrency: '',
        conversionRate: '',
        paidBy: activeUserId ?? participants[0]?.id ?? '',
        paidFor: remembered.paidFor,
        splitMode: remembered.splitMode,
        saveDefaultSplittingOptions: false,
        isReimbursement: false,
        documents: [],
        notes: '',
        recurrenceRule: 'NONE',
      }

  const form = useForm<ExpenseFormInput, unknown, ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: defaults,
  })

  // useWatch rather than form.watch: the latter cannot be memoized, and the
  // React Compiler bails out of the whole hook when it sees one.
  const originalCode = useWatch({
    control: form.control,
    name: 'originalCurrency',
  })
  const originalCurrency = getCurrency(originalCode ?? '', locale, 'Custom')

  // Order matters: conversion settles the amount fields before the split is
  // rebalanced against the amount they produced.
  const conversion = useExpenseCurrencyConversion({
    form,
    groupCurrency,
    originalCurrency,
    isCreate,
  })
  const { markEdited } = useExpenseSplitBalancing(form, groupCurrency)

  const submit = form.handleSubmit(async (values) => {
    if (values.saveDefaultSplittingOptions) {
      remember(groupId, {
        splitMode: values.splitMode,
        paidFor: form.getValues('paidFor'),
      })
    }

    const payload = toExpensePayload(
      values,
      groupCurrency,
      originalCurrency,
      conversion.conversionRequired,
    )

    if (expense) {
      await updateExpense.mutateAsync({
        groupId,
        expenseId: expense.id,
        expenseFormValues: payload,
        participantId: activeUserId ?? undefined,
      })
    } else {
      await createExpense.mutateAsync({
        groupId,
        expenseFormValues: payload,
        participantId: activeUserId ?? undefined,
      })
    }

    await utils.groups.invalidate()
    router.push(`/groups/${groupId}/expenses`)
  })

  const remove = async () => {
    if (!expense) return
    await deleteExpense.mutateAsync({
      groupId,
      expenseId: expense.id,
      participantId: activeUserId ?? undefined,
    })
    await utils.groups.invalidate()
    router.push(`/groups/${groupId}/expenses`)
  }

  return {
    form,
    groupId,
    group,
    locale,
    groupCurrency,
    originalCurrency,
    participants,
    isCreate,
    submit,
    remove,
    markEdited,
    isSubmitting:
      createExpense.isPending || updateExpense.isPending || deleteExpense.isPending,
    ...conversion,
  }
}
