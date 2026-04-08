import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../../store/gameStore'
import { CatAvatar } from '../../components/CatAvatar/CatAvatar'
import './TitleScreen.css'

const TITLE_ART = `
   ██████╗██╗   ██╗██████╗ ███████╗ ██████╗ ██████╗
  ██╔════╝██║   ██║██╔══██╗██╔════╝██╔═══██╗██╔══██╗
  ██║     ██║   ██║██████╔╝███████╗██║   ██║██████╔╝
  ██║     ██║   ██║██╔══██╗╚════██║██║   ██║██╔══██╗
  ╚██████╗╚██████╔╝██║  ██║███████║╚██████╔╝██║  ██║
   ╚═════╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝ ╚═════╝ ╚═╝  ╚═╝
             ██████╗ █████╗ ████████╗███████╗
            ██╔════╝██╔══██╗╚══██╔══╝██╔════╝
            ██║     ███████║   ██║   ███████╗
            ██║     ██╔══██║   ██║   ╚════██║
            ╚██████╗██║  ██║   ██║   ███████║
             ╚═════╝╚═╝  ╚═╝   ╚═╝   ╚══════╝
`

export function TitleScreen() {
  const navigate = useNavigate()
  const { playerName, setPlayerName, setCatName } = useGameStore()
  const hasSave = playerName !== ''

  const [showNewGame, setShowNewGame] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const [catNameInput, setCatNameInput] = useState('')

  function handleStartNewGame() {
    if (!nameInput.trim() || !catNameInput.trim()) return
    setPlayerName(nameInput.trim())
    setCatName(catNameInput.trim())
    navigate('/world')
  }

  function handleContinue() {
    navigate('/world')
  }

  return (
    <div className="title-screen">
      <div className="title-screen__content fade-in">
        <pre className="title-screen__ascii" aria-label="Cursor Cats">
          {TITLE_ART}
        </pre>

        <div className="title-screen__cat">
          <CatAvatar mood="idle" accessories={[]} size="lg" />
        </div>

        <p className="title-screen__tagline">
          Train your AI cat. Master Cursor.
        </p>

        {!showNewGame ? (
          <div className="title-screen__buttons">
            <button
              className="title-screen__btn title-screen__btn--primary"
              onClick={() => setShowNewGame(true)}
            >
              🐾 New Game
            </button>
            {hasSave && (
              <button
                className="title-screen__btn title-screen__btn--secondary"
                onClick={handleContinue}
              >
                ▶ Continue
              </button>
            )}
          </div>
        ) : (
          <div className="title-screen__new-game slide-up">
            <h3>Welcome to the Cursor Cattery!</h3>
            <div className="title-screen__field">
              <label htmlFor="player-name">Your Name</label>
              <input
                id="player-name"
                type="text"
                placeholder="Enter your name..."
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                maxLength={20}
                autoFocus
              />
            </div>
            <div className="title-screen__field">
              <label htmlFor="cat-name">Name Your Cat</label>
              <input
                id="cat-name"
                type="text"
                placeholder="Enter your cat's name..."
                value={catNameInput}
                onChange={(e) => setCatNameInput(e.target.value)}
                maxLength={20}
              />
            </div>
            <div className="title-screen__buttons">
              <button
                className="title-screen__btn title-screen__btn--primary"
                onClick={handleStartNewGame}
                disabled={!nameInput.trim() || !catNameInput.trim()}
              >
                🚀 Start Adventure
              </button>
              <button
                className="title-screen__btn title-screen__btn--ghost"
                onClick={() => setShowNewGame(false)}
              >
                Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
