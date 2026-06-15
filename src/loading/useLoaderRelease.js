import { useState, useEffect, useCallback } from 'react'

export default function useLoaderRelease(externalPhase, onFinishMorph) {
  const [releaseStep, setReleaseStep] = useState(
    externalPhase === 'spinning' ? 'loading' : 'done'
  )

  useEffect(() => {
    if (externalPhase === 'morphing' && releaseStep === 'loading') {
      setReleaseStep('releasing')
    }
  }, [externalPhase, releaseStep])

  const onExpansionDone = useCallback(() => {
    setReleaseStep('done')
    onFinishMorph()
  }, [onFinishMorph])

  return { releaseStep, onExpansionDone }
}
