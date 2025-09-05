import { Input } from '@/components/core/atoms/Input'
import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta<typeof Input> = {
  title: 'Atoms/Input',
  component: Input,
  args: { placeholder: 'Tìm kiếm khoản chi, người trả…' },
}
export default meta

type Story = StoryObj<typeof Input>

export const Default: Story = {}
export const Filled: Story = { args: { defaultValue: 'Bánh xèo Bà Dưỡng' } }
export const Disabled: Story = { args: { disabled: true } }
