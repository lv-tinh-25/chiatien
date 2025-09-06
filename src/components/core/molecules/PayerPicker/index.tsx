'use client'

import { Avatar } from '@/components/core/atoms/Avatar'
import { Chip } from '@/components/core/atoms/Chip'
import { Input } from '@/components/core/atoms/Input'
import { Sheet, SheetContent, SheetTitle } from '@/components/core/atoms/Sheet'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/lib/hooks'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { Check, Search } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState, type ReactNode } from 'react'

type Participant = { id: string; name: string }

/** How many chips fit before the rest collapse behind a pill. */
const VISIBLE = 4

function PickerList({
  participants,
  value,
  query,
  onQueryChange,
  onPick,
}: {
  participants: Participant[]
  value: string
  query: string
  onQueryChange: (query: string) => void
  onPick: (id: string) => void
}) {
  const t = useTranslations('PayerPicker')
  const needle = query.trim().toLowerCase()
  const matches = participants.filter(
    (participant) =>
      needle === '' || participant.name.toLowerCase().includes(needle),
  )

  return (
    <>
      <div className="relative">
        <Search
          aria-hidden
          className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={t('search')}
          aria-label={t('search')}
          className="pl-9"
        />
      </div>

      <div className="flex max-h-65 flex-col gap-0.5 overflow-y-auto">
        {matches.map((participant) => (
          <button
            key={participant.id}
            type="button"
            role="option"
            aria-selected={participant.id === value}
            title={participant.name}
            onClick={() => onPick(participant.id)}
            className={cn(
              'flex min-h-touch-min cursor-pointer items-center gap-3 rounded-control px-2.5 text-left text-body-lg font-semibold text-foreground',
              'transition-colors duration-150 ease-out-soft hover:bg-foreground/5',
              participant.id === value && 'bg-chip-selected',
            )}
          >
            <Avatar name={participant.name} size="md" />
            <span className="min-w-0 flex-1 truncate">{participant.name}</span>
            {participant.id === value && (
              <Check className="size-4 shrink-0 text-primary-ink" aria-hidden />
            )}
          </button>
        ))}
        {matches.length === 0 && (
          <p className="px-2.5 py-4 text-center text-body-md text-muted-foreground">
            {t('empty')}
          </p>
        )}
      </div>
    </>
  )
}

/**
 * Up to four chips with the selected participant first; a group larger than
 * that collapses the rest behind a pill that opens a searchable picker — a
 * popover on a desktop, a sheet on a phone.
 *
 * The chips themselves are options, so a small group needs no picker at all and
 * every participant stays one tap away. `testId` lands on the listbox rather
 * than the pill for the same reason: the pill does not exist in a small group.
 */
export function PayerPicker({
  id,
  value,
  participants,
  onValueChange,
  testId,
  'aria-describedby': describedBy,
}: {
  id?: string
  value: string
  participants: Participant[]
  onValueChange: (participantId: string) => void
  testId?: string
  'aria-describedby'?: string
}) {
  const t = useTranslations('PayerPicker')
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  const selectedFirst = [
    ...participants.filter((participant) => participant.id === value),
    ...participants.filter((participant) => participant.id !== value),
  ]
  const shown = selectedFirst.slice(0, VISIBLE)
  const rest = selectedFirst.slice(VISIBLE)

  const pick = (participantId: string) => {
    onValueChange(participantId)
    setOpen(false)
    setQuery('')
  }

  const list = (
    <PickerList
      participants={participants}
      value={value}
      query={query}
      onQueryChange={setQuery}
      onPick={pick}
    />
  )

  const trigger = (
    <button
      type="button"
      aria-expanded={open}
      aria-label={t('showAll')}
      title={t('showAll')}
      className={cn(
        'inline-flex min-h-9.5 cursor-pointer items-center gap-2 rounded-full border border-chip-border bg-chip/80 py-0.5 pr-3 pl-1',
        'text-body-sm font-extrabold text-chip-foreground transition-colors duration-150 ease-out-soft hover:bg-chip',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none',
      )}
    >
      <span aria-hidden className="flex">
        {rest.slice(0, 3).map((participant, index) => (
          <Avatar
            key={participant.id}
            name={participant.name}
            size="xs"
            className={cn(
              'ring-2 ring-card',
              index !== 0 && '-ml-2',
            )}
          />
        ))}
      </span>
      +{rest.length}
    </button>
  )

  return (
    <div
      id={id}
      role="listbox"
      data-testid={testId}
      aria-describedby={describedBy}
      className="flex flex-wrap items-center gap-2"
    >
      {shown.map((participant) => (
        <Chip
          key={participant.id}
          role="option"
          selected={participant.id === value}
          title={participant.name}
          onClick={() => onValueChange(participant.id)}
          className="max-w-37.5 pl-1"
        >
          <Avatar name={participant.name} size="xs" />
          <span className="max-w-18 truncate">{participant.name}</span>
        </Chip>
      ))}

      {rest.length > 0 &&
        (isDesktop ? (
          <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
            <PopoverPrimitive.Trigger asChild>{trigger}</PopoverPrimitive.Trigger>
            <PopoverPrimitive.Portal>
              <PopoverPrimitive.Content
                align="start"
                sideOffset={8}
                className="glass-modal z-50 flex w-75 flex-col gap-2.5 rounded-card p-3"
              >
                <div className="flex items-center justify-between px-0.5">
                  <span className="text-body-md font-extrabold text-foreground">
                    {t('title')}
                  </span>
                  <span className="text-body-sm font-semibold text-muted-foreground">
                    {t('count', { count: participants.length })}
                  </span>
                </div>
                {list}
              </PopoverPrimitive.Content>
            </PopoverPrimitive.Portal>
          </PopoverPrimitive.Root>
        ) : (
          <SheetPicker open={open} onOpenChange={setOpen} trigger={trigger} count={participants.length}>
            {list}
          </SheetPicker>
        ))}
    </div>
  )
}

function SheetPicker({
  open,
  onOpenChange,
  trigger,
  count,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  trigger: ReactNode
  count: number
  children: ReactNode
}) {
  const t = useTranslations('PayerPicker')
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <span onClick={() => onOpenChange(true)}>{trigger}</span>
      <SheetContent className="max-h-[78dvh] gap-2.5 p-3.5 pb-6">
        <div className="flex items-center justify-between px-0.5">
          <SheetTitle className="text-headline-sm font-extrabold">
            {t('title')}
          </SheetTitle>
          <span className="text-body-sm font-semibold text-muted-foreground">
            {t('count', { count })}
          </span>
        </div>
        {children}
      </SheetContent>
    </Sheet>
  )
}
