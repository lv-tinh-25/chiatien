export type ReceiptDraft = {
  title: string
  /** A decimal, which is how the extractor reports an amount. */
  amount: string
  categoryId: number
  date: Date | null
  document: { url: string; width: number; height: number } | null
}

/**
 * Reads the draft the receipt scanner hands to the create form through the URL.
 *
 * `imageUrl` is the discriminator: the scanner only navigates once the upload
 * has succeeded, so its absence means this is an ordinary create. A settlement
 * link shares the `amount` parameter but carries it in minor units, so a link
 * carrying `reimbursement` is never read as a receipt.
 */
export function parseReceiptParams(
  params: URLSearchParams,
): ReceiptDraft | null {
  const url = params.get('imageUrl')
  if (url === null || params.get('reimbursement') !== null) return null

  const width = Number(params.get('imageWidth'))
  const height = Number(params.get('imageHeight'))
  const amount = Number(params.get('amount'))
  const categoryId = Number(params.get('categoryId'))
  const date = params.get('date')
  const parsedDate = date === null ? null : new Date(date)

  return {
    title: params.get('title') ?? '',
    amount: Number.isFinite(amount) && amount !== 0 ? String(amount) : '',
    categoryId: Number.isInteger(categoryId) && categoryId > 0 ? categoryId : 0,
    date:
      parsedDate !== null && !Number.isNaN(parsedDate.getTime())
        ? parsedDate
        : null,
    document:
      width > 0 && height > 0 ? { url, width: width, height: height } : null,
  }
}
