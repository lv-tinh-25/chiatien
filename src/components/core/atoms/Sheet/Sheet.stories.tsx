import { Button } from '@/components/core/atoms/Button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/core/atoms/Sheet'
import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta<typeof Sheet> = { title: 'Atoms/Sheet', component: Sheet }
export default meta

type Story = StoryObj<typeof Sheet>

export const Default: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Mở tuỳ chọn</Button>
      </SheetTrigger>
      <SheetContent className="p-4">
        <SheetTitle className="text-headline-md">Tuỳ chọn nhóm</SheetTitle>
        <SheetDescription className="text-body-md text-muted-foreground">
          Thông tin, sửa nhóm, chia sẻ và xuất dữ liệu.
        </SheetDescription>
      </SheetContent>
    </Sheet>
  ),
}
