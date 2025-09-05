import { Money } from '@/components/core/atoms/Money'
import type { Currency } from '@/lib/currency'
import type { Meta, StoryObj } from '@storybook/react'

const VND: Currency = {
  name: 'Đồng Việt Nam',
  symbol_native: '₫',
  symbol: '₫',
  code: 'VND',
  name_plural: 'Vietnamese dong',
  rounding: 0,
  decimal_digits: 0,
}

const meta: Meta<typeof Money> = {
  title: 'Atoms/Money',
  component: Money,
  args: { amount: 1250000, currency: VND, locale: 'vi' },
}
export default meta

type Story = StoryObj<typeof Money>

export const Neutral: Story = {}
export const Credit: Story = { args: { tone: 'credit' } }
export const Debit: Story = { args: { amount: -320000, tone: 'debit' } }
export const Column: Story = {
  render: (args) => (
    <div className="flex flex-col items-end">
      {[1250000, 980000, 45000, 7500000].map((amount) => (
        <Money key={amount} {...args} amount={amount} />
      ))}
    </div>
  ),
}
