import * as THREE from 'three'
import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { RigidBody, RapierRigidBody, CapsuleCollider, useRapier } from '@react-three/rapier'
import { useKeyboardControls, PointerLockControls } from '@react-three/drei'
import { useGameStore } from '../store/gameStore'
import { useMobileControlsStore } from '../store/mobileControlsStore'

const SPEED = 12
const RUN_SPEED = 20
const LOOK_SPEED = 0.002
const direction = new THREE.Vector3()
const frontVector = new THREE.Vector3()
const sideVector = new THREE.Vector3()

export const Player = () => {
    const body = useRef<RapierRigidBody>(null)
    const gunRef = useRef<THREE.Group>(null)
    const flashRef = useRef<THREE.PointLight>(null)
    const laserRef = useRef<THREE.Mesh>(null)
    const [, getKeys] = useKeyboardControls()
    const { rapier, world } = useRapier()
    const { camera } = useThree()
    const { hitEnemy, weapon } = useGameStore()
    const { movement, isJumping, isShooting, cameraDelta, resetCameraDelta, isMobile } = useMobileControlsStore()

    // Shooting logic
    useEffect(() => {
        const handleMouseDown = () => {
            if (isMobile) return // Don't fire on touch taps that might propagate

            const origin = camera.position
            const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion)
            const ray = new rapier.Ray(origin, direction)
            const hit = world.castRay(ray, 100, true)

            // Visual recoil & Flash
            if (gunRef.current) {
                gunRef.current.position.z += 0.2
            }
            if (flashRef.current) {
                flashRef.current.intensity = 10
                setTimeout(() => {
                    if (flashRef.current) flashRef.current.intensity = 0
                }, 50)
            }
            if (laserRef.current) {
                laserRef.current.visible = true
                setTimeout(() => {
                    if (laserRef.current) laserRef.current.visible = false
                }, 50)
            }

            if (hit && hit.collider && hit.collider.parent()) {
                const userData = hit.collider.parent()?.userData as any
                if (userData && userData.type === 'enemy') {
                    hitEnemy(userData.id, weapon.damage)
                }
            }
        }
        document.addEventListener('mousedown', handleMouseDown)
        return () => document.removeEventListener('mousedown', handleMouseDown)
    }, [camera, rapier, world, hitEnemy, weapon, isMobile])

    // Mobile Shooting
    useEffect(() => {
        if (isShooting) {
            const handleMobileShoot = () => {
                const origin = camera.position
                const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion)
                const ray = new rapier.Ray(origin, direction)
                const hit = world.castRay(ray, 100, true)

                // Visual recoil & Flash
                if (gunRef.current) {
                    gunRef.current.position.z += 0.2
                }
                if (flashRef.current) {
                    flashRef.current.intensity = 10
                    setTimeout(() => {
                        if (flashRef.current) flashRef.current.intensity = 0
                    }, 50)
                }
                if (laserRef.current) {
                    laserRef.current.visible = true
                    setTimeout(() => {
                        if (laserRef.current) laserRef.current.visible = false
                    }, 50)
                }

                if (hit && hit.collider && hit.collider.parent()) {
                    const userData = hit.collider.parent()?.userData as any
                    if (userData && userData.type === 'enemy') {
                        hitEnemy(userData.id, weapon.damage)
                    }
                }
            }

            // Debounce or just fire once per tap equivalent? 
            // Since isShooting is a boolean state from a button hold, we might want continuous fire or semi-auto.
            // The existing mouse logic is event based (mousedown).
            // Let's implement semi-auto for now (trigger once when isShooting becomes true).
            // Actually, if we want auto-fire we'd put this in useFrame.
            // But the current game seems to be semi-auto (click to shoot).
            // But my button state might toggle. 
            // Implementation detail: The MobileControls sets isShooting=true on TouchStart and false on TouchEnd.
            // So this effect will run when isShooting changes.
            if (isShooting) handleMobileShoot()
        }
    }, [isShooting, camera, rapier, world, hitEnemy, weapon])

    useFrame((state) => {
        if (!body.current) return

        const { forward, backward, left, right, jump, run } = getKeys()
        const velocity = body.current.linvel()

        // Mobile Camera Look
        if (cameraDelta.x !== 0 || cameraDelta.y !== 0) {
            const euler = new THREE.Euler(0, 0, 0, 'YXZ')
            euler.setFromQuaternion(state.camera.quaternion)
            euler.y -= cameraDelta.x * LOOK_SPEED
            euler.x -= cameraDelta.y * LOOK_SPEED
            euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, euler.x))
            state.camera.quaternion.setFromEuler(euler)

            resetCameraDelta()
        }

        // Gun follow camera
        if (gunRef.current) {
            gunRef.current.position.copy(state.camera.position)
            gunRef.current.quaternion.copy(state.camera.quaternion)
            gunRef.current.translateZ(0.2) // Recoil return
            // Offset gun to bottom right
            gunRef.current.translateX(0.3)
            gunRef.current.translateY(-0.3)
            gunRef.current.translateZ(-0.5)
        }

        // Camera follow
        const translation = body.current.translation()
        state.camera.position.set(translation.x, translation.y + 1.5, translation.z)

        // Movement
        const zDir = (Number(backward) - Number(forward)) + movement.y
        const xDir = (Number(right) - Number(left)) + movement.x

        frontVector.set(0, 0, zDir)
        sideVector.set(xDir, 0, 0)
        const currentSpeed = run ? RUN_SPEED : SPEED
        direction.subVectors(frontVector, sideVector).normalize().multiplyScalar(currentSpeed).applyEuler(state.camera.rotation)

        body.current.setLinvel({ x: direction.x, y: velocity.y, z: direction.z }, true)

        // Jump
        if ((jump || isJumping) && Math.abs(velocity.y) < 0.05) {
            body.current.setLinvel({ x: velocity.x, y: 5, z: velocity.z }, true)
        }
    })

    return (
        <>
            <RigidBody ref={body} colliders={false} mass={1} type="dynamic" position={[0, 5, 0]} enabledRotations={[false, false, false]}>
                <CapsuleCollider args={[0.75, 0.5]} />
            </RigidBody>

            {/* Gun Model */}
            <group ref={gunRef}>
                <mesh position={[0, 0, 0]}>
                    <boxGeometry args={[0.1, 0.1, 0.5]} />
                    <meshStandardMaterial color={weapon.color} emissive={weapon.color} emissiveIntensity={0.5} />
                </mesh>
                <pointLight ref={flashRef} position={[0, 0, -0.6]} distance={5} intensity={0} color={weapon.color} />
                <mesh ref={laserRef} position={[0, 0, -10]} rotation={[Math.PI / 2, 0, 0]} visible={false}>
                    <cylinderGeometry args={[0.02, 0.02, 20]} />
                    <meshBasicMaterial color={weapon.color} transparent opacity={0.5} />
                </mesh>
            </group>

            {!isMobile && <PointerLockControls />}
        </>
    )
}
