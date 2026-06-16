const MAX_DELTA = 0.008

export default function useScrollLimiter(rawDelta) {
  const clamped = Math.sign(rawDelta) * Math.min(Math.abs(rawDelta), MAX_DELTA)

  if (Math.abs(rawDelta) > MAX_DELTA && typeof window !== 'undefined') {
    window.__mobileLimitedScroll = (window.__mobileLimitedScroll || 0) + 1
  }

  return clamped
}
