import { CurrencySelect } from '@/components/core/molecules/CurrencySelect'
import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'

const meta: Meta<typeof CurrencySelect> = {
  title: 'Molecules/CurrencySelect',
  component: CurrencySelect,
}
export default meta

type Story = StoryObj<typeof CurrencySelect>

function ControlledCurrencySelect() {
  const [value, setValue] = useState('VND')
  return (
    <div className="w-72">
      <CurrencySelect value={value} onValueChange={setValue} locale="vi" />
    </div>
  )
}

export const Vietnamese: Story = { render: () => <ControlledCurrencySelect /> }
