import { useGameStore } from '../store/gameStore'

export const UI = () => {
    const { score, health, lastMessage } = useGameStore()
    const healthColor = health < 30 ? 'red' : '#0f0'

    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            {/* Crosshair */}
            <div style={{
                position: 'absolute', top: '50%', left: '50%',
                width: 6, height: 6, background: '#0f0', borderRadius: '50%',
                transform: 'translate(-50%, -50%)', opacity: 0.8
            }} />

            {/* Combat Message */}
            {lastMessage && (
                <div style={{
                    position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
                    color: 'white', fontSize: 20, fontFamily: 'monospace', fontWeight: 'bold',
                    textShadow: '0 0 5px black', background: 'rgba(0,0,0,0.5)', padding: '5px 10px'
                }}>
                    {lastMessage}
                </div>
            )}

            {/* Stats */}
            <div style={{
                position: 'absolute', top: 20, left: 20,
                color: healthColor, fontSize: 32, fontFamily: 'Courier New, monospace', fontWeight: 'bold',
                textShadow: '0 0 5px #0f0'
            }}>
                HP: {Math.round(health)} <br />
                SCORE: {score}
            </div>
        </div>
    )
}
