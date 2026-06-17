import type { BlockValue } from '@/lib/notion/types'
import RichText from './RichText'

interface Props {
  block: BlockValue
  slugMap?: Map<string, string>
}

const levelMap: Record<string, 'h1' | 'h2' | 'h3'> = {
  header: 'h1',
  sub_header: 'h2',
  sub_sub_header: 'h3',
}

const classMap: Record<string, string> = {
  header: 'text-3xl font-bold mt-8 mb-4 text-gray-900',
  sub_header: 'text-2xl font-semibold mt-6 mb-3 text-gray-900',
  sub_sub_header: 'text-xl font-semibold mt-5 mb-2 text-gray-800',
}

export default function Heading({ block, slugMap }: Props) {
  const Tag = levelMap[block.type] ?? 'h2'
  const className = classMap[block.type] ?? 'text-xl font-semibold mt-5 mb-2'
  const richText = block.properties?.title ?? []
  return (
    <Tag className={className}>
      <RichText richText={richText} slugMap={slugMap} />
    </Tag>
  )
}
