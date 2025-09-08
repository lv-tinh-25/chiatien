'use client'

import { Button } from '@/components/core/atoms/Button'
import { EmptyState } from '@/components/core/molecules/EmptyState'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

/**
 * What an expense's own page shows once the expense is gone. A bookmark, a
 * shared link, or the browser's back button all outlive the thing they point
 * at, and rendering nothing left the reader on a blank page with two 404s in
 * the console and no idea what had happened.
 */
export function ExpenseNotFound({ groupId }: { groupId: string }) {
  const t = useTranslations('ExpenseForm')

  return (
    <EmptyState
      title={t('notFoundTitle')}
      description={t('notFoundDescription')}
      action={
        <Button variant="outline" className="mt-2" asChild>
          <Link href={`/groups/${groupId}/expenses`} replace>
            {t('notFoundAction')}
          </Link>
        </Button>
      }
    />
  )
}
