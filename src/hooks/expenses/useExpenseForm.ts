'use client'

import { useExpenseCurrencyConversion } from '@/hooks/expenses/useExpenseCurrencyConversion'
import { useExpenseSplitBalancing } from '@/hooks/expenses/useExpenseSplitBalancing'
import { useLeaveForm } from '@/hooks/forms/useLeaveForm'
import { useMutationFeedback } from '@/hooks/forms/useMutationFeedback'
import { useCurrentGroup } from '@/hooks/groups/useCurrentGroup'
import { defaultCategoryFor } from '@/lib/categories'
import { getCurrency } from '@/lib/currency'
import { reconcileSplittingOptions } from '@/lib/expense-defaults'
import { toExpensePayload } from '@/lib/expense-payload'
import { sameFormValues } from '@/lib/form-dirty'
import { randomId } from '@/lib/random'
import { parseReceiptParams } from '@/lib/receipt-params'
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
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { useForm, useWatch } from 'react-hook-form'

type Expense = AppRouterOutput['groups']['expenses']['get']['expense']

export function useExpenseForm(expense?: Expense) {
  const t = useTranslations('ExpenseForm')
  const tToast = useTranslations('Toast')
  const { run } = useMutationFeedback()
  const leaveForm = useLeaveForm()
  const { groupId, group, locale, currency, activeUserId } = useCurrentGroup()
  const utils = trpc.useUtils()
  const searchParams = useSearchParams()
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

  // A settlement link from the balances screen arrives prefilled: who pays,
  // who receives, and how much. Anything absent falls back to the normal
  // create defaults, so a hand-edited URL cannot produce a broken form.
  const settlement = isCreate
    ? {
        active: searchParams.get('reimbursement') !== null,
        from: searchParams.get('from'),
        to: searchParams.get('to'),
        amount: Number(searchParams.get('amount')) || 0,
      }
    : { active: false, from: null, to: null, amount: 0 }

  // A scanned receipt arrives the same way, carrying what the model read off
  // the photo plus the image it read it from.
  const receipt = isCreate
    ? parseReceiptParams(new URLSearchParams(searchParams.toString()))
    : null

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
        expenseDate: receipt?.date ?? new Date(),
        title: settlement.active ? t('reimbursement') : (receipt?.title ?? ''),
        // The design opens on Food, the category most expenses land in;
        // Settlement is chosen for a repayment rather than typed.
        category: receipt?.categoryId ?? defaultCategoryFor(settlement.active),
        amount: settlement.active
          ? String(amountAsDecimal(settlement.amount, groupCurrency))
          : (receipt?.amount ?? ''),
        originalAmount: '',
        originalCurrency: '',
        conversionRate: '',
        paidBy: settlement.from ?? activeUserId ?? participants[0]?.id ?? '',
        paidFor:
          settlement.active && settlement.to !== null
            ? [{ participant: settlement.to, shares: '1' }]
            : remembered.paidFor,
        splitMode: settlement.active ? 'EVENLY' : remembered.splitMode,
        saveDefaultSplittingOptions: false,
        isReimbursement: settlement.active,
        documents:
          receipt?.document === undefined || receipt?.document === null
            ? []
            : [{ id: randomId(), ...receipt.document }],
        notes: '',
        recurrenceRule: 'NONE',
      }

  const form = useForm<ExpenseFormInput, unknown, ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: defaults,
  })

  // Not `formState.isDirty`: it compares raw values, so the amount is dirty for
  // ever once typed — its default is a number and the input writes a string —
  // and it ignores every `setValue` that was not given `shouldDirty`, which is
  // most of this form. `sameFormValues` compares what the values mean.
  const current = useWatch({ control: form.control })
  const edited = !sameFormValues(current, defaults)

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

    const saved = await run(
      async () => {
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
      },
      {
        success: tToast(expense ? 'expenseUpdated' : 'expenseCreated'),
        failure: tToast('failed'),
      },
    )
    if (!saved.ok) return

    await utils.groups.invalidate()
    leaveForm(`/groups/${groupId}/expenses`)
  })

  const remove = async () => {
    // The dialog disables its own button, but a stray second call would still
    // ask the server to delete a row that is already gone.
    if (!expense || deleteExpense.isPending) return
    const deleted = await run(
      async () => {
        await deleteExpense.mutateAsync({
          groupId,
          expenseId: expense.id,
          participantId: activeUserId ?? undefined,
        })
      },
      { success: tToast('expenseDeleted'), failure: tToast('failed') },
    )
    if (!deleted.ok) return

    await utils.groups.invalidate()
    leaveForm(`/groups/${groupId}/expenses`)
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
      createExpense.isPending ||
      updateExpense.isPending ||
      deleteExpense.isPending,
    // Saving an expense nobody edited writes the same row back and reports
    // success for nothing. Creating one is different: a settlement or a
    // scanned receipt arrives prefilled and is meant to be submitted as it is.
    canSubmit: isCreate || edited,
    ...conversion,
  }
}
