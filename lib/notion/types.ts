export type BlockType =
  | 'page'
  | 'text'
  | 'header'
  | 'sub_header'
  | 'sub_sub_header'
  | 'bulleted_list'
  | 'numbered_list'
  | 'table'
  | 'table_row'
  | 'callout'
  | 'toggle'
  | 'code'
  | 'child_page'
  | 'divider'
  | 'image'
  | 'quote'
  | 'to_do'
  | string

export type NotionColor =
  | 'default'
  | 'gray'
  | 'brown'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'blue'
  | 'purple'
  | 'pink'
  | 'red'
  | 'gray_background'
  | 'brown_background'
  | 'orange_background'
  | 'yellow_background'
  | 'green_background'
  | 'blue_background'
  | 'purple_background'
  | 'pink_background'
  | 'red_background'

// Decoration: [text, [[format, value?], ...]]
export type Decoration = [string] | [string, ([string] | [string, string])[]]
export type RichText = Decoration[]

export interface BlockValue {
  id: string
  type: BlockType
  properties?: {
    title?: RichText
    caption?: RichText
    language?: [[string]]
    checked?: [['Yes' | 'No']]
    icon?: [[string]]
    [key: string]: RichText | undefined
  }
  content?: string[]      // child block IDs
  format?: {
    page_icon?: string
    block_color?: NotionColor
    page_cover?: string
    table_block_column_order?: string[]
    table_block_column_format?: Record<string, { width?: number }>
    block_width?: number
    block_full_width?: boolean
    has_column_header?: boolean
    has_row_header?: boolean
    [key: string]: unknown
  }
  parent_id?: string
  parent_table?: string
  alive?: boolean
  created_time?: number
  last_edited_time?: number
}

export interface NotionBlock {
  role: string
  value: BlockValue
}

export type RecordMap = {
  block: Record<string, NotionBlock>
  [key: string]: unknown
}

export interface PageTreeNode {
  id: string
  title: string
  slug: string
  depth: number
  children: PageTreeNode[]
}

export interface PageTree {
  root: PageTreeNode
  byId: Map<string, PageTreeNode>
  bySlug: Map<string, PageTreeNode>
  // page id → slug
  slugMap: Map<string, string>
}
