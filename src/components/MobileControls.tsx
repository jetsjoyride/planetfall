import React, { useEffect, useRef, useState } from 'react'
import { useMobileControlsStore } from '../store/mobileControlsStore'
import { useGameStore } from '../store/gameStore'

export const MobileControls = () => {
    const { setMovement, setJumping, setShooting, setRunning, addCameraDelta, setIsMobile } = useMobileControlsStore()
    const { gameState } = useGameStore()

    // Touch look state
    const lookIdRef = useRef<number | null>(null)
    const lastLookPos = useRef<{ x: number, y: number } | null>(null)
    const lastTapTime = useRef<number>(0)

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

    // Continuous button state handlers
    const lookInterval = useRef<number | null>(null)

    useEffect(() => {
        return () => {
            if (lookInterval.current) clearInterval(lookInterval.current)
        }
    }, [])

    if (!isTouch || gameState !== 'playing') return null

    // Handlers
    const handleLookStart = (dir: 'up' | 'down') => {
        if (lookInterval.current) clearInterval(lookInterval.current)
        lookInterval.current = window.setInterval(() => {
            addCameraDelta(0, dir === 'up' ? -5 : 5) // Continuous pitch
        }, 16)
    }

    const handleLookEnd = () => {
        if (lookInterval.current) {
            clearInterval(lookInterval.current)
            lookInterval.current = null
        }
    }

    // Touch Look (Background)
    const handleBgTouchStart = (e: React.TouchEvent) => {
        const now = Date.now()
        // Double tap detection (within 300ms)
        if (now - lastTapTime.current < 300) {
            setShooting(true)
            setTimeout(() => setShooting(false), 100)
            lastTapTime.current = 0 // Reset
        } else {
            lastTapTime.current = now
        }

        // Only track if not already tracking
        if (lookIdRef.current === null) {
            const touch = e.changedTouches[0]
            lookIdRef.current = touch.identifier
            lastLookPos.current = { x: touch.clientX, y: touch.clientY }
        }
    }

    const handleBgTouchMove = (e: React.TouchEvent) => {
        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i]
            if (touch.identifier === lookIdRef.current && lastLookPos.current) {
                const deltaX = touch.clientX - lastLookPos.current.x
                const deltaY = touch.clientY - lastLookPos.current.y
                addCameraDelta(deltaX, deltaY)
                lastLookPos.current = { x: touch.clientX, y: touch.clientY }
            }
        }
    }

    const handleBgTouchEnd = (e: React.TouchEvent) => {
        for (let i = 0; i < e.changedTouches.length; i++) {
            if (e.changedTouches[i].identifier === lookIdRef.current) {
                lookIdRef.current = null
                lastLookPos.current = null
            }
        }
    }

    // Button Style
    const btnStyle: React.CSSProperties = {
        width: '100%',
        height: '100%',
        background: 'rgba(0, 0, 0, 0.5)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        borderRadius: '8px',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '14px',
        fontWeight: 'bold',
        userSelect: 'none',
        touchAction: 'none',
        pointerEvents: 'auto' // Buttons catch events
    }

    const containerStyle: React.CSSProperties = {
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        width: '240px',
        height: '180px', // 3 rows of 60px
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gridTemplateRows: '1fr 1fr 1fr',
        gap: '8px',
        zIndex: 1001,
        pointerEvents: 'none' // Grid container shouldn't block, but buttons will
    }

    return (
        <div
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1000, touchAction: 'none' }}
            onTouchStart={handleBgTouchStart}
            onTouchMove={handleBgTouchMove}
            onTouchEnd={handleBgTouchEnd}
        >
            <div style={containerStyle}>
                {/* Row 1 */}
                <div style={btnStyle} onTouchStart={(e) => { e.stopPropagation(); setJumping(true) }} onTouchEnd={(e) => { e.stopPropagation(); setJumping(false) }}>
                    Jump
                </div>
                <div style={btnStyle} onTouchStart={(e) => { e.stopPropagation(); setMovement(0, 1) }} onTouchEnd={(e) => { e.stopPropagation(); setMovement(0, 0) }}>
                    Forward
                    <span style={{ fontSize: '20px' }}>⬆️</span>
                </div>
                <div style={btnStyle} onTouchStart={(e) => { e.stopPropagation(); handleLookStart('up') }} onTouchEnd={(e) => { e.stopPropagation(); handleLookEnd() }}>
                    Look Up
                </div>

                {/* Row 2 */}
                <div style={btnStyle} onTouchStart={(e) => { e.stopPropagation(); setMovement(-1, 0) }} onTouchEnd={(e) => { e.stopPropagation(); setMovement(0, 0) }}>
                    Left
                    <span style={{ fontSize: '20px' }}>⬅️</span>
                </div>
                <div style={{ ...btnStyle, background: 'rgba(255, 0, 0, 0.5)' }} onTouchStart={(e) => { e.stopPropagation(); setShooting(true) }} onTouchEnd={(e) => { e.stopPropagation(); setShooting(false) }}>
                    Fire
                    <span style={{ fontSize: '10px' }}>🔴</span>
                </div>
                <div style={btnStyle} onTouchStart={(e) => { e.stopPropagation(); setMovement(1, 0) }} onTouchEnd={(e) => { e.stopPropagation(); setMovement(0, 0) }}>
                    Right
                    <span style={{ fontSize: '20px' }}>➡️</span>
                </div>

                {/* Row 3 */}
                <div style={btnStyle} onTouchStart={(e) => { e.stopPropagation(); setRunning(true) }} onTouchEnd={(e) => { e.stopPropagation(); setRunning(false) }}>
                    Run
                </div>
                <div style={btnStyle} onTouchStart={(e) => { e.stopPropagation(); setMovement(0, -1) }} onTouchEnd={(e) => { e.stopPropagation(); setMovement(0, 0) }}>
                    Reverse
                    <span style={{ fontSize: '20px' }}>⬇️</span>
                </div>
                <div style={btnStyle} onTouchStart={(e) => { e.stopPropagation(); handleLookStart('down') }} onTouchEnd={(e) => { e.stopPropagation(); handleLookEnd() }}>
                    Look<br />Down
                </div>
            </div>
        </div>
    )
}
