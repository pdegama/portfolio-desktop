import { useWindowStore } from '@/store/window'
import { Window } from '@/components/Window'

export function WindowLayer() {
  const windows = useWindowStore((s) => s.windows)

  return (
    <>
      {windows.map((win) => (
        <Window key={win.id} {...win} />
      ))}
    </>
  )
}
