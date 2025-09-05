import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ChiaTien',
    short_name: 'ChiaTien',
    description:
      'Chia tiền với bạn bè và gia đình. Không quảng cáo, không cần tài khoản.',
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
