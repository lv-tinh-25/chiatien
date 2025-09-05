'use client'

import { conversionRateNotice } from '@/lib/conversion-rate-notice'
import type { Currency } from '@/lib/currency'
import { enforceCurrencyPattern } from '@/lib/currency-input'
import {
  convertToGroupCurrency,
  convertToOriginalCurrency,
} from '@/lib/currency-conversion'
import { useCurrencyRate } from '@/lib/hooks'
import type { ExpenseFormInput, ExpenseFormValues } from '@/lib/schemas'
import { useEffect, useState } from 'react'
import { useWatch } from 'react-hook-form'
import type { UseFormReturn } from 'react-hook-form'

type Options = {
  form: UseFormReturn<ExpenseFormInput, unknown, ExpenseFormValues>
  groupCurrency: Currency
  originalCurrency: Currency
  isCreate: boolean
}

/**
 * Keeps the two amount fields in step across a currency conversion.
 *
 * Which one drives the other depends on the expense: for a normal expense the
 * user enters what they spent abroad and the group-currency amount follows; for
 * a repayment the group-currency amount is the balance being settled and the
 * amount to transfer is derived from it.
 *
 * The three effects below must keep this order. They communicate through
 * `form.watch`, and reordering them makes the two fields overwrite each other.
 */
export function useExpenseCurrencyConversion({
  form,
  groupCurrency,
  originalCurrency,
  isCreate,
}: Options) {
  const [usingCustomRate, setUsingCustomRate] = useState(
    Boolean(form.formState.defaultValues?.conversionRate),
  )

  const expenseDate = useWatch({ control: form.control, name: 'expenseDate' })
  const originalCode = useWatch({ control: form.control, name: 'originalCurrency' }) ?? ''
  const amount = useWatch({ control: form.control, name: 'amount' })
  const originalAmount = useWatch({ control: form.control, name: 'originalAmount' })
  const conversionRate = useWatch({ control: form.control, name: 'conversionRate' })
  const isReimbursement = Boolean(useWatch({ control: form.control, name: 'isReimbursement' }))

  const conversionRequired =
    groupCurrency.code.length > 0 &&
    originalCurrency.code.length > 0 &&
    originalCurrency.code !== groupCurrency.code

  // `expenseDate` is a Date once the schema has coerced it, but the raw form
  // input can still be the string a date field produces.
  const rateDate =
    expenseDate instanceof Date ? expenseDate : new Date(String(expenseDate))

  const exchangeRate = useCurrencyRate(
    rateDate,
    originalCode,
    groupCurrency.code,
  )

  useEffect(() => {
    if (usingCustomRate || !exchangeRate.data) return
    form.setValue('conversionRate', exchangeRate.data)
  }, [exchangeRate.data, usingCustomRate, form])

  useEffect(() => {
    if (isReimbursement || !conversionRequired) return

    // No touched-field gate: an empty or zero original amount is the only
    // thing that should stop the conversion, and checking the value directly
    // avoids depending on form state that does not re-render reliably under
    // the React Compiler.
    const rate = Number(conversionRate)
    const original = Number(originalAmount ?? 0)
    if (!rate || !original) return

    const converted = convertToGroupCurrency(original, rate, groupCurrency)
    if (converted === null) return
    form.setValue('amount', Number(enforceCurrencyPattern(converted)))
  }, [
    originalAmount,
    conversionRate,
    isReimbursement,
    conversionRequired,
    groupCurrency,
    form,
  ])

  useEffect(() => {
    if (!isReimbursement || !conversionRequired) return
    // When editing, leave the stored amount alone until the user touches
    // something the conversion actually depends on.
    if (
      !isCreate &&
      !form.getFieldState('amount').isDirty &&
      !form.getFieldState('originalCurrency').isDirty &&
      !form.getFieldState('conversionRate').isDirty
    )
      return

    const converted = convertToOriginalCurrency(
      Number(amount),
      Number(conversionRate),
      originalCurrency,
    )
    if (converted === null) return
    // A tiny balance can round down to zero in the original currency, which the
    // schema rejects; leave the field empty rather than block the form.
    form.setValue(
      'originalAmount',
      Number(converted) === 0 ? '' : enforceCurrencyPattern(converted),
    )
  }, [
    amount,
    conversionRate,
    isReimbursement,
    conversionRequired,
    originalCurrency,
    isCreate,
    form,
  ])

  const notice = conversionRateNotice({
    isLoading: exchangeRate.isLoading,
    hasDate: !Number.isNaN(rateDate.getTime()),
    usingCustomRate,
    rate: exchangeRate.data,
    error: exchangeRate.error,
    originalCode: originalCurrency.code,
    groupCode: groupCurrency.code,
  })

  return {
    conversionRequired,
    exchangeRate,
    usingCustomRate,
    setUsingCustomRate,
    notice,
  }
}
