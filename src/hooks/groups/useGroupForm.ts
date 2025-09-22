'use client'

import { useLeaveForm } from '@/hooks/forms/useLeaveForm'
import { useMutationFeedback } from '@/hooks/forms/useMutationFeedback'
import { asLocale } from '@/i18n/locales'
import { defaultCurrencyList } from '@/lib/currency'
import { sameFormValues } from '@/lib/form-dirty'
import { groupFormSchema, type GroupFormValues } from '@/lib/schemas'
import { NO_ACTIVE_USER, useActiveUserStore } from '@/stores/useActiveUserStore'
import { useRecentGroupsStore } from '@/stores/useRecentGroupsStore'
import { trpc } from '@/trpc/client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useLocale, useTranslations } from 'next-intl'
import { useMemo } from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'

type ExistingGroup = {
  id: string
  name: string
  information: string | null
  currency: string
  currencyCode: string | null
  participants: { id: string; name: string }[]
}

type UseGroupFormOptions = {
  group?: ExistingGroup
  protectedParticipantIds?: string[]
  defaultCurrencyCode?: string
}

export function useGroupForm({
  group,
  protectedParticipantIds = [],
  defaultCurrencyCode = 'VND',
}: UseGroupFormOptions) {
  const t = useTranslations('GroupForm')
  const tToast = useTranslations('Toast')
  const { run } = useMutationFeedback()
  const leaveForm = useLeaveForm()
  const locale = asLocale(useLocale())
  const utils = trpc.useUtils()
  const visit = useRecentGroupsStore((state) => state.visit)
  const activeUser = useActiveUserStore((state) => {
    const stored = group ? state.activeUsers[group.id] : undefined
    return stored === undefined || stored === NO_ACTIVE_USER ? null : stored
  })

  const isEdit = group !== undefined

  const createGroup = trpc.groups.create.useMutation()
  const updateGroup = trpc.groups.update.useMutation()

  const symbolFor = (code: string) =>
    defaultCurrencyList(locale).find((currency) => currency.code === code)
      ?.symbol_native ?? ''

  const defaults: GroupFormValues = group
    ? {
        name: group.name,
        information: group.information ?? '',
        currency: group.currency,
        currencyCode: group.currencyCode ?? '',
        participants: group.participants.map(({ id, name }) => ({ id, name })),
      }
    : {
        name: '',
        information: '',
        currency: symbolFor(defaultCurrencyCode),
        currencyCode: defaultCurrencyCode,
        participants: [
          { name: t('Participants.John') },
          { name: t('Participants.Jane') },
          { name: t('Participants.Jack') },
        ],
      }

  const form = useForm<GroupFormValues>({
    resolver: zodResolver(groupFormSchema),
    defaultValues: defaults,
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'participants',
  })

  // Not `formState.isDirty`: it only counts a `setValue` that was given
  // `shouldDirty`, and it compares raw values rather than what they mean.
  const current = useWatch({ control: form.control })
  const edited = !sameFormValues(current, defaults)

  const protectedIds = useMemo(
    () => new Set(protectedParticipantIds),
    [protectedParticipantIds],
  )

  /**
   * The currency is the unit every stored amount is counted in, and the rows
   * carry no unit of their own -- switching it would silently reinterpret every
   * one of them. `protectedParticipantIds` is the group's expense participants,
   * so a non-empty one means the group already has amounts to protect. The
   * server refuses the same change; this only keeps it off the screen.
   */
  const currencyLocked = protectedParticipantIds.length > 0

  /**
   * A participant who already appears in an expense cannot be removed: deleting
   * the row would cascade the expense away with them.
   */
  const isProtected = (index: number) => {
    const id = form.getValues(`participants.${index}.id`)
    return id !== undefined && protectedIds.has(id)
  }

  const submit = form.handleSubmit(async (values) => {
    if (group) {
      const saved = await run(
        async () => {
          await updateGroup.mutateAsync({
            groupId: group.id,
            participantId: activeUser ?? undefined,
            groupFormValues: values,
          })
        },
        { success: tToast('groupUpdated'), failure: tToast('failed') },
      )
      if (!saved.ok) return

      await utils.groups.invalidate()
      visit({ id: group.id, name: values.name })
      // The form is a task, and the task is over: staying on it left the reader
      // looking at a screen that had already done its job.
      leaveForm(`/groups/${group.id}/settings`)
      return
    }

    const created = await run(
      () => createGroup.mutateAsync({ groupFormValues: values }),
      { success: tToast('groupCreated'), failure: tToast('failed') },
    )
    if (!created.ok) return

    const { groupId } = created.value
    await utils.groups.invalidate()
    visit({ id: groupId, name: values.name })
    leaveForm(`/groups/${groupId}/expenses`)
  })

  return {
    form,
    isEdit,
    fields,
    addParticipant: () => append({ name: '' }),
    removeParticipant: remove,
    isProtected,
    submit,
    isSubmitting: createGroup.isPending || updateGroup.isPending,
    // Saving a group nobody edited writes the same row back and reports
    // success for nothing. Creating one is different: a form opened from a
    // link can be complete before it is touched.
    canSubmit: !isEdit || edited,
    currencyLocked,
    onCurrencyCodeChange: (code: string) => {
      if (currencyLocked) return
      form.setValue('currencyCode', code)
      form.setValue('currency', symbolFor(code))
    },
  }
}
