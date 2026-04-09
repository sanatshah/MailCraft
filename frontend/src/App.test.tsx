import { render, screen, cleanup, waitFor, fireEvent } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

function pathnameFrom(input: RequestInfo | URL): string {
  const href =
    typeof input === 'string'
      ? input
      : input instanceof Request
        ? input.url
        : input instanceof URL
          ? input.href
          : String(input)
  return new URL(href, 'http://localhost').pathname
}

const emptyOverview = {
  overview: {
    period_days: 7,
    messages_sent: 0,
    messages_failed: 0,
    tracked_opens: 0,
    templates_count: 0,
    delivery_rate: null as number | null,
    open_rate: null as number | null,
  },
  recent_failures: [] as {
    message_id: string
    recipient: string
    subject: string
    failure_reason: string | null
    failed_at: string | null
  }[],
}

const sampleOverview = {
  overview: {
    period_days: 7,
    messages_sent: 3,
    messages_failed: 1,
    tracked_opens: 5,
    templates_count: 2,
    delivery_rate: 0.6667,
    open_rate: 0.4,
  },
  recent_failures: [
    {
      message_id: 'm1',
      recipient: 'fail@example.com',
      subject: 'Oops',
      failure_reason: 'Bounced',
      failed_at: '2025-03-01T12:00:00+00:00',
    },
  ],
}

const sampleTrends = {
  period_days: 7,
  series: [
    { date: '2025-03-18', sent: 0, failed: 0, opens: 0 },
    { date: '2025-03-19', sent: 1, failed: 0, opens: 1 },
    { date: '2025-03-20', sent: 2, failed: 1, opens: 0 },
    { date: '2025-03-21', sent: 0, failed: 0, opens: 2 },
    { date: '2025-03-22', sent: 1, failed: 0, opens: 0 },
    { date: '2025-03-23', sent: 0, failed: 0, opens: 1 },
    { date: '2025-03-24', sent: 1, failed: 0, opens: 0 },
  ],
}

const sampleTop = {
  period_days: 7,
  templates: [
    {
      template_id: 't1',
      template_name: 'Welcome',
      send_count: 4,
      open_count: 2,
    },
  ],
}

function setupFetch(options: {
  overview?: typeof emptyOverview
  trends?: typeof sampleTrends
  top?: typeof sampleTop
  templatesList?: unknown[]
  createdTemplate?: Record<string, unknown>
} = {}) {
  const overview = options.overview ?? emptyOverview
  const trends = options.trends ?? { period_days: 7, series: [] }
  const top = options.top ?? { period_days: 7, templates: [] }
  const templatesList = options.templatesList ?? []
  const createdTemplate = options.createdTemplate ?? {
    id: 'new-template-id',
    name: 'Untitled Template',
    subject: '',
    content: [],
    preview_text: '',
    created_at: '2026-04-09T00:00:00Z',
    updated_at: '2026-04-09T00:00:00Z',
  }

  vi.stubGlobal(
    'fetch',
    vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const path = pathnameFrom(input)
      const method =
        (init?.method ?? (input instanceof Request ? input.method : 'GET')).toUpperCase()
      if (path.startsWith('/api/dashboard/overview')) {
        return Promise.resolve(new Response(JSON.stringify(overview)))
      }
      if (path.startsWith('/api/dashboard/trends')) {
        return Promise.resolve(new Response(JSON.stringify(trends)))
      }
      if (path.startsWith('/api/dashboard/top-templates')) {
        return Promise.resolve(new Response(JSON.stringify(top)))
      }
      if (path === '/api/templates' && method === 'GET') {
        return Promise.resolve(new Response(JSON.stringify(templatesList)))
      }
      if (path === '/api/templates' && method === 'POST') {
        return Promise.resolve(new Response(JSON.stringify(createdTemplate), { status: 201 }))
      }
      if (path === `/api/templates/${String(createdTemplate.id)}`) {
        return Promise.resolve(new Response(JSON.stringify(createdTemplate)))
      }
      return Promise.resolve(new Response('not found', { status: 404 }))
    }),
  )
}

afterEach(() => {
  vi.unstubAllGlobals()
  cleanup()
})

describe('App', () => {
  beforeEach(() => {
    setupFetch()
  })

  it('renders the sidebar with MailCraft branding', () => {
    render(<App />)
    expect(screen.getByText('MailCraft')).toBeInTheDocument()
  })

  it('renders the sidebar navigation', () => {
    render(<App />)
    const sidebar = screen.getByTestId('sidebar')
    expect(sidebar).toBeInTheDocument()
    expect(sidebar).toHaveTextContent('Templates')
    expect(sidebar).toHaveTextContent('Home')
    expect(sidebar).toHaveTextContent('Account')
  })

  it('renders the dashboard on / with empty-state guidance', async () => {
    render(<App />)
    await waitFor(() => {
      expect(screen.getByTestId('home-dashboard')).toBeInTheDocument()
    })
    expect(screen.getByTestId('home-empty-banner')).toBeInTheDocument()
    expect(screen.getByText('Manage templates')).toBeInTheDocument()
  })

  it('renders dashboard KPIs when analytics data exists', async () => {
    vi.unstubAllGlobals()
    setupFetch({
      overview: sampleOverview,
      trends: sampleTrends,
      top: sampleTop,
    })
    render(<App />)
    await waitFor(() => {
      expect(screen.getByTestId('home-kpi-sent')).toHaveTextContent('3')
    })
    expect(screen.getByTestId('home-kpi-failed')).toHaveTextContent('1')
    expect(screen.getByTestId('home-kpi-opens')).toHaveTextContent('5')
    expect(screen.getByTestId('home-trend-chart')).toBeInTheDocument()
    expect(screen.getByTestId('home-top-templates')).toBeInTheDocument()
    expect(screen.getByTestId('home-recent-failures')).toBeInTheDocument()
  })

  it('shows dashboard error UI when API fails', async () => {
    vi.unstubAllGlobals()
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(new Response('server error', { status: 500 }))),
    )
    render(<App />)
    await waitFor(() => {
      expect(screen.getByTestId('home-error')).toBeInTheDocument()
    })
  })

  it('navigates to templates list from sidebar', async () => {
    render(<App />)
    await waitFor(() => {
      expect(screen.getByTestId('home-dashboard')).toBeInTheDocument()
    })
    const templatesLink = screen.getByRole('link', { name: 'Templates' })
    expect(templatesLink).toHaveAttribute('href', '/templates')
    fireEvent.click(templatesLink)
    await waitFor(() => {
      expect(screen.getByTestId('template-list')).toBeInTheDocument()
    })
    expect(screen.getByText('Email Templates')).toBeInTheDocument()
  })

  it('creates a template and navigates to the editor without crashing', async () => {
    vi.unstubAllGlobals()
    setupFetch({
      templatesList: [
        {
          id: 'existing-template',
          name: 'Welcome',
          subject: 'Hello',
          content: [],
          preview_text: '',
          created_at: '2026-04-09T00:00:00Z',
          updated_at: '2026-04-09T00:00:00Z',
        },
      ],
      createdTemplate: {
        id: 'new-template-id',
        name: 'Untitled Template',
        subject: '',
        content: [],
        preview_text: '',
        created_at: '2026-04-09T00:00:00Z',
        updated_at: '2026-04-09T00:00:00Z',
      },
    })
    window.history.pushState({}, '', '/templates')
    render(<App />)

    await waitFor(() => {
      expect(screen.getByTestId('template-list')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Create Template' }))

    await waitFor(() => {
      expect(screen.getByTestId('template-editor')).toBeInTheDocument()
    })
  })
})
