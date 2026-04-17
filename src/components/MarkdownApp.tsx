import React, { useState, useEffect, useRef, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import mermaid from 'mermaid'

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
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/goat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed')
        return res.text()
      })
      .then((svg) => {
        if (ref.current) ref.current.innerHTML = svg
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

export function MarkdownAppBase({ filePath, fileName }: { filePath: string; fileName: string }) {

  useEffect(() => {
    console.log('MarkdownApp mounted')
    return () => {
      console.log('MarkdownApp unmounted')
    }
  }, [])

  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/files/serve/${filePath}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch file')
        return res.text()
      })
      .then((text) => {
        setContent(text)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [filePath])

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
              ? `${import.meta.env.VITE_API_BASE_URL}/api/files/serve/${src}`
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
