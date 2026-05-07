import { useEffect } from 'react'
import { motion, useMotionValue, useSpring } from 'motion/react'
import { useStickerStore } from '@/store/sticker'

export function StickerLayer() {
  const active = useStickerStore((s) => s.active)
  const currentSticker = useStickerStore((s) => s.currentSticker)
  const placedStickers = useStickerStore((s) => s.placedStickers)
  const placeSticker = useStickerStore((s) => s.placeSticker)
  const toggleActive = useStickerStore((s) => s.toggleActive)

  const mouseX = useMotionValue(-100)
  const mouseY = useMotionValue(-100)
  const springX = useSpring(mouseX, { stiffness: 280, damping: 22, mass: 0.5 })
  const springY = useSpring(mouseY, { stiffness: 280, damping: 22, mass: 0.5 })

  useEffect(() => {
    if (!active) return
    const onMove = (e: MouseEvent) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [active, mouseX, mouseY])

  // Escape key exits sticker mode
  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') toggleActive()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, toggleActive])

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    placeSticker(e.clientX, e.clientY)
  }

  return (
    <>
      {/* Placed stickers — always visible, on the desktop */}
      {placedStickers.map((s) => (
        <motion.div
          key={s.id}
          className="fixed pointer-events-none z-[99999] select-none"
          style={{ left: s.x, top: s.y }}
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        >
          <span className="text-[60px] block -translate-x-1/2 -translate-y-1/2">
            {s.emoji}
          </span>
        </motion.div>
      ))}

      {/* Active mode: click-capture overlay + cursor sticker */}
      {active && (
        <>
          {/* Invisible overlay to capture clicks (below dock z-9999) */}
          <div
            className="fixed inset-0 z-[9998] cursor-none"
            onClick={handleClick}
            onContextMenu={(e) => {
              e.preventDefault()
              toggleActive()
            }}
          />

          {/* Sticker following cursor with spring */}
          <motion.div
            className="fixed top-0 left-0 z-[99999] pointer-events-none select-none"
            style={{ x: springX, y: springY }}
          >
            <span className="text-[75px] block -translate-x-1/2 -translate-y-1/2 drop-shadow-lg">
              {currentSticker}
            </span>
          </motion.div>
        </>
      )}
    </>
  )
}
