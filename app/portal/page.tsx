import { redirect } from 'next/navigation'
import { buildPageTree } from '@/lib/notion/tree'

export const dynamic = 'force-dynamic'

const ROOT_PAGE_ID = process.env.ROOT_PAGE_ID!

export default async function PortalRoot() {
  const tree = await buildPageTree(ROOT_PAGE_ID)
  redirect(`/portal/${tree.root.slug}`)
}
