import { render, screen, waitFor, cleanup, fireEvent } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { TemplateList } from './TemplateList'

const templatePayload = {
  id: 'tpl-a',
  name: 'Newsletter Alpha',
  subject: 'Weekly',
  preview_text: '',
  content: [
    {
      id: 'b1',
      type: 'text' as const,
      properties: {
        content: 'Hi',
        fontSize: 16,
        color: '#000',
        alignment: 'left' as const,
        padding: 12,
      },
    },
  ],
  created_at: '2026-01-01T00:00:00+00:00',
  updated_at: '2026-01-02T00:00:00+00:00',
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
    vi.fn((input: RequestInfo | URL) => {
      const path = pathnameFrom(input)
      if (path === '/api/templates') {
        return Promise.resolve(new Response(JSON.stringify([templatePayload])))
      }
      return Promise.resolve(new Response('not found', { status: 404 }))
    }),
  )
}

afterEach(() => {
  vi.unstubAllGlobals()
  cleanup()
})

describe('TemplateList', () => {
  beforeEach(() => {
    setupFetch()
  })

  it('focuses template search with Meta+S (macOS chord)', async () => {
    render(
      <MemoryRouter initialEntries={['/templates']}>
        <Routes>
          <Route path="/templates" element={<TemplateList />} />
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('template-list')).toBeInTheDocument()
    })

    const search = screen.getByTestId('template-search') as HTMLInputElement
    const other = document.createElement('button')
    other.tabIndex = 0
    document.body.appendChild(other)
    other.focus()
    expect(document.activeElement).toBe(other)

    const spy = vi.spyOn(KeyboardEvent.prototype, 'preventDefault')
    fireEvent.keyDown(window, { key: 's', metaKey: true, cancelable: true })
    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
    expect(document.activeElement).toBe(search)

    other.remove()
  })

  it('focuses template search with Ctrl+S', async () => {
    render(
      <MemoryRouter initialEntries={['/templates']}>
        <Routes>
          <Route path="/templates" element={<TemplateList />} />
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('template-list')).toBeInTheDocument()
    })

    fireEvent.keyDown(window, { key: 's', ctrlKey: true })

    await waitFor(() => {
      expect(document.activeElement).toBe(screen.getByTestId('template-search'))
    })
  })

  it('does not handle Meta+S when typing in a textarea', async () => {
    render(
      <MemoryRouter initialEntries={['/templates']}>
        <Routes>
          <Route path="/templates" element={<TemplateList />} />
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('template-list')).toBeInTheDocument()
    })

    const ta = document.createElement('textarea')
    document.body.appendChild(ta)
    ta.focus()
    fireEvent.keyDown(ta, { key: 's', metaKey: true, bubbles: true })

    expect(document.activeElement).toBe(ta)

    ta.remove()
  })
})
