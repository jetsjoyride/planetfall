import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/rapier'
import { Stats, KeyboardControls } from '@react-three/drei'
import { Player } from './Player'
import { World } from './World'
import { EnemyManager } from './EnemyManager'
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
    return (
        <Canvas shadows camera={{ position: [0, 5, 10], fov: 75 }} gl={{ antialias: false }}>
            <KeyboardControls map={keyboardMap}>
                <Stats />
                <fog attach="fog" args={['#050505', 0, 40]} />
                <color attach="background" args={['#050505']} />

                {/* Dramatic Lighting */}
                <hemisphereLight intensity={0.2} groundColor="#000000" />
                <directionalLight position={[10, 20, 10]} intensity={1.5} castShadow shadow-bias={-0.0001} />
                <ambientLight intensity={0.1} />

                <Physics gravity={[0, -20, 0]}>
                    <Player />
                    <World />
                    <EnemyManager />
                </Physics>

                <EffectComposer>
                    <Bloom luminanceThreshold={0.5} mipmapBlur intensity={1.5} radius={0.5} />
                </EffectComposer>
            </KeyboardControls>
        </Canvas>
    )
}
