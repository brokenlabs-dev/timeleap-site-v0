import type { RecordMap } from './types'

const NOTION_API = 'https://www.notion.so/api/v3'

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
  return data.recordMap as RecordMap
}

export async function syncRecordValues(blockIds: string[]): Promise<RecordMap> {
  const res = await fetchWithRetry(`${NOTION_API}/syncRecordValues`, {
    requests: blockIds.map(id => ({ id, table: 'block', version: -1 })),
  })
  const data = await res.json()
  return data.recordMap as RecordMap
}
