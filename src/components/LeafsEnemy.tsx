import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { RigidBody, RapierRigidBody } from '@react-three/rapier'
import * as THREE from 'three'
import { useGameStore } from '../store/gameStore'

interface LeafsEnemyProps {
    id: number
}

export const LeafsEnemy = ({ id }: LeafsEnemyProps) => {
    const body = useRef<RapierRigidBody>(null)
    const { camera } = useThree()
    const { takeDamage } = useGameStore()
    const lastAttackTime = useRef(0)
    const speed = 6 // Faster

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

        const angle = Math.atan2(direction.x, direction.z)
        body.current.setRotation(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), angle), true)

        if (new THREE.Vector3(enemyPos.x, enemyPos.y, enemyPos.z).distanceTo(playerPos) < 2.5) {
            const now = Date.now()
            if (now - lastAttackTime.current > 1000) {
                takeDamage(10)
                lastAttackTime.current = now
            }
        }
    })

    return (
        <RigidBody ref={body} position={[10, 2, 10]} colliders="hull" lockRotations userData={{ type: 'enemy', id }}>
            <group>
                {/* Leafs Jersey Body */}
                <mesh position={[0, 0, 0]} castShadow>
                    <boxGeometry args={[0.6, 0.8, 0.3]} />
                    <meshStandardMaterial color="#00205b" /> {/* Leafs Blue */}
                </mesh>
                {/* Head */}
                <mesh position={[0, 0.7, 0]} castShadow>
                    <boxGeometry args={[0.4, 0.4, 0.4]} />
                    <meshStandardMaterial color="#ffccaa" /> {/* Skin tone */}
                </mesh>
                {/* White Stripe */}
                <mesh position={[0, 0, 0.16]}>
                    <planeGeometry args={[0.4, 0.2]} />
                    <meshStandardMaterial color="white" />
                </mesh>
                {/* Hockey Stick */}
                <mesh position={[0.5, -0.2, 0.4]} rotation={[0.5, 0, 0]}>
                    <boxGeometry args={[0.1, 1.5, 0.1]} />
                    <meshStandardMaterial color="#8B4513" />
                </mesh>
            </group>
        </RigidBody>
    )
}
