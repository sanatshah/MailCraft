import { useCallback, useEffect, useMemo, useState } from 'react'
import { useContent } from '../../hooks/useContent'
import './Content.css'

const KEY_REGEX = /^[a-zA-Z0-9._-]+$/
const LOCALE_REGEX = /^[a-zA-Z0-9-]+$/

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function defaultLocale(translations: Record<string, string>): string {
  const keys = Object.keys(translations).sort()
  if (keys.includes('en')) return 'en'
  return keys[0] ?? ''
}

export function Content() {
  const {
    entries,
    loading,
    error,
    createEntry,
    patchEntry,
    upsertTranslation,
    deleteTranslation,
    deleteEntry,
  } = useContent()

  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [activeLocale, setActiveLocale] = useState('')
  const [descDraft, setDescDraft] = useState('')
  const [valueDraft, setValueDraft] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [createKey, setCreateKey] = useState('')
  const [createDesc, setCreateDesc] = useState('')
  const [createEn, setCreateEn] = useState('')
  const [createErr, setCreateErr] = useState<string | null>(null)
  const [newLocale, setNewLocale] = useState('')
  const [busy, setBusy] = useState(false)

  const selected = useMemo(
    () => entries.find((e) => e.id === selectedId) ?? null,
    [entries, selectedId],
  )

  useEffect(() => {
    if (!selected) {
      setDescDraft('')
      setValueDraft('')
      setActiveLocale('')
      return
    }
    setDescDraft(selected.description)
  }, [selected])

  useEffect(() => {
    if (!selected) return
    const locales = Object.keys(selected.translations).sort()
    setActiveLocale((prev) =>
      prev && locales.includes(prev) ? prev : defaultLocale(selected.translations),
    )
  }, [selected])

  useEffect(() => {
    if (!selected || !activeLocale) {
      setValueDraft('')
      return
    }
    setValueDraft(selected.translations[activeLocale] ?? '')
  }, [selected, activeLocale])

  const filtered = useMemo(
    () =>
      entries.filter((e) => {
        const q = search.trim().toLowerCase()
        if (!q) return true
        return (
          e.key.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q)
        )
      }),
    [entries, search],
  )

  const handleSelectRow = useCallback((id: string) => {
    setSelectedId(id)
  }, [])

  const handleSaveDescription = async () => {
    if (!selected) return
    setBusy(true)
    try {
      await patchEntry(selected.id, { description: descDraft })
    } finally {
      setBusy(false)
    }
  }

  const handleSaveTranslation = async () => {
    if (!selected || !activeLocale) return
    setBusy(true)
    try {
      await upsertTranslation(selected.id, activeLocale, valueDraft)
    } finally {
      setBusy(false)
    }
  }

  const handleAddLocale = async () => {
    if (!selected) return
    const loc = newLocale.trim()
    if (!loc) return
    if (!LOCALE_REGEX.test(loc)) {
      window.alert('Locale may only contain letters, digits, and hyphens.')
      return
    }
    if (selected.translations[loc] !== undefined) {
      window.alert('That locale already exists.')
      return
    }
    setBusy(true)
    try {
      await upsertTranslation(selected.id, loc, '')
      setNewLocale('')
      setActiveLocale(loc)
      setValueDraft('')
    } finally {
      setBusy(false)
    }
  }

  const handleRemoveLocale = async () => {
    if (!selected || !activeLocale) return
    if (!window.confirm(`Remove locale “${activeLocale}” for this key?`)) return
    setBusy(true)
    try {
      await deleteTranslation(selected.id, activeLocale)
    } finally {
      setBusy(false)
    }
  }

  const handleDeleteEntry = async () => {
    if (!selected) return
    if (
      !window.confirm(
        `Delete content entry “${selected.key}”? This removes all locales.`,
      )
    ) {
      return
    }
    setBusy(true)
    try {
      await deleteEntry(selected.id)
      setSelectedId(null)
    } finally {
      setBusy(false)
    }
  }

  const handleCreateSubmit = async () => {
    const key = createKey.trim()
    setCreateErr(null)
    if (!key) {
      setCreateErr('Key is required.')
      return
    }
    if (!KEY_REGEX.test(key)) {
      setCreateErr('Key may only use letters, digits, dots, underscores, and hyphens.')
      return
    }
    const translations: Record<string, string> = {}
    const enVal = createEn.trim()
    if (enVal) translations.en = enVal

    setBusy(true)
    try {
      const entry = await createEntry({
        key,
        description: createDesc.trim(),
        translations,
      })
      setCreateOpen(false)
      setCreateKey('')
      setCreateDesc('')
      setCreateEn('')
      setSelectedId(entry.id)
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Could not create content entry.'
      setCreateErr(msg)
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <div className="content-loading">
        <div className="spinner" />
        <p>Loading content…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="content-error">
        <p>Error: {error}</p>
      </div>
    )
  }

  const localeKeys = selected ? Object.keys(selected.translations).sort() : []

  return (
    <div className="content-page" data-testid="content-page">
      <div className="content-page-header">
        <div>
          <h1 className="content-page-title">Content</h1>
          <p className="content-page-subtitle">
            Manage reusable strings by key and locale
          </p>
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={() => {
            setCreateErr(null)
            setCreateOpen(true)
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M8 3V13M3 8H13"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          New key
        </button>
      </div>

      <div className="content-layout">
        <div>
          <div className="content-toolbar">
            <div className="content-search-wrapper">
              <svg
                className="search-icon"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
              >
                <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input
                type="search"
                className="search-input"
                placeholder="Search keys…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <span className="content-count">
              {filtered.length} entr{filtered.length === 1 ? 'y' : 'ies'}
            </span>
          </div>

          {filtered.length === 0 ? (
            <div className="content-empty-banner">
              <h3>No matching entries</h3>
              <p>Create a key or adjust your search.</p>
              <button type="button" className="btn-primary" onClick={() => setCreateOpen(true)}>
                New key
              </button>
            </div>
          ) : (
            <div className="content-table-wrap">
              <table className="content-table">
                <thead>
                  <tr>
                    <th>Key</th>
                    <th>Locales</th>
                    <th>Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row) => {
                    const locales = Object.keys(row.translations).sort()
                    return (
                      <tr
                        key={row.id}
                        className={row.id === selectedId ? 'selected' : ''}
                        onClick={() => handleSelectRow(row.id)}
                      >
                        <td className="content-table-key">{row.key}</td>
                        <td>
                          <div className="content-locale-chips">
                            {locales.length === 0 ? (
                              <span className="content-muted">None</span>
                            ) : (
                              locales.map((loc) => (
                                <span key={loc} className="locale-chip">
                                  {loc}
                                </span>
                              ))
                            )}
                          </div>
                        </td>
                        <td>{formatDate(row.updated_at)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <aside className="content-detail">
          {!selected ? (
            <div className="content-panel-empty">
              Select a row to edit descriptions and translations.
            </div>
          ) : (
            <div className="content-panel">
              <h2>{selected.key}</h2>

              <div className="content-field">
                <label htmlFor="content-desc">Description</label>
                <textarea
                  id="content-desc"
                  value={descDraft}
                  onChange={(e) => setDescDraft(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="content-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={busy || descDraft === (selected.description ?? '')}
                  onClick={() => void handleSaveDescription()}
                >
                  Save description
                </button>
              </div>

              <hr
                style={{
                  border: 'none',
                  borderTop: '1px solid var(--color-border-light)',
                  margin: 'var(--space-lg) 0',
                }}
              />

              {localeKeys.length > 0 ? (
                <div className="content-field">
                  <label htmlFor="content-locale">Locale</label>
                  <select
                    id="content-locale"
                    value={activeLocale}
                    onChange={(e) => setActiveLocale(e.target.value)}
                  >
                    {localeKeys.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}

              {activeLocale ? (
                <>
                  <div className="content-field">
                    <label htmlFor="content-value">Translation</label>
                    <textarea
                      id="content-value"
                      value={valueDraft}
                      onChange={(e) => setValueDraft(e.target.value)}
                    />
                  </div>
                  <div className="content-actions">
                    <button
                      type="button"
                      className="btn-primary"
                      disabled={
                        busy ||
                        valueDraft === (selected.translations[activeLocale] ?? '')
                      }
                      onClick={() => void handleSaveTranslation()}
                    >
                      Save translation
                    </button>
                    <button
                      type="button"
                      className="btn-secondary btn-danger"
                      disabled={busy || !activeLocale}
                      onClick={() => void handleRemoveLocale()}
                    >
                      Remove locale
                    </button>
                  </div>
                </>
              ) : (
                <p className="content-muted">Add a locale below to start translating.</p>
              )}

              <div className="content-actions-row" style={{ marginTop: 'var(--space-lg)' }}>
                <div className="content-field">
                  <label htmlFor="content-new-locale">New locale</label>
                  <input
                    id="content-new-locale"
                    type="text"
                    placeholder="e.g. es"
                    value={newLocale}
                    onChange={(e) => setNewLocale(e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={busy || !newLocale.trim()}
                  onClick={() => void handleAddLocale()}
                >
                  Add
                </button>
              </div>

              <div className="content-actions" style={{ marginTop: 'var(--space-xl)' }}>
                <button
                  type="button"
                  className="btn-secondary btn-danger"
                  disabled={busy}
                  onClick={() => void handleDeleteEntry()}
                >
                  Delete entry
                </button>
              </div>
            </div>
          )}
        </aside>
      </div>

      {createOpen ? (
        <div
          className="content-modal-overlay"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) setCreateOpen(false)
          }}
        >
          <div className="content-modal" role="dialog" aria-labelledby="content-modal-title">
            <h3 id="content-modal-title">New content key</h3>
            <div className="content-field">
              <label htmlFor="modal-key">Key</label>
              <input
                id="modal-key"
                type="text"
                autoComplete="off"
                placeholder="section.element_name"
                value={createKey}
                onChange={(e) => setCreateKey(e.target.value)}
              />
            </div>
            <div className="content-field">
              <label htmlFor="modal-desc">Description (optional)</label>
              <input
                id="modal-desc"
                type="text"
                value={createDesc}
                onChange={(e) => setCreateDesc(e.target.value)}
              />
            </div>
            <div className="content-field">
              <label htmlFor="modal-en">Default English (optional)</label>
              <textarea
                id="modal-en"
                rows={4}
                value={createEn}
                onChange={(e) => setCreateEn(e.target.value)}
              />
            </div>
            {createErr ? (
              <p className="content-error" style={{ marginTop: 'var(--space-sm)' }}>
                {createErr}
              </p>
            ) : null}
            <div className="content-modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setCreateOpen(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                disabled={busy}
                onClick={() => void handleCreateSubmit()}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
