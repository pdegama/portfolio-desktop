import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import mermaid from 'mermaid'
import { parse as parseToml } from 'smol-toml'
import { LuShare2, LuCheck } from 'react-icons/lu'
import api, { API_BASE_URL } from '@/lib/api'

mermaid.initialize({ startOnLoad: false, theme: 'default' })

let mermaidCounter = 0

function MermaidBlock({ code }: { code: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const id = `mermaid-${++mermaidCounter}`
    mermaid.render(id, code).then(({ svg }) => {
      if (ref.current) ref.current.innerHTML = svg
    }).catch(() => {
      if (ref.current) ref.current.textContent = code
    })
  }, [code])

  return <div ref={ref} className="my-4 flex justify-center" />
}

function GoatBlock({ code }: { code: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    api.post('/api/goat', { code }, { responseType: 'text' })
      .then((res) => {
        if (ref.current) ref.current.innerHTML = res.data
      })
      .catch(() => setError(true))
  }, [code])

  if (error) {
    return (
      <pre className="overflow-x-auto rounded-lg border bg-muted p-4 text-sm">
        <code>{code}</code>
      </pre>
    )
  }

  return <div ref={ref} className="my-4 flex justify-center [&_svg]:max-w-full" />
}

interface FrontMatter {
  title?: string
  description?: string
  author?: string
  date?: string
  cover?: string
  tags?: string[]
  keywords?: string[]
  draft?: boolean
}

function parseFrontMatter(raw: string): { frontMatter: FrontMatter | null; body: string } {
  const tomlMatch = raw.match(/^\+\+\+\s*\n([\s\S]*?)\n\+\+\+\s*\n?/)
  if (tomlMatch) {
    try {
      const fm = parseToml(tomlMatch[1]) as unknown as FrontMatter
      return { frontMatter: fm, body: raw.slice(tomlMatch[0].length) }
    } catch {
      return { frontMatter: null, body: raw }
    }
  }
  return { frontMatter: null, body: raw }
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return dateStr
  }
}

function resolveImageUrl(src: string): string {
  if (src.startsWith('http')) return src
  return `${API_BASE_URL}/api/files/serve/${src.replace(/^\//, '')}`
}

