import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/core/atoms/Card'
import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta<typeof Card> = { title: 'Atoms/Card', component: Card }
export default meta

type Story = StoryObj<typeof Card>

export const Default: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Chuyến đi Đà Nẵng</CardTitle>
        <CardDescription>6 thành viên · hoạt động 10 phút trước</CardDescription>
      </CardHeader>
      <CardContent className="text-body-md">Tổng chi 5.190.000₫</CardContent>
    </Card>
  ),
}
