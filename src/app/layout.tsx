import { ToastViewport } from '@/components/core/molecules/Toast'
import { ServiceWorkerRegistration } from '@/components/core/templates/ServiceWorkerRegistration'
import { jakarta } from '@/lib/fonts'
import '@/styles/globals.css'
import { TRPCProvider } from '@/trpc/client'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages, getTranslations } from 'next-intl/server'

// `viewportFit: 'cover'` is required, not cosmetic: the floating bottom bar
// positions itself against `env(safe-area-inset-bottom)`, which stays 0 without it.
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#f8fafc',
}

export async function generateMetadata() {
  const t = await getTranslations('App')
  const name = t('name')
  return {
    // Every page returns a bare title; the template is what appends the app
    // name, so no screen has to repeat it.
    title: { default: name, template: `%s · ${name}` },
    description: t('description'),
    applicationName: name,
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html lang={locale} className={jakarta.variable}>
      <body className="min-h-dvh font-sans antialiased">
        <div className="aurora pointer-events-none fixed inset-0 -z-10" />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <TRPCProvider>{children}</TRPCProvider>
          <ToastViewport />
          <ServiceWorkerRegistration />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
