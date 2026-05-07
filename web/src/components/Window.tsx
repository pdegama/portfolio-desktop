import { memo, useRef, useCallback, useEffect, useSyncExternalStore } from 'react'
import { LuX, LuMinus, LuSquare, LuCopyMinus } from 'react-icons/lu'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { PAD_T, useWindowStore, type WindowState } from '@/store/window'

const SMALL_BREAKPOINT = 500

function useIsSmallScreen() {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(`(max-width: ${SMALL_BREAKPOINT}px)`)
      mq.addEventListener('change', cb)
      return () => mq.removeEventListener('change', cb)
    },
    () => window.innerWidth <= SMALL_BREAKPOINT,
  )
}

type Edge =
  | 'top' | 'bottom' | 'left' | 'right'
  | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

export const Window = memo(function Window({
  id,
  title,
  icon,
  Component,
  props,
  x,
  y,
  w,
  h,
  zIndex,
  minimized,
  maximized,
  maximiable,
  padding,
  minW,
  minH,
}: WindowState) {
  const closeWindow = useWindowStore((s) => s.closeWindow)
  const updatePosition = useWindowStore((s) => s.updatePosition)
  const updateSize = useWindowStore((s) => s.updateSize)
  const bringToFront = useWindowStore((s) => s.bringToFront)
  const minimizeWindow = useWindowStore((s) => s.minimizeWindow)
  const toggleMaximize = useWindowStore((s) => s.toggleMaximize)
  const unmaximizeWindow = useWindowStore((s) => s.unmaximizeWindow)
  const isFocused = useWindowStore((s) => s.focusedId === id)
  const isSmall = useIsSmallScreen()
  const preMaxBounds = useWindowStore(
    (s) => s.windows.find((win) => win.id === id)?.preMaxBounds,
  )

  const posRef = useRef({ x, y })
  const sizeRef = useRef({ w, h })

  useEffect(() => {
    posRef.current = { x, y }
    sizeRef.current = { w, h }
  }, [x, y, w, h])

  const winRef = useRef<HTMLDivElement>(null)

  /* ---- drag title bar ---- */
  const handleDragPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return
    if (isSmall) return // locked maximized on small screens
    e.preventDefault()
    bringToFront(id)

    // If maximized, unmaximize and reposition so cursor stays proportionally on title bar
    if (maximized && preMaxBounds) {
      const prevW = preMaxBounds.w
      const prevH = preMaxBounds.h
      const ratio = e.clientX / window.innerWidth
      const nx = e.clientX - prevW * ratio
      const ny = e.clientY - 16 // keep cursor near top of title bar

      unmaximizeWindow(id)
      // Override with cursor-relative position
      updatePosition(id, nx, ny)
      updateSize(id, prevW, prevH)
      posRef.current = { x: nx, y: ny }
      sizeRef.current = { w: prevW, h: prevH }

      if (winRef.current) {
        winRef.current.style.left = `${nx}px`
        winRef.current.style.top = `${ny}px`
        winRef.current.style.width = `${prevW}px`
        winRef.current.style.height = `${prevH}px`
      }

      const startX = e.clientX - nx
      const startY = e.clientY - ny

      const onMove = (ev: PointerEvent) => {
        const mx = ev.clientX - startX
        const my = Math.max(ev.clientY - startY, PAD_T)
        posRef.current = { x: mx, y: my }
        if (winRef.current) {
          winRef.current.style.left = `${mx}px`
          winRef.current.style.top = `${my}px`
        }
      }

      const onUp = () => {
        window.removeEventListener('pointermove', onMove)
        window.removeEventListener('pointerup', onUp)
        updatePosition(id, posRef.current.x, posRef.current.y)
      }

      window.addEventListener('pointermove', onMove)
      window.addEventListener('pointerup', onUp)
      return
    }

    const startX = e.clientX - posRef.current.x
    const startY = e.clientY - posRef.current.y

    const onMove = (ev: PointerEvent) => {
      const nx = ev.clientX - startX
      const ny = Math.max(ev.clientY - startY, PAD_T)
      posRef.current = { x: nx, y: ny }
      if (winRef.current) {
        winRef.current.style.left = `${nx}px`
        winRef.current.style.top = `${ny}px`
      }
    }

    const onUp = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      updatePosition(id, posRef.current.x, posRef.current.y)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  /* ---- resize edges ---- */
  const resizesRight = (e: Edge) => e.includes('right')
  const resizesLeft = (e: Edge) => e.includes('left')
  const resizesBottom = (e: Edge) => e === 'bottom' || e.startsWith('bottom-')
  const resizesTop = (e: Edge) => e === 'top' || e.startsWith('top-')

  const handleResizePointerDown = useCallback(
    (edge: Edge) => (e: React.PointerEvent<HTMLDivElement>) => {
      if (maximized) return
      e.preventDefault()
      e.stopPropagation()
      bringToFront(id)

      const el = e.currentTarget
      el.setPointerCapture(e.pointerId)

      const startMouseX = e.clientX
      const startMouseY = e.clientY
      const startW = sizeRef.current.w
      const startH = sizeRef.current.h
      const startX = posRef.current.x
      const startY = posRef.current.y

      const onMove = (ev: PointerEvent) => {
        const dx = ev.clientX - startMouseX
        const dy = ev.clientY - startMouseY
        let nw = startW
        let nh = startH
        let nx = startX
        let ny = startY

        if (resizesRight(edge)) {
          nw = Math.max(minW, startW + dx)
        }
        if (resizesLeft(edge)) {
          nw = Math.max(minW, startW - dx)
          nx = startX + startW - nw
        }
        if (resizesBottom(edge)) {
          nh = Math.max(minH, startH + dy)
        }
        if (resizesTop(edge)) {
          nh = Math.max(minH, startH - dy)
          ny = startY + startH - nh
        }

        ny = Math.max(ny, PAD_T)

        sizeRef.current = { w: nw, h: nh }
        posRef.current = { x: nx, y: ny }
        if (winRef.current) {
          winRef.current.style.width = `${nw}px`
          winRef.current.style.height = `${nh}px`
          winRef.current.style.left = `${nx}px`
          winRef.current.style.top = `${ny}px`
        }
      }

      const onUp = () => {
        el.removeEventListener('pointermove', onMove)
        el.removeEventListener('pointerup', onUp)
        updateSize(id, sizeRef.current.w, sizeRef.current.h)
        updatePosition(id, posRef.current.x, posRef.current.y)
      }

      el.addEventListener('pointermove', onMove)
      el.addEventListener('pointerup', onUp)
    },
    [id, maximized, minW, minH, bringToFront, updateSize, updatePosition],
  )

  return (
    <div
      ref={winRef}
      data-window
      className={cn(
        'absolute flex flex-col overflow-hidden rounded-lg border bg-card shadow-lg transition-colors',
        isFocused ? 'border-primary' : 'border-border',
        minimized && 'hidden',
      )}
      style={{ left: x, top: y, width: w, height: h, zIndex }}
      onPointerDown={(e) => {
        e.stopPropagation()
        bringToFront(id)
      }}
    >
      {/* Title bar */}
      <div
        onPointerDown={handleDragPointerDown}
        onDoubleClick={isSmall || !maximiable ? undefined : () => toggleMaximize(id)}
        className={cn(
          'flex shrink-0 cursor-move items-center justify-between border-b px-3 py-2',
          isFocused ? 'border-primary/30 bg-primary/5 dark:bg-primary/20' : 'border-border bg-muted',
        )}
      >
        <span className="flex items-center gap-1.5 text-sm font-medium select-none">
          {icon && (() => { const Icon = icon; return <Icon className="size-3.5" /> })()}
          {title}
        </span>
        <div className="flex gap-1">
          <Button
            variant="titleBar"
            size="icon-xs"
            onClick={(e) => {
              e.stopPropagation()
              minimizeWindow(id)
            }}
          >
            <LuMinus className="size-3.5" />
          </Button>
          {!isSmall && maximiable && (
            <Button
              variant="titleBar"
              size="icon-xs"
              onClick={(e) => {
                e.stopPropagation()
                toggleMaximize(id)
              }}
            >
              {maximized
                ? <LuCopyMinus className="size-3.5" />
                : <LuSquare className="size-3" />
              }
            </Button>
          )}
          <Button
            variant="titleBar"
            size="icon-xs"
            onClick={(e) => {
              e.stopPropagation()
              closeWindow(id)
            }}
          >
            <LuX className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className={cn(
        "flex-1 overflow-auto",
        {
          "p-4": padding
        }
      )}>
        <Component {...props} winId={id} />
      </div>

      {/* Resize handles — hidden when maximized */}
      {!maximized && (
        <>
          <div onPointerDown={handleResizePointerDown('top')} className="absolute top-0 left-1.5 right-1.5 h-1.5 cursor-n-resize" />
          <div onPointerDown={handleResizePointerDown('bottom')} className="absolute bottom-0 left-1.5 right-1.5 h-1.5 cursor-s-resize" />
          <div onPointerDown={handleResizePointerDown('left')} className="absolute top-1.5 bottom-1.5 left-0 w-1.5 cursor-w-resize" />
          <div onPointerDown={handleResizePointerDown('right')} className="absolute top-1.5 bottom-1.5 right-0 w-1.5 cursor-e-resize" />
          <div onPointerDown={handleResizePointerDown('top-left')} className="absolute top-0 left-0 size-2 cursor-nw-resize" />
          <div onPointerDown={handleResizePointerDown('top-right')} className="absolute top-0 right-0 size-2 cursor-ne-resize" />
          <div onPointerDown={handleResizePointerDown('bottom-left')} className="absolute bottom-0 left-0 size-2 cursor-sw-resize" />
          <div onPointerDown={handleResizePointerDown('bottom-right')} className="absolute bottom-0 right-0 size-2 cursor-se-resize" />
        </>
      )}
    </div>
  )
})
