import type { ComponentType } from 'react'
import { LuFileText, LuInfo, LuSettings, LuTerminal, LuUser, LuFileQuestion } from 'react-icons/lu'
import { cn } from '@/lib/utils'
import { useWindowStore } from '@/store/window'
import { FileApp } from '@/components/FileApp'
import { AboutApp } from '@/components/AboutApp'
import { SettingsApp } from '@/components/SettingsApp'
import { TerminalApp } from '@/components/TerminalApp'
import { ResumeApp } from '@/components/ResumeApp'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface DockItem {
  title: string
  icon: ComponentType<{ className?: string }>
  Component: ComponentType<Record<string, unknown>>,
  size?: {
    width: number
    height: number
  },
  minSize?: {
    width: number
    height: number
  },
  maximiable?: boolean,
  padding?: boolean,
}

const DOCK_ITEMS: DockItem[] = [
  { title: 'Files', icon: LuFileText, Component: FileApp, padding: false, size: { width: 900, height: 660 }, minSize: { width: 400, height: 300 } },
  { title: 'Resume', icon: LuUser, Component: ResumeApp, size: { width: 720, height: 640 }, minSize: { width: 400, height: 300 } },
  { title: 'Terminal', icon: LuTerminal, Component: TerminalApp, size: { width: 700, height: 450 }, padding: false, minSize: { width: 300, height: 200 } },
  { title: 'About', icon: LuInfo, Component: AboutApp, maximiable: false, size: { width: 320, height: 450 }, minSize: { width: 250, height: 200 } },
  { title: 'Settings', icon: LuSettings, Component: SettingsApp, size: { width: 600, height: 460 }, minSize: { width: 350, height: 300 } },
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
      createWindow(item.title, item.Component, {}, item.size?.width, item.size?.height, item.maximiable, item.padding, item.minSize?.width, item.minSize?.height, item.icon)
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

  const dockTitles = DOCK_ITEMS.map((i) => i.title)
  const otherWindows = windows.filter((w) => !dockTitles.includes(w.title))

  return (
    <TooltipProvider delay={0}>
      <div
        className="absolute bottom-1.25 left-1/2 z-9999 flex -translate-x-1/2 items-end gap-1 rounded-lg border border-border bg-card px-2 py-1.5"
        onPointerDown={(e) => e.stopPropagation()}
      >
        {DOCK_ITEMS.map((item) => {
          const running = windows.filter((w) => w.title === item.title)
          const isActive = running.some((w) => w.id === focusedId && !w.minimized)
          const Icon = item.icon

          return (
            <Tooltip key={item.title}>
              <TooltipTrigger
                render={
                  <button
                    onClick={() => handleClick(item)}
                    className={cn(
                      'cursor-pointer relative flex size-10 items-center justify-center rounded-lg transition-all duration-150',
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
                  </button>
                }
              />
              <TooltipContent sideOffset={8}>{item.title}</TooltipContent>
            </Tooltip>
          )
        })}

        {/* Separator + dynamic windows */}
        {otherWindows.length > 0 && (
          <>
            <div className="mx-0.5 h-8 w-px self-center bg-border" />
            {otherWindows.map((win) => {
              const isActive = win.id === focusedId && !win.minimized
              const WinIcon = win.icon || LuFileQuestion
              return (
                <Tooltip key={win.id}>
                  <TooltipTrigger
                    render={
                      <button
                        onClick={() => {
                          if (win.minimized) {
                            restoreWindow(win.id)
                          } else if (focusedId === win.id) {
                            minimizeWindow(win.id)
                          } else {
                            bringToFront(win.id)
                          }
                        }}
                        className={cn(
                          'cursor-pointer relative flex size-10 items-center justify-center rounded-lg transition-all duration-150',
                          isActive
                            ? 'bg-primary/15 text-primary'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                        )}
                      >
                        <WinIcon className="size-5" />
                        <div className="absolute -bottom-0.5 flex gap-0.5">
                          <span
                            className={cn(
                              'size-1 rounded-full',
                              isActive ? 'bg-primary' : 'bg-muted-foreground',
                            )}
                          />
                        </div>
                      </button>
                    }
                  />
                  <TooltipContent sideOffset={8}>{win.title}</TooltipContent>
                </Tooltip>
              )
            })}
          </>
        )}
      </div>
    </TooltipProvider>
  )
}
