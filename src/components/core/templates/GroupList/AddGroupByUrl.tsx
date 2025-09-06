'use client'

import { Input } from '@/components/core/atoms/Input'
import { QrScanner } from '@/components/core/templates/GroupList/QrScanner'
import { cn } from '@/lib/utils'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { QrCode } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

/**
 * Accepts anything that contains a group id — a full share URL, a path, or the
 * bare id — because people paste all three.
 */
function groupIdFromUrl(value: string): string | null {
  const trimmed = value.trim()
  if (trimmed === '') return null
  const fromPath = /\/groups\/([^/?#]+)/.exec(trimmed)
  if (fromPath) return fromPath[1]
  return /^[A-Za-z0-9_-]+$/.test(trimmed) ? trimmed : null
}

export function AddGroupByUrl({
  onAdd,
}: {
  onAdd: (groupId: string) => Promise<boolean>
}) {
  const t = useTranslations('Groups.AddByURL')
  const tGroups = useTranslations('Groups')
  const [value, setValue] = useState('')
  const [failed, setFailed] = useState(false)
  const [scanning, setScanning] = useState(false)

  const add = async (candidate: string) => {
    const groupId = groupIdFromUrl(candidate)
    if (groupId === null) {
      setFailed(true)
      return
    }
    const added = await onAdd(groupId)
    setFailed(!added)
    if (added) setValue('')
  }

  return (
    <div className="flex flex-col justify-center gap-2.5 rounded-hero border border-dashed border-border bg-card/45 p-3.5 backdrop-blur-md lg:gap-3 lg:p-5">
      {/* The title and the explanation are desktop furniture: on a phone the
          placeholder already says what the field takes. */}
      <p className="hidden text-body-lg font-extrabold text-foreground lg:block">
        {tGroups('joinTitle')}
      </p>
      <p className="hidden text-body-sm text-muted-foreground lg:block">
        {t('description')}
      </p>

      <form
        className="flex items-center gap-2"
        onSubmit={(event) => {
          event.preventDefault()
          void add(value)
        }}
      >
        <label className="flex-1">
          <span className="sr-only">{t('title')}</span>
          <Input
            name="groupUrl"
            placeholder={t('placeholder')}
            value={value}
            onChange={(event) => {
              setValue(event.target.value)
              setFailed(false)
            }}
          />
        </label>
        <button type="submit" className="sr-only">
          {tGroups('joinTitle')}
        </button>

        <DialogPrimitive.Root open={scanning} onOpenChange={setScanning}>
          <DialogPrimitive.Trigger
            aria-label={t('scanQr')}
            className={cn(
              'flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-control border border-input bg-card/85 text-primary-ink',
              'transition-colors duration-150 ease-out-soft hover:bg-card',
              'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
            )}
          >
            <QrCode aria-hidden className="size-5" />
          </DialogPrimitive.Trigger>
          <DialogPrimitive.Portal>
            <DialogPrimitive.Overlay className="glass-scrim fixed inset-0 z-50" />
            <DialogPrimitive.Content className="glass-modal fixed top-1/2 left-1/2 z-50 w-[min(24rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-card p-5">
              <DialogPrimitive.Title className="text-headline-md text-foreground">
                {t('scanQr')}
              </DialogPrimitive.Title>
              <div className="mt-4">
                <QrScanner
                  onScan={(text) => {
                    setScanning(false)
                    void add(text)
                  }}
                />
              </div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
      </form>

      {failed && (
        <p role="alert" className="text-body-sm text-destructive">
          {t('error')}
        </p>
      )}
    </div>
  )
}
