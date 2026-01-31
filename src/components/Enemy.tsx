import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { RigidBody, RapierRigidBody } from '@react-three/rapier'
import * as THREE from 'three'

interface EnemyProps {
    id: number
    position: [number, number, number]
}

export const Enemy = ({ id, position }: EnemyProps) => {
    const body = useRef<RapierRigidBody>(null)
    const { camera } = useThree()
    const speed = 3

    useFrame((_state, _delta) => {
        if (!body.current) return

        const playerPos = camera.position
        const enemyPos = body.current.translation()

        const direction = new THREE.Vector3(
            playerPos.x - enemyPos.x,
            0,
            playerPos.z - enemyPos.z
        ).normalize()

        const velocity = body.current.linvel()
        body.current.setLinvel({ x: direction.x * speed, y: velocity.y, z: direction.z * speed }, true)
    })

    return (
        <RigidBody ref={body} position={position} colliders="hull" lockRotations userData={{ type: 'enemy', id }}>
            <mesh castShadow receiveShadow>
                <icosahedronGeometry args={[0.5, 1]} />
                <meshStandardMaterial
                    color="#204020"
                    roughness={0.1}
                    metalness={0.8}
                    emissive="#40ff40"
                    emissiveIntensity={0.5}
                />
            </mesh>
        </RigidBody>
    )
}
