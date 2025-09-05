'use client'

import { Button } from '@/components/core/atoms/Button'
import { Card, CardContent } from '@/components/core/atoms/Card'
import { FormInput } from '@/components/core/molecules/FormInput'
import { QrScanner } from '@/components/core/templates/GroupList/QrScanner'
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
  const [mode, setMode] = useState<'url' | 'qr'>('url')

  const add = async (candidate: string) => {
    const groupId = groupIdFromUrl(candidate)
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
      <CardContent className="flex flex-col gap-3 p-4">
        <div role="tablist" className="flex gap-1">
          {(['url', 'qr'] as const).map((candidate) => (
            <Button
              key={candidate}
              type="button"
              role="tab"
              aria-selected={mode === candidate}
              variant={mode === candidate ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => {
                setMode(candidate)
                setFailed(false)
              }}
            >
              {t(candidate === 'url' ? 'urlMode' : 'qrMode')}
            </Button>
          ))}
        </div>

        <form
          hidden={mode !== 'url'}
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
          onSubmit={(event) => {
            event.preventDefault()
            void add(value)
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

        {mode === 'qr' && <QrScanner onScan={(text) => void add(text)} />}

        {failed && (
          <p role="alert" className="text-body-sm text-destructive">
            {t('error')}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
