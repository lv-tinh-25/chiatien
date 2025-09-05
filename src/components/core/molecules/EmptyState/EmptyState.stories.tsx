import { Button } from '@/components/core/atoms/Button'
import { EmptyState } from '@/components/core/molecules/EmptyState'
import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta<typeof EmptyState> = {
  title: 'Molecules/EmptyState',
  component: EmptyState,
  args: { title: 'Chưa có nhóm nào' },
}
export default meta

type Story = StoryObj<typeof EmptyState>

export const TitleOnly: Story = {}
export const WithDescription: Story = {
  args: { description: 'Bạn chưa mở nhóm nào gần đây.' },
}
export const WithAction: Story = {
  args: {
    description: 'Bạn chưa mở nhóm nào gần đây.',
    action: <Button>Tạo nhóm</Button>,
  },
}
