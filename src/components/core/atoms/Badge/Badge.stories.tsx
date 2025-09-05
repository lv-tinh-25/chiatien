import { Badge } from '@/components/core/atoms/Badge'
import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta<typeof Badge> = {
  title: 'Atoms/Badge',
  component: Badge,
  args: { children: 'Ăn uống' },
}
export default meta

type Story = StoryObj<typeof Badge>

export const Neutral: Story = {}
export const Credit: Story = { args: { tone: 'credit', children: 'Đã trả' } }
export const Debit: Story = { args: { tone: 'debit', children: 'Chưa trả' } }
export const Pending: Story = {
  args: { tone: 'pending', children: 'Chờ xác nhận' },
}
