'use client'

import { Button } from '@/components/core/atoms/Button'
import { Card, CardContent } from '@/components/core/atoms/Card'
import { FormInput } from '@/components/core/molecules/FormInput'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

/**
 * Accepts anything that contains a group id — a full share URL, a path, or the
 * bare id — because people paste all three.
 */
function groupIdFromUrl(value: string): string | null {
  const trimmed = value.trim()
  if (trimmed === '') return null
  const fromPath = /\/groups\/([^/?#]+)/.exec(trimmed)
  if (fromPath) return fromPath[1]
  return /^[A-Za-z0-9_-]+$/.test(trimmed) ? trimmed : null
}

export function AddGroupByUrl({
  onAdd,
}: {
  onAdd: (groupId: string) => Promise<boolean>
}) {
  const t = useTranslations('Groups.AddByURL')
  const [value, setValue] = useState('')
  const [failed, setFailed] = useState(false)

  const submit = async () => {
    const groupId = groupIdFromUrl(value)
    if (groupId === null) {
      setFailed(true)
      return
    }
    const added = await onAdd(groupId)
    setFailed(!added)
    if (added) setValue('')
  }

  return (
    <Card>
      <CardContent className="p-4">
        <form
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
          onSubmit={(event) => {
            event.preventDefault()
            void submit()
          }}
        >
          <FormInput
            name="groupUrl"
            label={t('title')}
            description={t('description')}
            placeholder="https://…/groups/…"
            fieldClassName="flex-1"
            value={value}
            onChange={(event) => {
              setValue(event.target.value)
              setFailed(false)
            }}
          />
          <Button type="submit" variant="outline" className="sm:mb-8">
            {t('button')}
          </Button>
        </form>
        {failed && (
          <p role="alert" className="mt-2 text-body-sm text-destructive">
            {t('error')}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
