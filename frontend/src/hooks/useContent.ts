import { useCallback, useEffect, useState } from 'react'
import { api } from '../api/client'
import type { ContentEntry, ContentEntryCreate, ContentEntryPatch } from '../types'

export function useContent() {
  const [entries, setEntries] = useState<ContentEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshEntries = useCallback(async () => {
    try {
      setLoading(true)
      const data = await api.listContentEntries()
      setEntries(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load content')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refreshEntries()
  }, [refreshEntries])

  const createEntry = useCallback(async (data: ContentEntryCreate) => {
    const entry = await api.createContentEntry(data)
    setEntries((prev) => mergeEntry(prev, entry))
    return entry
  }, [])

  const patchEntry = useCallback(async (id: string, data: ContentEntryPatch) => {
    const entry = await api.patchContentEntry(id, data)
    setEntries((prev) => prev.map((e) => (e.id === id ? entry : e)))
    return entry
  }, [])

  const upsertTranslation = useCallback(async (id: string, locale: string, value: string) => {
    const entry = await api.upsertContentTranslation(id, locale, value)
    setEntries((prev) => prev.map((e) => (e.id === id ? entry : e)))
    return entry
  }, [])

  const deleteTranslation = useCallback(async (id: string, locale: string) => {
    await api.deleteContentTranslation(id, locale)
    setEntries((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              translations: Object.fromEntries(
                Object.entries(e.translations).filter(([k]) => k !== locale),
              ),
            }
          : e,
      ),
    )
  }, [])

  const deleteEntry = useCallback(async (id: string) => {
    await api.deleteContentEntry(id)
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }, [])

  return {
    entries,
    loading,
    error,
    refreshEntries,
    createEntry,
    patchEntry,
    upsertTranslation,
    deleteTranslation,
    deleteEntry,
  }
}

function mergeEntry(prev: ContentEntry[], entry: ContentEntry): ContentEntry[] {
  const filtered = prev.filter((e) => e.id !== entry.id)
  return [...filtered, entry].sort((a, b) =>
    a.updated_at < b.updated_at ? 1 : a.updated_at > b.updated_at ? -1 : 0,
  )
}
