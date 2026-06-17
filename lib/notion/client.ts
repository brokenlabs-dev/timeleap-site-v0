import type { RecordMap } from './types'

const NOTION_API = 'https://www.notion.so/api/v3'

// Notion's loadPageChunk/syncRecordValues now wrap each block as
// { spaceId, value: { value: <block>, role } }. Older clients (and the rest of
// this codebase) expect the flat { role, value: <block> } shape, so normalize.
function normalizeRecordMap(rm: RecordMap | undefined): RecordMap {
  if (!rm?.block) return rm ?? ({ block: {} } as RecordMap)
  const block: RecordMap['block'] = {}
  for (const [id, entry] of Object.entries(rm.block)) {
    const e = entry as { role?: string; value?: unknown }
    const inner = e?.value as { value?: unknown; role?: string } | undefined
    if (inner && typeof inner === 'object' && 'value' in inner) {
      // new nested shape: { spaceId, value: { value, role } }
      block[id] = { role: inner.role ?? e.role ?? 'reader', value: inner.value } as RecordMap['block'][string]
    } else {
      // already flat: { role, value }
      block[id] = entry
    }
  }
  return { ...rm, block }
}

async function fetchWithRetry(url: string, body: object, retries = 3): Promise<Response> {
  let lastError: Error | null = null
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; TimeLeap-Portal/1.0)',
        },
        body: JSON.stringify(body),
        next: { revalidate: 3600 },
      })
      if (res.ok) return res
      if (res.status === 429) {
        // rate limited
        await new Promise(r => setTimeout(r, 2 ** i * 1000))
        continue
      }
      throw new Error(`Notion API error: ${res.status}`)
    } catch (err) {
      lastError = err as Error
      if (i < retries - 1) await new Promise(r => setTimeout(r, 2 ** i * 1000))
    }
  }
  throw lastError ?? new Error('Failed to fetch from Notion')
}

export async function loadPageChunk(pageId: string, limit = 100): Promise<RecordMap> {
  const res = await fetchWithRetry(`${NOTION_API}/loadPageChunk`, {
    pageId,
    limit,
    cursor: { stack: [] },
    chunkNumber: 0,
    verticalColumns: false,
  })
  const data = await res.json()
  return normalizeRecordMap(data.recordMap as RecordMap)
}

export async function syncRecordValues(blockIds: string[]): Promise<RecordMap> {
  const res = await fetchWithRetry(`${NOTION_API}/syncRecordValues`, {
    requests: blockIds.map(id => ({ id, table: 'block', version: -1 })),
  })
  const data = await res.json()
  return normalizeRecordMap(data.recordMap as RecordMap)
}
