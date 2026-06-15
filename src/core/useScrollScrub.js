import { useEffect, useRef, useState } from 'react'
import { clamp01 } from './cinematicTimeline'

const WHEEL_SCALE = 0.00008
const TOUCH_SCALE = 0.00036
const KEY_STEP = 0.015
const FOLLOW_SPEED = 0.08

function clampDelta(delta) {
  return Math.max(-110, Math.min(110, delta))
}

function sameState(a, b) {
  return (
    Math.abs(a.progress - b.progress) < 0.0001 &&
    Math.abs(a.target - b.target) < 0.0001
  )
}

export default function useScrollScrub() {
  const [state, setState] = useState({
    progress: 0,
    target: 0,
  })

  const raf = useRef(null)
  const touchY = useRef(null)
  const data = useRef({
    progress: 0,
    target: 0,
  })

  useEffect(() => {
    const d = data.current

    function moveTarget(delta) {
      d.target = clamp01(d.target + delta)
    }

    function onWheel(event) {
      if (event.cancelable) event.preventDefault()
      moveTarget(clampDelta(event.deltaY) * WHEEL_SCALE)
    }

    function onTouchStart(event) {
      touchY.current = event.touches[0]?.clientY ?? null
    }

    function onTouchMove(event) {
      const nextY = event.touches[0]?.clientY
      if (nextY == null || touchY.current == null) return
      if (event.cancelable) event.preventDefault()
      moveTarget((touchY.current - nextY) * TOUCH_SCALE)
      touchY.current = nextY
    }

    function onTouchEnd() {
      touchY.current = null
    }

    function onKeyDown(event) {
      const tag = event.target?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || event.target?.isContentEditable) return

      if (event.key === 'ArrowDown' || event.key === 'PageDown' || event.key === ' ') {
        event.preventDefault()
        moveTarget(KEY_STEP)
      }
      if (event.key === 'ArrowUp' || event.key === 'PageUp') {
        event.preventDefault()
        moveTarget(-KEY_STEP)
      }
      if (event.key === 'Home') {
        event.preventDefault()
        d.target = 0
      }
      if (event.key === 'End') {
        event.preventDefault()
        d.target = 1
      }
    }

    function tick() {
      d.progress += (d.target - d.progress) * FOLLOW_SPEED

      if (Math.abs(d.target - d.progress) < 0.00001) {
        d.progress = d.target
      }

      const nextState = {
        progress: d.progress,
        target: d.target,
      }

      setState((prev) => (sameState(prev, nextState) ? prev : nextState))
      raf.current = requestAnimationFrame(tick)
    }

    raf.current = requestAnimationFrame(tick)
    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onTouchEnd)
    window.addEventListener('keydown', onKeyDown)

    return () => {
      cancelAnimationFrame(raf.current)
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  return state
}
