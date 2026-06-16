import { memo } from 'react'
import CinematicOverlay from '../ui/CinematicOverlay'
import CinematicTextSystem from '../ui/CinematicTextSystem'

const OVERLAY_THRESHOLD = 0.002
const TEXT_THRESHOLD = 0.003

export const MemoizedOverlay = memo(CinematicOverlay, (prev, next) => {
  return Math.abs(prev.progress - next.progress) < OVERLAY_THRESHOLD
})

export const MemoizedTextSystem = memo(CinematicTextSystem, (prev, next) => {
  return Math.abs(prev.progress - next.progress) < TEXT_THRESHOLD
})
