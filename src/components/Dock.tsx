import type { ComponentType } from 'react'
import { FileText, Info, Settings, Terminal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useWindowStore } from '@/store/window'
import { FileApp } from '@/components/FileApp'
import { AboutApp } from '@/components/AboutApp'
import { SettingsApp } from '@/components/SettingsApp'
import { TerminalApp } from '@/components/TerminalApp'

interface DockItem {
  title: string
  icon: typeof FileText
  Component: ComponentType<Record<string, unknown>>,
  size?: {
    width: number
    height: number
  },
  maximiable?: boolean
}

const DOCK_ITEMS: DockItem[] = [
  { title: 'Files', icon: FileText, Component: FileApp },
  { title: 'Terminal', icon: Terminal, Component: TerminalApp, size: { width: 700, height: 450 } },
  { title: 'About', icon: Info, Component: AboutApp, maximiable: false },
  { title: 'Settings', icon: Settings, Component: SettingsApp, size: { width: 600, height: 400 } },
]

export function Dock() {
  const windows = useWindowStore((s) => s.windows)
  const focusedId = useWindowStore((s) => s.focusedId)
  const createWindow = useWindowStore((s) => s.createWindow)
  const bringToFront = useWindowStore((s) => s.bringToFront)
  const minimizeWindow = useWindowStore((s) => s.minimizeWindow)
  const restoreWindow = useWindowStore((s) => s.restoreWindow)

  const handleClick = (item: DockItem) => {
    // Find existing windows of this app
    const existing = windows.filter((w) => w.title === item.title)

    if (existing.length === 0) {
      // No instance — open new
      createWindow(item.title, item.Component, {}, item.size?.width, item.size?.height, item.maximiable)
    } else if (existing.length === 1) {
      const win = existing[0]
      if (win.minimized) {
        restoreWindow(win.id)
      } else if (focusedId === win.id) {
        minimizeWindow(win.id)
      } else {
        bringToFront(win.id)
      }
    } else {
      // Multiple instances — cycle focus
      const visibleIdx = existing.findIndex(
        (w) => w.id === focusedId && !w.minimized,
      )
      const next = existing[(visibleIdx + 1) % existing.length]
      if (next.minimized) {
        restoreWindow(next.id)
      } else {
        bringToFront(next.id)
      }
    }
  }

  return (
    <div
      className="absolute bottom-[5px] left-1/2 z-9999 flex -translate-x-1/2 items-end gap-1 rounded-lg border border-border bg-card px-2 py-1.5"
      onPointerDown={(e) => e.stopPropagation()}
    >
      {DOCK_ITEMS.map((item) => {
        const running = windows.filter((w) => w.title === item.title)
        const isActive = running.some((w) => w.id === focusedId && !w.minimized)
        const Icon = item.icon

        return (
          <button
            key={item.title}
            onClick={() => handleClick(item)}
            title={item.title}
            className={cn(
              'cursor-pointer group relative flex size-10 items-center justify-center rounded-lg transition-all duration-150',
              isActive
                ? 'bg-primary/15 text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <Icon className="size-5" />

            {/* Running indicator dots */}
            {running.length > 0 && (
              <div className="absolute -bottom-0.5 flex gap-0.5">
                {running.slice(0, 3).map((w) => (
                  <span
                    key={w.id}
                    className={cn(
                      'size-1 rounded-full',
                      w.id === focusedId && !w.minimized
                        ? 'bg-primary'
                        : 'bg-muted-foreground',
                    )}
                  />
                ))}
              </div>
            )}

            {/* Tooltip */}
            <span className="pointer-events-none absolute -top-8 rounded-md bg-popover px-2 py-1 text-[10px] text-popover-foreground border border-border opacity-0 transition-opacity group-hover:opacity-100">
              {item.title}
            </span>
          </button>
        )
      })}
    </div>
  )
}
