import { useRef, useState, useCallback } from 'react'

const ACTIVATION_THRESHOLD = 0.08
const BACKWARD_TOLERANCE = -0.0005
const FORWARD_DISMISS = 0.003

export default function useForwardOnlyScroll(progress) {
  const [blocked, setBlocked] = useState(false)
  const peakRef = useRef(0)
  const prevRef = useRef(progress)
  const cooldownRef = useRef(false)
  const frozenProgress = useRef(0)

  const delta = progress - prevRef.current
  prevRef.current = progress

  if (progress > peakRef.current) {
    peakRef.current = progress
  }

  if (blocked && delta > FORWARD_DISMISS) {
    peakRef.current = progress
    setBlocked(false)
  }

  if (peakRef.current > ACTIVATION_THRESHOLD && delta < BACKWARD_TOLERANCE && !cooldownRef.current) {
    cooldownRef.current = true
    frozenProgress.current = peakRef.current
    setBlocked(true)

    setTimeout(() => {
      cooldownRef.current = false
    }, 2000)
  }

  const effectiveProgress = blocked ? frozenProgress.current : progress

  const dismiss = useCallback(() => {
    setBlocked(false)
  }, [])

  const reset = useCallback(() => {
    setBlocked(false)
    peakRef.current = 0
    prevRef.current = 0
    frozenProgress.current = 0
  }, [])

  return { blocked, effectiveProgress, dismiss, reset }
}
