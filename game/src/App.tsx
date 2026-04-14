import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { TitleScreen } from './pages/TitleScreen/TitleScreen'
import { WorldSelect } from './pages/WorldSelect/WorldSelect'
import { LevelPlay } from './pages/LevelPlay/LevelPlay'
import { CatProfile } from './pages/CatProfile/CatProfile'

function App() {
  return (
    <>
      <div className="mobile-warning">
        <div className="mobile-warning__cat">🐱</div>
        <div className="mobile-warning__title">Best on Desktop!</div>
        <div className="mobile-warning__text">
          Cursor Cats is best played on a desktop browser. The simulated IDE
          experience needs more screen space than a phone can offer.
        </div>
      </div>
      <div className="app-root">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<TitleScreen />} />
            <Route path="/world" element={<WorldSelect />} />
            <Route path="/play/:levelId" element={<LevelPlay />} />
            <Route path="/profile" element={<CatProfile />} />
          </Routes>
        </BrowserRouter>
      </div>
    </>
  )
}

export default App
