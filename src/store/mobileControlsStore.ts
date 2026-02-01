import { create } from 'zustand'

interface MobileControlsState {
    movement: { x: number; y: number }
    isJumping: boolean
    isShooting: boolean
    cameraDelta: { x: number; y: number }
    isMobile: boolean
    isRunning: boolean

    setMovement: (x: number, y: number) => void
    setJumping: (isJumping: boolean) => void
    setShooting: (isShooting: boolean) => void
    setRunning: (isRunning: boolean) => void
    addCameraDelta: (x: number, y: number) => void
    resetCameraDelta: () => void
    setIsMobile: (isMobile: boolean) => void
}

export const useMobileControlsStore = create<MobileControlsState>((set) => ({
    movement: { x: 0, y: 0 },
    isJumping: false,
    isShooting: false,
    cameraDelta: { x: 0, y: 0 },
    isMobile: false,
    isRunning: false,

    setMovement: (x, y) => set({ movement: { x, y } }),
    setJumping: (isJumping) => set({ isJumping }),
    setShooting: (isShooting) => set({ isShooting }),
    setRunning: (isRunning) => set({ isRunning }),
    addCameraDelta: (x, y) => set((state) => ({ cameraDelta: { x: state.cameraDelta.x + x, y: state.cameraDelta.y + y } })),
    resetCameraDelta: () => set({ cameraDelta: { x: 0, y: 0 } }),
    setIsMobile: (isMobile) => set({ isMobile }),
}))
