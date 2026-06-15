let _active = false

const ACTIVATE_THRESHOLD = 0.900
const DEACTIVATE_THRESHOLD = 0.890

export function isRoomLineActive(progress) {
  if (progress > ACTIVATE_THRESHOLD) {
    _active = true
  } else if (progress < DEACTIVATE_THRESHOLD) {
    _active = false
  }
  return _active
}

export function getRoomLineOpacity(progress) {
  if (progress <= 0.900) return 0
  if (progress >= 0.920) return 1
  return (progress - 0.900) / 0.020
}
