import { useEffect } from 'react'
import type { ComponentType } from 'react'
import { WindowLayer } from '@/components/WindowLayer'
import { TopPanel } from '@/components/TopPanel'
import { Dock } from '@/components/Dock'
import { Splash } from '@/components/Splash'
import { DesktopIcons } from '@/components/DesktopIcons'
import { StickerLayer } from '@/components/StickerLayer'
import { useWindowStore } from '@/store/window'
import {
  useSettingsStore,
  ACCENT_COLORS,
  applyAccent,
  applyFontMode,
} from '@/store/settings'
import { useTheme } from '@/components/theme-provider'
import { LuUser } from 'react-icons/lu'
import { openFile } from '@/lib/openFile'
import { ResumeApp } from '@/components/ResumeApp'

function App() {
  const blurAll = useWindowStore((s) => s.blurAll)
  const clampToViewport = useWindowStore((s) => s.clampToViewport)
  const wallpaper = useSettingsStore((s) => s.wallpaper)
  const accentIndex = useSettingsStore((s) => s.accentIndex)
  const fontMode = useSettingsStore((s) => s.fontMode)
  const { theme } = useTheme()

  useEffect(() => {
    applyFontMode(fontMode)
  }, [fontMode])

  useEffect(() => {
    const onResize = () => clampToViewport(window.innerWidth, window.innerHeight)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [clampToViewport])

  useEffect(() => {
    const isDark =
      theme === 'dark' ||
      (theme === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
    applyAccent(ACCENT_COLORS[accentIndex], isDark)
  }, [theme, accentIndex])

  // Open file from ?o= param or default to ResumeApp
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const fileParam = params.get('o')
    if (fileParam) {
      openFile(fileParam)
    } else {
      useWindowStore.getState().createWindow(
        'Resume',
        ResumeApp as ComponentType<Record<string, unknown>>,
        {},
        720, 640,
        undefined, undefined, undefined, undefined,
        LuUser,
      )
    }
  }, [])

  return (
    <div
      className="relative h-svh w-full overflow-hidden bg-background bg-cover bg-center"
      style={wallpaper ? { backgroundImage: `url(${wallpaper})` } : undefined}
      onPointerDown={blurAll}
    >
      {/* GNOME top panel */}
      <TopPanel />

      {/* Desktop icons */}
      <DesktopIcons />

      {/* Window layer */}
      <WindowLayer />

      {/* GNOME dock */}
      <Dock />

      {/* Sticker layer */}
      <StickerLayer />

      {/* Boot splash */}
      <Splash />
    </div>
  )
}

export default App
