'use client'

import { Card } from '@/components/core/atoms/Card'
import { Skeleton } from '@/components/core/atoms/Skeleton'
import { useTranslations } from 'next-intl'

export function GroupSummaryAsideSkeleton() {
  const t = useTranslations('App')

  return (
    <div className="flex flex-col gap-3.5">
      <p role="status" className="sr-only">
        {t('loading')}
      </p>
      <Card className="p-4">
        <Skeleton className="h-4 w-24" />
        <ul className="mt-2 flex flex-col gap-3">
          {[0, 1, 2].map((row) => (
            <li key={row} className="flex items-center gap-2">
              <Skeleton className="size-6 rounded-full" />
              <Skeleton className="h-3.5 flex-1" />
            </li>
          ))}
        </ul>
      </Card>
      <Card className="p-4">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="mt-3 h-10 rounded-card" />
      </Card>
    </div>
  )
}
