import { useEffect, useState } from 'react'

const JOKES = [
  'Teaching pixels teamwork.',
  'Adding details nobody asked for.',
  'Rendering unnecessary perfection.',
  'Still loading\u2026 dramatically.',
  'Polishing invisible corners.',
  'Turning coffee into visuals.',
  'Almost there.',
  'Making the GPU earn respect.',
  'Loading cinematic chaos.',
  'Waiting increases rarity.',
]

export default function LoaderJokes() {
  const [idx, setIdx] = useState(0)
  const [fade, setFade] = useState(1)

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(0)
      setTimeout(() => {
        setIdx((i) => (i + 1) % JOKES.length)
        setFade(1)
      }, 180)
    }, 3200)
    return () => clearInterval(interval)
  }, [])

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 80,
        left: '50%',
        transform: 'translateX(-50%)',
        fontFamily: "'Permanent Marker', 'Caveat', cursive",
        fontSize: 'clamp(18px, 1.4vw, 30px)',
        color: '#FFFFFF',
        opacity: fade * 0.92,
        transition: 'opacity 180ms ease',
        textAlign: 'center',
        userSelect: 'none',
        pointerEvents: 'none',
        whiteSpace: 'nowrap',
      }}
    >
      {JOKES[idx]}
    </div>
  )
}
