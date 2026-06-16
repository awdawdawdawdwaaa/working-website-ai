export default function useDeviceProfile() {
  const width = window.innerWidth
  const height = window.innerHeight
  const isMobile = width < 1024 || height < 768
  const isLandscape = width > height
  const dpr = isMobile ? Math.min(window.devicePixelRatio, 1) : Math.min(window.devicePixelRatio, 1.5)
  return { isMobile, isLandscape, dpr }
}
