import { FormTextarea } from '@/components/core/molecules/FormTextarea'
import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta<typeof FormTextarea> = {
  title: 'Molecules/FormTextarea',
  component: FormTextarea,
  args: { label: 'Thông tin nhóm' },
}
export default meta

type Story = StoryObj<typeof FormTextarea>

export const Default: Story = {}
export const WithError: Story = { args: { errorKey: 'max50' } }
