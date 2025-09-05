import { Button } from '@/components/core/atoms/Button'
import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta<typeof Button> = {
  title: 'Atoms/Button',
  component: Button,
  args: { children: 'Thêm khoản chi' },
}
export default meta

type Story = StoryObj<typeof Button>

export const Primary: Story = {}
export const Secondary: Story = { args: { variant: 'secondary' } }
export const Outline: Story = { args: { variant: 'outline' } }
export const Ghost: Story = { args: { variant: 'ghost' } }
export const Settle: Story = { args: { variant: 'settle', children: 'Trả hết' } }
export const Destructive: Story = { args: { variant: 'destructive', children: 'Xoá' } }
export const Disabled: Story = { args: { disabled: true } }
export const Small: Story = { args: { size: 'sm' } }
export const Large: Story = { args: { size: 'lg' } }
