'use client'

import { Button } from '@/components/core/atoms/Button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/core/atoms/Sheet'
import { useBaseUrl } from '@/lib/hooks'
import { Check, Copy, Share2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { QRCodeCanvas } from 'qrcode.react'
import { useState } from 'react'

export function ShareSheet({ groupId }: { groupId: string }) {
  const t = useTranslations('Share')
  const baseUrl = useBaseUrl()
  const [copied, setCopied] = useState(false)
  const url = baseUrl === null ? '' : `${baseUrl}/groups/${groupId}/expenses`

  const copy = async () => {
    await navigator.clipboard.writeText(url)
    setCopied(true)
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={t('title')}>
          <Share2 aria-hidden />
        </Button>
      </SheetTrigger>
      <SheetContent className="p-4">
        <SheetTitle className="text-headline-md">{t('title')}</SheetTitle>
        <SheetDescription className="text-body-md text-muted-foreground">
          {t('description')}
        </SheetDescription>

        <div className="my-4 flex justify-center rounded-card bg-card p-4">
          {url !== '' && <QRCodeCanvas value={url} size={180} />}
        </div>

        <p className="mb-3 rounded-control bg-muted p-3 text-body-sm break-all text-muted-foreground">
          {url}
        </p>

        <Button onClick={copy} className="w-full">
          {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
          {t('copyLink')}
        </Button>

        <p className="mt-3 text-body-sm text-muted-foreground">
          <strong>{t('warning')}</strong> {t('warningHelp')}
        </p>
      </SheetContent>
    </Sheet>
  )
}
