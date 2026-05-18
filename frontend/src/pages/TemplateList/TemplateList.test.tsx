import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
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

const newTemplate = {
  id: 'new-tpl',
  name: 'Weekly digest',
  subject: '',
  content: [] as unknown[],
  preview_text: '',
  created_at: '2026-05-01T12:00:00Z',
  updated_at: '2026-05-01T12:00:00Z',
}

describe('TemplateList onboarding', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.stubGlobal(
      'fetch',
      vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
        const path = pathnameFrom(input)
        if (path === '/api/templates' && (!init?.method || init.method === 'GET')) {
          return Promise.resolve(new Response(JSON.stringify([])))
        }
        if (path === '/api/templates' && init?.method === 'POST') {
          const body = JSON.parse(String(init.body)) as { name: string }
          return Promise.resolve(
            new Response(JSON.stringify({ ...newTemplate, name: body.name }), { status: 200 }),
          )
        }
        return Promise.resolve(new Response('not found', { status: 404 }))
      }),
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    cleanup()
  })

  const renderList = () =>
    render(
      <MemoryRouter initialEntries={['/templates']}>
        <Routes>
          <Route path="/templates" element={<TemplateList />} />
          <Route path="/templates/:id" element={<div data-testid="editor-route">editor</div>} />
        </Routes>
      </MemoryRouter>,
    )

  it('shows create-template onboarding when the workspace has no templates and storage is clear', async () => {
    renderList()
    await waitFor(() => {
      expect(screen.getByTestId('create-template-onboarding')).toBeInTheDocument()
    })
    expect(screen.getByText('Continue')).toBeInTheDocument()
  })

  it('hides onboarding after Skip for now', async () => {
    renderList()
    await waitFor(() => {
      expect(screen.getByTestId('create-template-onboarding')).toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole('button', { name: 'Skip for now' }))
    await waitFor(() => {
      expect(screen.queryByTestId('create-template-onboarding')).not.toBeInTheDocument()
    })
    expect(screen.getByText('No templates yet')).toBeInTheDocument()
    expect(localStorage.getItem('mailcraft:template-create-onboarding')).toBe('skipped')
  })

  it('creates a template via onboarding and navigates to the editor', async () => {
    renderList()
    await waitFor(() => {
      expect(screen.getByTestId('create-template-onboarding')).toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    const nameInput = screen.getByLabelText('Template name')
    fireEvent.change(nameInput, { target: { value: 'Weekly digest' } })
    fireEvent.click(screen.getByRole('button', { name: 'Create & open editor' }))
    await waitFor(() => {
      expect(screen.getByTestId('editor-route')).toBeInTheDocument()
    })
    expect(localStorage.getItem('mailcraft:template-create-onboarding')).toBe('completed')
  })
})
