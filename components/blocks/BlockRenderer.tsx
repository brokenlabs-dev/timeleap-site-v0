import type { BlockValue, RecordMap } from '@/lib/notion/types'
import { notionIdToUuid } from '@/lib/slug'
import Heading from './Heading'
import Paragraph from './Paragraph'
import ListItem from './ListItem'
import NotionTable from './NotionTable'
import Callout from './Callout'
import Toggle from './Toggle'
import CodeBlock from './CodeBlock'
import ChildPage from './ChildPage'

interface Props {
  blockId: string
  allBlocks: RecordMap
  slugMap?: Map<string, string>
  depth?: number
}

export default function BlockRenderer({ blockId, allBlocks, slugMap, depth = 0 }: Props) {
  const uuid = notionIdToUuid(blockId)
  const blockEntry = allBlocks.block?.[uuid] ?? allBlocks.block?.[blockId]
  if (!blockEntry?.value) return null

  const block: BlockValue = blockEntry.value
  if (!block.alive && block.alive !== undefined) return null

  const renderChildren = () =>
    block.content?.map(childId => (
      <BlockRenderer
        key={childId}
        blockId={childId}
        allBlocks={allBlocks}
        slugMap={slugMap}
        depth={depth + 1}
      />
    ))

  switch (block.type) {
    case 'page':
      // Only render root page children (not sub-pages inline)
      if (depth === 0) return <>{renderChildren()}</>
      return null

    case 'header':
    case 'sub_header':
    case 'sub_sub_header':
      return <Heading block={block} slugMap={slugMap} />

    case 'text':
      return <Paragraph block={block} slugMap={slugMap} />

    case 'bulleted_list':
      return <ListItem block={block} allBlocks={allBlocks} slugMap={slugMap} ordered={false} />

    case 'numbered_list':
      return <ListItem block={block} allBlocks={allBlocks} slugMap={slugMap} ordered={true} />

    case 'table':
      return <NotionTable block={block} allBlocks={allBlocks} slugMap={slugMap} />

    case 'table_row':
      // rendered by NotionTable, skip standalone
      return null

    case 'callout':
      return <Callout block={block} allBlocks={allBlocks} slugMap={slugMap} />

    case 'toggle':
      return <Toggle block={block} allBlocks={allBlocks} slugMap={slugMap} />

    case 'code':
      return <CodeBlock block={block} />

    case 'child_page':
      return <ChildPage block={block} slugMap={slugMap} />

    case 'divider':
      return <hr className="my-6 border-gray-200" />

    case 'quote':
      return (
        <blockquote className="my-4 border-l-4 border-blue-400 pl-4 italic text-gray-600">
          <Paragraph block={block} slugMap={slugMap} />
        </blockquote>
      )

    case 'to_do': {
      const checked = block.properties?.checked?.[0]?.[0] === 'Yes'
      const richText = block.properties?.title ?? []
      return (
        <div className="my-1 flex items-start gap-2">
          <input type="checkbox" checked={checked} readOnly className="mt-1" />
          <span className={checked ? 'line-through text-gray-400' : 'text-gray-700'}>
            {richText.map(d => d[0]).join('')}
          </span>
        </div>
      )
    }

    case 'image':
      return (
        <div className="my-4 text-center">
          <span className="text-sm text-gray-400 italic">[image]</span>
        </div>
      )

    default:
      return (
        <div className="my-2 rounded border border-dashed border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-400 font-mono">
          [unsupported: {block.type}]
        </div>
      )
  }
}
