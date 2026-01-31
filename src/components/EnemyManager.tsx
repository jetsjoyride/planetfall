import { useEffect } from 'react'
import { useGameStore } from '../store/gameStore'
import { Enemy } from './Enemy'

export const EnemyManager = () => {
    const { enemies, spawnEnemy } = useGameStore()

    useEffect(() => {
        const interval = setInterval(() => {
            spawnEnemy()
        }, 2000)
        return () => clearInterval(interval)
    }, [spawnEnemy])

    return (
        <>
            {enemies.map(e => (
                <Enemy key={e.id} id={e.id} position={e.position} />
            ))}
        </>
    )
}
