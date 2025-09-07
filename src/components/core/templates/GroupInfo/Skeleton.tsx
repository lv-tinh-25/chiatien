'use client'

import { Card } from '@/components/core/atoms/Card'
import { Skeleton } from '@/components/core/atoms/Skeleton'
import { useTranslations } from 'next-intl'

export function GroupInfoSkeleton() {
  const t = useTranslations('App')

  return (
    <div className="flex max-w-190 flex-col gap-4">
      <p role="status" className="sr-only">
        {t('loading')}
      </p>
      <Skeleton className="hidden h-7 w-40 lg:block" />
      <Card className="flex flex-col gap-3 p-5 lg:p-6">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-2/3" />
      </Card>
      <Skeleton className="h-3.5 w-52" />
    </div>
  )
}
