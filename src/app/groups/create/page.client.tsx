'use client'

import { GroupForm } from '@/components/core/templates/GroupForm'

export function CreateGroupPageClient({
  defaultCurrencyCode,
}: {
  defaultCurrencyCode: string
}) {
  return <GroupForm defaultCurrencyCode={defaultCurrencyCode} />
}
