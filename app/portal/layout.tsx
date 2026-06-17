import { buildPageTree } from '@/lib/notion/tree'
import Sidebar from '@/components/Sidebar'

export const dynamic = 'force-dynamic'

const ROOT_PAGE_ID = process.env.ROOT_PAGE_ID!

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  let tree
  try {
    tree = await buildPageTree(ROOT_PAGE_ID)
  } catch {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Could not load portal content. Check ROOT_PAGE_ID and Notion access.</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-white">
      <Sidebar tree={tree.root} />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}
