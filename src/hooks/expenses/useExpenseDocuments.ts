'use client'

import { randomId } from '@/lib/random'
import type { ExpenseFormInput, ExpenseFormValues } from '@/lib/schemas'
import { formatFileSize } from '@/lib/utils'
import { useToastStore } from '@/stores/useToastStore'
import { useLocale, useTranslations } from 'next-intl'
import { getImageData, usePresignedUpload } from 'next-s3-upload'
import { useState } from 'react'
import { useWatch, type UseFormReturn } from 'react-hook-form'

const MAX_FILE_SIZE = 5 * 1024 ** 2

type ExpenseDocument = ExpenseFormValues['documents'][number]

export function useExpenseDocuments(
  form: UseFormReturn<ExpenseFormInput, unknown, ExpenseFormValues>,
) {
  const t = useTranslations('ExpenseDocumentsInput')
  const locale = useLocale()
  const showToast = useToastStore((state) => state.show)
  const [isUploading, setIsUploading] = useState(false)
  const { FileInput, openFileDialog, uploadToS3 } = usePresignedUpload()

  const documents: ExpenseDocument[] =
    useWatch({ control: form.control, name: 'documents' }) ?? []

  const current = (): ExpenseDocument[] => form.getValues('documents') ?? []

  const attach = async (file: File): Promise<void> => {
    if (file.size > MAX_FILE_SIZE) {
      showToast({
        title: t('TooBigToast.title'),
        description: t('TooBigToast.description', {
          maxSize: formatFileSize(MAX_FILE_SIZE, locale),
          size: formatFileSize(file.size, locale),
        }),
        variant: 'warning',
      })
      return
    }

    setIsUploading(true)
    try {
      // The dimensions are stored so the viewer can reserve the right space
      // before the image itself arrives.
      const { width, height } = await getImageData(file)
      if (!width || !height) throw new Error('image has no dimensions')
      const { url } = await uploadToS3(file)
      form.setValue(
        'documents',
        [...current(), { id: randomId(), url, width, height }],
        { shouldDirty: true },
      )
    } catch {
      showToast({
        title: t('ErrorToast.title'),
        description: t('ErrorToast.description'),
        action: {
          label: t('ErrorToast.retry'),
          altLabel: t('ErrorToast.retry'),
          onAction: () => void attach(file),
        },
        variant: 'error',
      })
    } finally {
      setIsUploading(false)
    }
  }

  const remove = (id: string) => {
    form.setValue(
      'documents',
      current().filter((document) => document.id !== id),
      { shouldDirty: true },
    )
  }

  return { FileInput, openFileDialog, attach, remove, documents, isUploading }
}
