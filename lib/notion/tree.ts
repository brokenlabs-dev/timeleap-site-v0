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
  const visited = new Set<string>()

  // Collect descendant child-page ids, descending through container blocks
  // (callout, toggle, columns, …) but NOT into the pages themselves. Notion
  // nests sub-pages inside layout blocks, so a flat scan of direct children
  // misses them.
  function collectChildPageIds(content: string[], allBlocks: RecordMap): string[] {
    const found: string[] = []
    const stack = [...content]
    while (stack.length) {
      const id = stack.shift()!
      const uuid = notionIdToUuid(id)
      const b = allBlocks.block?.[uuid]?.value ?? allBlocks.block?.[id]?.value
      if (!b) continue
      if (b.type === 'page' || b.type === 'child_page') {
        found.push(id)
        // stop here — the sub-page's own content is handled when it's processed
      } else if (b.content?.length) {
        stack.push(...b.content)
      }
    }
    return found
  }

  async function processPage(
    pageId: string,
    depth: number,
    allBlocks: RecordMap
  ): Promise<PageTreeNode | null> {
    const uuid = notionIdToUuid(pageId)
    if (visited.has(uuid)) return null
    visited.add(uuid)

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
      const childPageIds = collectChildPageIds(block.content, allBlocks)
      for (const childId of childPageIds) {
        const childUuid = notionIdToUuid(childId)
        // A sub-page block carries a `content` array (its child ids) but those
        // child blocks aren't in this record map — fetch the page's own chunk
        // so we can read its title and discover *its* nested sub-pages.
        try {
          const childRm = await loadPageChunk(childUuid)
          allBlocks = mergeRecordMaps(allBlocks, childRm)
        } catch {
          // skip unreachable pages
        }
        const childNode = await processPage(childId, depth + 1, allBlocks)
        if (childNode) node.children.push(childNode)
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
