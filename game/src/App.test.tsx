import { render, fireEvent, waitFor, within, cleanup } from '@testing-library/react'
import { afterEach, describe, it, expect, beforeEach } from 'vitest'
import App from './App'
import { useGameStore } from './store/gameStore'

function getAppRoot() {
  // The app renders both mobile-warning and app-root divs.
  // In jsdom, CSS media queries don't apply, so both are visible.
  // Scope all queries to the app-root div.
  return document.querySelector('.app-root') as HTMLElement
}

describe('App', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame()
    window.history.pushState({}, '', '/')
  })

  afterEach(() => {
    cleanup()
  })

  it('renders the title screen at /', () => {
    render(<App />)
    const root = getAppRoot()
    expect(within(root).getByText('🐾 New Game')).toBeInTheDocument()
  })

  it('shows the tagline', () => {
    render(<App />)
    const root = getAppRoot()
    expect(within(root).getByText('Train your AI cat. Master Cursor.')).toBeInTheDocument()
  })

  it('does not show Continue button when no save exists', () => {
    render(<App />)
    const root = getAppRoot()
    expect(within(root).queryByText('▶ Continue')).not.toBeInTheDocument()
  })

  it('shows Continue button when save exists', () => {
    useGameStore.getState().setPlayerName('Alice')
    render(<App />)
    const root = getAppRoot()
    expect(within(root).getByText('▶ Continue')).toBeInTheDocument()
  })

  it('shows new game form when clicking New Game', () => {
    render(<App />)
    const root = getAppRoot()
    fireEvent.click(within(root).getByText('🐾 New Game'))
    expect(within(root).getByLabelText('Your Name')).toBeInTheDocument()
    expect(within(root).getByLabelText('Name Your Cat')).toBeInTheDocument()
  })

  it('navigates to world select after starting a new game', async () => {
    render(<App />)
    const root = getAppRoot()
    fireEvent.click(within(root).getByText('🐾 New Game'))

    const playerInput = within(root).getByLabelText('Your Name')
    const catInput = within(root).getByLabelText('Name Your Cat')

    fireEvent.change(playerInput, { target: { value: 'Alice' } })
    fireEvent.change(catInput, { target: { value: 'Whiskers' } })
    fireEvent.click(within(root).getByText('🚀 Start Adventure'))

    await waitFor(() => {
      expect(within(root).getByTestId('world-select')).toBeInTheDocument()
    })
  })

  it('renders the world select page', () => {
    useGameStore.getState().setPlayerName('Alice')
    useGameStore.getState().setCatName('Whiskers')
    window.history.pushState({}, '', '/world')
    render(<App />)
    const root = getAppRoot()
    expect(within(root).getByTestId('world-select')).toBeInTheDocument()
  })

  it('renders the cat profile page', () => {
    useGameStore.getState().setPlayerName('Alice')
    useGameStore.getState().setCatName('Whiskers')
    window.history.pushState({}, '', '/profile')
    render(<App />)
    const root = getAppRoot()
    expect(within(root).getByTestId('cat-profile')).toBeInTheDocument()
  })

  it('renders the level play page', () => {
    window.history.pushState({}, '', '/play/1-1')
    render(<App />)
    const root = getAppRoot()
    expect(within(root).getByTestId('level-play')).toBeInTheDocument()
  })
})
