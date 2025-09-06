'use client'

import { Button } from '@/components/core/atoms/Button'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { Archive, ArchiveRestore, MoreVertical, Star, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

const ROW =
  'flex min-h-touch-min w-full cursor-pointer items-center gap-3 rounded-control px-3 text-left text-body-md font-semibold text-foreground transition-colors duration-150 ease-out-soft hover:bg-foreground/5'

/**
 * Star, archive and forget used to sit on the card face, which made the card
 * four targets instead of one. They live behind this button so the card itself
 * is a single link.
 */
export function GroupCardMenu({
  starred,
  archived,
  onToggleStar,
  onToggleArchive,
  onForget,
}: {
  starred: boolean
  archived: boolean
  onToggleStar: () => void
  onToggleArchive: () => void
  onForget: () => void
}) {
  const t = useTranslations('Groups')
  const tNav = useTranslations('Nav')
  const [open, setOpen] = useState(false)

  const run = (action: () => void) => () => {
    setOpen(false)
    action()
  }

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={tNav('more')}
          className="min-h-9 w-9 text-muted-foreground"
        >
          <MoreVertical aria-hidden />
        </Button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="end"
          sideOffset={6}
          className="glass-modal z-50 flex w-52 flex-col rounded-card p-1.5"
        >
          <button
            type="button"
            className={ROW}
            aria-pressed={starred}
            onClick={run(onToggleStar)}
          >
            <Star
              aria-hidden
              className={starred ? 'text-accent' : undefined}
              fill={starred ? 'currentColor' : 'none'}
            />
            {t('starred')}
          </button>
          <button
            type="button"
            className={ROW}
            onClick={run(onToggleArchive)}
          >
            {archived ? (
              <ArchiveRestore aria-hidden />
            ) : (
              <Archive aria-hidden />
            )}
            {archived ? t('unarchive') : t('archive')}
          </button>
          <button
            type="button"
            className={ROW}
            onClick={run(onForget)}
          >
            <Trash2 aria-hidden className="text-destructive" />
            {t('removeRecent')}
          </button>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}
