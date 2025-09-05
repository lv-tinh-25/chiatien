import { Select } from '@/components/core/molecules/Select'
import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'

const meta: Meta<typeof Select> = { title: 'Molecules/Select', component: Select }
export default meta

type Story = StoryObj<typeof Select>

const OPTIONS = [
  { value: 'evenly', label: 'Chia đều' },
  { value: 'shares', label: 'Theo phần' },
  { value: 'percentage', label: 'Theo phần trăm' },
  { value: 'amount', label: 'Theo số tiền' },
]

function ControlledSelect() {
  const [value, setValue] = useState('evenly')
  return (
    <div className="w-72">
      <Select value={value} onValueChange={setValue} options={OPTIONS} />
    </div>
  )
}

export const Default: Story = { render: () => <ControlledSelect /> }
