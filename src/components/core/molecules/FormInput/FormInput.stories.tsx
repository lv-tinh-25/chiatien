import { FormInput } from '@/components/core/molecules/FormInput'
import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta<typeof FormInput> = {
  title: 'Molecules/FormInput',
  component: FormInput,
  args: { label: 'Tên nhóm', placeholder: 'Chuyến đi Đà Nẵng' },
}
export default meta

type Story = StoryObj<typeof FormInput>

export const Default: Story = {}
export const WithDescription: Story = {
  args: { description: 'Tên hiển thị cho mọi thành viên trong nhóm.' },
}
export const WithError: Story = { args: { errorKey: 'min2' } }
export const Disabled: Story = { args: { disabled: true } }
