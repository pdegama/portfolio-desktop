import type { ComponentType } from 'react'
import { create } from 'zustand'

export const PAD_L = 5
export const PAD_R = 5
export const PAD_T = 37
export const PAD_B = 64

interface SavedBounds {
  x: number
  y: number
  w: number
  h: number
}

export interface WindowState {
  id: string
  title: string
  icon: ComponentType<{ className?: string }> | null
  Component: ComponentType<Record<string, unknown>>
  props: Record<string, unknown>
  x: number
  y: number
  w: number
  h: number
  minW: number
  minH: number
  zIndex: number
  minimized: boolean
  maximized: boolean
  preMaxBounds: SavedBounds | null
  maximiable: boolean
  padding: boolean
}

interface WindowStore {
  windows: WindowState[]
  focusedId: string | null
  _zCounter: number
  createWindow: (
    title: string,
    Component: ComponentType<Record<string, unknown>>,
    props?: Record<string, unknown>,
    width?: number,
    height?: number,
    maximiable?: boolean,
    padding?: boolean,
    minW?: number,
    minH?: number,
    icon?: ComponentType<{ className?: string }>,
  ) => void
  closeWindow: (id: string) => void
  updatePosition: (id: string, x: number, y: number) => void
  updateSize: (id: string, w: number, h: number) => void
  bringToFront: (id: string) => void
  minimizeWindow: (id: string) => void
  restoreWindow: (id: string) => void
  maximizeWindow: (id: string) => void
  unmaximizeWindow: (id: string) => void
  toggleMaximize: (id: string) => void
  setWindowIcon: (id: string, icon: ComponentType<{ className?: string }>) => void
  clampToViewport: (vw: number, vh: number) => void
  blurAll: () => void
}

function getMaxBounds() {
  return {
    x: PAD_L,
    y: PAD_T,
    w: window.innerWidth - PAD_L - PAD_R,
    h: window.innerHeight - PAD_T - PAD_B,
  }
}

export const useWindowStore = create<WindowStore>((set, get) => ({
  windows: [],
  focusedId: null,
  _zCounter: 1,

  createWindow: (title, Component, props = {}, width = 320, height = 240, maximiable = true, padding = true, minW = 200, minH = 120, icon) =>
    set((state) => {
      const vw = window.innerWidth
      const vh = window.innerHeight
      const isSmall = vw <= 500

      const focusdWindow = state.windows.find((w) => w.id === state.focusedId)
      const baseX = Math.min(focusdWindow ? focusdWindow.x + 30 : 120, vw - PAD_R - width)
      const baseY = Math.min(focusdWindow ? focusdWindow.y + 30 : PAD_T + 40, vh - PAD_B - height)
      
      const id = crypto.randomUUID()

      const bounds = isSmall
        ? { x: PAD_L, y: PAD_T, w: vw - PAD_L - PAD_R, h: vh - PAD_T - PAD_B }
        : { x: baseX, y: baseY, w: width, h: height }

      return {
        _zCounter: state._zCounter + 1,
        focusedId: id,
        windows: [
          ...state.windows,
          {
            id,
            title,
            icon: icon || null,
            Component,
            props,
            ...bounds,
            zIndex: state._zCounter + 1,
            minimized: false,
            maximized: isSmall,
            preMaxBounds: isSmall ? { x: baseX, y: baseY, w: width, h: height } : null,
            maximiable: maximiable,
            padding: padding,
            minW,
            minH,
          },
        ],
      }
    }),

  closeWindow: (id) =>
    set((state) => ({
      focusedId: state.focusedId === id ? null : state.focusedId,
      windows: state.windows.filter((w) => w.id !== id),
    })),

  updatePosition: (id, x, y) =>
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, x, y } : w,
      ),
    })),

  updateSize: (id, w, h) =>
    set((state) => ({
      windows: state.windows.map((win) =>
        win.id === id ? { ...win, w, h } : win,
      ),
    })),

  bringToFront: (id) =>
    set((state) => ({
      _zCounter: state._zCounter + 1,
      focusedId: id,
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, zIndex: state._zCounter + 1 } : w,
      ),
    })),

  minimizeWindow: (id) =>
    set((state) => ({
      focusedId: state.focusedId === id ? null : state.focusedId,
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, minimized: true } : w,
      ),
    })),

  restoreWindow: (id) =>
    set((state) => ({
      _zCounter: state._zCounter + 1,
      focusedId: id,
      windows: state.windows.map((w) =>
        w.id === id
          ? { ...w, minimized: false, zIndex: state._zCounter + 1 }
          : w,
      ),
    })),

  maximizeWindow: (id) => {
    const bounds = getMaxBounds()
    set((state) => ({
      _zCounter: state._zCounter + 1,
      focusedId: id,
      windows: state.windows.map((w) =>
        w.id === id
          ? {
            ...w,
            preMaxBounds: { x: w.x, y: w.y, w: w.w, h: w.h },
            maximized: true,
            ...bounds,
            zIndex: state._zCounter + 1,
          }
          : w,
      ),
    }))
  },

  unmaximizeWindow: (id) =>
    set((state) => ({
      windows: state.windows.map((w) => {
        if (w.id !== id || !w.preMaxBounds) return w
        return {
          ...w,
          ...w.preMaxBounds,
          maximized: false,
          preMaxBounds: null,
        }
      }),
    })),

  toggleMaximize: (id) => {
    const win = get().windows.find((w) => w.id === id)
    if (!win) return
    if (win.maximized) {
      get().unmaximizeWindow(id)
    } else {
      get().maximizeWindow(id)
    }
  },

  setWindowIcon: (id, icon) =>
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, icon } : w,
      ),
    })),

  clampToViewport: (vw, vh) => {
    const areaW = vw - PAD_L - PAD_R
    const areaH = vh - PAD_T - PAD_B
    const forceMax = vw <= 500

    set((state) => ({
      windows: state.windows.map((w) => {
        if (forceMax) {
          return {
            ...w,
            maximized: true,
            preMaxBounds: w.preMaxBounds ?? { x: w.x, y: w.y, w: w.w, h: w.h },
            x: PAD_L, y: PAD_T, w: areaW, h: areaH,
          }
        }
        if (w.maximized) {
          return { ...w, x: PAD_L, y: PAD_T, w: areaW, h: areaH }
        }
        const nw = Math.min(w.w, areaW)
        const nh = Math.min(w.h, areaH)
        const nx = Math.max(PAD_L, Math.min(w.x, PAD_L + areaW - nw))
        const ny = Math.max(PAD_T, Math.min(w.y, PAD_T + areaH - nh))
        return { ...w, x: nx, y: ny, w: nw, h: nh }
      }),
    }))
  },

  blurAll: () => set({ focusedId: null }),
}))
