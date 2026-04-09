import { useCallback, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  type DragEndEvent,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { useTemplateEditor } from '../../hooks/useTemplateEditor'
import { BlockLibrary } from '../../components/BlockLibrary/BlockLibrary'
import { EmailCanvas } from '../../components/EmailCanvas/EmailCanvas'
import { PropertiesPanel } from '../../components/PropertiesPanel/PropertiesPanel'
import { HtmlPreviewModal } from '../../components/HtmlPreviewModal/HtmlPreviewModal'
import { api } from '../../api/client'
import type { Block, BlockType } from '../../types'
import { DEFAULT_BLOCK_PROPERTIES } from '../../types'
import './TemplateEditor.css'

export function TemplateEditor() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const editor = useTemplateEditor(id)
  const [htmlPreview, setHtmlPreview] = useState<string | null>(null)
  const [previewModalTitle, setPreviewModalTitle] = useState('HTML Export')
  const [previewLoading, setPreviewLoading] = useState(false)
  const [activeDragId, setActiveDragId] = useState<string | null>(null)
  const [, setPostEntrySync] = useState(0)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveDragId(String(event.active.id))
  }, [])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveDragId(null)
      const { active, over } = event

      if (!over) return

      // Drag from library → add new block
      const fromLibrary = active.data?.current?.fromLibrary
      if (fromLibrary) {
        const blockType = active.data?.current?.type as BlockType
        const newBlock: Block = {
          id: crypto.randomUUID(),
          type: blockType,
          properties: { ...DEFAULT_BLOCK_PROPERTIES[blockType] },
        }

        // Find the index to insert at
        const overIndex = editor.blocks.findIndex((b) => b.id === over.id)
        if (over.id === 'canvas-drop-zone') {
          editor.addBlock(newBlock)
        } else if (overIndex !== -1) {
          editor.addBlock(newBlock, overIndex)
        } else {
          editor.addBlock(newBlock)
        }
        return
      }

      // Drag to reorder within canvas
      if (active.id !== over.id && over.id !== 'canvas-drop-zone') {
        const oldIndex = editor.blocks.findIndex((b) => b.id === active.id)
        const newIndex = editor.blocks.findIndex((b) => b.id === over.id)
        if (oldIndex !== -1 && newIndex !== -1) {
          editor.moveBlock(oldIndex, newIndex)
        }
      }
    },
    [editor],
  )

  const handleExportHtml = useCallback(async () => {
    if (!id) return
    try {
      await editor.save()
      const html = await api.getHtml(id)
      setPreviewModalTitle('HTML Export')
      setHtmlPreview(html)
    } catch (err) {
      console.error('Failed to export HTML:', err)
    }
  }, [id, editor])

  const handlePreviewEmail = useCallback(async () => {
    if (!id) return
    try {
      setPreviewLoading(true)
      await editor.save()
      const html = await api.getHtml(id)
      setPreviewModalTitle('Email preview')
      setHtmlPreview(html)
    } catch (err) {
      console.error('Failed to preview email:', err)
    } finally {
      setPreviewLoading(false)
    }
  }, [id, editor])

  if (editor.loading) {
    return (
      <div className="editor-loading">
        <div className="spinner" />
        <p>Loading template…</p>
      </div>
    )
  }

  if (editor.error) {
    return (
      <div className="editor-error">
        <p>Error: {editor.error}</p>
        <button onClick={() => navigate('/')}>Back to Templates</button>
      </div>
    )
  }

  if ((location.state as { k?: number } | null)?.k === 1) {
    setPostEntrySync((n) => n + 1)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="template-editor" data-testid="template-editor">
        {/* Top toolbar */}
        <div className="editor-toolbar">
          <button className="editor-back-btn" onClick={() => navigate('/')}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="editor-toolbar-center">
            <input
              type="text"
              className="editor-name-input"
              value={editor.templateName}
              onChange={(e) => editor.setTemplateName(e.target.value)}
              placeholder="Template name"
            />
            <input
              type="text"
              className="editor-subject-input"
              value={editor.subject}
              onChange={(e) => editor.setSubject(e.target.value)}
              placeholder="Subject line"
            />
          </div>
          <div className="editor-toolbar-actions">
            <span className="save-indicator">
              {editor.saving ? 'Saving…' : 'Saved'}
            </span>
            <button className="btn-secondary" onClick={() => editor.save()}>
              Save
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={handlePreviewEmail}
              disabled={previewLoading}
            >
              {previewLoading ? 'Loading preview…' : 'Preview email'}
            </button>
            <button className="btn-primary" onClick={handleExportHtml}>
              Export HTML
            </button>
          </div>
        </div>

        {/* Three-panel editor */}
        <div className="editor-panels">
          <BlockLibrary />
          <EmailCanvas
            blocks={editor.blocks}
            selectedBlockId={editor.selectedBlockId}
            onSelectBlock={editor.setSelectedBlockId}
            onDeleteBlock={editor.removeBlock}
          />
          <PropertiesPanel
            block={editor.selectedBlock}
            onUpdate={editor.updateBlock}
            onDelete={editor.removeBlock}
          />
        </div>
      </div>

      <DragOverlay>
        {activeDragId ? (
          <div className="drag-overlay-block">
            {activeDragId.startsWith('library-')
              ? activeDragId.replace('library-', '').toUpperCase()
              : 'Block'}
          </div>
        ) : null}
      </DragOverlay>

      {htmlPreview && (
        <HtmlPreviewModal
          html={htmlPreview}
          title={previewModalTitle}
          onClose={() => setHtmlPreview(null)}
        />
      )}
    </DndContext>
  )
}
