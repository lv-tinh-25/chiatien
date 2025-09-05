import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin()

/**
 * Hosts uploaded expense documents can be served from, derived from the
 * configured S3 storage. Undefined entries are not supported, so a pattern is
 * pushed only once its inputs exist. isAllowedUploadUrl in
 * src/lib/uploaded-image-url.ts mirrors this logic and must stay in step.
 * @type {import('next/dist/shared/lib/image-config').RemotePattern[]}
 */
const remotePatterns = []

if (process.env.S3_UPLOAD_ENDPOINT) {
  const url = new URL(process.env.S3_UPLOAD_ENDPOINT)
  remotePatterns.push({ hostname: url.hostname })
} else if (process.env.S3_UPLOAD_BUCKET && process.env.S3_UPLOAD_REGION) {
  remotePatterns.push({
    hostname: `${process.env.S3_UPLOAD_BUCKET}.s3.${process.env.S3_UPLOAD_REGION}.amazonaws.com`,
  })
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  images: { remotePatterns },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(self), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
          },
        ],
      },
    ]
  },
}

export default withNextIntl(nextConfig)
