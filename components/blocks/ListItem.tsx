import type { BlockValue, RecordMap } from '@/lib/notion/types'
import RichText from './RichText'
import BlockRenderer from './BlockRenderer'

interface Props {
  block: BlockValue
  allBlocks: RecordMap
  slugMap?: Map<string, string>
  ordered?: boolean
}

export default function ListItem({ block, allBlocks, slugMap, ordered }: Props) {
  const richText = block.properties?.title ?? []
  const Tag = ordered ? 'ol' : 'ul'
  const itemClass = ordered
    ? 'list-decimal list-inside my-1 leading-7 text-gray-700'
    : 'list-disc list-inside my-1 leading-7 text-gray-700'

  return (
    <Tag className="my-1 pl-4">
      <li className={itemClass}>
        <RichText richText={richText} slugMap={slugMap} />
        {block.content?.length ? (
          <div className="pl-4">
            {block.content.map(childId => (
              <BlockRenderer
                key={childId}
                blockId={childId}
                allBlocks={allBlocks}
                slugMap={slugMap}
              />
            ))}
          </div>
        ) : null}
      </li>
    </Tag>
  )
}
