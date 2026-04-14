import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { TemplateList } from './TemplateList'

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

const existingTemplate = {
  id: 'tpl-1',
  name: 'Welcome Sequence',
  subject: 'Welcome to MailCraft',
  preview_text: 'Your first email',
  content: [],
  created_at: '2026-01-01T00:00:00+00:00',
  updated_at: '2026-01-01T00:00:00+00:00',
}

const duplicatedTemplate = {
  ...existingTemplate,
  id: 'tpl-copy-1',
  name: 'Copy of Welcome Sequence',
  created_at: '2026-01-02T00:00:00+00:00',
  updated_at: '2026-01-02T00:00:00+00:00',
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('TemplateList', () => {
  it('duplicates a template from card actions', async () => {
    const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const path = pathnameFrom(input)
      if (path === '/api/templates' && (!init || !init.method || init.method === 'GET')) {
        return Promise.resolve(new Response(JSON.stringify([existingTemplate])))
      }
      if (path === '/api/templates/tpl-1/duplicate' && init?.method === 'POST') {
        return Promise.resolve(new Response(JSON.stringify(duplicatedTemplate), { status: 201 }))
      }
      return Promise.resolve(new Response('not found', { status: 404 }))
    })
    vi.stubGlobal('fetch', fetchMock)

    render(
      <MemoryRouter initialEntries={['/templates']}>
        <Routes>
          <Route path="/templates" element={<TemplateList />} />
          <Route path="/templates/:id" element={<div data-testid="editor-route">Editor</div>} />
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Welcome Sequence')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Template actions' }))
    fireEvent.click(screen.getByRole('button', { name: 'Duplicate' }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/templates/tpl-1/duplicate',
        expect.objectContaining({
          method: 'POST',
        }),
      )
      expect(screen.getByTestId('editor-route')).toBeInTheDocument()
    })
  })
})
