import type { BlockValue } from '@/lib/notion/types'
import RichText from './RichText'

interface Props {
  block: BlockValue
  slugMap?: Map<string, string>
}

export default function Paragraph({ block, slugMap }: Props) {
  const richText = block.properties?.title ?? []
  if (!richText.length) return <div className="my-2 h-4" />
  return (
    <p className="my-3 leading-7 text-gray-700">
      <RichText richText={richText} slugMap={slugMap} />
    </p>
  )
}
