'use client'

import { Card } from '@/components/core/atoms/Card'
import { Skeleton } from '@/components/core/atoms/Skeleton'
import { useTranslations } from 'next-intl'

function Field({ className }: { className?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Skeleton className="h-3 w-24 rounded-full" />
      <Skeleton className={className ?? 'h-12'} />
    </div>
  )
}

export function ExpenseFormSkeleton() {
  const t = useTranslations('App')

  return (
    <div className="grid items-start gap-3.5 *:min-w-0 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <p role="status" className="sr-only">
        {t('loading')}
      </p>
      <Card className="flex flex-col gap-4 p-4 lg:p-5">
        <Field />
        <Field />
        <div className="grid grid-cols-2 gap-2.5">
          <Field />
          <Field />
        </div>
        <Field className="h-16" />
      </Card>
      <div className="flex flex-col gap-3.5">
        <Card className="flex flex-col gap-3 p-4">
          <Skeleton className="h-4 w-28" />
          {[0, 1, 2].map((row) => (
            <Skeleton key={row} className="h-11" />
          ))}
        </Card>
        <Skeleton className="h-14 rounded-control" />
      </div>
    </div>
  )
}
