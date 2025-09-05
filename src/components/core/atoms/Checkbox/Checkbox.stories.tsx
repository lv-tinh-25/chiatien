import { Checkbox } from '@/components/core/atoms/Checkbox'
import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta<typeof Checkbox> = {
  title: 'Atoms/Checkbox',
  component: Checkbox,
}
export default meta

type Story = StoryObj<typeof Checkbox>

export const Unchecked: Story = {}
export const Checked: Story = { args: { defaultChecked: true } }
export const Disabled: Story = { args: { disabled: true } }
