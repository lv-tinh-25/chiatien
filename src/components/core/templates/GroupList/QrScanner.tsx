'use client'

import { Button } from '@/components/core/atoms/Button'
import { cameraErrorKey } from '@/lib/camera-error'
import { Html5Qrcode } from 'html5-qrcode'
import { Camera, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useId, useRef, useState } from 'react'

export function QrScanner({ onScan }: { onScan: (text: string) => void }) {
  const t = useTranslations('Groups.AddByURL.scanner')
  const [isScanning, setIsScanning] = useState(false)
  const [errorKey, setErrorKey] = useState<string | null>(null)
  const scanner = useRef<Html5Qrcode | null>(null)
  const elementId = `qr-reader-${useId()}`

  useEffect(
    () => () => {
      if (scanner.current?.isScanning) void scanner.current.stop()
    },
    [],
  )

  const start = async () => {
    setErrorKey(null)
    try {
      const instance = new Html5Qrcode(elementId)
      scanner.current = instance
      await instance.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decoded) => {
          onScan(decoded)
          void stop()
        },
        // Every frame without a code lands here, so it is not an error the
        // person needs to hear about.
        undefined,
      )
      setIsScanning(true)
    } catch (error) {
      setIsScanning(false)
      setErrorKey(cameraErrorKey(error))
    }
  }

  const stop = async () => {
    if (scanner.current?.isScanning) await scanner.current.stop()
    setIsScanning(false)
  }

  return (
    <div className="flex flex-col gap-3">
      <div id={elementId} className="w-full" />

      <Button
        type="button"
        variant={isScanning ? 'destructive' : 'outline'}
        onClick={() => void (isScanning ? stop() : start())}
      >
        {isScanning ? <X aria-hidden /> : <Camera aria-hidden />}
        {t(isScanning ? 'stopScanning' : 'startCamera')}
      </Button>

      {errorKey !== null && (
        <p role="alert" className="text-body-sm text-destructive">
          {t(errorKey)}
        </p>
      )}
    </div>
  )
}
