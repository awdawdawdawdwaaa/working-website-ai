import { useState, useEffect } from 'react'

export default function useLineVisibilityGate() {
  const [loaderLineActive, setLoaderLineActive] = useState(true)

  useEffect(() => {
    setLoaderLineActive(false)
  }, [])

  return loaderLineActive
}
