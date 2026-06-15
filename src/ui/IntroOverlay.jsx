import { useState, useEffect, useRef } from 'react'

function WavyText({ text, style }) {
  const spansRef = useRef([])
  const chars = text.split('')

  useEffect(() => {
    const stagger = 50
    const rise = 200
    const fall = 300
    const hold = 1000
    const amplitude = 10
    const waveEnd = (chars.length - 1) * stagger + rise + fall
    const cycle = waveEnd + hold

    let burstStart = performance.now()
    let rafId

    const animate = (now) => {
      const elapsed = now - burstStart
      if (elapsed >= cycle) burstStart = now - (elapsed - cycle)

      spansRef.current.forEach((span, i) => {
        if (!span) return
        const t = elapsed - i * stagger
        if (t < 0 || t > rise + fall) {
          span.style.transform = 'translateY(0px)'
        } else if (t < rise) {
          const p = t / rise
          span.style.transform = `translateY(${-Math.sin(p * Math.PI / 2) * amplitude}px)`
        } else {
          const p = (t - rise) / fall
          span.style.transform = `translateY(${-Math.cos(p * Math.PI / 2) * amplitude}px)`
        }
      })

      rafId = requestAnimationFrame(animate)
    }

    rafId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafId)
  }, [chars.length])

  return (
    <>
      {chars.map((char, i) => (
        <span
          key={i}
          ref={el => (spansRef.current[i] = el)}
          style={{
            display: 'inline-block',
            ...style,
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </>
  )
}

export default function IntroOverlay() {
  const [showOverlay, setShowOverlay] = useState(false)
  const [entered, setEntered] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [textFadeIn, setTextFadeIn] = useState(false)
  const onceRef = useRef(false)

  useEffect(() => {
    const timer = setTimeout(() => { setShowOverlay(true) }, 8000)

    const cb = () => {
      if (onceRef.current) return
      onceRef.current = true
      clearTimeout(timer)
      setHidden(true)
    }

    for (const e of ['wheel', 'touchmove']) {
      window.addEventListener(e, cb, { passive: true, capture: true })
      document.addEventListener(e, cb, { passive: true, capture: true })
    }

    return () => {
      clearTimeout(timer)
      for (const e of ['wheel', 'touchmove']) {
        window.removeEventListener(e, cb, { capture: true })
        document.removeEventListener(e, cb, { capture: true })
      }
    }
  }, [])

  useEffect(() => {
    const id = requestAnimationFrame(() => setTextFadeIn(true))
    return () => cancelAnimationFrame(id)
  }, [])

  useEffect(() => {
    if (showOverlay) {
      const id = setTimeout(() => setEntered(true), 30)
      return () => clearTimeout(id)
    }
  }, [showOverlay])

  if (hidden) return null

  const baseText = {
    fontFamily: "'Playfair Display','Inter','Segoe UI',sans-serif",
    fontWeight: 700,
    letterSpacing: '0.15em',
    color: 'rgba(255,255,255,0.85)',
    userSelect: 'none',
    pointerEvents: 'none',
  }

  if (showOverlay) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2147483647,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.70)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        pointerEvents: 'auto',
        opacity: entered ? 1 : 0,
        transform: entered ? 'translateY(0)' : 'translateY(24px)',
        transition: 'opacity 0.9s ease, transform 0.9s ease',
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
          <WavyText
            text="Scroll to continue"
            style={{ fontSize: 'clamp(28px, 3vw, 44px)', ...baseText }}
          />
        </div>
      </div>
    )
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '36px',
      left: 0,
      width: '100%',
      textAlign: 'center',
      zIndex: 2147483647,
      pointerEvents: 'none',
      opacity: textFadeIn ? 1 : 0,
      transition: 'opacity 0.6s ease',
    }}>
      <WavyText
        text="Scroll to continue"
        style={{
          fontSize: 'clamp(13px, 1.2vw, 17px)',
          color: 'rgba(255,255,255,0.55)',
          ...baseText,
        }}
      />
    </div>
  )
}
