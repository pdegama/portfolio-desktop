import { useEffect, useRef } from 'react'
import { Terminal as XTerm } from '@xterm/xterm'
import { AttachAddon } from '@xterm/addon-attach'
import { FitAddon } from '@xterm/addon-fit'
import '@xterm/xterm/css/xterm.css'

export function TerminalApp() {
  const terminalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!terminalRef.current) return

    const term = new XTerm({
      fontFamily: '"FiraCode Nerd Font", "MesloLGS NF", "Hack Nerd Font", "JetBrainsMono Nerd Font", "Droid Sans Mono for Powerline", monospace',
      fontSize: 14,
      cursorBlink: true,
      theme: {
        background: '#282a36',
        foreground: '#f8f8f2',
        cursor: '#f8f8f2',
        cursorAccent: '#282a36',
        selectionBackground: '#44475a',
        black: '#21222c',
        red: '#ff5555',
        green: '#50fa7b',
        yellow: '#f1fa8c',
        blue: '#bd93f9',
        magenta: '#ff79c6',
        cyan: '#8be9fd',
        white: '#f8f8f2',
        brightBlack: '#6272a4',
        brightRed: '#ff6e6e',
        brightGreen: '#69ff94',
        brightYellow: '#ffffa5',
        brightBlue: '#d6acff',
        brightMagenta: '#ff92df',
        brightCyan: '#a4ffff',
        brightWhite: '#ffffff'
      }
    })

    const fitAddon = new FitAddon()
    term.loadAddon(fitAddon)

    term.open(terminalRef.current)

    // Slight delay for fit to ensure container is fully rendered by react
    setTimeout(() => {
      fitAddon.fit()
    }, 50)

    // Connect to backend
    const ws = new WebSocket('ws://localhost:3001')

    ws.onopen = () => {
      const attachAddon = new AttachAddon(ws)
      term.loadAddon(attachAddon)

      // Let backend know the initial size
      ws.send(JSON.stringify({ type: 'resize', cols: term.cols, rows: term.rows }))
    }

    const handleResize = () => {
      fitAddon.fit()
      if (ws.readyState === WebSocket.OPEN && term.cols && term.rows) {
        ws.send(JSON.stringify({ type: 'resize', cols: term.cols, rows: term.rows }))
      }
    }

    // Connect resize observer for the parent window box
    const element = terminalRef.current
    const resizeObserver = new ResizeObserver(() => {
      // debounce slightly to avoid lag
      requestAnimationFrame(() => handleResize())
    });
    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
      term.dispose()
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close()
      }
    }
  }, [])

  return (
    <div className="size-full overflow-hidden bg-[#282a36] focus:outline-none">
      <div ref={terminalRef} className="size-full outline-none" />
    </div>
  )
}
