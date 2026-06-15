import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { getCharacterTravel, smootherstep } from '../core/cinematicTimeline'
import { registerCharacterRefs } from '../core/narrativeRegistry'

const MODEL_PATH = '/assets/character.glb'
const MODEL_SCALE = 0.84
const WALK_ANIMATION_SCALE = 0.62

function findNamedBone(scene, pattern) {
  let result = null
  scene.traverse((child) => {
    if (!result && child.isBone && pattern.test(child.name ?? '')) {
      result = child
    }
  })
  return result
}

export default function CharacterController({ progress }) {
  const rootRef = useRef(null)
  const modelRef = useRef(null)
  const headAnchorRef = useRef(null)
  const leftFootAnchorRef = useRef(null)
  const rightFootAnchorRef = useRef(null)
  const mixerRef = useRef(null)
  const actionsRef = useRef({})
  const activeActionRef = useRef(null)

  const gltf = useGLTF(MODEL_PATH)
  const characterModel = useMemo(() => gltf.scene, [gltf.scene])
  const clips = gltf.animations ?? []

  useEffect(() => {
    const materials = new Set()
    const textures = new Set()
    let characterSkeleton = null

    characterModel.traverse((child) => {
      if (child.isMesh || child.isSkinnedMesh) {
        child.castShadow = true
        child.receiveShadow = true
        const mats = Array.isArray(child.material) ? child.material : [child.material]
        mats.forEach((mat) => {
          if (!mat) return
          materials.add(mat)
          if (mat.map) textures.add(mat.map)
          mat.roughness = Math.max(0.68, mat.roughness ?? 0.68)
          mat.needsUpdate = true
        })
      }
      if (child.isSkinnedMesh && child.skeleton) {
        characterSkeleton = child.skeleton
      }
    })

    const mixer = new THREE.AnimationMixer(characterModel)
    mixerRef.current = mixer
    actionsRef.current = {}
    clips.forEach((clip) => {
      actionsRef.current[clip.name.toLowerCase()] = mixer.clipAction(clip)
    })

    const headBone =
      findNamedBone(characterModel, /head|face|neck/i) ??
      headAnchorRef.current
    const leftFootBone =
      findNamedBone(characterModel, /left.*foot|foot.*l|ankle.*l/i) ??
      leftFootAnchorRef.current
    const rightFootBone =
      findNamedBone(characterModel, /right.*foot|foot.*r|ankle.*r/i) ??
      rightFootAnchorRef.current

    registerCharacterRefs({
      characterModel,
      characterSkeleton,
      headBone,
      leftFootBone,
      rightFootBone,
      animationClips: clips,
      materials: [...materials],
      textures: [...textures],
    })

    return () => {
      mixer.stopAllAction()
    }
  }, [characterModel, clips])

  useFrame((_, delta) => {
    const root = rootRef.current
    if (!root) return

    const travel = getCharacterTravel(progress)
    const sit = travel.sit
    const slow = smootherstep(0.790, 0.890, progress)
    const startEase = smootherstep(0.105, 0.185, progress)
    const stopEase = 1 - smootherstep(0.790, 0.890, progress)
    const gait = startEase * stopEase * (1 - sit)
    const moving = progress > 0.105 && progress < 0.890 && sit < 0.15
    const cycle = travel.z * 2.95
    const footLift = Math.pow(Math.abs(Math.sin(cycle)), 1.7)
    const bob = moving ? footLift * 0.014 * gait : 0
    const sway = moving ? Math.sin(cycle * 2) * 0.012 * gait : 0

    root.position.set(travel.x + sway, bob - sit * 0.26, travel.z)
    root.rotation.y = THREE.MathUtils.lerp(0, -0.10, slow * (1 - sit))
    root.rotation.x = THREE.MathUtils.lerp(0, -0.10, sit)

    const actionNames = Object.keys(actionsRef.current)
    if (actionNames.length > 0) {
      const wanted =
        sit && actionNames.find((name) => /sit/i.test(name)) ||
        moving && actionNames.find((name) => /walk|run/i.test(name)) ||
        actionNames.find((name) => /idle/i.test(name)) ||
        actionNames[0]

      const nextAction = actionsRef.current[wanted]
      if (nextAction && activeActionRef.current !== nextAction) {
        nextAction.reset().fadeIn(0.35).play()
        activeActionRef.current?.fadeOut(0.35)
        activeActionRef.current = nextAction
      }

      if (activeActionRef.current) {
        activeActionRef.current.timeScale = moving
          ? THREE.MathUtils.lerp(0.38, WALK_ANIMATION_SCALE, gait)
          : 0.72
      }
    }

    if (mixerRef.current) {
      mixerRef.current.update(delta)
    }
  })

  return (
    <group ref={rootRef}>
      <group ref={headAnchorRef} name="headBone" position={[0, 1.52, 0.20]} />
      <group ref={leftFootAnchorRef} name="leftFootBone" position={[-0.18, 0.04, 0.02]} />
      <group ref={rightFootAnchorRef} name="rightFootBone" position={[0.18, 0.04, 0.02]} />
      <primitive
        ref={modelRef}
        object={characterModel}
        position={[0, MODEL_SCALE, 0]}
        scale={MODEL_SCALE}
      />
    </group>
  )
}

useGLTF.preload(MODEL_PATH)
