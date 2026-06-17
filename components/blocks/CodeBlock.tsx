import type { BlockValue } from '@/lib/notion/types'

interface Props {
  block: BlockValue
}

export default function CodeBlock({ block }: Props) {
  const code = (block.properties?.title ?? []).map(d => d[0]).join('')
  const language = block.properties?.language?.[0]?.[0] ?? 'plaintext'
  return (
    <div className="my-4">
      <div className="flex items-center justify-between rounded-t bg-gray-800 px-4 py-2">
        <span className="text-xs text-gray-400 font-mono">{language}</span>
      </div>
      <pre className="overflow-x-auto rounded-b bg-gray-900 p-4 text-sm">
        <code className="text-green-300 font-mono whitespace-pre">{code}</code>
      </pre>
    </div>
  )
}
