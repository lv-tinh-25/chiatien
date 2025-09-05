import { Input } from '@/components/core/atoms/Input'
import { FormField } from '@/components/core/molecules/FormField'
import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta<typeof FormField> = {
  title: 'Molecules/FormField',
  component: FormField,
}
export default meta

type Story = StoryObj<typeof FormField>

export const Default: Story = {
  render: () => (
    <div className="w-72">
      <FormField label="Ký hiệu tiền tệ" description="Ví dụ: ₫, $, €">
        {({ id }) => <Input id={id} defaultValue="₫" />}
      </FormField>
    </div>
  ),
}
