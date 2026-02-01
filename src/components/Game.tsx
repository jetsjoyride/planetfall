import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/rapier'
import { Stats, KeyboardControls, Sky } from '@react-three/drei'
import { Player } from './Player'
import { World } from './World'
import { EnemyManager } from './EnemyManager'
import { Item } from './Item'
import { useGameStore } from '../store/gameStore'
import { EffectComposer, Bloom } from '@react-three/postprocessing'

const keyboardMap = [
    { name: 'forward', keys: ['ArrowUp', 'w', 'W'] },
    { name: 'backward', keys: ['ArrowDown', 's', 'S'] },
    { name: 'left', keys: ['ArrowLeft', 'a', 'A'] },
    { name: 'right', keys: ['ArrowRight', 'd', 'D'] },
    { name: 'jump', keys: ['Space'] },
    { name: 'run', keys: ['Shift'] },
]

export const Game = () => {
    const items = useGameStore((state) => state.items)

    return (
        <Canvas shadows camera={{ position: [0, 5, 10], fov: 75 }} gl={{ antialias: false }}>
            <KeyboardControls map={keyboardMap}>
                <Stats />
                <Sky sunPosition={[100, 20, 100]} turbidity={0.5} rayleigh={0.5} />
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 20, 10]} intensity={1.5} castShadow shadow-bias={-0.0001} />

                <Physics gravity={[0, -20, 0]}>
                    <Player />
                    <World />
                    <EnemyManager />
                    {items.map(item => (
                        <Item key={item.id} {...item} />
                    ))}
                </Physics>

                <EffectComposer>
                    <Bloom luminanceThreshold={1} intensity={1.5} />
                </EffectComposer>
            </KeyboardControls>
        </Canvas>
    )
}
