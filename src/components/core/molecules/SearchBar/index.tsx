'use client'

import { Input } from '@/components/core/atoms/Input'
import { Search, X } from 'lucide-react'
import { useState } from 'react'

type SearchBarProps = {
  label: string
  placeholder: string
  clearLabel: string
  onValueChange: (value: string) => void
}

export function SearchBar({
  label,
  placeholder,
  clearLabel,
  onValueChange,
}: SearchBarProps) {
  const [value, setValue] = useState('')

  const update = (next: string) => {
    setValue(next)
    onValueChange(next)
  }

  return (
    <div className="relative">
      <Search
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        type="search"
        role="searchbox"
        aria-label={label}
        placeholder={placeholder}
        value={value}
        onChange={(event) => update(event.target.value)}
        className="pl-9"
      />
      {value !== '' && (
        <button
          type="button"
          aria-label={clearLabel}
          onClick={() => update('')}
          className="absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-foreground/8"
        >
          <X className="size-4" aria-hidden />
        </button>
      )}
    </div>
  )
}
