import { SaveRecentGroup } from '@/app/groups/[groupId]/save-recent-group'
import type { ReactNode } from 'react'

export default async function GroupLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ groupId: string }>
}) {
  const { groupId } = await params

  return (
    <>
      <SaveRecentGroup groupId={groupId} />
      {children}
    </>
  )
}
