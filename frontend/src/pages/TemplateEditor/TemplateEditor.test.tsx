import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { TemplateEditor } from './TemplateEditor'

const templatePayload = {
  id: 'tpl-1',
  name: 'Welcome',
  subject: 'Hello',
  preview_text: '',
  content: [
    {
      id: 'b1',
      type: 'text' as const,
      properties: { content: 'Hi', fontSize: 16, color: '#000', alignment: 'left' as const, padding: 12 },
    },
  ],
  created_at: '2026-01-01T00:00:00+00:00',
  updated_at: '2026-01-01T00:00:00+00:00',
}

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

function setupFetch() {
  vi.stubGlobal(
    'fetch',
    vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const path = pathnameFrom(input)
      if (path === '/api/templates/tpl-1' && (!init || init.method === undefined || init.method === 'GET')) {
        return Promise.resolve(new Response(JSON.stringify(templatePayload)))
      }
      if (path === '/api/templates/tpl-1' && init?.method === 'PUT') {
        return Promise.resolve(new Response(JSON.stringify({ ...templatePayload, ...JSON.parse(String(init.body)) })))
      }
      if (path === '/api/templates/tpl-1/html') {
        return Promise.resolve(
          new Response('<!DOCTYPE html><html><body><p>Preview body</p></body></html>', {
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
          }),
        )
      }
      return Promise.resolve(new Response('not found', { status: 404 }))
    }),
  )
}

afterEach(() => {
  vi.unstubAllGlobals()
  cleanup()
})

describe('TemplateEditor', () => {
  beforeEach(() => {
    setupFetch()
  })

  it('opens preview modal on rendered tab when Preview is clicked', async () => {
    render(
      <MemoryRouter initialEntries={['/templates/tpl-1']}>
        <Routes>
          <Route path="/templates/:id" element={<TemplateEditor />} />
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('template-editor')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Preview' }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Email Preview' })).toBeInTheDocument()
    })
    const previewTab = screen.getByRole('tab', { name: 'Preview' })
    expect(previewTab).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByTitle('Rendered email')).toBeInTheDocument()
  })

  it('opens HTML export modal with source when Export HTML is clicked', async () => {
    render(
      <MemoryRouter initialEntries={['/templates/tpl-1']}>
        <Routes>
          <Route path="/templates/:id" element={<TemplateEditor />} />
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('template-editor')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Export HTML' }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'HTML Export' })).toBeInTheDocument()
    })
    expect(screen.getByText(/Preview body/)).toBeInTheDocument()
  })
})
