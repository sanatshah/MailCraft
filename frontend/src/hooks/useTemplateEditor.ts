import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '../api/client'
import type { Block, Template } from '../types'

export function useTemplateEditor(templateId: string | undefined) {
  const [template, setTemplate] = useState<Template | null>(null)
  const [blocks, setBlocks] = useState<Block[]>([])
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  const [templateName, setTemplateName] = useState('')
  const [subject, setSubject] = useState('')
  const [previewText, setPreviewText] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load template
  useEffect(() => {
    if (!templateId) {
      setLoading(false)
      return
    }
    let cancelled = false
    const load = async () => {
      try {
        setLoading(true)
        const data = await api.getTemplate(templateId)
        if (!cancelled) {
          setTemplate(data)
          setBlocks(data.content)
          setTemplateName(data.name)
          setSubject(data.subject)
          setPreviewText(data.preview_text)
          setError(null)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load template')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [templateId])

  // Auto-save (debounced)
  const save = useCallback(async () => {
    if (!templateId) return
    try {
      setSaving(true)
      const updated = await api.updateTemplate(templateId, {
        name: templateName,
        subject,
        content: blocks,
        preview_text: previewText,
      })
      setTemplate(updated)
    } catch {
      // Silently fail auto-save — user can retry manually
    } finally {
      setSaving(false)
    }
  }, [templateId, templateName, subject, blocks, previewText])

  const debouncedSave = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      save()
    }, 1000)
  }, [save])

  // Trigger debounced save on content changes (but not on initial load)
  const initialLoadDone = useRef(false)
  useEffect(() => {
    if (!initialLoadDone.current) {
      if (!loading && templateId) initialLoadDone.current = true
      return
    }
    debouncedSave()
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [blocks, templateName, subject, previewText, debouncedSave, loading, templateId])

  const addBlock = useCallback((block: Block, index?: number) => {
    setBlocks((prev) => {
      const newBlocks = [...prev]
      if (index !== undefined) {
        newBlocks.splice(index, 0, block)
      } else {
        newBlocks.push(block)
      }
      return newBlocks
    })
    setSelectedBlockId(block.id)
  }, [])

  const updateBlock = useCallback((blockId: string, properties: Record<string, unknown>) => {
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === blockId ? { ...b, properties: { ...b.properties, ...properties } } : b,
      ),
    )
  }, [])

  const removeBlock = useCallback((blockId: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== blockId))
    setSelectedBlockId((prev) => (prev === blockId ? null : prev))
  }, [])

  const moveBlock = useCallback((fromIndex: number, toIndex: number) => {
    setBlocks((prev) => {
      const newBlocks = [...prev]
      const [moved] = newBlocks.splice(fromIndex, 1)
      newBlocks.splice(toIndex, 0, moved)
      return newBlocks
    })
  }, [])

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId) ?? null

  return {
    template,
    blocks,
    selectedBlock,
    selectedBlockId,
    templateName,
    subject,
    previewText,
    loading,
    saving,
    error,
    setSelectedBlockId,
    setTemplateName,
    setSubject,
    setPreviewText,
    addBlock,
    updateBlock,
    removeBlock,
    moveBlock,
    save,
  }
}
