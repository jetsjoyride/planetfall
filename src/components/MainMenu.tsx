import { useState } from 'react'
import { useGameStore } from '../store/gameStore'

export const MainMenu = () => {
    const { gameState, startGame, saveHighScore, highScores, score, resetGame } = useGameStore()
    const [name, setName] = useState('')
    const [showInfo, setShowInfo] = useState(false)

    if (gameState === 'playing') return null

    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100dvh', // Use dynamic viewport height for mobile
            background: 'rgba(0,0,0,0.85)',
            zIndex: 100,
            overflowY: 'auto',
            overflowX: 'hidden', // Prevent horizontal scroll
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center' // Center vertically
        }}>
            <div style={{
                margin: 'auto',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '1rem', // Reduced padding
                width: '100%',
                maxWidth: '100%',
                boxSizing: 'border-box'
            }}>
                <h1 style={{
                    fontSize: 'clamp(2.5rem, 13vw, 4rem)', // Responsive font size
                    marginBottom: '0',
                    fontFamily: 'monospace',
                    color: 'white',
                    textAlign: 'center',
                    lineHeight: '1',
                    width: '100%'
                }}>
                    PLANETFALL
                    <br />
                    <span style={{ fontSize: 'clamp(1.5rem, 8vw, 2rem)', letterSpacing: '0.5em', color: '#40ff40' }}>ODYSSEY</span>
                </h1>
                <p style={{ fontSize: '1rem', marginBottom: '1.5rem', marginTop: '1rem', fontFamily: 'monospace', color: '#40ff40', opacity: 0.8 }}>Designed by Daniel H</p>

                {gameState === 'gameover' && (
                    <div style={{ marginBottom: '2rem', textAlign: 'center', color: 'white' }}>
                        <h2 style={{ color: 'red' }}>GAME OVER</h2>
                        <p style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Final Score: {score}</p>

                        {/* Check if Top 10 AND Score > 0 */}
                        {((highScores.length < 10 || score > (highScores[highScores.length - 1]?.score || 0)) && score > 0) ? (
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

                {gameState === 'menu' && !showInfo && (
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
                                marginBottom: '2rem',
                                fontWeight: 'bold'
                            }}
                        >
                            PLAY
                        </button>

                        <button
                            onClick={() => setShowInfo(true)}
                            style={{
                                padding: '0.5rem 1rem',
                                fontSize: '1rem',
                                fontFamily: 'monospace',
                                background: 'transparent',
                                border: '1px solid white',
                                color: 'white',
                                cursor: 'pointer',
                                marginBottom: '3rem'
                            }}
                        >
                            HOW TO PLAY
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
                        </div>
                    </>
                )}

                {showInfo && (
                    <div style={{
                        background: 'rgba(0,0,0,0.9)',
                        padding: '2rem',
                        border: '1px solid #40ff40',
                        maxWidth: '600px',
                        color: 'white',
                        textAlign: 'left'
                    }}>
                        <h2 style={{ color: '#40ff40', textAlign: 'center', marginBottom: '1.5rem' }}>HOW TO PLAY</h2>

                        <p style={{ marginBottom: '1rem' }}><strong>GOAL:</strong> Survive as long as you can and defeat the alien swarm! Earn points by defeating enemies and grab power-ups to stay alive.</p>

                        <h3 style={{ color: '#40ff40', marginTop: '1.5rem', marginBottom: '0.5rem' }}>CONTROLS</h3>

                        <div style={{ textAlign: 'center' }}>
                            <ul style={{ listStyle: 'none', padding: 0, display: 'inline-block', textAlign: 'left' }}>
                                <li><strong>WASD</strong> - Move</li>
                                <li><strong>Mouse</strong> - Look</li>
                                <li><strong>Click</strong> - Shoot</li>
                                <li><strong>Space</strong> - Jump</li>
                                <li><strong>Shift</strong> - Run</li>
                            </ul>
                        </div>

                        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                            <button
                                onClick={() => setShowInfo(false)}
                                style={{
                                    padding: '0.5rem 2rem',
                                    background: '#40ff40',
                                    border: 'none',
                                    fontSize: '1.2rem',
                                    fontWeight: 'bold',
                                    cursor: 'pointer'
                                }}
                            >
                                CLOSE
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
