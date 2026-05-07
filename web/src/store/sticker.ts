import { create } from 'zustand'

const STICKERS = [
  '🌟', '🔥', '💖', '🦋', '🌈', '🍕', '🎸', '🚀',
  '🎨', '🌸', '⭐', '💫', '🎯', '🦄', '🐱', '🌻',
  '🍄', '✨', '🎵', '👾', '🧸', '🍩', '🌮', '🐸',
]

function randomSticker(exclude?: string): string {
  const pool = exclude ? STICKERS.filter((s) => s !== exclude) : STICKERS
  return pool[Math.floor(Math.random() * pool.length)]
}

interface PlacedSticker {
  id: string
  emoji: string
  x: number
  y: number
}

interface StickerStore {
  active: boolean
  currentSticker: string
  placedStickers: PlacedSticker[]
  toggleActive: () => void
  placeSticker: (x: number, y: number) => void
}

export const useStickerStore = create<StickerStore>((set, get) => ({
  active: false,
  currentSticker: randomSticker(),
  placedStickers: [],

  toggleActive: () =>
    set((s) => ({
      active: !s.active,
      currentSticker: s.active ? s.currentSticker : randomSticker(),
    })),

  placeSticker: (x, y) => {
    const { currentSticker } = get()
    set((s) => ({
      placedStickers: [
        ...s.placedStickers,
        { id: crypto.randomUUID(), emoji: currentSticker, x, y },
      ],
      currentSticker: randomSticker(currentSticker),
    }))
  },
}))
