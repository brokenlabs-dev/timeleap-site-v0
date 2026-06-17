'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import type { PageTreeNode } from '@/lib/notion/types'
import { theme } from '@/theme/config'

interface Props {
  tree: PageTreeNode
}

function NavNode({ node, depth }: { node: PageTreeNode; depth: number }) {
  const pathname = usePathname()
  const isActive = pathname === `/portal/${node.slug}`
  const [expanded, setExpanded] = useState(true)

  return (
    <li>
      <div className="flex items-center">
        {node.children.length > 0 && (
          <button
            onClick={() => setExpanded(e => !e)}
            className="mr-1 text-gray-400 hover:text-gray-600 text-xs w-4"
            aria-label={expanded ? 'collapse' : 'expand'}
          >
            {expanded ? '▾' : '▸'}
          </button>
        )}
        {node.children.length === 0 && <span className="mr-1 w-4" />}
        <Link
          href={`/portal/${node.slug}`}
          className={`flex-1 truncate rounded px-2 py-1 text-sm transition-colors ${
            isActive
              ? 'bg-blue-50 text-blue-700 font-medium'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
          style={{ paddingLeft: `${(depth * 12) + 8}px` }}
        >
          {node.title}
        </Link>
      </div>
      {expanded && node.children.length > 0 && (
        <ul>
          {node.children.map(child => (
            <NavNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  )
}

export default function Sidebar({ tree }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const nav = (
    <nav className="flex flex-col h-full">
      <div className="flex items-center gap-2 border-b border-gray-200 px-4 py-4 mb-2">
        <Link href="/portal" className="font-bold text-gray-900 text-lg tracking-tight">
          {theme.siteName}
        </Link>
        <span className="text-xs text-gray-400 hidden sm:block">{theme.siteTagline}</span>
      </div>
      <ul className="flex-1 overflow-y-auto px-2 pb-4 space-y-0.5">
        <NavNode node={tree} depth={0} />
      </ul>
      <div className="border-t border-gray-100 px-4 py-3 text-xs text-gray-400">
        {theme.footerLine}
      </div>
    </nav>
  )

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className="fixed top-3 left-3 z-50 rounded bg-white border border-gray-200 shadow p-2 md:hidden"
        onClick={() => setMobileOpen(o => !o)}
        aria-label="Toggle navigation"
      >
        <span className="block w-5 h-0.5 bg-gray-600 mb-1" />
        <span className="block w-5 h-0.5 bg-gray-600 mb-1" />
        <span className="block w-5 h-0.5 bg-gray-600" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full w-64 bg-white border-r border-gray-200 shadow-sm transition-transform duration-200
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:z-auto md:shadow-none`}
      >
        {nav}
      </aside>
    </>
  )
}
