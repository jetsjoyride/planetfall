import { create } from 'zustand'
import { collection, addDoc, query, orderBy, limit, getDocs, doc, setDoc, increment } from 'firebase/firestore'
import { db } from '../firebase'

interface EnemyData {
    id: number
    position: [number, number, number]
    hp: number
    type: 'normal' | 'leafs'
}

interface ItemData {
    id: number
    position: [number, number, number]
    type: 'health' | 'weapon'
}

interface Weapon {
    name: string
    damage: number
    color: string
}

interface HighScore {
    name: string
    score: number
}

interface GameState {
    score: number
    health: number
    enemies: EnemyData[]
    items: ItemData[]
    gameOver: boolean
    gameState: 'menu' | 'playing' | 'gameover'
    weapon: Weapon
    highScores: HighScore[]
    lastMessage: string
    addScore: (amount: number) => void
    takeDamage: (amount: number) => void
    setLastMessage: (msg: string) => void
    spawnEnemy: (type?: 'normal' | 'leafs') => void
    resetGame: () => void
    hitEnemy: (id: number, damage: number) => void
    startGame: () => void
    saveHighScore: (name: string) => void
    fetchHighScores: () => Promise<void>
    initApp: () => Promise<void>
    pickupItem: (id: number) => void
}

export const useGameStore = create<GameState>((set, get) => ({
    score: 0,
    health: 100,
    enemies: [],
    items: [],
    gameOver: false,
    gameState: 'menu',
    weapon: { name: 'Blaster', damage: 10, color: 'cyan' },
    highScores: JSON.parse(localStorage.getItem('planetfall_highscores') || '[]'),
    lastMessage: '',

    addScore: (amount) => set((state) => ({ score: state.score + amount })),

    setLastMessage: (msg) => set({ lastMessage: msg }),

    takeDamage: (amount) => set((state) => {
        const newHealth = Math.max(0, state.health - amount)
        const isGameOver = newHealth <= 0
        return {
            health: newHealth,
            gameOver: isGameOver,
            gameState: isGameOver ? 'gameover' : state.gameState,
            lastMessage: `Took ${amount} Damage!`
        }
    }),

    spawnEnemy: (type = 'normal') => set((state) => {
        if ((state.enemies.length >= 20 && type === 'normal') || state.gameState !== 'playing') return state

        const isLeafs = type === 'leafs'
        // Scale enemy HP with score to ensure game gets harder
        const difficultyMultiplier = 1 + (state.score * 0.0005)
        const baseHp = isLeafs ? 100 : 30
        const scaledHp = Math.floor(baseHp * difficultyMultiplier)

        return {
            enemies: [
                ...state.enemies,
                {
                    id: Date.now(),
                    hp: scaledHp,
                    type: type,
                    position: [
                        (Math.random() - 0.5) * 50,
                        2,
                        (Math.random() - 0.5) * 50
                    ]
                }
            ]
        }
    }),

    hitEnemy: (id: number, damage: number) => set((state) => {
        let itemsToAdd: ItemData[] = []
        let msg = ''

        const updatedEnemies = state.enemies.map(e => {
            if (e.id === id) {
                return { ...e, hp: e.hp - damage }
            }
            return e
        }).filter(e => {
            if (e.hp <= 0) {
                // Chance to drop item (30%)
                if (Math.random() < 0.3) {
                    itemsToAdd.push({
                        id: Date.now() + Math.random(),
                        position: e.position,
                        type: Math.random() > 0.5 ? 'health' : 'weapon'
                    })
                }
                return false
            }
            return true
        })

        const diff = state.enemies.length - updatedEnemies.length
        if (diff > 0) {
            msg = 'Alien Killed!'
        } else {
            msg = `Hit Enemy: ${damage}`
        }

        return {
            enemies: updatedEnemies,
            items: [...state.items, ...itemsToAdd],
            score: state.score + (diff * 100),
            lastMessage: msg
        }
    }),

    resetGame: () => set({
        score: 0,
        health: 100,
        enemies: [],
        items: [],
        gameOver: false,
        gameState: 'menu',
        weapon: { name: 'Blaster', damage: 10, color: 'cyan' },
        lastMessage: ''
    }),

    startGame: () => set({
        score: 0,
        health: 100,
        enemies: [],
        items: [],
        gameOver: false,
        gameState: 'playing',
        lastMessage: 'Good Luck!'
    }),

    saveHighScore: async (name) => {
        set((state) => {
            const newScore = { name, score: state.score }
            const newHighScores = [...state.highScores, newScore].sort((a, b) => b.score - a.score).slice(0, 10)
            // Still save to local storage as fallback/cache
            localStorage.setItem('planetfall_highscores', JSON.stringify(newHighScores))
            return { highScores: newHighScores }
        })

        // Fire and forget upload to Firebase
        try {
            const state = get() // Access fresh state
            await addDoc(collection(db, 'highscores'), {
                name,
                score: state.score,
                date: new Date()
            })
            // Re-fetch to ensure global syncing
            state.fetchHighScores()
        } catch (e) {
            console.warn("Firebase save failed (config might be missing):", e)
        }
    },

    fetchHighScores: async () => {
        try {
            const q = query(collection(db, 'highscores'), orderBy('score', 'desc'), limit(10))
            const querySnapshot = await getDocs(q)
            const scores: HighScore[] = []
            querySnapshot.forEach((doc) => {
                const data = doc.data()
                scores.push({ name: data.name, score: data.score })
            })
            if (scores.length > 0) {
                set({ highScores: scores })
            }
        } catch (e) {
            console.warn("Firebase fetch failed (config might be missing):", e)
        }
    },

    initApp: async () => {
        const state = get()
        state.fetchHighScores()

        // Player Count Tracking
        const playerIdKey = 'planetfall_player_id'
        let playerId = localStorage.getItem(playerIdKey)

        if (!playerId) {
            playerId = crypto.randomUUID()
            localStorage.setItem(playerIdKey, playerId)

            try {
                // Increment player count in Firestore
                const statsRef = doc(db, 'stats', 'players')
                await setDoc(statsRef, { count: increment(1) }, { merge: true })
            } catch (e) {
                console.warn("Firebase stats update failed:", e)
            }
        }
    },

    pickupItem: (id) => set((state) => {
        const item = state.items.find(i => i.id === id)
        if (!item) return state

        let newState: Partial<GameState> & { weapon?: Weapon } = {}
        let msg = ''

        // Difficulty Multiplier: Increases by 50% every 1000 points (example logic)
        // Base: 1.0, 1000 score: 1.5, 2000 score: 2.0
        const difficultyMultiplier = 1 + (state.score * 0.0005)

        if (item.type === 'health') {
            const healAmount = Math.floor(25 * difficultyMultiplier)
            newState = { health: Math.min(100, state.health + healAmount) }
            msg = `Picked up Health Pack (+${healAmount} HP)!`
        } else if (item.type === 'weapon') {
            const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#ffa500']
            const color = colors[Math.floor(Math.random() * colors.length)]

            // Scaled Damage
            const baseMin = 10
            const baseMax = 30
            const damage = Math.floor((baseMin + Math.random() * (baseMax - baseMin)) * difficultyMultiplier)

            const prefixes = ['Plasma', 'Void', 'Neutron', 'Cosmic', 'Hyper', 'Turbo']
            const suffixes = ['Ravager', 'Blaster', 'Cannon', 'Ray', 'Slicer', 'Melter']
            const name = `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${suffixes[Math.floor(Math.random() * suffixes.length)]}`

            newState = { weapon: { name, damage, color } }
            msg = `Found ${name} (Dmg: ${damage})!`
        }

        return {
            items: state.items.filter(i => i.id !== id),
            ...newState,
            lastMessage: msg
        }
    })
}))
