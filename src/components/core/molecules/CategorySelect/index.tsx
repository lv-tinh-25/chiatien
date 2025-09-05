'use client'

import { Button } from '@/components/core/atoms/Button'
import { CategoryIcon } from '@/components/core/atoms/CategoryIcon'
import type { Category } from '@/generated/prisma/browser'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { Command } from 'cmdk'
import { Check, ChevronDown } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'

type CategorySelectProps = {
  id?: string
  value: number
  onValueChange: (categoryId: number) => void
  categories: Category[]
  'aria-describedby'?: string
}

export function CategorySelect({
  id,
  value,
  onValueChange,
  categories,
  ...aria
}: CategorySelectProps) {
  const t = useTranslations('Categories')
  const [open, setOpen] = useState(false)

  const sections = useMemo(() => {
    const byGroup = new Map<string, Category[]>()
    for (const category of categories) {
      byGroup.set(category.grouping, [
        ...(byGroup.get(category.grouping) ?? []),
        category,
      ])
    }
    return [...byGroup.entries()]
  }, [categories])

  const selected = categories.find((category) => category.id === value)

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        <Button
          type="button"
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-describedby={aria['aria-describedby']}
          variant="outline"
          className="w-full justify-between font-normal"
        >
          <span className="flex items-center gap-2">
            {selected !== undefined && (
              <CategoryIcon category={selected} className="size-4" />
            )}
            {selected === undefined
              ? ''
              : t(`${selected.grouping}.${selected.name}`)}
          </span>
          <ChevronDown className="size-4 opacity-60" aria-hidden />
        </Button>
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={4}
          className="z-50 w-[var(--radix-popover-trigger-width)] overflow-hidden rounded-control border border-border bg-card shadow-sheet"
        >
          <Command>
            <div className="border-b border-border px-3">
              <Command.Input
                placeholder={t('search')}
                className="h-touch-min w-full bg-transparent text-body-lg text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>
            <Command.List className="max-h-72 overflow-y-auto p-1">
              <Command.Empty className="px-3 py-4 text-body-md text-muted-foreground">
                {t('noCategory')}
              </Command.Empty>
              {sections.map(([grouping, entries]) => (
                <Command.Group
                  key={grouping}
                  heading={t(`${grouping}.heading`)}
                  className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-label-md [&_[cmdk-group-heading]]:text-muted-foreground"
                >
                  {entries.map((category) => (
                    <Command.Item
                      key={category.id}
                      value={`${t(`${grouping}.heading`)} ${t(
                        `${grouping}.${category.name}`,
                      )}`}
                      onSelect={() => {
                        onValueChange(category.id)
                        setOpen(false)
                      }}
                      className="flex min-h-touch-min cursor-default items-center justify-between rounded-control px-3 text-body-lg text-foreground data-[selected=true]:bg-muted"
                    >
                      <span className="flex items-center gap-2">
                        <CategoryIcon category={category} className="size-4" />
                        {t(`${grouping}.${category.name}`)}
                      </span>
                      {category.id === value && (
                        <Check className="size-4 text-primary" aria-hidden />
                      )}
                    </Command.Item>
                  ))}
                </Command.Group>
              ))}
            </Command.List>
          </Command>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}
