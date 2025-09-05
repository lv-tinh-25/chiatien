'use client'

import { Button } from '@/components/core/atoms/Button'
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/core/atoms/Sheet'
import { ShareSheet } from '@/components/core/templates/GroupHeader/ShareSheet'
import { useCurrentGroup } from '@/hooks/groups/useCurrentGroup'
import { Download, Info, MoreHorizontal, Settings2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

export function GroupHeader() {
  const t = useTranslations('Expenses')
  const tNav = useTranslations('Nav')
  const tForm = useTranslations('GroupForm')
  const { groupId, group } = useCurrentGroup()

  return (
    <header className="flex items-center justify-between gap-3 pt-4">
      <h1 className="min-w-0 flex-1 truncate text-headline-lg text-foreground">
        {group?.name ?? ''}
      </h1>

      <div className="flex items-center gap-1">
        <ShareSheet groupId={groupId} />

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label={tNav('more')}>
              <MoreHorizontal aria-hidden />
            </Button>
          </SheetTrigger>
          <SheetContent className="p-4">
            <SheetTitle className="mb-3 text-headline-md">
              {group?.name ?? ''}
            </SheetTitle>
            <nav className="flex flex-col">
              <Button variant="ghost" className="justify-start" asChild>
                <Link href={`/groups/${groupId}/information`}>
                  <Info aria-hidden />
                  {tForm('InformationField.label')}
                </Link>
              </Button>
              <Button variant="ghost" className="justify-start" asChild>
                <Link href={`/groups/${groupId}/edit`}>
                  <Settings2 aria-hidden />
                  {tNav('groupSettings')}
                </Link>
              </Button>
              <Button variant="ghost" className="justify-start" asChild>
                <a href={`/groups/${groupId}/expenses/export/csv`}>
                  <Download aria-hidden />
                  {t('exportCsv')}
                </a>
              </Button>
              <Button variant="ghost" className="justify-start" asChild>
                <a href={`/groups/${groupId}/expenses/export/json`}>
                  <Download aria-hidden />
                  {t('exportJson')}
                </a>
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
