'use client'

import { Button } from '@/components/core/atoms/Button'
import { Sheet, SheetContent, SheetTitle } from '@/components/core/atoms/Sheet'
import { ShareSheet } from '@/components/core/templates/AppShell/ShareSheet'
import { useGroupMembership } from '@/hooks/groups/useGroupMembership'
import { useMediaQuery } from '@/lib/hooks'
import { cn } from '@/lib/utils'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import {
  Archive,
  ArchiveRestore,
  ChevronDown,
  Download,
  FileJson,
  Link2,
  Settings2,
  Star,
  Trash2,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

const ROW = cn(
  'flex min-h-touch-min w-full cursor-pointer items-center gap-3 rounded-control px-3',
  'text-left text-body-lg font-medium text-foreground',
  'transition-colors duration-150 ease-out-soft hover:bg-foreground/5',
  '[&_svg]:size-5 [&_svg]:shrink-0',
  // A pointer needs none of the 48px a thumb does, and the icons were half
  // again the height of the words they label.
  'lg:min-h-9 lg:gap-2.5 lg:px-2.5 lg:text-body-md lg:[&_svg]:size-4',
)

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
 * Every group-level *action* in the two shapes the design asks for: a labelled
 * dropdown beside the desktop breadcrumb, and a bottom sheet behind the mobile
 * header's overflow button. Nothing here navigates to a screen — the five
 * destinations are reached from the nav, so a reader never has to open a menu
 * to find out where they can go.
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

  // Both bars mount this; CSS hides the one that does not belong to the current
  // width. A sheet's content is portalled to the body, though, so it escapes
  // that `lg:hidden` and a phone-width sheet left open across a resize reappears
  // full-width over the desktop layout. Whichever copy the width no longer
  // addresses closes itself.
  const wide = useMediaQuery('(min-width: 1024px)')
  const addressed = variant === 'menu' ? wide : !wide

  // Hiding it is not enough: a copy that stops being addressed keeps `open`
  // true, and coming back to that width re-opens a menu nobody asked for. The
  // state is corrected during the render that notices, which is React's own
  // answer to a prop change and costs no second pass.
  const [addressedBefore, setAddressedBefore] = useState(addressed)
  if (addressedBefore !== addressed) {
    setAddressedBefore(addressed)
    if (open) setOpen(false)
  }

  const showing = open && addressed

  const share = () => {
    setOpen(false)
    setSharing(true)
  }

  return (
    <>
      {variant === 'menu' ? (
        <PopoverPrimitive.Root open={showing} onOpenChange={setOpen}>
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
              className="solid-overlay z-50 flex w-60 flex-col rounded-card p-1.5"
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
        <Sheet open={showing} onOpenChange={setOpen}>
          <Button
            variant="ghost"
            size="icon"
            aria-label={t('more')}
            onClick={() => setOpen(true)}
          >
            <Settings2 aria-hidden />
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
