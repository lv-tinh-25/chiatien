'use client'

import { Card, CardContent, CardHeader } from '@/components/core/atoms/Card'
import { Skeleton } from '@/components/core/atoms/Skeleton'
import { useTranslations } from 'next-intl'

export function GroupSettingsSkeleton() {
  const t = useTranslations('App')

  return (
    <div className="flex flex-col gap-4 lg:max-w-190">
      <p role="status" className="sr-only">
        {t('loading')}
      </p>
      <Skeleton className="hidden h-7 w-40 lg:block" />

      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-44" />
        </CardHeader>
        <CardContent className="flex flex-col gap-1.5">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-touch-min w-full rounded-control" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {['name', 'currency', 'members', 'note'].map((row) => (
            <div
              key={row}
              className="flex flex-col gap-1.5 md:flex-row md:gap-4"
            >
              <Skeleton className="h-3.5 w-24 md:w-40 md:shrink-0" />
              <Skeleton className="h-4 w-2/3 md:flex-1" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
