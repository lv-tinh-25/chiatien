'use client'

import { Card } from '@/components/core/atoms/Card'
import { Skeleton } from '@/components/core/atoms/Skeleton'
import { useTranslations } from 'next-intl'

function Rows({ count }: { count: number }) {
  return (
    <ul className="mt-1.5 flex flex-col gap-3">
      {Array.from({ length: count }, (_, row) => (
        <li key={row} className="flex items-center gap-2">
          <Skeleton className="size-7 rounded-full" />
          <Skeleton className="h-4 flex-1" />
        </li>
      ))}
    </ul>
  )
}

export function BalanceListSkeleton() {
  const t = useTranslations('App')

  return (
    <div className="grid items-start gap-4 *:min-w-0 md:grid-cols-[repeat(auto-fit,minmax(min(100%,21.25rem),1fr))]">
      <p role="status" className="sr-only">
        {t('loading')}
      </p>
      <Card className="p-4 lg:p-5">
        <Skeleton className="h-3 w-32 rounded-full" />
        <Rows count={4} />
      </Card>
      <Card className="p-4 lg:p-5">
        <Skeleton className="h-3 w-40 rounded-full" />
        <Rows count={3} />
      </Card>
    </div>
  )
}
