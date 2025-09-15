'use client'

import { Card } from '@/components/core/atoms/Card'
import { Skeleton } from '@/components/core/atoms/Skeleton'
import { useTranslations } from 'next-intl'

export function GroupStatsSkeleton() {
  const t = useTranslations('App')

  return (
    <div className="flex flex-col gap-4">
      <p role="status" className="sr-only">
        {t('loading')}
      </p>
      <Skeleton className="h-11 w-full rounded-card lg:w-160" />
      <Card className="flex flex-col gap-3 p-5">
        <Skeleton className="h-3.5 w-40" />
        <Skeleton className="h-9 w-56" />
      </Card>
      <Card className="flex flex-col gap-3 p-5">
        <Skeleton className="h-3.5 w-40" />
        <Skeleton className="h-19.5 lg:h-30" />
      </Card>
      <div className="grid items-start gap-4 *:min-w-0 lg:grid-cols-[repeat(auto-fit,minmax(min(100%,21.25rem),1fr))]">
        {[0, 1].map((card) => (
          <Card key={card} className="flex flex-col gap-3 p-5">
            <Skeleton className="h-3.5 w-40" />
            {[0, 1, 2].map((row) => (
              <Skeleton key={row} className="h-9" />
            ))}
          </Card>
        ))}
      </div>
    </div>
  )
}
