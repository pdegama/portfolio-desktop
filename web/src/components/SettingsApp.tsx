import { LuMonitor, LuMoon, LuSun, LuType, LuCode } from 'react-icons/lu'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/components/theme-provider'
import {
  useSettingsStore,
  ACCENT_COLORS,
  WALLPAPERS,
  applyAccent,
  applyFontMode,
  type FontMode,
} from '@/store/settings'

export function SettingsApp() {
  const { theme, setTheme } = useTheme()
  const {
    wallpaper,
    setWallpaper,
    accentIndex,
    setAccentIndex,
    fontMode,
    setFontMode,
  } = useSettingsStore()

  const isDark =
    theme === 'dark' ||
    (theme === 'system' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches)

  const handleAccent = (i: number) => {
    setAccentIndex(i)
    applyAccent(ACCENT_COLORS[i], isDark)
  }

  const handleTheme = (t: 'light' | 'dark' | 'system') => {
    setTheme(t)
    const willBeDark =
      t === 'dark' ||
      (t === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
    applyAccent(ACCENT_COLORS[accentIndex], willBeDark)
  }

  const handleFont = (mode: FontMode) => {
    setFontMode(mode)
    applyFontMode(mode)
  }

  return (
    <div className="space-y-5 text-sm">
      {/* Theme */}
      <section className="space-y-2">
        <h3 className="font-semibold">Theme</h3>
        <div className="flex gap-2">
          {([
            { value: 'light', icon: LuSun, label: 'Light' },
            { value: 'dark', icon: LuMoon, label: 'Dark' },
            { value: 'system', icon: LuMonitor, label: 'System' },
          ] as const).map(({ value, icon: Icon, label }) => (
            <Button
              key={value}
              variant={theme === value ? 'default' : 'outline'}
              onClick={() => handleTheme(value)}
            >
              <Icon className="size-3.5" />
              {label}
            </Button>
          ))}
        </div>
      </section>

      {/* Accent Color */}
      <section className="space-y-2">
        <h3 className="font-semibold">Accent Color</h3>
        <div className="flex flex-wrap gap-2">
          {ACCENT_COLORS.map((color, i) => (
            <button
              key={color.name}
              onClick={() => handleAccent(i)}
              title={color.name}
              className={cn(
                'size-7 rounded-full border-2 transition-transform hover:scale-110',
                accentIndex === i
                  ? 'border-foreground scale-110'
                  : 'border-transparent',
              )}
              style={{ background: isDark ? color.dark : color.light }}
            />
          ))}
        </div>
      </section>

      {/* Font */}
      <section className="space-y-2">
        <h3 className="font-semibold">Font</h3>
        <div className="flex gap-2">
          {([
            { value: 'sans', icon: LuType, label: 'Sans', preview: 'Aa' },
            { value: 'mono', icon: LuCode, label: 'Mono', preview: 'Aa' },
          ] as const).map(({ value, icon: Icon, label, preview }) => (
            <Button
              key={value}
              variant={fontMode === value ? 'default' : 'outline'}
              onClick={() => handleFont(value)}
            >
              <Icon className="size-3.5" />
              {label}
              <span
                className={cn(
                  'ml-1 text-xs opacity-70',
                  value === 'mono' && 'font-mono',
                )}
              >
                {preview}
              </span>
            </Button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Mono switches the entire UI to JetBrains Mono.
        </p>
      </section>

      {/* Wallpaper */}
      <section className="space-y-2">
        <h3 className="font-semibold">Wallpaper</h3>
        <div className="flex gap-2 flex-wrap">
          {WALLPAPERS.map((wp) => (
            <button
              key={wp.name}
              onClick={() => setWallpaper(wp.url)}
              className={cn(
                'h-16 w-24 overflow-hidden rounded-md border-2 transition-transform hover:scale-105',
                wallpaper === wp.url
                  ? 'border-primary'
                  : 'border-border',
              )}
            >
              {wp.url ? (
                <img
                  src={wp.url}
                  alt={wp.name}
                  className="size-full object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center bg-muted text-xs text-muted-foreground">
                  None
                </div>
              )}
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
