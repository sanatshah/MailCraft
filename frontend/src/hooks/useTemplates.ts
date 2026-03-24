import { useCallback, useEffect, useState } from 'react'
import { api } from '../api/client'
import type { Template, TemplateCreate } from '../types'

export function useTemplates() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true)
      const data = await api.listTemplates()
      setTemplates(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load templates')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  const createTemplate = useCallback(async (data: TemplateCreate) => {
    const template = await api.createTemplate(data)
    setTemplates((prev) => [template, ...prev])
    return template
  }, [])

  const deleteTemplate = useCallback(async (id: string) => {
    await api.deleteTemplate(id)
    setTemplates((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const duplicateTemplate = useCallback(async (id: string) => {
    const template = await api.duplicateTemplate(id)
    setTemplates((prev) => [template, ...prev])
    return template
  }, [])

  return {
    templates,
    loading,
    error,
    fetchTemplates,
    createTemplate,
    deleteTemplate,
    duplicateTemplate,
  }
}
