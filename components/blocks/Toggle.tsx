import type { BlockValue, RecordMap } from '@/lib/notion/types'
import RichText from './RichText'
import BlockRenderer from './BlockRenderer'

interface Props {
  block: BlockValue
  allBlocks: RecordMap
  slugMap?: Map<string, string>
}

export default function Toggle({ block, allBlocks, slugMap }: Props) {
  const richText = block.properties?.title ?? []
  return (
    <details className="my-2 rounded border border-gray-200 bg-white">
      <summary className="cursor-pointer select-none p-3 font-medium text-gray-800 hover:bg-gray-50 list-none flex items-center gap-2">
        <span className="text-gray-400 text-sm">▶</span>
        <RichText richText={richText} slugMap={slugMap} />
      </summary>
      {block.content?.length ? (
        <div className="px-6 pb-3 pt-1 border-t border-gray-100">
          {block.content.map(childId => (
            <BlockRenderer key={childId} blockId={childId} allBlocks={allBlocks} slugMap={slugMap} />
          ))}
        </div>
      ) : null}
    </details>
  )
}
