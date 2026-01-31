import * as THREE from 'three'
import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { RigidBody, RapierRigidBody, CapsuleCollider, useRapier } from '@react-three/rapier'
import { useKeyboardControls, PointerLockControls } from '@react-three/drei'

const SPEED = 12
const RUN_SPEED = 20
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

    // Shooting logic
    useEffect(() => {
        const handleMouseDown = () => {
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

            if (hit) {
                // Check if hit an enemy (will implement tagging later)
                // console.log("Hit!", hit)
            }
        }
        document.addEventListener('mousedown', handleMouseDown)
        return () => document.removeEventListener('mousedown', handleMouseDown)
    }, [camera, rapier, world])

    useFrame((state) => {
        if (!body.current) return

        const { forward, backward, left, right, jump, run } = getKeys()
        const velocity = body.current.linvel()

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
        frontVector.set(0, 0, Number(backward) - Number(forward))
        sideVector.set(Number(left) - Number(right), 0, 0)
        const currentSpeed = run ? RUN_SPEED : SPEED
        direction.subVectors(frontVector, sideVector).normalize().multiplyScalar(currentSpeed).applyEuler(state.camera.rotation)

        body.current.setLinvel({ x: direction.x, y: velocity.y, z: direction.z }, true)

        // Jump
        if (jump && Math.abs(velocity.y) < 0.05) {
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
                    <meshStandardMaterial color="cyan" emissive="cyan" emissiveIntensity={0.5} />
                </mesh>
                <pointLight ref={flashRef} position={[0, 0, -0.6]} distance={5} intensity={0} color="cyan" />
                <mesh ref={laserRef} position={[0, 0, -10]} rotation={[Math.PI / 2, 0, 0]} visible={false}>
                    <cylinderGeometry args={[0.02, 0.02, 20]} />
                    <meshBasicMaterial color="cyan" transparent opacity={0.5} />
                </mesh>
            </group>

            <PointerLockControls />
        </>
    )
}
