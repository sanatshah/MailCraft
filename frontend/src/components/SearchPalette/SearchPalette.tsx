import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  type SyntheticEvent,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../api/client'
import type { Template } from '../../types'
import { SearchPaletteContext } from './searchPaletteContext'
import './SearchPalette.css'

const NAV_SEARCH_ENTRIES: readonly { label: string; path: string; hint: string }[] = [
  { label: 'Home', path: '/', hint: 'Dashboard' },
  { label: 'Templates', path: '/templates', hint: 'All email templates' },
  { label: 'Account', path: '/account', hint: 'Account settings' },
]

type PaletteItem =
  | { kind: 'nav'; id: string; label: string; path: string; hint: string }
  | { kind: 'template'; id: string; label: string; path: string; meta: string }

function normalize(s: string): string {
  return s.trim().toLowerCase()
}

function matchesQuery(query: string, ...parts: string[]): boolean {
  if (!query) return true
  const q = normalize(query)
  return parts.some((p) => normalize(p).includes(q))
}

function navItems(query: string): PaletteItem[] {
  return NAV_SEARCH_ENTRIES.filter((n) => matchesQuery(query, n.label, n.hint)).map((n) => ({
    kind: 'nav',
    id: `nav:${n.path}`,
    label: n.label,
    path: n.path,
    hint: n.hint,
  }))
}

function templateItems(query: string, templates: Template[]): PaletteItem[] {
  return templates
    .filter((t) => matchesQuery(query, t.name, t.subject, t.preview_text ?? ''))
    .map((t) => ({
      kind: 'template',
      id: `tpl:${t.id}`,
      label: t.name,
      path: `/templates/${t.id}`,
      meta: t.subject ? `Subject: ${t.subject}` : 'Email template',
    }))
}

function SearchPaletteDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const titleId = useId()
  const listId = useId()
  const [query, setQuery] = useState('')
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const items = useMemo(() => {
    const nav = navItems(query)
    const tpl = loading || loadError ? [] : templateItems(query, templates)
    return [...nav, ...tpl]
  }, [query, templates, loading, loadError])

  useEffect(() => {
    setActiveIndex(0)
  }, [query])

  useEffect(() => {
    setActiveIndex((i) => {
      if (items.length === 0) return 0
      return Math.min(i, items.length - 1)
    })
  }, [items.length])

  useEffect(() => {
    if (!open) return
    setQuery('')
    setLoadError(null)
    setTemplates([])
    setLoading(true)

    ;(async () => {
      try {
        const data = await api.listTemplates()
        setTemplates(data)
        setLoadError(null)
      } catch (e) {
        setTemplates([])
        setLoadError(e instanceof Error ? e.message : 'Failed to load templates')
      } finally {
        setLoading(false)
      }
    })()
  }, [open])

  useEffect(() => {
    if (!open) return
    const t = window.setTimeout(() => inputRef.current?.focus(), 10)
    return () => window.clearTimeout(t)
  }, [open])

  const goTo = useCallback(
    (item: PaletteItem) => {
      navigate(item.path)
      onClose()
    },
    [navigate, onClose],
  )

  useEffect(() => {
    if (!open) return
    const root = containerRef.current
    if (!root) return

    const prevActive = document.activeElement

    const tabbables = () =>
      Array.from(
        root.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => root.contains(el))

    const syncFocus = () => {
      queueMicrotask(() => {
        const list = tabbables()
        if (!list.some((el) => el === document.activeElement)) {
          inputRef.current?.focus()
        }
      })
    }

    const onDocKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }

      if (e.key === 'Tab') {
        const list = tabbables()
        if (list.length === 0) return
        const first = list[0]
        const last = list[list.length - 1]
        const active = document.activeElement as HTMLElement | null
        if (e.shiftKey) {
          if (active === first || !root.contains(active)) {
            e.preventDefault()
            last.focus()
          }
        } else if (active === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', onDocKeyDown, true)
    syncFocus()

    return () => {
      document.removeEventListener('keydown', onDocKeyDown, true)
      if (prevActive instanceof HTMLElement && document.body.contains(prevActive)) {
        prevActive.focus()
      }
    }
  }, [open, onClose])

  const onInputKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (items.length === 0) return
      setActiveIndex((i) => (i + 1) % items.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (items.length === 0) return
      setActiveIndex((i) => (i - 1 + items.length) % items.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const item = items[activeIndex]
      if (item) goTo(item)
    }
  }

  const activeDescendant =
    items.length > 0 && activeIndex >= 0 && activeIndex < items.length
      ? `search-palette-opt-${activeIndex}`
      : undefined

  const onOverlayMouseDown = (ev: SyntheticEvent) => {
    if (ev.target === ev.currentTarget) onClose()
  }

  if (!open) return null

  return (
    <div
      className="search-palette-overlay"
      ref={containerRef}
      role="presentation"
      onMouseDown={onOverlayMouseDown}
    >
      <div
        className="search-palette-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h2 id={titleId} className="search-palette-sr-only">
          Search MailCraft
        </h2>

        <div className="search-palette-header">
          <label htmlFor="search-palette-input" className="search-palette-sr-only">
            Search pages and templates
          </label>
          <input
            ref={inputRef}
            id="search-palette-input"
            type="search"
            className="search-palette-input"
            placeholder="Search pages and templates…"
            autoComplete="off"
            spellCheck={false}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onInputKeyDown}
            role="combobox"
            aria-autocomplete="list"
            aria-controls={listId}
            aria-expanded={items.length > 0}
            aria-activedescendant={activeDescendant}
            data-testid="search-palette-input"
          />
          <button
            type="button"
            className="search-palette-close"
            onClick={onClose}
            aria-label="Close search"
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
              <path
                d="M5 5L15 15M15 5L5 15"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <p className="search-palette-hint" aria-hidden>
          Navigate with arrows · Enter to open · Esc to close
        </p>

        {loading ? (
          <div className="search-palette-loading" role="status">
            Loading templates…
          </div>
        ) : null}

        {loadError ? (
          <div className="search-palette-error" role="alert">
            {loadError}. Template search is unavailable; page shortcuts below still work.
          </div>
        ) : null}

        {items.length === 0 && !loading ? (
          <div className="search-palette-empty" role="status">
            No matches. Try another search.
          </div>
        ) : null}

        {items.length > 0 ? (
          <ul
            id={listId}
            className="search-palette-list"
            role="listbox"
            aria-label="Search results"
            data-testid="search-palette-list"
          >
            {items.map((item, i) => (
              <li
                key={item.id}
                id={`search-palette-opt-${i}`}
                role="option"
                aria-selected={i === activeIndex}
                className="search-palette-option"
                data-active={i === activeIndex}
                onMouseEnter={() => setActiveIndex(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => goTo(item)}
              >
                <div className="search-palette-option-main">
                  <span className="search-palette-option-label">{item.label}</span>
                  <span className="search-palette-option-meta">
                    {item.kind === 'nav' ? item.hint : item.meta}
                  </span>
                </div>
                <span className="search-palette-badge">
                  {item.kind === 'nav' ? 'Page' : 'Template'}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  )
}

export function SearchPaletteProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const openPalette = useCallback(() => setOpen(true), [])
  const closePalette = useCallback(() => setOpen(false), [])
  const togglePalette = useCallback(() => setOpen((o) => !o), [])

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== 'k') return
      e.preventDefault()
      togglePalette()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [togglePalette])

  const value = useMemo(() => ({ openPalette }), [openPalette])

  return (
    <SearchPaletteContext.Provider value={value}>
      {children}
      <SearchPaletteDialog open={open} onClose={closePalette} />
    </SearchPaletteContext.Provider>
  )
}
