import { useState, useCallback } from 'react'
import type { QuizQuestion } from '../../types/game'
import './QuizPanel.css'

interface QuizPanelProps {
  questions: QuizQuestion[]
  onComplete: (score: number) => void
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D']

export function QuizPanel({ questions, onComplete }: QuizPanelProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  const question = questions[currentIndex]
  const isLast = currentIndex === questions.length - 1
  const isCorrect = submitted && selectedOption === question?.correctIndex

  const handleSelect = useCallback((index: number) => {
    if (!submitted) {
      setSelectedOption(index)
    }
  }, [submitted])

  const handleSubmit = useCallback(() => {
    if (selectedOption === null || submitted) return
    setSubmitted(true)
    if (selectedOption === question.correctIndex) {
      setScore((s) => s + 1)
    }
  }, [selectedOption, submitted, question])

  const handleNext = useCallback(() => {
    if (isLast) {
      const finalScore = score + (isCorrect ? 0 : 0)
      setFinished(true)
      onComplete(finalScore)
    } else {
      setCurrentIndex((i) => i + 1)
      setSelectedOption(null)
      setSubmitted(false)
    }
  }, [isLast, score, isCorrect, onComplete])

  if (finished) {
    return (
      <div className="quiz-panel quiz-panel--finished" data-testid="quiz-panel">
        <div className="quiz-panel__summary">
          <div className="quiz-panel__summary-icon">
            {score === questions.length ? '🏆' : score >= questions.length / 2 ? '⭐' : '📚'}
          </div>
          <h3 className="quiz-panel__summary-title">Quiz Complete!</h3>
          <p className="quiz-panel__summary-score">
            {score} / {questions.length} correct
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="quiz-panel" data-testid="quiz-panel">
      <div className="quiz-panel__progress">
        Q{currentIndex + 1}/{questions.length}
      </div>

      <p className="quiz-panel__question">{question.question}</p>

      <div className="quiz-panel__options">
        {question.options.map((option, i) => {
          let stateClass = ''
          if (submitted) {
            if (i === question.correctIndex) stateClass = ' quiz-panel__option--correct'
            else if (i === selectedOption) stateClass = ' quiz-panel__option--wrong'
          } else if (i === selectedOption) {
            stateClass = ' quiz-panel__option--selected'
          }

          return (
            <button
              key={i}
              className={`quiz-panel__option${stateClass}`}
              onClick={() => handleSelect(i)}
              disabled={submitted}
              data-testid={`quiz-option-${i}`}
            >
              <span className="quiz-panel__option-letter">{OPTION_LETTERS[i]}</span>
              <span className="quiz-panel__option-text">{option}</span>
              {submitted && i === question.correctIndex && (
                <span className="quiz-panel__option-icon">✓</span>
              )}
              {submitted && i === selectedOption && i !== question.correctIndex && (
                <span className="quiz-panel__option-icon">✗</span>
              )}
            </button>
          )
        })}
      </div>

      <div className="quiz-panel__actions">
        {!submitted ? (
          <button
            className="quiz-panel__btn quiz-panel__btn--submit"
            onClick={handleSubmit}
            disabled={selectedOption === null}
            data-testid="quiz-submit"
          >
            Submit
          </button>
        ) : (
          <button
            className="quiz-panel__btn quiz-panel__btn--next"
            onClick={handleNext}
            data-testid="quiz-next"
          >
            {isLast ? 'Finish Quiz' : 'Next'}
          </button>
        )}
      </div>
    </div>
  )
}
