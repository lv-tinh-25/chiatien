import { MetadataRoute } from 'next'
import { getTranslations } from 'next-intl/server'

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const t = await getTranslations('App')

  return {
    name: t('name'),
    short_name: t('name'),
    description: t('description'),
    start_url: '/groups',
    id: '/groups',
    display: 'standalone',
    background_color: '#fff',
    theme_color: '#047857',
    icons: [
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
