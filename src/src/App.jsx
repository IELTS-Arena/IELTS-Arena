import { useState } from 'react'
import LandingPage from './components/LandingPage'
import ParaphrasingApp from './components/ParaphrasingApp'

function App() {
  const [started, setStarted] = useState(false)

  return (
    <div>
      {!started ? (
        <LandingPage onStart={() => setStarted(true)} />
      ) : (
        <ParaphrasingApp />
      )}
    </div>
  )
}

export default App
