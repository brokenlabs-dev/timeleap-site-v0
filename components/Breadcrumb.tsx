'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { PageTree } from '@/lib/notion/types'

interface Props {
  tree: PageTree
}

function buildCrumbs(tree: PageTree, slug: string) {
  const node = tree.bySlug.get(slug)
  if (!node) return []

  const crumbs: { title: string; slug: string }[] = []
  let current: typeof node | undefined = node

  while (current) {
    crumbs.unshift({ title: current.title, slug: current.slug })
    // find parent by checking byId map for parent_id
    // Since PageTreeNode doesn't store parent ref, we search
    let found = false
    for (const [, n] of tree.byId) {
      if (n.children.some(c => c.id === current!.id)) {
        current = n
        found = true
        break
      }
    }
    if (!found) break
  }

  return crumbs
}

export default function Breadcrumb({ tree }: Props) {
  const pathname = usePathname()
  const slug = pathname.replace('/portal/', '').replace('/portal', '')
  const crumbs = buildCrumbs(tree, slug)

  if (crumbs.length <= 1) return null

  return (
    <nav className="flex items-center gap-1 text-sm text-gray-500 mb-4 flex-wrap">
      <Link href="/portal" className="hover:text-gray-700">Home</Link>
      {crumbs.map((crumb, i) => (
        <span key={crumb.slug} className="flex items-center gap-1">
          <span>/</span>
          {i === crumbs.length - 1 ? (
            <span className="text-gray-900 font-medium">{crumb.title}</span>
          ) : (
            <Link href={`/portal/${crumb.slug}`} className="hover:text-gray-700">
              {crumb.title}
            </Link>
          )}
        </span>
      ))}
    </nav>
  )
}
