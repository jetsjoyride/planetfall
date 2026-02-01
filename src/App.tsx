import { useEffect, useState } from 'react'
import { Game } from './components/Game'
import { UI } from './components/UI'
import { MainMenu } from './components/MainMenu'
import { MobileControls } from './components/MobileControls'
import { Admin } from './components/Admin'
import { useGameStore } from './store/gameStore'

function App() {
  const { initApp } = useGameStore()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    // Initialize game (High scores, player count)
    initApp()

    // Check for admin URL param
    const params = new URLSearchParams(window.location.search)
    if (params.get('admin') === 'true') {
      setIsAdmin(true)
    }
  }, [])

  if (isAdmin) {
    return <Admin />
  }

  return (
    <div style={{ width: '100vw', height: '100vh', background: 'black' }}>
      <Game />
      <UI />
      <MobileControls />
      <MainMenu />
    </div>
  )
}

export default App
