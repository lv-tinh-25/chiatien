import { ToastCard } from '@/components/core/molecules/Toast/ToastCard'
import * as ToastPrimitive from '@radix-ui/react-toast'
import type { Meta, StoryObj } from '@storybook/react'
import { Trash2 } from 'lucide-react'

const meta: Meta<typeof ToastCard> = {
  title: 'Molecules/Toast',
  component: ToastCard,
  args: { title: 'Đã lưu khoản chi' },
  decorators: [
    (Story) => (
      <ToastPrimitive.Provider>
        <div className="w-96">
          <Story />
        </div>
      </ToastPrimitive.Provider>
    ),
  ],
}
export default meta

type Story = StoryObj<typeof ToastCard>

export const Neutral: Story = {
  args: { title: 'Nhóm đã loại bỏ' },
}

export const WithDescription: Story = {
  args: {
    title: 'Nhóm đã loại bỏ',
    description: 'Nhóm đã loại bỏ khỏi danh sách nhóm gần đây của bạn.',
  },
}

export const Success: Story = {
  args: { variant: 'success' },
}

export const SuccessWithAction: Story = {
  args: {
    variant: 'success',
    title: 'Đã xoá khoản chi',
    description: 'Taxi sân bay · 180.000 ₫',
    icon: Trash2,
    action: {
      label: 'Hoàn tác',
      altLabel: 'Hoàn tác việc xoá',
      onAction: () => {},
    },
  },
}

export const Warning: Story = {
  args: {
    variant: 'warning',
    title: 'Ảnh quá lớn',
    description: 'Tối đa 5 MB, ảnh bạn chọn nặng 12 MB.',
  },
}

export const Error: Story = {
  args: {
    variant: 'error',
    title: 'Không lưu được khoản chi',
    description: 'Máy chủ không phản hồi. Dữ liệu bạn nhập vẫn được giữ lại.',
    action: { label: 'Thử lại', altLabel: 'Thử lại', onAction: () => {} },
  },
}