function ShareButton({ filePath }: { filePath: string }) {
  const [copied, setCopied] = useState(false)

  const handleShare = () => {
    const url = `${import.meta.env.VITE_FRONTEND_URL}/?o=${encodeURIComponent(filePath)}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center gap-1.5 border border-primary/25 bg-foreground/5 px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
    >
      {copied ? <LuCheck className="size-3.5 text-primary" /> : <LuShare2 className="size-3.5" />}
      {copied ? 'Copied!' : 'Share'}
    </button>
  )
}

function PostHeader({ fm, filePath }: { fm: FrontMatter; filePath: string }) {
  return (
    <header className="mb-8 space-y-4">
      <div className="flex items-start justify-between gap-4">
        {fm.title && (
          <h1 className="text-[1.45em] font-semibold text-foreground leading-tight">{fm.title}</h1>
        )}
        <ShareButton filePath={filePath} />
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {fm.author && <span>by <span className="text-foreground font-medium">{fm.author}</span></span>}
        {fm.date && <span>{formatDate(fm.date)}</span>}
        {fm.draft && <span className="border border-primary/50 text-primary px-1.5 py-0.5">draft</span>}
      </div>
      {fm.cover && (
        <img
          src={resolveImageUrl(fm.cover)}
          alt={fm.title || ''}
          className="w-full max-h-80 object-cover border-2 border-primary overflow-hidden"
        />
      )}
      {fm.description && (
        <p className="text-muted-foreground italic">{fm.description}</p>
      )}
      {fm.tags && fm.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {fm.tags.map((tag) => (
            <span key={tag} className="border-t border-x border-primary/25 border-b-[3px] border-b-primary rounded bg-foreground/5 px-2 py-0.5 text-[11px] text-foreground">
              {tag}
            </span>
          ))}
        </div>
      )}
      <hr className="border-none bg-primary h-0.5" />
    </header>
  )
}

export function MarkdownAppBase({ filePath, fileName, }: { filePath: string; fileName: string; }) {
  const [rawContent, setRawContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    api.get(`/api/files/serve/${filePath}`, { responseType: 'text' })
      .then((res) => {
        setRawContent(res.data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch file')
        setLoading(false)
        alert(`Error loading ${fileName}: ${err.message || 'Unknown error'}`)
        // closeWindow(winId)
      })
  }, [filePath])

  const { frontMatter, body: content } = useMemo(() => parseFrontMatter(rawContent), [rawContent])

  const renderCode = useCallback(
    (props: React.ComponentProps<'code'> & { className?: string; children?: React.ReactNode }) => {
      const { className, children, ...rest } = props
      const match = /language-(\w+)/.exec(className || '')
      const code = String(children).replace(/\n$/, '')

      if (match && match[1] === 'mermaid') {
        return <MermaidBlock code={code} />
      }

      if (match && match[1] === 'goat') {
        return <GoatBlock code={code} />
      }

      if (match) {
        return (
          <pre className="my-6 overflow-x-auto border border-foreground/25 bg-foreground/5 px-3 py-5 text-[0.95em] text-primary/90">
            <code className={className} {...rest}>
              {children}
            </code>
          </pre>
        )
      }

      return (
        <code className="border border-foreground/25 bg-foreground/5 px-1.5 py-0.5 text-[0.95em] text-primary/90" {...rest}>
          {children}
        </code>
      )
    },
    [],
  )

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="text-muted-foreground">Loading {fileName}...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="text-destructive">{error}</span>
      </div>
    )
  }

  return (
    <div className="max-w-3xl space-y-4 p-6 text-sm leading-relaxed">
      {frontMatter && <PostHeader fm={frontMatter} filePath={filePath} />}
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code: renderCode,
          h1: ({ children }) => (
            <h1 className="my-6 text-[1.45em] font-semibold text-foreground">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="my-6 text-[1.35em] font-semibold text-foreground">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="my-6 text-[1.15em] font-semibold text-foreground">{children}</h3>
          ),
          h4: ({ children }) => (
            <h4 className="my-6 text-base font-semibold text-foreground">{children}</h4>
          ),
          p: ({ children }) => <p className="my-6 text-muted-foreground">{children}</p>,
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noreferrer" className="text-primary hover:text-primary/80">
              {children}
            </a>
          ),
          ul: ({ children }) => <ul className="my-6 ml-[4ch] list-disc space-y-1 text-muted-foreground marker:text-primary">{children}</ul>,
          ol: ({ children }) => <ol className="my-6 ml-[4ch] list-decimal space-y-1 text-muted-foreground marker:text-primary">{children}</ol>,
          li: ({ children }) => <li>{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="relative my-6 border-t border-b border-primary pl-5 text-muted-foreground before:absolute before:left-0 before:top-6 before:text-primary before:content-['>']">{children}</blockquote>
          ),
          table: ({ children }) => (
            <div className="my-6 overflow-x-auto">
              <table className="border-collapse border-2 border-foreground text-sm">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border-2 border-foreground px-2.5 py-2.5 text-left font-semibold uppercase tracking-wide">{children}</th>
          ),
          td: ({ children }) => (
            <td className="border-2 border-foreground px-2.5 py-2.5">{children}</td>
          ),
          hr: () => <hr className="my-6 border-none bg-primary h-0.5" />,
          img: ({ src, alt }) => {
            const imgSrc = src && !src.startsWith('http')
              ? `${API_BASE_URL}/api/files/serve/${src}`
              : src
            return <img src={imgSrc} alt={alt} className="my-6 block max-w-full border-2 border-primary p-3 overflow-hidden" />
          },
          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
          em: ({ children }) => <em>{children}</em>,
          del: ({ children }) => <del className="text-muted-foreground/60">{children}</del>,
          pre: ({ children }) => <>{children}</>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

export const MarkdownApp = React.memo(MarkdownAppBase)
