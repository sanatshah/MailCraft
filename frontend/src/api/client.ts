import type { Template, TemplateCreate, TemplateUpdate } from '../types'

const BASE = '/api/templates'

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`)
  }
  if (response.status === 204) {
    return undefined as T
  }
  return response.json()
}

export const api = {
  listTemplates(): Promise<Template[]> {
    return request<Template[]>(BASE)
  },

  getTemplate(id: string): Promise<Template> {
    return request<Template>(`${BASE}/${id}`)
  },

  createTemplate(data: TemplateCreate): Promise<Template> {
    return request<Template>(BASE, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  updateTemplate(id: string, data: TemplateUpdate): Promise<Template> {
    return request<Template>(`${BASE}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  deleteTemplate(id: string): Promise<void> {
    return request<void>(`${BASE}/${id}`, { method: 'DELETE' })
  },

  duplicateTemplate(id: string): Promise<Template> {
    return request<Template>(`${BASE}/${id}/duplicate`, { method: 'POST' })
  },

  getHtml(id: string): Promise<string> {
    return fetch(`${BASE}/${id}/html`).then((r) => {
      if (!r.ok) throw new Error(`API error: ${r.status}`)
      return r.text()
    })
  },
}
