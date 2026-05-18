import { createContext } from 'react'

export type SearchPaletteContextValue = {
  openPalette: () => void
}

export const SearchPaletteContext = createContext<SearchPaletteContextValue | null>(null)
