import type { BlockValue } from '@/lib/notion/types'
import Link from 'next/link'

interface Props {
  block: BlockValue
  slugMap?: Map<string, string>
}

export default function ChildPage({ block, slugMap }: Props) {
  const title = (block.properties?.title ?? []).map(d => d[0]).join('') || 'Untitled'
  const id = block.id
  const slug = slugMap?.get(id) ?? slugMap?.get(id.replace(/-/g, '')) ?? id.replace(/-/g, '')
  return (
    <Link
      href={`/portal/${slug}`}
      className="my-2 flex items-center gap-2 rounded border border-gray-200 p-3 text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-colors"
    >
      <span>📄</span>
      <span className="font-medium">{title}</span>
    </Link>
  )
}
