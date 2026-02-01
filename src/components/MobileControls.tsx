import React, { useEffect, useRef, useState } from 'react'
import { useMobileControlsStore } from '../store/mobileControlsStore'
import { useGameStore } from '../store/gameStore'

const JOYSTICK_SIZE = 100
const HANDLE_SIZE = 50

export const MobileControls = () => {
    const { setMovement, setJumping, setShooting, addCameraDelta, setIsMobile } = useMobileControlsStore()
    const { gameState } = useGameStore()

    // Joystick state
    const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 })
    const [joystickOrigin, setJoystickOrigin] = useState<{ x: number, y: number } | null>(null)
    const joystickIdRef = useRef<number | null>(null)

    // Look state
    const lookIdRef = useRef<number | null>(null)
    const lastLookPos = useRef<{ x: number, y: number } | null>(null)

    // D-Pad state
    const dpadState = useRef({ up: false, down: false, left: false, right: false })

    // Check if touch is supported/active
    const [isTouch, setIsTouch] = useState(false)
    useEffect(() => {
        const checkTouch = () => {
            const touch = 'ontouchstart' in window ||
                navigator.maxTouchPoints > 0 ||
                window.matchMedia("(pointer: coarse)").matches

            setIsTouch(touch)
            if (touch) setIsMobile(true)
        }
        checkTouch()
        window.addEventListener('resize', checkTouch)
        return () => window.removeEventListener('resize', checkTouch)
    }, [setIsMobile])

    if (!isTouch || gameState !== 'playing') return null

    const handleTouchStart = (e: React.TouchEvent) => {
        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i]
            const x = touch.clientX
            const y = touch.clientY

            // Left half of screen for Joystick
            if (x < window.innerWidth / 2) {
                if (joystickIdRef.current === null) {
                    joystickIdRef.current = touch.identifier
                    setJoystickOrigin({ x, y })
                    setJoystickPos({ x: 0, y: 0 })
                }
            }
            // Right half for Look
            else {
                if (lookIdRef.current === null) {
                    lookIdRef.current = touch.identifier
                    lastLookPos.current = { x, y }
                }
            }
        }
    }

    const handleTouchMove = (e: React.TouchEvent) => {
        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i]

            // Update Joystick
            if (touch.identifier === joystickIdRef.current && joystickOrigin) {
                const deltaX = touch.clientX - joystickOrigin.x
                const deltaY = touch.clientY - joystickOrigin.y

                // Clamp magnitude
                const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
                const maxDist = JOYSTICK_SIZE / 2
                const scale = distance > maxDist ? maxDist / distance : 1

                const clampedX = deltaX * scale
                const clampedY = deltaY * scale

                setJoystickPos({ x: clampedX, y: clampedY })

                // Update store (normalized -1 to 1)
                setMovement(clampedX / maxDist, clampedY / maxDist)
            }

            // Update Look
            if (touch.identifier === lookIdRef.current && lastLookPos.current) {
                const deltaX = touch.clientX - lastLookPos.current.x
                const deltaY = touch.clientY - lastLookPos.current.y

                addCameraDelta(deltaX, deltaY)
                lastLookPos.current = { x: touch.clientX, y: touch.clientY }
            }
        }
    }

    const handleTouchEnd = (e: React.TouchEvent) => {
        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i]

            if (touch.identifier === joystickIdRef.current) {
                joystickIdRef.current = null
                setJoystickOrigin(null)
                setJoystickPos({ x: 0, y: 0 })
                setMovement(0, 0)
            }

            if (touch.identifier === lookIdRef.current) {
                lookIdRef.current = null
                lastLookPos.current = null
            }
        }
    }



    const updateDpadMovement = () => {
        let x = 0
        let y = 0
        if (dpadState.current.up) y -= 1
        if (dpadState.current.down) y += 1
        if (dpadState.current.left) x -= 1
        if (dpadState.current.right) x += 1

        // Normalize if diagonal
        if (x !== 0 && y !== 0) {
            const len = Math.sqrt(x * x + y * y)
            x /= len
            y /= len
        }

        setMovement(x, y)
    }

    const handleDpad = (dir: 'up' | 'down' | 'left' | 'right', active: boolean) => {
        dpadState.current[dir] = active
        updateDpadMovement()
    }

    return (
        <div
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 1000,
                touchAction: 'none',
                userSelect: 'none'
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
        >
            {/* Visual Joystick */}
            {joystickOrigin && (
                <div style={{
                    position: 'absolute',
                    left: joystickOrigin.x - JOYSTICK_SIZE / 2,
                    top: joystickOrigin.y - JOYSTICK_SIZE / 2,
                    width: JOYSTICK_SIZE,
                    height: JOYSTICK_SIZE,
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    pointerEvents: 'none'
                }}>
                    <div style={{
                        position: 'absolute',
                        left: JOYSTICK_SIZE / 2 - HANDLE_SIZE / 2 + joystickPos.x,
                        top: JOYSTICK_SIZE / 2 - HANDLE_SIZE / 2 + joystickPos.y,
                        width: HANDLE_SIZE,
                        height: HANDLE_SIZE,
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.5)',
                    }} />
                </div>
            )}

            {/* D-Pad Container */}
            <div style={{
                position: 'absolute',
                bottom: '40px',
                left: '40px',
                width: '150px',
                height: '150px',
                pointerEvents: 'none' // Let children handle events
            }}>
                {/* UP */}
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: '50px',
                        width: '50px',
                        height: '50px',
                        background: 'rgba(255, 255, 255, 0.2)',
                        border: '1px solid rgba(255, 255, 255, 0.4)',
                        borderRadius: '5px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        color: 'white',
                        pointerEvents: 'auto'
                    }}
                    onTouchStart={(e) => { e.stopPropagation(); handleDpad('up', true) }}
                    onTouchEnd={(e) => { e.stopPropagation(); handleDpad('up', false) }}
                >
                    ▲
                </div>
                {/* DOWN */}
                <div
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        left: '50px',
                        width: '50px',
                        height: '50px',
                        background: 'rgba(255, 255, 255, 0.2)',
                        border: '1px solid rgba(255, 255, 255, 0.4)',
                        borderRadius: '5px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        color: 'white',
                        pointerEvents: 'auto'
                    }}
                    onTouchStart={(e) => { e.stopPropagation(); handleDpad('down', true) }}
                    onTouchEnd={(e) => { e.stopPropagation(); handleDpad('down', false) }}
                >
                    ▼
                </div>
                {/* LEFT */}
                <div
                    style={{
                        position: 'absolute',
                        top: '50px',
                        left: 0,
                        width: '50px',
                        height: '50px',
                        background: 'rgba(255, 255, 255, 0.2)',
                        border: '1px solid rgba(255, 255, 255, 0.4)',
                        borderRadius: '5px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        color: 'white',
                        pointerEvents: 'auto'
                    }}
                    onTouchStart={(e) => { e.stopPropagation(); handleDpad('left', true) }}
                    onTouchEnd={(e) => { e.stopPropagation(); handleDpad('left', false) }}
                >
                    ◀
                </div>
                {/* RIGHT */}
                <div
                    style={{
                        position: 'absolute',
                        top: '50px',
                        right: 0,
                        width: '50px',
                        height: '50px',
                        background: 'rgba(255, 255, 255, 0.2)',
                        border: '1px solid rgba(255, 255, 255, 0.4)',
                        borderRadius: '5px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        color: 'white',
                        pointerEvents: 'auto'
                    }}
                    onTouchStart={(e) => { e.stopPropagation(); handleDpad('right', true) }}
                    onTouchEnd={(e) => { e.stopPropagation(); handleDpad('right', false) }}
                >
                    ▶
                </div>
            </div>

            {/* Jump Button */}
            <div
                style={{
                    position: 'absolute',
                    bottom: '40px',
                    right: '40px',
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: 'rgba(0, 255, 255, 0.3)',
                    border: '2px solid rgba(0, 255, 255, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '14px',
                    pointerEvents: 'auto'
                }}
                onTouchStart={(e) => { e.stopPropagation(); setJumping(true) }}
                onTouchEnd={(e) => { e.stopPropagation(); setJumping(false) }}
            >
                JUMP
            </div>

            {/* Shoot Button */}
            <div
                style={{
                    position: 'absolute',
                    bottom: '60px',
                    right: '140px',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'rgba(255, 50, 50, 0.3)',
                    border: '2px solid rgba(255, 50, 50, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '12px',
                    pointerEvents: 'auto'
                }}
                onTouchStart={(e) => { e.stopPropagation(); setShooting(true) }}
                onTouchEnd={(e) => { e.stopPropagation(); setShooting(false) }}
            >
                FIRE
            </div>
        </div>
    )
}
