import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { afterEach, describe, it, expect, vi } from 'vitest'
import { QuizPanel } from './QuizPanel'
import type { QuizQuestion } from '../../types/game'

const sampleQuestions: QuizQuestion[] = [
  {
    question: 'What is Ask mode best for?',
    options: ['Quick inline edits', 'Multi-file refactors', 'Debugging', 'Deployment'],
    correctIndex: 0,
  },
  {
    question: 'What should you do before using Ask mode?',
    options: ['Write a plan', 'Select the relevant code', 'Close all files', 'Restart the editor'],
    correctIndex: 1,
  },
]

describe('QuizPanel', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders the first question', () => {
    render(<QuizPanel questions={sampleQuestions} onComplete={() => {}} />)
    expect(screen.getByText('What is Ask mode best for?')).toBeInTheDocument()
  })

  it('shows progress indicator', () => {
    render(<QuizPanel questions={sampleQuestions} onComplete={() => {}} />)
    // Progress format: Q1/2
    expect(screen.getByText('Q1/2')).toBeInTheDocument()
  })

  it('shows all answer options', () => {
    render(<QuizPanel questions={sampleQuestions} onComplete={() => {}} />)
    expect(screen.getByTestId('quiz-option-0')).toBeInTheDocument()
    expect(screen.getByTestId('quiz-option-1')).toBeInTheDocument()
    expect(screen.getByTestId('quiz-option-2')).toBeInTheDocument()
    expect(screen.getByTestId('quiz-option-3')).toBeInTheDocument()
  })

  it('allows selecting an answer and submitting', () => {
    render(<QuizPanel questions={sampleQuestions} onComplete={() => {}} />)
    // Click the correct answer (option 0)
    fireEvent.click(screen.getByTestId('quiz-option-0'))
    // Submit
    fireEvent.click(screen.getByTestId('quiz-submit'))
    // After submit, Next button should appear
    expect(screen.getByTestId('quiz-next')).toBeInTheDocument()
  })

  it('calls onComplete when quiz is finished', () => {
    const onComplete = vi.fn()
    render(<QuizPanel questions={sampleQuestions} onComplete={onComplete} />)

    // Answer Q1 correctly (option 0)
    fireEvent.click(screen.getByTestId('quiz-option-0'))
    fireEvent.click(screen.getByTestId('quiz-submit'))
    fireEvent.click(screen.getByTestId('quiz-next'))

    // Answer Q2 correctly (option 1)
    fireEvent.click(screen.getByTestId('quiz-option-1'))
    fireEvent.click(screen.getByTestId('quiz-submit'))
    // Last question: "Finish Quiz" button
    fireEvent.click(screen.getByTestId('quiz-next'))

    expect(onComplete).toHaveBeenCalledWith(2) // Both correct
  })

  it('tracks incorrect answers', () => {
    const onComplete = vi.fn()
    render(<QuizPanel questions={sampleQuestions} onComplete={onComplete} />)

    // Answer Q1 incorrectly (option 1 instead of 0)
    fireEvent.click(screen.getByTestId('quiz-option-1'))
    fireEvent.click(screen.getByTestId('quiz-submit'))
    fireEvent.click(screen.getByTestId('quiz-next'))

    // Answer Q2 correctly (option 1)
    fireEvent.click(screen.getByTestId('quiz-option-1'))
    fireEvent.click(screen.getByTestId('quiz-submit'))
    fireEvent.click(screen.getByTestId('quiz-next'))

    expect(onComplete).toHaveBeenCalledWith(1) // Only 1 correct
  })

  it('shows correct/incorrect feedback after submit', () => {
    render(<QuizPanel questions={sampleQuestions} onComplete={() => {}} />)
    // Select wrong answer (option 2)
    fireEvent.click(screen.getByTestId('quiz-option-2'))
    fireEvent.click(screen.getByTestId('quiz-submit'))
    // The correct answer (option 0) should have ✓
    expect(screen.getByTestId('quiz-option-0')).toHaveTextContent('✓')
    // The wrong answer (option 2) should have ✗
    expect(screen.getByTestId('quiz-option-2')).toHaveTextContent('✗')
  })
})
