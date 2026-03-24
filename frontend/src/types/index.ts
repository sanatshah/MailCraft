export type BlockType = 'text' | 'image' | 'button' | 'divider' | 'spacer' | 'columns'

export interface TextProperties {
  content: string
  fontSize: number
  color: string
  alignment: 'left' | 'center' | 'right'
  padding: number
}

export interface ImageProperties {
  src: string
  alt: string
  width: string
  alignment: 'left' | 'center' | 'right'
  padding: number
  linkUrl: string
}

export interface ButtonProperties {
  text: string
  url: string
  backgroundColor: string
  textColor: string
  borderRadius: number
  alignment: 'left' | 'center' | 'right'
  padding: number
}

export interface DividerProperties {
  color: string
  thickness: number
  width: number
  padding: number
}

export interface SpacerProperties {
  height: number
}

export interface ColumnContent {
  content: string
}

export interface ColumnsProperties {
  columns: ColumnContent[]
  gap: number
  padding: number
}

export type BlockProperties =
  | TextProperties
  | ImageProperties
  | ButtonProperties
  | DividerProperties
  | SpacerProperties
  | ColumnsProperties

export interface Block {
  id: string
  type: BlockType
  properties: Record<string, unknown>
}

export interface Template {
  id: string
  name: string
  subject: string
  content: Block[]
  preview_text: string
  created_at: string
  updated_at: string
}

export interface TemplateCreate {
  name: string
  subject?: string
  content?: Block[]
  preview_text?: string
}

export interface TemplateUpdate {
  name?: string
  subject?: string
  content?: Block[]
  preview_text?: string
}

/** Dashboard / email analytics (matches backend Pydantic models) */
export interface DashboardOverview {
  period_days: number
  messages_sent: number
  messages_failed: number
  tracked_opens: number
  templates_count: number
  delivery_rate: number | null
  open_rate: number | null
}

export interface RecentFailureRow {
  message_id: string
  recipient: string
  subject: string
  failure_reason: string | null
  failed_at: string | null
}

export interface DashboardOverviewExtended {
  overview: DashboardOverview
  recent_failures: RecentFailureRow[]
}

export interface TrendDay {
  date: string
  sent: number
  failed: number
  opens: number
}

export interface DashboardTrends {
  period_days: number
  series: TrendDay[]
}

export interface TopTemplateRow {
  template_id: string
  template_name: string
  send_count: number
  open_count: number
}

export interface DashboardTopTemplates {
  period_days: number
  templates: TopTemplateRow[]
}

export const DEFAULT_BLOCK_PROPERTIES: Record<BlockType, Record<string, unknown>> = {
  text: {
    content: 'Enter your text here...',
    fontSize: 16,
    color: '#232426',
    alignment: 'left',
    padding: 16,
  },
  image: {
    src: '',
    alt: '',
    width: '100%',
    alignment: 'center',
    padding: 16,
    linkUrl: '',
  },
  button: {
    text: 'Click Here',
    url: '#',
    backgroundColor: '#EF6351',
    textColor: '#FFFFFF',
    borderRadius: 6,
    alignment: 'center',
    padding: 16,
  },
  divider: {
    color: '#E8E5E0',
    thickness: 1,
    width: 100,
    padding: 16,
  },
  spacer: {
    height: 32,
  },
  columns: {
    columns: [{ content: 'Column 1' }, { content: 'Column 2' }],
    gap: 16,
    padding: 16,
  },
}
