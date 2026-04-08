import { render, fireEvent, cleanup } from '@testing-library/react'
import { afterEach, beforeEach, describe, it, expect } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { LevelPlay } from './LevelPlay'
import { useGameStore } from '../../store/gameStore'

function renderLevel(levelId: string) {
  return render(
    <MemoryRouter initialEntries={[`/play/${levelId}`]}>
      <Routes>
        <Route path="/play/:levelId" element={<LevelPlay />} />
        <Route path="/world" element={<div data-testid="world-select">World</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('LevelPlay', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame()
  })

  afterEach(() => {
    cleanup()
  })

  describe('not found', () => {
    it('shows not-found when level does not exist', () => {
      const { getByText } = renderLevel('nonexistent')
      expect(getByText('🐱 Level Not Found')).toBeInTheDocument()
    })

    it('provides a link back to world map', () => {
      const { getByText } = renderLevel('nonexistent')
      expect(getByText('Back to World Map')).toBeInTheDocument()
    })
  })

  describe('briefing phase', () => {
    it('renders the level title in the header', () => {
      const { container } = renderLevel('1-1')
      const headerTitle = container.querySelector('.level-play__level-title')
      expect(headerTitle).toHaveTextContent('First Meow')
    })

    it('renders the concept tag', () => {
      const { getByText } = renderLevel('1-1')
      expect(
        getByText('Using Ask mode for quick, inline questions and edits'),
      ).toBeInTheDocument()
    })

    it('renders the narrative intro text', () => {
      const { getByText } = renderLevel('1-1')
      // The narrative starts with "Welcome to the Kitten Academy"
      expect(getByText(/Welcome to the Kitten Academy/)).toBeInTheDocument()
    })

    it('renders the mission briefing', () => {
      const { getByText } = renderLevel('1-1')
      expect(getByText('📋 Your Mission')).toBeInTheDocument()
    })

    it('shows the "Let\'s Go!" button', () => {
      const { getByText } = renderLevel('1-1')
      expect(getByText("Let's Go! 🐾")).toBeInTheDocument()
    })

    it('shows the cat avatar', () => {
      const { getByTestId } = renderLevel('1-1')
      // There are multiple cat avatars (header + briefing body)
      const avatars = getByTestId('level-play').querySelectorAll('[data-testid="cat-avatar"]')
      expect(avatars.length).toBeGreaterThanOrEqual(1)
    })

    it('shows phase dots in the header', () => {
      const { container } = renderLevel('1-1')
      const dots = container.querySelectorAll('.level-play__phase-dot')
      expect(dots.length).toBe(5) // briefing, challenge, debrief, quiz, complete
      expect(dots[0]).toHaveClass('level-play__phase-dot--active')
    })
  })

  describe('phase progression', () => {
    it('advances from briefing to challenge when clicking Let\'s Go!', () => {
      const { getByText, container } = renderLevel('1-1')
      fireEvent.click(getByText("Let's Go! 🐾"))

      // The challenge step header should appear with step instruction
      expect(container.querySelector('.challenge__step-header')).toBeInTheDocument()
      // Phase dot 1 (index 1 = challenge) should now be active
      const dots = container.querySelectorAll('.level-play__phase-dot')
      expect(dots[1]).toHaveClass('level-play__phase-dot--active')
      expect(dots[0]).toHaveClass('level-play__phase-dot--done')
    })

    it('shows step progress indicator (Step 1 / N)', () => {
      const { getByText } = renderLevel('1-1')
      fireEvent.click(getByText("Let's Go! 🐾"))
      expect(getByText(/Step 1 \/ 3/)).toBeInTheDocument()
    })
  })

  describe('challenge phase — highlight_and_ask (Level 1-1)', () => {
    it('renders the simulated editor', () => {
      const { getByText, getByTestId } = renderLevel('1-1')
      fireEvent.click(getByText("Let's Go! 🐾"))
      expect(getByTestId('simulated-editor')).toBeInTheDocument()
    })

    it('renders the simulated chat', () => {
      const { getByText, getByTestId } = renderLevel('1-1')
      fireEvent.click(getByText("Let's Go! 🐾"))
      expect(getByTestId('simulated-chat')).toBeInTheDocument()
    })

    it('renders the mode selector with Ask enabled', () => {
      const { getByText, getByTestId } = renderLevel('1-1')
      fireEvent.click(getByText("Let's Go! 🐾"))
      expect(getByTestId('mode-selector')).toBeInTheDocument()
    })

    it('shows the hint system during challenge', () => {
      const { getByText, getByTestId } = renderLevel('1-1')
      fireEvent.click(getByText("Let's Go! 🐾"))
      expect(getByTestId('hint-system')).toBeInTheDocument()
    })
  })

  describe('challenge phase — review_plan (Level 1-2)', () => {
    it('renders the plan steps', () => {
      const { getByText } = renderLevel('1-2')
      fireEvent.click(getByText("Let's Go! 🐾"))
      expect(getByText('📋 Proposed Plan')).toBeInTheDocument()
    })

    it('renders the mode selector with Plan enabled', () => {
      const { getByText, getByTestId } = renderLevel('1-2')
      fireEvent.click(getByText("Let's Go! 🐾"))
      expect(getByTestId('mode-selector')).toBeInTheDocument()
    })
  })

  describe('challenge phase — model_select (Level 1-5)', () => {
    it('renders scenario cards with model selector', () => {
      const { getByText, container } = renderLevel('1-5')
      fireEvent.click(getByText("Let's Go! 🐾"))
      const scenarioCards = container.querySelectorAll('.scenario-card')
      expect(scenarioCards.length).toBe(5) // 5 scenarios
    })
  })

  describe('boss level (boss-1)', () => {
    it('shows the boss star icon in the title', () => {
      const { getByText } = renderLevel('boss-1')
      expect(getByText(/⭐/)).toBeInTheDocument()
    })

    it('shows the level title', () => {
      const { container } = renderLevel('boss-1')
      const headerTitle = container.querySelector('.level-play__level-title')
      expect(headerTitle).toHaveTextContent('The Yarn Ball Challenge')
    })
  })

  describe('back navigation', () => {
    it('has a back link to world map', () => {
      const { container } = renderLevel('1-1')
      const backLink = container.querySelector('.level-play__back')
      expect(backLink).toHaveAttribute('href', '/world')
    })
  })
})
