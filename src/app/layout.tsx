import { jakarta } from '@/lib/fonts'
import '@/styles/globals.css'
import { TRPCProvider } from '@/trpc/client'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi" className={jakarta.variable}>
      <body className="font-sans">
        <TRPCProvider>{children}</TRPCProvider>
      </body>
    </html>
  )
}
