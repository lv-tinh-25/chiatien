'use client'

import { Button } from '@/components/core/atoms/Button'
import { Sheet, SheetContent, SheetTitle } from '@/components/core/atoms/Sheet'
import { ShareSheet } from '@/components/core/templates/AppShell/ShareSheet'
import { useGroupMembership } from '@/hooks/groups/useGroupMembership'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import {
  Archive,
  ArchiveRestore,
  ChevronDown,
  Download,
  FileJson,
  Info,
  Link2,
  MoreHorizontal,
  Settings,
  Settings2,
  Star,
  Trash2,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useState } from 'react'

const ROW =
  'flex min-h-touch-min w-full cursor-pointer items-center gap-3 rounded-control px-3 text-left text-body-lg font-medium text-foreground transition-colors duration-150 ease-out-soft hover:bg-foreground/5'

function Items({
  groupId,
  onShare,
  onNavigate,
}: {
  groupId: string
  onShare: () => void
  onNavigate: () => void
}) {
  const t = useTranslations('Nav')
  const tExpenses = useTranslations('Expenses')
  const tGroups = useTranslations('Groups')
  const membership = useGroupMembership(groupId)

  const act = (action: () => void) => () => {
    onNavigate()
    action()
  }

  return (
    <>
      <Link
        href={`/groups/${groupId}/information`}
        className={ROW}
        onClick={onNavigate}
      >
        <Info aria-hidden />
        {t('information')}
      </Link>
      <Link
        href={`/groups/${groupId}/edit`}
        className={ROW}
        onClick={onNavigate}
      >
        <Settings2 aria-hidden />
        {t('groupSettings')}
      </Link>
      <button type="button" className={ROW} onClick={onShare}>
        <Link2 aria-hidden />
        {t('shareLink')}
      </button>
      <a
        href={`/groups/${groupId}/expenses/export/csv`}
        className={ROW}
        onClick={onNavigate}
      >
        <Download aria-hidden />
        {tExpenses('exportCsv')}
      </a>
      <a
        href={`/groups/${groupId}/expenses/export/json`}
        className={ROW}
        onClick={onNavigate}
      >
        <FileJson aria-hidden />
        {tExpenses('exportJson')}
      </a>
      {/* Inside a group the shell shows no settings button of its own, so this
          is the only way to the language switcher on a phone. */}
      <Link href="/settings" className={ROW} onClick={onNavigate}>
        <Settings aria-hidden />
        {t('settings')}
      </Link>

      {membership.remembered && (
        <>
          <hr className="my-1.5 border-border/60" />
          <button
            type="button"
            className={ROW}
            aria-pressed={membership.starred}
            onClick={act(membership.toggleStar)}
          >
            <Star
              aria-hidden
              className={membership.starred ? 'text-accent' : undefined}
              fill={membership.starred ? 'currentColor' : 'none'}
            />
            {tGroups(membership.starred ? 'unstar' : 'star')}
          </button>
          <button
            type="button"
            className={ROW}
            onClick={act(membership.toggleArchive)}
          >
            {membership.archived ? (
              <ArchiveRestore aria-hidden />
            ) : (
              <Archive aria-hidden />
            )}
            {tGroups(membership.archived ? 'unarchive' : 'archive')}
          </button>
          <button
            type="button"
            className={ROW}
            onClick={act(membership.forget)}
          >
            <Trash2 aria-hidden className="text-destructive" />
            {tGroups('removeRecent')}
          </button>
        </>
      )}
    </>
  )
}

/**
 * Every group-level action in the two shapes the design asks for: a labelled
 * dropdown beside the desktop breadcrumb, and a bottom sheet behind the mobile
 * header's overflow button.
 */
export function GroupOverflowMenu({
  groupId,
  variant,
}: {
  groupId: string
  variant: 'menu' | 'sheet'
}) {
  const t = useTranslations('Nav')
  const [open, setOpen] = useState(false)
  const [sharing, setSharing] = useState(false)

  const share = () => {
    setOpen(false)
    setSharing(true)
  }

  return (
    <>
      {variant === 'menu' ? (
        <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
          <PopoverPrimitive.Trigger asChild>
            <Button variant="outline" size="sm" className="min-h-9.5">
              {t('thisGroup')}
              <ChevronDown aria-hidden />
            </Button>
          </PopoverPrimitive.Trigger>
          <PopoverPrimitive.Portal>
            <PopoverPrimitive.Content
              align="end"
              sideOffset={8}
              className="glass-modal z-50 flex w-60 flex-col rounded-card p-1.5"
            >
              <Items
                groupId={groupId}
                onShare={share}
                onNavigate={() => setOpen(false)}
              />
            </PopoverPrimitive.Content>
          </PopoverPrimitive.Portal>
        </PopoverPrimitive.Root>
      ) : (
        <Sheet open={open} onOpenChange={setOpen}>
          <Button
            variant="ghost"
            size="icon"
            aria-label={t('more')}
            onClick={() => setOpen(true)}
          >
            <MoreHorizontal aria-hidden />
          </Button>
          <SheetContent className="p-3 pb-6">
            <SheetTitle className="sr-only">{t('thisGroup')}</SheetTitle>
            <div className="flex flex-col">
              <Items
                groupId={groupId}
                onShare={share}
                onNavigate={() => setOpen(false)}
              />
            </div>
          </SheetContent>
        </Sheet>
      )}

      <ShareSheet groupId={groupId} open={sharing} onOpenChange={setSharing} />
    </>
  )
}
