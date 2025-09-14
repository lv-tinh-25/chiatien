'use client'

import { Button } from '@/components/core/atoms/Button'
import { useLanguageToggle } from '@/hooks/forms/useLanguageToggle'
import { Languages } from 'lucide-react'
import { useTranslations } from 'next-intl'

/**
 * No visible label on purpose. A flag or a two-letter code never says whether
 * it names the language you are reading or the one you would get, and the
 * interface around it already answers the first question.
 */
export function LanguageToggle({ className }: { className?: string }) {
  const t = useTranslations('Nav')
  const { targetLabel, pending, switchLanguage } = useLanguageToggle()

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={t('switchLanguage', { language: targetLabel })}
      pending={pending}
      onClick={switchLanguage}
      className={className}
    >
      {/* `Button` supplies the spinner; showing both would crowd a 48px box. */}
      {!pending && <Languages aria-hidden />}
    </Button>
  )
}
