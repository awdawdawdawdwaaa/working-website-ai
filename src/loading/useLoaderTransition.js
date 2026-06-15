import { useEffect, useRef, useState } from 'react'

const GLB_FILES = [
  '/props/Meshy_AI_Age_Wall_0611070403_texture.glb',
  '/props/Meshy_AI_Brushed_Steel_City_Sk_0610152611_texture.glb',
  '/props/Meshy_AI_Ahmedabad_Map_Install_0611072026_texture.glb',
  '/props/Meshy_AI_Time_in_Steel_0611065420_texture.glb',
  '/props/Meshy_AI_Python_Development_Ex_0611071109_texture.glb',
  '/assets/character.glb',
  '/assets/workstation.glb',
]

export default function useLoaderTransition() {
  const [phase, setPhase] = useState('spinning')
  const [assetsReady, setAssetsReady] = useState(false)
  const [timeDone, setTimeDone] = useState(false)
  const transitionReady = useRef(true)

  useEffect(() => {
    const timer = setTimeout(() => setTimeDone(true), 15000)

    let count = 0
    const total = GLB_FILES.length
    GLB_FILES.forEach((url) => {
      fetch(url)
        .then(() => { count++; if (count >= total) setAssetsReady(true) })
        .catch(() => { count++; if (count >= total) setAssetsReady(true) })
    })

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (timeDone && assetsReady && transitionReady.current && phase === 'spinning') {
      setPhase('morphing')
    }
  }, [timeDone, assetsReady, phase])

  const finishMorph = () => {
    setPhase('ending')
    setTimeout(() => setPhase('done'), 450)
  }

  return { phase, finishMorph, setPhase }
}
