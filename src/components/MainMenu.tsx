import { useState } from 'react'
import { useGameStore } from '../store/gameStore'

export const MainMenu = () => {
    const { gameState, startGame, saveHighScore, highScores, score, resetGame } = useGameStore()
    const [name, setName] = useState('')

    if (gameState === 'playing') return null

    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.85)',
            zIndex: 100,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
        }}>
            <div style={{
                margin: 'auto', // Safe centering
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '2rem',
                minHeight: 'min-content'
            }}>
                <h1 style={{ fontSize: '4rem', marginBottom: '1rem', fontFamily: 'monospace', color: 'white' }}>PLANETFALL</h1>

                {gameState === 'gameover' && (
                    <div style={{ marginBottom: '2rem', textAlign: 'center', color: 'white' }}>
                        <h2 style={{ color: 'red' }}>GAME OVER</h2>
                        <p style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Final Score: {score}</p>

                        {/* Check if Top 10 */}
                        {(highScores.length < 10 || score > (highScores[highScores.length - 1]?.score || 0)) ? (
                            <div style={{ marginTop: '1rem', background: 'rgba(0,0,0,0.5)', padding: '1.5rem', borderRadius: '10px', border: '1px solid #40ff40' }}>
                                <p style={{ color: '#40ff40', fontSize: '1.2rem', marginBottom: '1rem' }}>NEW HIGH SCORE!</p>
                                <input
                                    type="text"
                                    placeholder="Enter Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    maxLength={10}
                                    style={{ padding: '0.5rem', fontSize: '1rem', marginRight: '0.5rem' }}
                                />
                                <button
                                    onClick={() => {
                                        if (name) {
                                            saveHighScore(name)
                                            resetGame()
                                        }
                                    }}
                                    style={{ padding: '0.5rem 1rem', fontSize: '1rem', cursor: 'pointer', background: '#fff', border: 'none', fontWeight: 'bold' }}
                                >
                                    Save Score
                                </button>
                                <div style={{ marginTop: '1rem' }}>
                                    <button
                                        onClick={startGame}
                                        style={{ background: 'transparent', border: '1px solid white', color: 'white', padding: '0.5rem 1rem', cursor: 'pointer' }}
                                    >
                                        I don't want to save
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div style={{ marginTop: '1rem' }}>
                                <p style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: '#aaa' }}>You didn't make the leaderboard.</p>
                                <button
                                    onClick={startGame}
                                    style={{
                                        padding: '1rem 2rem',
                                        fontSize: '1.5rem',
                                        background: '#40ff40',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    RESTART GAME
                                </button>
                                <div style={{ marginTop: '1rem' }}>
                                    <button
                                        onClick={resetGame}
                                        style={{ background: 'transparent', border: '1px solid #555', color: '#aaa', padding: '0.5rem 1rem', cursor: 'pointer' }}
                                    >
                                        Return to Menu
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {gameState === 'menu' && (
                    <>
                        <button
                            onClick={startGame}
                            style={{
                                padding: '1rem 2rem',
                                fontSize: '2rem',
                                fontFamily: 'monospace',
                                background: '#40ff40',
                                border: 'none',
                                cursor: 'pointer',
                                marginBottom: '3rem',
                                fontWeight: 'bold'
                            }}
                        >
                            PLAY
                        </button>

                        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
                            <div style={{ border: '2px solid #555', padding: '2rem', background: 'rgba(0,0,0,0.6)', minWidth: '250px', color: 'white' }}>
                                <h3 style={{ borderBottom: '1px solid #555', paddingBottom: '0.5rem', marginBottom: '1rem' }}>HIGH SCORES</h3>
                                {highScores.map((s, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', margin: '0.5rem 0' }}>
                                        <span>{i + 1}. {s.name}</span>
                                        <span>{s.score}</span>
                                    </div>
                                ))}
                                {highScores.length === 0 && <p>No scores yet.</p>}
                            </div>

                            <div style={{ border: '2px solid #555', padding: '2rem', background: 'rgba(0,0,0,0.6)', minWidth: '250px', color: 'white' }}>
                                <h3 style={{ borderBottom: '1px solid #555', paddingBottom: '0.5rem', marginBottom: '1rem' }}>CONTROLS</h3>
                                <div style={{ textAlign: 'left', lineHeight: '1.6' }}>
                                    <p style={{ color: '#40ff40', fontWeight: 'bold', marginBottom: '0.5rem' }}>DESKTOP</p>
                                    <p><strong>WASD</strong> - Move</p>
                                    <p><strong>Mouse</strong> - Look</p>
                                    <p><strong>Click</strong> - Shoot</p>
                                    <p><strong>Space</strong> - Jump</p>

                                    <p style={{ color: '#40ff40', fontWeight: 'bold', marginBottom: '0.5rem', marginTop: '1.5rem' }}>MOBILE</p>
                                    <p><strong>Left</strong> - Move</p>
                                    <p><strong>Right</strong> - Look</p>
                                    <p><strong>Tap Buttons</strong> - Jump/Fire</p>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
