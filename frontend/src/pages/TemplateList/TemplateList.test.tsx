import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { TemplateList } from './TemplateList'

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('TemplateList', () => {
  it('navigates to editor after creating a template', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
        const href =
          typeof input === 'string'
            ? input
            : input instanceof Request
              ? input.url
              : input instanceof URL
                ? input.href
                : String(input)
        const path = new URL(href, 'http://localhost').pathname

        if (path === '/api/templates' && !init?.method) {
          return Promise.resolve(jsonResponse([]))
        }
        if (path === '/api/templates' && init?.method === 'POST') {
          return Promise.resolve(
            jsonResponse({
              id: 'new-template',
              name: 'Untitled Template',
              subject: '',
              content: [],
              preview_text: '',
              created_at: '2026-04-08T00:00:00Z',
              updated_at: '2026-04-08T00:00:00Z',
            }),
          )
        }
        return Promise.resolve(new Response('not found', { status: 404 }))
      }),
    )

    render(
      <MemoryRouter initialEntries={['/templates']}>
        <Routes>
          <Route path="/templates" element={<TemplateList />} />
          <Route path="/templates/:id" element={<div data-testid="editor-route">Editor</div>} />
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('template-list')).toBeInTheDocument()
    })

    fireEvent.click(screen.getAllByRole('button', { name: /Create Template/i })[0])

    await waitFor(() => {
      expect(screen.getByTestId('editor-route')).toBeInTheDocument()
    })

    vi.unstubAllGlobals()
  })
})
