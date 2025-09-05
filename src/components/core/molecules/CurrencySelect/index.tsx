'use client'

import { Button } from '@/components/core/atoms/Button'
import type { Locale } from '@/i18n/locales'
import { defaultCurrencyList, type Currency } from '@/lib/currency'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { Command } from 'cmdk'
import { Check, ChevronDown } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'

const COMMON_CODES = ['USD', 'EUR', 'JPY', 'GBP', 'CNY', 'VND']

type CurrencyGroup = 'custom' | 'common' | 'other'

const groupOf = (currency: Currency): CurrencyGroup =>
  currency.code === ''
    ? 'custom'
    : COMMON_CODES.includes(currency.code)
      ? 'common'
      : 'other'

const GROUP_ORDER: CurrencyGroup[] = ['custom', 'common', 'other']

type CurrencySelectProps = {
  id?: string
  value: string
  onValueChange: (value: string) => void
  locale: Locale
  placeholder?: string
  /** Label for the entry that lets a group use a currency the list has no code for. */
  customLabel?: string
  'aria-describedby'?: string
}

export function CurrencySelect({
  id,
  value,
  onValueChange,
  locale,
  placeholder,
  customLabel,
  ...aria
}: CurrencySelectProps) {
  const t = useTranslations('Currencies')
  const [open, setOpen] = useState(false)

  const currencies = useMemo(
    () => defaultCurrencyList(locale, customLabel ?? null),
    [locale, customLabel],
  )

  const sections = useMemo(
    () =>
      GROUP_ORDER.flatMap((group) => {
        const entries = currencies.filter(
          (currency) => groupOf(currency) === group,
        )
        return entries.length === 0 ? [] : [{ group, entries }]
      }),
    [currencies],
  )

  const selected = currencies.find((currency) => currency.code === value)
  // The ISO code is appended because several currencies share a symbol.
  const label =
    selected === undefined
      ? placeholder
      : selected.code === ''
        ? selected.name
        : `${selected.name} (${selected.code})`

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
          <span
            className={
              selected === undefined ? 'text-muted-foreground' : undefined
            }
          >
            {label}
          </span>
          <ChevronDown className="size-4 opacity-60" aria-hidden />
        </Button>
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={4}
          className="glass-modal z-50 w-[var(--radix-popover-trigger-width)] overflow-hidden rounded-control"
        >
          <Command>
            <div className="border-b border-border/60 px-3">
              <Command.Input
                placeholder={t('search')}
                className="h-touch-min w-full bg-transparent text-body-lg text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>
            <Command.List className="max-h-72 overflow-y-auto p-1">
              <Command.Empty className="px-3 py-4 text-body-md text-muted-foreground">
                {t('noCurrency')}
              </Command.Empty>
              {sections.map(({ group, entries }) => (
                <Command.Group
                  key={group}
                  heading={t(`${group}.heading`)}
                  className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-label-md [&_[cmdk-group-heading]]:text-muted-foreground"
                >
                  {entries.map((currency) => (
                    <Command.Item
                      key={currency.code}
                      value={`${currency.name} ${currency.code} ${currency.symbol}`}
                      onSelect={() => {
                        onValueChange(currency.code)
                        setOpen(false)
                      }}
                      className="flex min-h-touch-min cursor-default items-center justify-between rounded-control px-3 text-body-lg text-foreground data-[selected=true]:bg-foreground/6"
                    >
                      <span>
                        {currency.code === ''
                          ? currency.name
                          : `${currency.name} (${currency.code})`}
                      </span>
                      {currency.code === value && (
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
