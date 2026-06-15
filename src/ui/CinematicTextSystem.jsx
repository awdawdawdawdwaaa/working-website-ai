import { useEffect, useRef, useState } from 'react'
import textWindows from '../core/textWindows'

export default function CinematicTextSystem({ progress }) {
  const [active, setActive] = useState(null)
  const timerRef = useRef(null)
  const activeRef = useRef(null)

  const current = textWindows.find(
    (w) => progress >= w.start && progress <= w.end
  )

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }

    if (!current) {
      if (activeRef.current) {
        setActive({ ...activeRef.current, phase: 'exiting' })
        timerRef.current = setTimeout(() => {
          setActive(null)
          activeRef.current = null
        }, 320)
      }
      return
    }

    if (!activeRef.current || activeRef.current.text !== current) {
      if (activeRef.current) {
        const prev = activeRef.current
        setActive({ ...prev, phase: 'exiting' })
        timerRef.current = setTimeout(() => {
          const next = { text: current, phase: 'entering' }
          setActive(next)
          activeRef.current = next
          timerRef.current = setTimeout(() => {
            setActive((a) => a?.text === current ? { ...a, phase: 'visible' } : a)
          }, 420)
        }, 320)
      } else {
        const next = { text: current, phase: 'entering' }
        setActive(next)
        activeRef.current = next
        timerRef.current = setTimeout(() => {
          setActive((a) => a?.text === current ? { ...a, phase: 'visible' } : a)
        }, 420)
      }
    }
  }, [current])

  const phase = active?.phase ?? 'hidden'
  const mod = phase === 'entering' || phase === 'visible' ? 'is-visible' : ''

  return (
    <div className={`cinematic-text-panel ${mod}`} aria-hidden="true">
      <div className="cinematic-text__title">{active?.text?.white}</div>
      <div className="cinematic-text__subtitle">{active?.text?.yellow}</div>
    </div>
  )
}
