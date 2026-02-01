import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGameStore } from '../store/gameStore'
import { Enemy } from './Enemy'
import { LeafsEnemy } from './LeafsEnemy'

export const EnemyManager = () => {
    const { enemies, spawnEnemy, gameState } = useGameStore()
    const nextLeafSpawn = useRef(Number.MAX_SAFE_INTEGER)

    useEffect(() => {
        if (gameState === 'playing') {
            nextLeafSpawn.current = Date.now() + 60000 // 60s initial delay
        }
    }, [gameState])

    useFrame((_state) => {
        if (gameState !== 'playing') return

        const now = Date.now()
        // Spawn interval check (every 2s)
        if (Math.floor(now / 2000) > Math.floor((now - 16) / 2000)) {
            spawnEnemy('normal')
        }

        // Leafs Enemy Check (Every 30s after initial 60s)
        if (now >= nextLeafSpawn.current) {
            spawnEnemy('leafs')
            nextLeafSpawn.current = now + 30000
        }
    })

    return (
        <>
            {enemies.map((e) => {
                if (e.type === 'leafs') {
                    return <LeafsEnemy key={e.id} id={e.id} />
                }
                return <Enemy key={e.id} id={e.id} position={e.position} />
            })}
        </>
    )
}
