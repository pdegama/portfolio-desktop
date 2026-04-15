import { useState, useEffect } from 'react'
import { Moon, Sun, Monitor, ChevronDown } from 'lucide-react'
import { useTheme } from '@/components/theme-provider'
import { useWindowStore } from '@/store/window'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

function Clock() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const date = now.toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })

  return (
    <span className="text-xs font-medium">
      {date} {time}
    </span>
  )
}

const THEME_OPTIONS = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
] as const

export function TopPanel() {
  const focusedId = useWindowStore((s) => s.focusedId)
  const windows = useWindowStore((s) => s.windows)
  const { theme, setTheme } = useTheme()

  const focusedTitle = windows.find((w) => w.id === focusedId && !w.minimized)?.title

  const ThemeIcon =
    theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor

  return (
    <div
      className="absolute top-0 left-0 z-9999 flex h-8 w-full items-center justify-between border-b border-border bg-card px-3 text-card-foreground"
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* Left */}
      <div className="flex items-center gap-3">
        {focusedTitle ? (
          <span className="text-xs text-muted-foreground">{focusedTitle}</span>
        ) : (
          <span className="text-xs">Parthka</span>
        )}
      </div>

      {/* Center — Clock */}
      <div className="absolute left-1/2 -translate-x-1/2">
        <Clock />
      </div>

      {/* Right — System tray */}
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-xs hover:bg-muted outline-none">
          <ThemeIcon className="size-3.5" />
          <ChevronDown className="size-3" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={4} className="w-40">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-xs">Appearance</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
              <DropdownMenuItem
                key={value}
                onClick={() => setTheme(value)}
                className={theme === value ? 'font-medium bg-primary/10' : ''}
              >
                <Icon className="size-3.5" />
                {label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
