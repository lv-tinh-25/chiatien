'use client'

import { useCurrentGroup } from '@/hooks/groups/useCurrentGroup'
import { extractExpenseInformationFromImage } from '@/lib/receipt-extract'
import { formatFileSize } from '@/lib/utils'
import { useToastStore } from '@/stores/useToastStore'
import { trpc } from '@/trpc/client'
import { useLocale, useTranslations } from 'next-intl'
import { getImageData, usePresignedUpload } from 'next-s3-upload'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const MAX_FILE_SIZE = 5 * 1024 ** 2

type Scan = {
  title: string | null
  amount: number | null
  categoryId: string | null
  date: string | null
  url: string
  width: number
  height: number
}

export function useReceiptExtract() {
  const t = useTranslations('CreateFromReceipt')
  const locale = useLocale()
  const router = useRouter()
  const { groupId } = useCurrentGroup()
  const showToast = useToastStore((state) => state.show)
  const { data: categoriesData } = trpc.categories.list.useQuery()
  const [isScanning, setIsScanning] = useState(false)
  const [scan, setScan] = useState<Scan | null>(null)
  const { FileInput, openFileDialog, uploadToS3 } = usePresignedUpload()

  const category =
    scan === null
      ? null
      : ((categoriesData?.categories ?? []).find(
          (candidate) => String(candidate.id) === scan.categoryId,
        ) ?? null)

  const pick = async (file: File): Promise<void> => {
    if (file.size > MAX_FILE_SIZE) {
      showToast({
        title: t('TooBigToast.title'),
        description: t('TooBigToast.description', {
          maxSize: formatFileSize(MAX_FILE_SIZE, locale),
          size: formatFileSize(file.size, locale),
        }),
      })
      return
    }

    setIsScanning(true)
    try {
      const { url } = await uploadToS3(file)
      // Extraction runs server-side against the uploaded URL, so the upload has
      // to land first; the dimensions are only needed for the thumbnail.
      const extracted = await extractExpenseInformationFromImage(url)
      const { width, height } = await getImageData(file)
      setScan({ ...extracted, url, width: width ?? 0, height: height ?? 0 })
    } catch {
      showToast({
        title: t('ErrorToast.title'),
        description: t('ErrorToast.description'),
        action: {
          label: t('ErrorToast.retry'),
          altLabel: t('ErrorToast.retry'),
          onAction: () => void pick(file),
        },
      })
    } finally {
      setIsScanning(false)
    }
  }

  const editNext = () => {
    if (scan === null) return
    const params = new URLSearchParams({
      title: scan.title ?? '',
      amount: String(scan.amount ?? ''),
      categoryId: String(scan.categoryId ?? ''),
      date: scan.date ?? '',
      imageUrl: scan.url,
      imageWidth: String(scan.width),
      imageHeight: String(scan.height),
    })
    router.push(`/groups/${groupId}/expenses/create?${params.toString()}`)
  }

  return {
    FileInput,
    openFileDialog,
    pick,
    editNext,
    isScanning,
    scan,
    category,
  }
}
