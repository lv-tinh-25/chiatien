'use client'

import { Card } from '@/components/core/atoms/Card'
import { Skeleton } from '@/components/core/atoms/Skeleton'
import { useTranslations } from 'next-intl'

export function ActivityLogSkeleton() {
  const t = useTranslations('App')

  return (
    <div className="flex w-full flex-col gap-4 lg:max-w-190">
      <p role="status" className="sr-only">
        {t('loading')}
      </p>
      {[0, 1].map((section) => (
        <div key={section} className="flex flex-col gap-2">
          <Skeleton className="h-3 w-28 rounded-full" />
          <Card className="flex flex-col gap-4 p-4">
            {Array.from({ length: section === 0 ? 4 : 2 }, (_, row) => (
              <div key={row} className="flex items-center gap-3">
                <Skeleton className="size-8 rounded-full" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-14" />
              </div>
            ))}
          </Card>
        </div>
      ))}
    </div>
  )
}
