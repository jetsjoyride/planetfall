import { create } from 'zustand'

interface EnemyData {
    id: number
    position: [number, number, number]
}

interface GameState {
    score: number
    health: number
    enemies: EnemyData[]
    addScore: (amount: number) => void
    takeDamage: (amount: number) => void
    spawnEnemy: () => void
    killEnemy: (id: number) => void
}

export const useGameStore = create<GameState>((set) => ({
    score: 0,
    health: 100,
    enemies: [],
    addScore: (amount) => set((state) => ({ score: state.score + amount })),
    takeDamage: (amount) => set((state) => ({ health: Math.max(0, state.health - amount) })),
    spawnEnemy: () => set((state) => {
        if (state.enemies.length >= 20) return state
        return {
            enemies: [
                ...state.enemies,
                {
                    id: Date.now(),
                    position: [
                        (Math.random() - 0.5) * 50,
                        2,
                        (Math.random() - 0.5) * 50
                    ]
                }
            ]
        }
    }),
    killEnemy: (id) => set((state) => ({
        enemies: state.enemies.filter(e => e.id !== id),
        score: state.score + 100
    }))
}))
