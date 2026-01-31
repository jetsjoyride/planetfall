import { Game } from './components/Game'
import { UI } from './components/UI'

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <Game />
      <UI />
    </div>
  )
}

export default App
