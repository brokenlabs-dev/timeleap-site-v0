import type { BlockValue, RecordMap } from '@/lib/notion/types'
import RichText from './RichText'

interface Props {
  block: BlockValue
  allBlocks: RecordMap
  slugMap?: Map<string, string>
}

export default function NotionTable({ block, allBlocks, slugMap }: Props) {
  const hasColumnHeader = block.format?.has_column_header ?? false
  const rowIds = block.content ?? []

  const rows = rowIds.map(id => {
    const rowBlock = allBlocks.block?.[id]?.value
    return rowBlock
  }).filter(Boolean) as BlockValue[]

  if (!rows.length) return null

  const columnOrder = block.format?.table_block_column_order ?? []

  return (
    <div className="my-4 overflow-x-auto">
      <table className="min-w-full border-collapse border border-gray-300 text-sm">
        <tbody>
          {rows.map((row, rowIdx) => {
            const isHeader = hasColumnHeader && rowIdx === 0
            const CellTag = isHeader ? 'th' : 'td'
            const cells = columnOrder.length > 0
              ? columnOrder.map(colId => row.properties?.[colId] ?? [])
              : Object.values(row.properties ?? {})

            return (
              <tr
                key={row.id}
                className={isHeader ? 'bg-gray-100 font-semibold' : 'hover:bg-gray-50'}
              >
                {cells.map((cellText, cellIdx) => (
                  <CellTag
                    key={cellIdx}
                    className="border border-gray-300 px-3 py-2 text-left align-top text-gray-700"
                  >
                    <RichText richText={cellText as []} slugMap={slugMap} />
                  </CellTag>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
