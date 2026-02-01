import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody, RapierRigidBody } from '@react-three/rapier'
import * as THREE from 'three'
import { useGameStore } from '../store/gameStore'

interface ItemProps {
    id: number
    position: [number, number, number]
    type: 'health' | 'weapon'
}

export const Item = ({ id, position, type }: ItemProps) => {
    const body = useRef<RapierRigidBody>(null)
    const { pickupItem } = useGameStore()
    const color = type === 'health' ? '#ff0000' : '#ffff00'

    useFrame((state) => {
        if (!body.current) return

        // Rotate item
        const time = state.clock.getElapsedTime()
        body.current.setRotation(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), time), true)

        // Check distance to player for pickup (simple distance check instead of collision event for reliability)
        const playerPos = state.camera.position
        const itemPos = body.current.translation()
        if (new THREE.Vector3(itemPos.x, itemPos.y, itemPos.z).distanceTo(playerPos) < 3.0) {
            pickupItem(id)
        }
    })

    return (
        <RigidBody ref={body} position={position} colliders="hull" lockRotations>
            <mesh castShadow>
                <boxGeometry args={[0.5, 0.5, 0.5]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
            </mesh>
            {/* Type Indicator */}
            {type === 'health' ? (
                <mesh position={[0, 0.6, 0]}>
                    <boxGeometry args={[0.2, 0.6, 0.2]} />
                    <meshStandardMaterial color="white" />
                    <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                        <boxGeometry args={[0.2, 0.6, 0.2]} />
                        <meshStandardMaterial color="white" />
                    </mesh>
                </mesh>
            ) : (
                <mesh position={[0, 0.6, 0]}>
                    <coneGeometry args={[0.2, 0.5, 4]} />
                    <meshStandardMaterial color="cyan" />
                </mesh>
            )}
        </RigidBody>
    )
}
