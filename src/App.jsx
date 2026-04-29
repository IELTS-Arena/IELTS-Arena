import { useState } from 'react'
import LandingPage from './components/LandingPage'
import ParaphrasingApp from './components/ParaphrasingApp'
import TFNGApp from './components/TFNGApp'

function App() {
  const [view, setView] = useState('landing')

  return (
    <div>
      {view === 'landing' && (
        <LandingPage
          onStartParaphrasing={() => setView('paraphrasing')}
          onStartTFNG={() => setView('tfng')}
        />
      )}
      {view === 'paraphrasing' && (
        <ParaphrasingApp onBack={() => setView('landing')} />
      )}
      {view === 'tfng' && (
        <TFNGApp onBack={() => setView('landing')} />
      )}
    </div>
  )
}

export default App
