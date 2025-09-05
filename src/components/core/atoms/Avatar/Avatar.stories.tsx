import { Avatar } from '@/components/core/atoms/Avatar'
import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta<typeof Avatar> = {
  title: 'Atoms/Avatar',
  component: Avatar,
  args: { name: 'Nguyễn Văn Nam' },
}
export default meta

type Story = StoryObj<typeof Avatar>

export const Default: Story = {}
export const SingleWord: Story = { args: { name: 'Nam' } }
export const WithStackedDiacritics: Story = { args: { name: 'Đức Minh' } }
export const Small: Story = { args: { size: 'sm' } }
export const Large: Story = { args: { size: 'lg' } }
export const Row: Story = {
  render: () => (
    <div className="flex gap-2">
      {['Nguyễn Văn Nam', 'Linh Trần', 'Hoàng Huy', 'Thảo My', 'Tuấn Anh'].map(
        (name) => (
          <Avatar key={name} name={name} />
        ),
      )}
    </div>
  ),
}
