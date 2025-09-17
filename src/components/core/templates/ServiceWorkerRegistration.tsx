'use client'

import { Button } from '@/components/core/atoms/Button'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

// How often to ask the browser to check for a new worker (1 hour), so a
// long-lived tab notices a deploy without a manual refresh.
const UPDATE_CHECK_INTERVAL = 60 * 60 * 1000

/**
 * Registers the service worker that caches static assets and serves the
 * offline page, and offers a reload once a newer one is waiting.
 *
 * Registration is production-only: in development a cached worker would serve
 * stale assets and hide the change being worked on.
 */
export function ServiceWorkerRegistration() {
  const t = useTranslations('Pwa')
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null)

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return
    if (!('serviceWorker' in navigator)) return

    let cleanup: (() => void) | undefined

    const register = async () => {
      try {
        // Whether a worker is already in control. A later controllerchange then
        // means a *new* one took over, which warrants a reload; on a first
        // install clients.claim() fires the same event, and reloading there
        // would be a jarring refresh nobody asked for.
        const hadController = navigator.serviceWorker.controller !== null
        const registration = await navigator.serviceWorker.register('/sw.js')

        let refreshing = false
        const onControllerChange = () => {
          if (!hadController || refreshing) return
          refreshing = true
          window.location.reload()
        }
        navigator.serviceWorker.addEventListener(
          'controllerchange',
          onControllerChange,
        )

        if (registration.waiting && navigator.serviceWorker.controller) {
          setWaiting(registration.waiting)
        }

        registration.addEventListener('updatefound', () => {
          const installing = registration.installing
          if (!installing) return
          installing.addEventListener('statechange', () => {
            if (
              installing.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              setWaiting(installing)
            }
          })
        })

        const interval = window.setInterval(
          () => void registration.update(),
          UPDATE_CHECK_INTERVAL,
        )
        const onVisibilityChange = () => {
          if (document.visibilityState === 'visible') void registration.update()
        }
        document.addEventListener('visibilitychange', onVisibilityChange)

        cleanup = () => {
          navigator.serviceWorker.removeEventListener(
            'controllerchange',
            onControllerChange,
          )
          document.removeEventListener('visibilitychange', onVisibilityChange)
          window.clearInterval(interval)
        }
      } catch {
        // A failed registration costs offline support, nothing else.
      }
    }

    void register()
    return () => cleanup?.()
  }, [])

  if (!waiting) return null

  return (
    <div
      role="status"
      className="fixed inset-x-4 bottom-[calc(var(--spacing-thumb-safe)+0.75rem)] z-50 flex items-center gap-3 rounded-card border border-border bg-card p-3 shadow-sheet md:mx-auto md:max-w-sm lg:inset-x-auto lg:right-4 lg:bottom-4 lg:max-w-sm"
    >
      <span className="flex-1">
        <span className="block text-headline-sm text-foreground">
          {t('updateTitle')}
        </span>
        <span className="block text-body-sm text-muted-foreground">
          {t('updateDescription')}
        </span>
      </span>
      <Button size="sm" onClick={() => waiting.postMessage('SKIP_WAITING')}>
        {t('reload')}
      </Button>
    </div>
  )
}
