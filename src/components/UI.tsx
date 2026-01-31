import { useGameStore } from '../store/gameStore'

export const UI = () => {
    const { score, health } = useGameStore()
    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            {/* Crosshair */}
            <div style={{
                position: 'absolute', top: '50%', left: '50%',
                width: 6, height: 6, background: '#0f0', borderRadius: '50%',
                transform: 'translate(-50%, -50%)', opacity: 0.8
            }} />

            {/* Stats */}
            <div style={{
                position: 'absolute', top: 20, left: 20,
                color: '#0f0', fontSize: 24, fontFamily: 'Courier New, monospace', fontWeight: 'bold',
                textShadow: '0 0 5px #0f0'
            }}>
                HP: {health} <br />
                SCORE: {score}
            </div>
        </div>
    )
}
