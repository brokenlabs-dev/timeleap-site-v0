import { loadPageChunk } from './client'
import type { BlockValue, PageTree, PageTreeNode, RecordMap } from './types'
import { titleToSlug, notionIdToUuid } from '../slug'

function getTitle(block: BlockValue): string {
  const titleParts = block.properties?.title ?? []
  return titleParts.map(d => d[0]).join('').trim()
}

function mergeRecordMaps(base: RecordMap, addition: RecordMap): RecordMap {
  return {
    ...base,
    block: { ...base.block, ...(addition.block ?? {}) },
  }
}

async function fetchAllBlocks(pageId: string): Promise<RecordMap> {
  const rm = await loadPageChunk(pageId)
  const block = rm.block?.[pageId]?.value
  if (!block?.content?.length) return rm

  // Fetch any referenced child pages we haven't loaded yet
  const childPageIds = block.content.filter(id => {
    const child = rm.block?.[id]?.value
    return child?.type === 'child_page' || child?.type === 'page'
  })

  let merged = rm
  for (const childId of childPageIds) {
    const childBlock = merged.block?.[childId]?.value
    if (!childBlock) {
      const childRm = await loadPageChunk(notionIdToUuid(childId))
      merged = mergeRecordMaps(merged, childRm)
    }
  }
  return merged
}

export async function buildPageTree(rootId: string): Promise<PageTree> {
  const byId = new Map<string, PageTreeNode>()
  const bySlug = new Map<string, PageTreeNode>()
  const slugMap = new Map<string, string>()
  const usedSlugs = new Set<string>()

  async function processPage(
    pageId: string,
    depth: number,
    allBlocks: RecordMap
  ): Promise<PageTreeNode | null> {
    const uuid = notionIdToUuid(pageId)
    const blockEntry = allBlocks.block?.[uuid] ?? allBlocks.block?.[pageId]
    if (!blockEntry?.value) return null

    const block = blockEntry.value
    const rawTitle = getTitle(block)
    const title = rawTitle || 'Untitled'

    let slug = titleToSlug(title)
    if (!slug) slug = pageId.replace(/-/g, '').slice(0, 12)
    // deduplicate slugs
    if (usedSlugs.has(slug)) {
      slug = `${slug}-${pageId.replace(/-/g, '').slice(0, 6)}`
    }
    usedSlugs.add(slug)

    const node: PageTreeNode = { id: uuid, title, slug, depth, children: [] }
    byId.set(uuid, node)
    byId.set(pageId, node)
    bySlug.set(slug, node)
    slugMap.set(uuid, slug)
    slugMap.set(pageId, slug)

    if (block.content?.length) {
      for (const childId of block.content) {
        const childUuid = notionIdToUuid(childId)
        const childBlock =
          allBlocks.block?.[childUuid]?.value ?? allBlocks.block?.[childId]?.value
        if (!childBlock) continue

        if (childBlock.type === 'child_page' || childBlock.type === 'page') {
          // Fetch child page content if not already loaded
          if (!allBlocks.block?.[childUuid]?.value?.content) {
            try {
              const childRm = await loadPageChunk(childUuid)
              allBlocks = mergeRecordMaps(allBlocks, childRm)
            } catch {
              // skip unreachable pages
            }
          }
          const childNode = await processPage(childId, depth + 1, allBlocks)
          if (childNode) node.children.push(childNode)
        }
      }
    }
    return node
  }

  const rootRm = await loadPageChunk(rootId)
  const root = await processPage(rootId, 0, rootRm)

  if (!root) throw new Error(`Could not build page tree from root: ${rootId}`)

  return { root, byId, bySlug, slugMap }
}

export async function getPageBlocks(pageId: string): Promise<RecordMap> {
  return fetchAllBlocks(notionIdToUuid(pageId))
}
