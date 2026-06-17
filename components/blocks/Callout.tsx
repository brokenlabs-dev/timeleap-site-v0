import type { BlockValue, RecordMap } from '@/lib/notion/types'
import RichText from './RichText'
import BlockRenderer from './BlockRenderer'

interface Props {
  block: BlockValue
  allBlocks: RecordMap
  slugMap?: Map<string, string>
}

const colorMap: Record<string, string> = {
  gray_background: 'bg-gray-100 border-gray-300',
  brown_background: 'bg-amber-50 border-amber-200',
  orange_background: 'bg-orange-50 border-orange-200',
  yellow_background: 'bg-yellow-50 border-yellow-200',
  green_background: 'bg-green-50 border-green-200',
  blue_background: 'bg-blue-50 border-blue-200',
  purple_background: 'bg-purple-50 border-purple-200',
  pink_background: 'bg-pink-50 border-pink-200',
  red_background: 'bg-red-50 border-red-200',
  default: 'bg-gray-50 border-gray-200',
}

export default function Callout({ block, allBlocks, slugMap }: Props) {
  const icon = block.format?.page_icon ?? block.properties?.icon?.[0]?.[0] ?? '💡'
  const color = block.format?.block_color ?? 'default'
  const colorClass = colorMap[color] ?? colorMap.default
  const richText = block.properties?.title ?? []

  return (
    <div className={`my-4 flex gap-3 rounded-lg border p-4 ${colorClass}`}>
      <span className="text-xl shrink-0">{icon}</span>
      <div className="flex-1">
        <p className="leading-7 text-gray-700">
          <RichText richText={richText} slugMap={slugMap} />
        </p>
        {block.content?.map(childId => (
          <BlockRenderer key={childId} blockId={childId} allBlocks={allBlocks} slugMap={slugMap} />
        ))}
      </div>
    </div>
  )
}
