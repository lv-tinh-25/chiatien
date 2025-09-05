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
import { Check, Copy, Download, Share2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { QRCodeCanvas } from 'qrcode.react'
import { useRef, useState } from 'react'

export function ShareSheet({ groupId }: { groupId: string }) {
  const t = useTranslations('Share')
  const baseUrl = useBaseUrl()
  const [copied, setCopied] = useState(false)
  const qrCode = useRef<HTMLDivElement>(null)
  const url = baseUrl === null ? '' : `${baseUrl}/groups/${groupId}/expenses`

  const copy = async () => {
    await navigator.clipboard.writeText(url)
    setCopied(true)
  }

  const share = async () => {
    // Web Share is a mobile affordance and absent on most desktop browsers,
    // where copying is the only thing left to offer.
    if (typeof navigator.share !== 'function') {
      await copy()
      return
    }
    await navigator.share({ title: t('shareLink'), url }).catch(() => {
      // A dismissed share sheet rejects; there is nothing to report.
    })
  }

  const download = () => {
    const canvas = qrCode.current?.querySelector('canvas')
    if (!canvas) return
    const link = document.createElement('a')
    link.href = canvas.toDataURL('image/png')
    link.download = `chiatien-${groupId}.png`
    link.click()
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

        <p className="mt-4 text-headline-sm text-foreground">
          {t('qrCode.title')}
        </p>
        <p className="text-body-sm text-muted-foreground">
          {t('qrCode.description')}
        </p>

        <div
          ref={qrCode}
          className="my-3 flex justify-center rounded-card bg-card p-4"
        >
          {url !== '' && <QRCodeCanvas value={url} size={180} />}
        </div>

        <Button variant="outline" onClick={download} className="w-full">
          <Download aria-hidden />
          {t('qrCode.download')}
        </Button>

        <p className="my-3 rounded-control bg-muted p-3 text-body-sm break-all text-muted-foreground">
          {url}
        </p>

        <div className="flex flex-col gap-2">
          <Button onClick={() => void share()}>
            <Share2 aria-hidden />
            {t('shareLink')}
          </Button>
          <Button variant="outline" onClick={() => void copy()}>
            {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
            {t('copyLink')}
          </Button>
        </div>

        <p className="mt-3 text-body-sm text-muted-foreground">
          <strong>{t('warning')}</strong> {t('warningHelp')}
        </p>
      </SheetContent>
    </Sheet>
  )
}
