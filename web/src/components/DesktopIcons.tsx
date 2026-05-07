import { useState, useEffect, useCallback, type ComponentType } from 'react'
import { LuFile, LuFileText, LuImage, LuMusic } from 'react-icons/lu'
import { cn } from '@/lib/utils'
import api from '@/lib/api'
import { openFile } from '@/lib/openFile'
import { useWindowStore } from '@/store/window'
import { ACCENT_COLORS, useSettingsStore } from '@/store/settings'
import { FileApp } from '@/components/FileApp'

interface FileItem {
  name: string
  type: 'file' | 'directory'
  size: number | null
  modified: string
}

const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.bmp', '.ico'])
const MUSIC_EXTS = new Set(['.mp3', '.wav', '.ogg', '.flac', '.aac', '.m4a'])

function getExt(name: string): string {
  const dot = name.lastIndexOf('.')
  return dot === -1 ? '' : name.slice(dot).toLowerCase()
}

function FileIcon({ name }: { name: string }) {
  const ext = getExt(name)
  if (ext === '.md') return <LuFileText className="h-8 w-8 text-white/80 drop-shadow-md" />
  if (IMAGE_EXTS.has(ext)) return <LuImage className="h-8 w-8 text-white/80 drop-shadow-md" />
  if (MUSIC_EXTS.has(ext)) return <LuMusic className="h-8 w-8 text-white/80 drop-shadow-md" />
  return <LuFile className="h-8 w-8 text-white/80 drop-shadow-md" />
}

export function DesktopIcons() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const accentIndex = useSettingsStore((s) => s.accentIndex)
  const systemColor = ACCENT_COLORS[accentIndex].color
  const createWindow = useWindowStore((s) => s.createWindow)

  useEffect(() => {
    api.get('/api/files', { params: { path: '' } })
      .then(({ data }) => {
        if (data.success) setFiles(data.data)
      })
      .catch(() => {})
  }, [])

  const handleDoubleClick = useCallback(
    (item: FileItem) => {
      if (item.type === 'directory') {
        createWindow(
          "Files",
          FileApp as ComponentType<Record<string, unknown>>,
          { initialPath: item.name },
          900, 660, true, false, 400, 300,
          LuFileText,
        )
      } else {
        openFile(item.name)
      }
    },
    [createWindow],
  )

  const sorted = files
    .filter((f) => !f.name.startsWith('.'))
    .sort((a, b) => {
      if (a.type !== b.type) return a.type === 'directory' ? -1 : 1
      return a.name.localeCompare(b.name)
    })

  return (
    <div
      className="absolute inset-0 top-[37px] bottom-[56px] z-0 select-none overflow-hidden p-3"
      onClick={() => setSelected(null)}
    >
      <div
        className="h-full"
        style={{
          display: 'grid',
          gridAutoFlow: 'column',
          gridTemplateRows: 'repeat(auto-fill, 90px)',
          gridAutoColumns: '90px',
          gap: '2px',
          alignContent: 'start',
        }}
      >
        {sorted.map((item) => (
          <div
            key={item.name}
            className={cn(
              'flex flex-col items-center justify-start rounded-lg p-1.5 cursor-default transition-colors duration-100 hover:bg-white/10',
            )}
            onClick={(e) => {
              e.stopPropagation()
              setSelected(item.name)
            }}
            onDoubleClick={() => handleDoubleClick(item)}
          >
            <div className="w-11 h-11 flex items-center justify-center shrink-0">
              {item.type === 'directory' ? (
                <img
                  src={`/icons/dir-${systemColor}.svg`}
                  alt=""
                  className="w-full h-full object-contain drop-shadow-md"
                  draggable={false}
                />
              ) : (
                <FileIcon name={item.name} />
              )}
            </div>
            <span
              className={cn(
                'mt-1 w-full text-center text-[11px] leading-tight font-medium line-clamp-2 break-all',
                selected === item.name
                  ? 'text-white'
                  : 'text-white/90',
              )}
              style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9), 0 0 6px rgba(0,0,0,0.5)' }}
            >
              {item.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
