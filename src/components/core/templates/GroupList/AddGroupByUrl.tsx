'use client'

import { Button } from '@/components/core/atoms/Button'
import { Input } from '@/components/core/atoms/Input'
import { QrScanner } from '@/components/core/templates/GroupList/QrScanner'
import { useJoinGroupByUrl } from '@/hooks/groups/useJoinGroupByUrl'
import { cn } from '@/lib/utils'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { ArrowRight, QrCode } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

export function AddGroupByUrl() {
  const t = useTranslations('Groups.AddByURL')
  const tGroups = useTranslations('Groups')
  const { value, error, joining, change, submit, scanned } = useJoinGroupByUrl()
  const [scanning, setScanning] = useState(false)

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
          submit()
        }}
      >
        <label className="min-w-0 flex-1">
          <span className="sr-only">{t('title')}</span>
          <Input
            name="groupUrl"
            placeholder={t('placeholder')}
            value={value}
            onChange={(event) => change(event.target.value)}
          />
        </label>

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
            <DialogPrimitive.Content className="solid-overlay fixed top-1/2 left-1/2 z-50 w-[min(24rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-card p-5">
              <DialogPrimitive.Title className="text-headline-md text-foreground">
                {t('scanQr')}
              </DialogPrimitive.Title>
              <div className="mt-4">
                <QrScanner
                  onScan={(text) => {
                    setScanning(false)
                    scanned(text)
                  }}
                />
              </div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        </DialogPrimitive.Root>

        {/* Enter is not an affordance: a phone keyboard may show no submit key
            at all, and nothing on screen said the field could be sent. */}
        <Button
          type="submit"
          size="icon"
          aria-label={t('join')}
          pending={joining}
          disabled={value.trim() === ''}
          className="shrink-0"
        >
          {!joining && <ArrowRight aria-hidden />}
        </Button>
      </form>

      {error !== null && (
        <p role="alert" className="text-body-sm text-destructive">
          {t(error)}
        </p>
      )}
    </div>
  )
}
