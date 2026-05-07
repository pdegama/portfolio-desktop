import type { ComponentType } from 'react'
import { LuALargeSmall, LuImage } from 'react-icons/lu'
import { useWindowStore } from '@/store/window'
import { MarkdownApp } from '@/components/MarkdownApp'
import { ImageApp } from '@/components/ImageApp'
import { useDockStore } from '@/store/dock'

const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.bmp', '.ico']
const MUSIC_EXTENSIONS = ['.mp3', '.wav', '.ogg', '.flac', '.aac', '.m4a']

function getFileName(filePath: string): string {
  const slash = filePath.lastIndexOf('/')
  return slash === -1 ? filePath : filePath.slice(slash + 1)
}

function getExtension(name: string): string {
  const dot = name.lastIndexOf('.')
  return dot === -1 ? '' : name.slice(dot).toLowerCase()
}

export function openFile(filePath: string): boolean {
  const fileName = getFileName(filePath)
  const ext = getExtension(fileName)
  const create = useWindowStore.getState().createWindow
  const setDockExtrantion = useDockStore.getState().setExtrantion
  const setMusic = useDockStore.getState().setMusic

  if (ext === '.md') {
    create(
      fileName,
      // @ts-ignore
      MarkdownApp as ComponentType<Record<string, unknown>>,
      { filePath, fileName },
      720, 640, true, true, 400, 300,
      LuALargeSmall,
    )
    return true
  }

  if (IMAGE_EXTENSIONS.includes(ext)) {
    create(
      fileName,
      ImageApp as ComponentType<Record<string, unknown>>,
      { filePath, fileName },
      800, 600, true, false, 300, 200,
      LuImage,
    )
    return true
  }

  if (MUSIC_EXTENSIONS.includes(ext)) {
    setDockExtrantion("music")
    setMusic({
      file: filePath,
      loading: true,
      playing: false,
    })
    return true
  }

  return false
}
