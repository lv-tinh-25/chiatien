'use client'

import { asLocale } from '@/i18n/locales'
import { defaultCurrencyList } from '@/lib/currency'
import { groupFormSchema, type GroupFormValues } from '@/lib/schemas'
import { NO_ACTIVE_USER, useActiveUserStore } from '@/stores/useActiveUserStore'
import { useRecentGroupsStore } from '@/stores/useRecentGroupsStore'
import { trpc } from '@/trpc/client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useMemo } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'

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
  const locale = asLocale(useLocale())
  const router = useRouter()
  const utils = trpc.useUtils()
  const visit = useRecentGroupsStore((state) => state.visit)
  const setActiveUser = useActiveUserStore((state) => state.setActiveUser)
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

  const form = useForm<GroupFormValues>({
    resolver: zodResolver(groupFormSchema),
    defaultValues: group
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
        },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'participants',
  })

  const protectedIds = useMemo(
    () => new Set(protectedParticipantIds),
    [protectedParticipantIds],
  )

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
      await updateGroup.mutateAsync({
        groupId: group.id,
        participantId: activeUser ?? undefined,
        groupFormValues: values,
      })
      await utils.groups.invalidate()
      visit({ id: group.id, name: values.name })
      return
    }

    const { groupId } = await createGroup.mutateAsync({ groupFormValues: values })
    await utils.groups.invalidate()
    visit({ id: groupId, name: values.name })
    router.push(`/groups/${groupId}/expenses`)
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
    activeUser,
    setActiveUser: (participantId: string | null) => {
      if (group) setActiveUser(group.id, participantId)
    },
    onCurrencyCodeChange: (code: string) => {
      form.setValue('currencyCode', code)
      form.setValue('currency', symbolFor(code))
    },
  }
}
