import type { Decoration, RichText as RichTextType } from '@/lib/notion/types'

interface Props {
  richText: RichTextType
  slugMap?: Map<string, string>
}

function getDecorationValue(formats: ([string] | [string, string])[], key: string): string | null {
  for (const f of formats) {
    if (f[0] === key) return f[1] ?? null
  }
  return null
}

function hasDecoration(formats: ([string] | [string, string])[], key: string): boolean {
  return formats.some(f => f[0] === key)
}

function notionIdToSlug(id: string, slugMap?: Map<string, string>): string {
  if (!slugMap) return id
  const uuid = id.length === 32
    ? [id.slice(0,8),id.slice(8,12),id.slice(12,16),id.slice(16,20),id.slice(20)].join('-')
    : id
  return slugMap.get(uuid) ?? slugMap.get(id) ?? id
}

function renderDecoration(dec: Decoration, idx: number, slugMap?: Map<string, string>): React.ReactNode {
  const text = dec[0]
  const formats = (dec[1] as ([string] | [string, string])[]) ?? []

  let node: React.ReactNode = text

  if (hasDecoration(formats, 'b')) node = <strong key={`b-${idx}`}>{node}</strong>
  if (hasDecoration(formats, 'i')) node = <em key={`i-${idx}`}>{node}</em>
  if (hasDecoration(formats, 's')) node = <s key={`s-${idx}`}>{node}</s>
  if (hasDecoration(formats, '_')) node = <u key={`u-${idx}`}>{node}</u>
  if (hasDecoration(formats, 'c')) node = <code key={`c-${idx}`} className="bg-gray-100 text-rose-600 rounded px-1 py-0.5 text-sm font-mono">{node}</code>

  const linkUrl = getDecorationValue(formats, 'a')
  if (linkUrl) {
    const isNotion = linkUrl.includes('notion.so') || linkUrl.startsWith('/')
    const pageIdMatch = linkUrl.match(/([0-9a-f]{32}|[0-9a-f-]{36})/)
    if (isNotion && pageIdMatch) {
      const slug = notionIdToSlug(pageIdMatch[1], slugMap)
      node = <a key={`a-${idx}`} href={`/portal/${slug}`} className="text-blue-600 hover:underline">{node}</a>
    } else {
      node = <a key={`a-${idx}`} href={linkUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{node}</a>
    }
  }

  const pageRef = getDecorationValue(formats, 'p')
  if (pageRef) {
    const slug = notionIdToSlug(pageRef, slugMap)
    node = <a key={`p-${idx}`} href={`/portal/${slug}`} className="text-blue-600 hover:underline">{node}</a>
  }

  return <span key={idx}>{node}</span>
}

export default function RichText({ richText, slugMap }: Props) {
  if (!richText?.length) return null
  return (
    <>
      {richText.map((dec, i) => renderDecoration(dec, i, slugMap))}
    </>
  )
}
