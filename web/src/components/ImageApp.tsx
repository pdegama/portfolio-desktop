import { useState } from 'react'
import { API_BASE_URL } from '@/lib/api'

export function ImageApp({ filePath, fileName }: { filePath: string; fileName: string }) {
  const [error, setError] = useState(false)
  const src = `${API_BASE_URL}/api/files/serve/${filePath}`

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="text-destructive">Failed to load {fileName}</span>
      </div>
    )
  }

  return (
    <div className="flex h-full items-center justify-center bg-background">
      <img
        src={src}
        alt={fileName}
        className="max-h-full max-w-full object-contain"
        onError={() => setError(true)}
      />
    </div>
  )
}
