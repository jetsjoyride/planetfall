import { RigidBody } from '@react-three/rapier'
import { useMemo } from 'react'

export const World = () => {
    const treeCount = 100
    const mountainCount = 30

    const items = useMemo(() => {
        const trees = new Array(treeCount).fill(0).map(() => ({
            position: [
                (Math.random() - 0.5) * 200,
                2.5, // Half height of cone (5)
                (Math.random() - 0.5) * 200
            ] as [number, number, number],
            scale: [0.5 + Math.random(), 0.5 + Math.random() * 2, 0.5 + Math.random()] as [number, number, number],
        }))

        const mountains = new Array(mountainCount).fill(0).map(() => ({
            position: [
                (Math.random() - 0.5) * 200,
                0,
                (Math.random() - 0.5) * 200
            ] as [number, number, number],
            scale: [5 + Math.random() * 5, 5 + Math.random() * 10, 5 + Math.random() * 5] as [number, number, number],
        }))

        return { trees, mountains }
    }, [])

    return (
        <>
            {/* Ground */}
            <RigidBody type="fixed" colliders="cuboid" restitution={0.2} friction={1}>
                <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
                    <planeGeometry args={[1000, 1000]} />
                    <meshStandardMaterial color="#5a6e4e" roughness={0.9} metalness={0.1} />
                </mesh>
            </RigidBody>

            {/* Alien Trees */}
            {items.trees.map((data, i) => (
                <RigidBody key={`tree-${i}`} type="fixed" position={data.position} colliders="hull">
                    <mesh castShadow receiveShadow scale={data.scale}>
                        <coneGeometry args={[1, 5, 8]} />
                        <meshStandardMaterial color="#330066" emissive="#110033" />
                    </mesh>
                </RigidBody>
            ))}

            {/* Mountains */}
            {items.mountains.map((data, i) => (
                <RigidBody key={`mnt-${i}`} type="fixed" position={data.position} colliders="hull">
                    <mesh castShadow receiveShadow scale={data.scale} position={[0, data.scale[1] / 2, 0]}>
                        <dodecahedronGeometry args={[1, 0]} />
                        <meshStandardMaterial color="#1a1a1a" roughness={1} />
                    </mesh>
                </RigidBody>
            ))}
        </>
    )
}
