import { useEffect, useState } from 'react'

const GLB_FILES = [
  '/props/Meshy_AI_Age_Wall_0611070403_texture.glb',
  '/props/Meshy_AI_Brushed_Steel_City_Sk_0610152611_texture.glb',
  '/props/Meshy_AI_Ahmedabad_Map_Install_0611072026_texture.glb',
  '/props/Meshy_AI_Time_in_Steel_0611065420_texture.glb',
  '/props/Meshy_AI_Python_Development_Ex_0611071109_texture.glb',
  '/assets/character.glb',
  '/assets/workstation.glb',
]

export default function useLoaderGate() {
  const [assetsLoaded, setAssetsLoaded] = useState(false)
  const [timeDone, setTimeDone] = useState(false)
  const [phase, setPhase] = useState('loading')
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setTimeDone(true), 15000)

    let count = 0
    const total = GLB_FILES.length
    const tick = () => {
      count++
      setProgress(Math.min(99, Math.round((count / total) * 100)))
      if (count >= total) {
        setAssetsLoaded(true)
        setProgress(100)
      }
    }
    GLB_FILES.forEach((url) => {
      fetch(url).then(tick).catch(tick)
    })

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (timeDone && assetsLoaded && phase === 'loading') {
      setPhase('morphing')
    }
  }, [timeDone, assetsLoaded, phase])

  return { phase, progress }
}
