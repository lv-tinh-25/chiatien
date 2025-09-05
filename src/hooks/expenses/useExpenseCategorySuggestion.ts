'use client'

import { extractCategoryFromTitle } from '@/lib/category-extract'
import { useState } from 'react'

/**
 * Asks the model to guess a category from the expense title. Failure is
 * deliberately silent: a wrong or missing guess must never stop someone
 * recording an expense.
 */
export function useExpenseCategorySuggestion(
  enabled: boolean,
  onSuggestion: (categoryId: number) => void,
) {
  const [isLoading, setLoading] = useState(false)

  const suggest = async (title: string) => {
    if (!enabled || title.length < 3) return
    setLoading(true)
    try {
      const { categoryId } = await extractCategoryFromTitle(title)
      onSuggestion(categoryId)
    } catch {
      // Nothing to show the user: the category stays whatever they picked.
    } finally {
      setLoading(false)
    }
  }

  return { suggest, isLoading }
}
