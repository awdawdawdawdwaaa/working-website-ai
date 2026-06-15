# Design Document: Strict Modular Scroll Architecture

## Overview

This document defines the technical design for a scroll-driven cinematic 3D portfolio experience built with React Three Fiber. The architecture is strictly modular: each component owns exactly one concern, all state flows top-down from `World`, and every visual output is a deterministic pure function of a single `progress` value (0–1).

The central principle is **scroll-driven determinism**: given the same `progress` value, the system must produce an identical scene state every time, with no random variation, no time-based automatic animation, and no sibling-to-sibling state sharing.

### Key Design Goals

- One scroll value controls everything — camera, character, lighting, and props
- All derived state (opacity, door angle, monitor on/off) is computed in `World` and passed down as props
- No component may "reach sideways" for state — only World reads `progress`
- All positions, keyframes, and world layout constants live in a single file (`scrollSections.js`)
- The scene is fully reconstructable: reloading at any scroll position reproduces the exact same frame

---

## Architecture

### Component Hierarchy

```
App
├── useScrollProgress()          — raw scroll → progress [0,1]
└── <Canvas>
    └── <World progress={p}>     — derives ALL display state; passes down as props
        ├── <CameraController progress={p} />
        ├── <Lighting progress={p} />
        ├── <SceneGeometry                  ← renamed from Scene.jsx
        │     mapOpacity={mapOpacity}
        │     wallTextOpacity={wallTextOpacity}
        │     doorOpen={doorOpen}
        │     monitorActive={monitorActive}
        │     screenProgress={screenProgress}
        │   />
        └── <Character progress={p} />
```

`World` is the only component allowed to read `progress` directly from the hook chain. All other components receive either `progress` (for components that own their own keyframe interpolation — Camera, Lighting, Character) or pre-derived scalar values (for Scene, which only renders geometry).

> **Rationale**: Camera, Lighting, and Character each manage their own internal smoothed state and must track `progress` frame-by-frame inside `useFrame`. Passing pre-computed "want" values to them would remove their ability to smooth toward targets. Scene has no internal animation state and needs only the final computed scalars.

### Data Flow Diagram

```
scrollY (DOM)
     │
     ▼
useScrollProgress()
     │  progress: 0..1
     ▼
App.jsx
     │  progress
     ▼
World.jsx  ◄── computes derived state ──────────────────────────────────┐
     │                                                                   │
     │  progress          mapOpacity  wallTextOpacity  doorOpen          │
     │  ──────────►       monitorActive  screenProgress                  │
     │  Camera            ──────────────────────────────► SceneGeometry  │
     │  Controller                                                        │
     │  (internal                                                         │
     │   lerp state)                                                      │
     │                                                                    │
     │  progress                                                          │
     ├──────────────► Lighting (internal lerp state)                      │
     │                                                                    │
     │  progress                                                          │
     └──────────────► Character (internal lerp state + mixer)            │
                                                                         │
              scrollSections.js provides all constants ──────────────────┘
              (S, sp, ease, CHAR_PATH, charPos, charRotY, WORLD, DESK_H)
```

### No Context for Scroll State

React context is explicitly prohibited for scroll state. The cost of a context update propagates to every subscriber; with a 60 fps scroll loop this causes unnecessary re-renders throughout the tree. Direct prop passing to the four children of World is the correct scope.

---

## Components and Interfaces

### `App.jsx`

Entry point. Owns the scroll spacer div, the fixed Canvas, and the HTML overlay.

**Responsibilities**: Mount Canvas; call `useScrollProgress`; pass `progress` to World.

```jsx
// Props: none (root component)
// Renders: Canvas → World, HUD, Cursor
const { progress } = useScrollProgress()
<World progress={progress} />
```

---

### `World.jsx`

Root scene controller. The **only** component that reads `progress` and computes derived display state.

**Props**
```ts
interface WorldProps {
  progress: number  // 0.0–1.0 global scroll progress
}
```

**Derived state computed here** (all pure functions of `progress`):

| Variable | Formula | Type |
|---|---|---|
| `mapOpacity` | `ease.out3(sp(p, S.MAP)) * (1 - ease.out2(sp(p, S.DOOR)))` | `number` 0–1 |
| `wallTextOpacity` | same as mapOpacity | `number` 0–1 |
| `doorOpen` | `ease.out3(sp(p, S.DOOR))` | `number` 0–1 |
| `monitorActive` | `sp(p, S.PROJECTS) > 0.05` | `boolean` |
| `screenProgress` | `ease.out3(sp(p, S.PROJECTS))` | `number` 0–1 |

**Passes to children**:
- `CameraController` → `progress`
- `Lighting` → `progress`
- `Character` → `progress`
- `SceneGeometry` → `{ mapOpacity, wallTextOpacity, doorOpen, monitorActive, screenProgress }`

---

### `CameraController.jsx`

Owns **all** camera state. Nothing else may touch `camera.position`, `camera.lookAt`, or `camera.fov`.

**Props**
```ts
interface CameraControllerProps {
  progress: number  // 0.0–1.0
}
```

**Internal state** (refs, never re-renders):
```ts
camPos:    [x, y, z]  // smoothed current position
camTarget: [x, y, z]  // smoothed current look-at
camFov:    number      // smoothed current FOV
mouseX:    number      // parallax offset X, ∈ [-0.05, 0.05]
mouseY:    number      // parallax offset Y, ∈ [-0.025, 0.025]
```

**Keyframe array** (`KF[8]` — one per scroll section end):

| Index | Section | pos | target | fov |
|---|---|---|---|---|
| 0 | INTRO | [0.0, 1.6, -3.5] | [0.0, 0.7, 1.5] | 46 |
| 1 | WALK end | [0.0, 1.3, -2.5] | [0.0, 0.7, 0.5] | 44 |
| 2 | MAP | [2.8, 1.1, -1.0] | [0.0, 0.8, 0.5] | 46 |
| 3 | DOOR | [1.4, 1.0, 1.0] | [0.0, 0.7, 2.2] | 44 |
| 4 | ROOM_REVEAL | [1.8, 0.9, 2.6] | [0.0, 0.5, 4.2] | 42 |
| 5 | SIT | [1.6, 1.1, 2.0] | [0.1, 0.6, 3.8] | 40 |
| 6 | PROJECTS | [1.2, 1.15, 2.4] | [0.0, 1.0, 4.6] | 38 |
| 7 | END | [-1.8, 1.3, 2.2] | [0.0, 0.7, 4.0] | 44 |

**Algorithm** (`useFrame`):
1. `getKFPair(progress)` → `{ a, b, t }` where `t = ease.inOut(frac(progress * 7))`
2. `wantPos = lerp3(a.pos, b.pos, t)`
3. `wantTarget = lerp3(a.target, b.target, t)`
4. `wantFov = a.fov + (b.fov - a.fov) * t`
5. Apply mouse parallax: `wantPos[0] += mouseX`, `wantPos[1] -= mouseY`
6. Smooth toward want: `camPos = lerp3(camPos, wantPos, 0.04)`, target factor 0.05, FOV factor 0.04
7. `camera.position.set(…)`, `camera.lookAt(…)`, `camera.fov = …`, `camera.updateProjectionMatrix()`

**Helper functions** (module-private):
```ts
lerp3(a: number[], b: number[], t: number): number[]
getKFPair(progress: number): { a: KF, b: KF, t: number }
```

---

### `Character.jsx`

Owns **all** character mesh state: position, rotation, and animation blend weights.

**Props**
```ts
interface CharacterProps {
  progress: number  // 0.0–1.0
}
```

**Internal state** (refs):
```ts
pivotY:      number   // bounding box calibration offset (set once on load)
calibrated:  boolean  // guard: run bounding box once only
walkRef:     AnimationAction
idleRef:     AnimationAction
```

**Floor grounding** (runs once in `useEffect` after GLB loads):
```ts
const box = new THREE.Box3().setFromObject(gltf)
pivotY.current = -box.min.y   // shift so model bottom sits at Y=0
```

**Per-frame algorithm** (`useFrame`):
1. `mixer.update(delta)` — always tick, needed by AnimationAction
2. Compute `walkP = sp(progress, S.WALK)`, `sitP = sp(progress, S.SIT)`
3. `isWalking = progress >= S.WALK.start && progress < S.SIT.start`
4. `walkWeight = isWalking ? ease.inOut(min(walkP * 5, 1)) : 0`
5. `idleWeight = 1 - walkWeight`
6. Apply weights to `walkRef.current.weight` and `idleRef.current.weight`
7. `{ x, z } = charPos(progress)` — path interpolation
8. `targetY = pivotY + (progress >= S.SIT.start ? (−0.16) * ease.out3(sitP) : 0)`
9. Smooth: XZ factor 0.10, Y factor 0.08, rotY factor 0.08 (shortest-path)
10. Seated lean: `rotation.x` interpolates toward `ease.out3(sitP) * 0.10` with factor 0.06

**Seated Y offset**: `SEAT_Y_OFFSET = 0.16` — subtracted from `pivotY` when sitting

---

### `Lighting.jsx`

Owns **all** light intensity state. Drives 5 light refs toward target intensities based on `progress`.

**Props**
```ts
interface LightingProps {
  progress: number  // 0.0–1.0
}
```

**Light inventory**:

| Ref | Type | Position | Color | Purpose |
|---|---|---|---|---|
| `ambRef` | AmbientLight | — | #140d08 | Floor of darkness |
| `rimRef` | DirectionalLight | [-3, 4, -6] | #8aaabb | Cold rim, silhouette |
| `keyRef` | DirectionalLight | [5, 9, 7] | #d8c4a0 | Warm key, casts shadows |
| `fillRef` | PointLight | [4.0, 1.2, 3.5] | #b07030 | Soft bounce fill |
| `lampRef` | PointLight | [-0.65, 1.38, 4.38] | #ffd060 | Desk lamp (warm) |
| `monitorRef` | PointLight | [0.0, 1.22, 4.42] | #c8dcc8 | Screen spill (warm white) |

**Per-frame algorithm** (`useFrame`, all lerp factor 0.028):
```
ambRef.intensity    → walkP * 0.06
rimRef.intensity    → 0.18 + walkP * 0.14
keyRef.intensity    → walkP * 0.48
fillRef.intensity   → mapP  * 0.12
lampRef.intensity   → roomP * 1.6        (factor 0.028 * 0.7)
monitorRef.intensity→ projectP * 0.5     (factor 0.03)
```

> The desk lamp drives the ROOM_REVEAL narrative moment. Its point light has distance 2.2, decay 2, shadow map 512×512, bias −0.003.

---

### `SceneGeometry` (Scene.jsx)

Pure render component. Contains all static world geometry with explicitly specified positions. **No animation logic** — all values arrive as props.

**Props**
```ts
interface SceneGeometryProps {
  mapOpacity:      number   // 0–1, map panel target opacity
  wallTextOpacity: number   // 0–1, wall projection target opacity
  doorOpen:        number   // 0–1, door swing progress (ease already applied in World)
  monitorActive:   boolean  // triggers monitor emissive lerp
  screenProgress:  number   // 0–1, screen content fade
}
```

**Sub-components** (all module-internal except Monitor/MapPanel/Door which accept props):

| Sub-component | Props accepted |
|---|---|
| `Floor` | none |
| `Walls` | none |
| `MapPanel` | `opacity` |
| `WallText` | `opacity` |
| `Door` | `doorOpen` |
| `Desk` | none |
| `Chair` | none |
| `DeskLamp` | none |
| `Monitor` | `active`, `screenProgress` |
| `Keyboard` | none |
| `Mouse` | none |
| `PCTower` | none |

**Door rotation**: computed as `ease_out(doorOpen) * (-PI/2)` where hinge pivot is at `X = -0.44` relative to door center. Applied as `group.rotation.y` inside a `<group position={[-0.44, 0, 0]}>` wrapper. No smoothing — scroll drives this directly.

**Monitor emissive**: `useFrame` inside Monitor lerps `emissiveIntensity` toward `active ? 0.65 : 0` with factor 0.05. Emissive color is `#0a1a0a` (very dark green — avoids bright cast).

**Map panel geometry**: `useMemo` computes `BufferGeometry` for 9 line segments (1 river + 4 E-W roads + 3 N-S roads) once. `useFrame` inside MapPanel lerps rendered opacity toward target with factor 0.04–0.05.

---

## Data Models

### Scroll Section (`S`)

```ts
type Section = { start: number; end: number }

const S: Record<SectionName, Section> = {
  INTRO:       { start: 0.00, end: 0.15 },
  WALK:        { start: 0.15, end: 0.30 },
  MAP:         { start: 0.30, end: 0.45 },
  DOOR:        { start: 0.45, end: 0.58 },
  ROOM_REVEAL: { start: 0.58, end: 0.70 },
  SIT:         { start: 0.70, end: 0.80 },
  PROJECTS:    { start: 0.80, end: 0.92 },
  END:         { start: 0.92, end: 1.00 },
}
```

All eight sections are contiguous: `S.INTRO.end === S.WALK.start`, etc.

### Section Progress Function (`sp`)

```ts
function sp(p: number, section: Section): number {
  return clamp((p - section.start) / (section.end - section.start), 0, 1)
}
```

### Easing Functions (`ease`)

```ts
const ease = {
  inOut:  (t) => t < 0.5 ? 2*t*t : -1 + (4 - 2*t)*t,
  out3:   (t) => 1 - Math.pow(1 - t, 3),
  out2:   (t) => 1 - Math.pow(1 - t, 2),
  in2:    (t) => t * t,
  linear: (t) => t,
}
```

All functions map `[0, 1] → [0, 1]` with `f(0) = 0` and `f(1) = 1`.

### Camera Keyframe (`KF`)

```ts
type KF = {
  pos:    [number, number, number]  // camera world position
  target: [number, number, number]  // look-at world point
  fov:    number                    // vertical FOV in degrees
}
```

8 keyframes; index maps to `floor(progress * 7)`.

### Character Path Keyframe (`CHAR_PATH`)

```ts
type CharKeyframe = {
  p: number   // progress value at this keyframe
  x: number   // world X position
  z: number   // world Z position
}

const CHAR_PATH: CharKeyframe[] = [
  { p: 0.00, x: 0.0, z: 4.0 },
  { p: 0.15, x: 0.0, z: 4.0 },
  { p: 0.30, x: 0.0, z: 1.5 },
  { p: 0.45, x: 0.0, z: 2.3 },
  { p: 0.58, x: 0.0, z: 4.0 },
  { p: 0.70, x: 0.0, z: 3.7 },
  { p: 1.00, x: 0.0, z: 3.7 },
]
```

### Character Path Functions

```ts
function charPos(p: number): { x: number; z: number }
// Finds surrounding CHAR_PATH keyframes i and i+1 where path[i].p <= p <= path[i+1].p
// Returns { x, z } = lerp(a, b, ease.inOut((p - a.p) / (b.p - a.p)))

function charRotY(p: number): number
// Samples charPos(p - 0.005) and charPos(p + 0.005)
// Returns atan2(dx, dz) when moving; returns 0 (intro) or PI (seated) when stationary
```

### World Positions (`WORLD`)

```ts
const WORLD = {
  mapWall: { x: -4.0, y: 1.8, z: -1.0 },
  door:    { x:  0.0, y:  0.0, z:  2.2 },
  desk:    { x:  0.0, y:  0.0, z:  4.4 },
  chair:   { x:  0.1, y:  0.0, z:  3.6 },
  lamp:    { x: -0.65, y: 0.0, z: 4.4  },
  monitor: { x:  0.0, y:  0.0, z:  4.6 },
}

const DESK_H = 0.76  // desk surface height above floor
```

### `scrollSections.js` Exports Summary

```ts
// Section boundaries
export const S: Record<string, Section>

// Section-local progress: 0 at section start, 1 at section end
export function sp(p: number, section: Section): number

// Easing library
export const ease: { inOut, out3, out2, in2, linear }

// Character path keyframes
export const CHAR_PATH: CharKeyframe[]

// Character world position at progress p
export function charPos(p: number): { x: number; z: number }

// Character Y-rotation at progress p (radians)
export function charRotY(p: number): number

// Fixed world object positions
export const WORLD: WorldPositions

// Desk surface height constant
export const DESK_H: number
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

---

### Property 1: Progress Clamping

*For any* scroll position value (including values below 0 or above the maximum scroll height), the computed `progress` value must be in the closed interval `[0.0, 1.0]`.

**Validates: Requirements 1.1**

---

### Property 2: Section Progress Boundaries

*For any* progress value `p` and any section `sec` from `S`, `sp(p, sec)` must return a value in `[0.0, 1.0]`; it must equal exactly `0.0` when `p <= sec.start`, and exactly `1.0` when `p >= sec.end`.

**Validates: Requirements 1.3, 15.2**

---

### Property 3: Easing Function Validity

*For any* easing function `f` in `{ inOut, out3, out2, in2, linear }` and any input `t` in `[0.0, 1.0]`, `f(t)` must be in `[0.0, 1.0]`, `f(0.0) = 0.0`, and `f(1.0) = 1.0`.

**Validates: Requirements 15.3**

---

### Property 4: Scroll-Driven Determinism

*For any* progress value `p` in `[0.0, 1.0]`, calling `charPos(p)`, `charRotY(p)`, and `getKFPair(p)` (the camera keyframe selector) twice in succession must return identical results. No function in the scroll pipeline may produce different outputs for the same input.

**Validates: Requirements 14.1, 14.5**

---

### Property 5: Lerp3 Correctness

*For any* two 3-vectors `a` and `b` and any interpolation factor `t` in `[0.0, 1.0]`, `lerp3(a, b, t)` must equal `[a[i] + (b[i] - a[i]) * t]` for each component `i`, and the result must lie component-wise between `a` and `b`.

**Validates: Requirements 10.1, 10.2, 10.3, 11.1, 11.2**

---

### Property 6: Animation Weight Sum

*For any* progress value `p` in `[0.0, 1.0]`, the computed `walkWeight` and `idleWeight` must satisfy `walkWeight + idleWeight = 1.0`, and both values must be in `[0.0, 1.0]`.

**Validates: Requirements 12.2, 12.3, 12.4**

---

### Property 7: Character Path Keyframe Exactness

*For any* keyframe `kf` in `CHAR_PATH`, `charPos(kf.p)` must return `{ x: kf.x, z: kf.z }` exactly (no interpolation error at keyframe boundaries).

**Validates: Requirements 16.1, 16.2**

---

### Property 8: Character Y Non-Negative

*For any* progress `p` in `[0.0, 1.0]`, the character's target Y position (after applying `pivotY` and seated offset) must be `>= 0.0` — the character never floats below the floor or seat.

**Validates: Requirements 11.4, 11.5, 22.2, 22.3**

---

### Property 9: Shortest-Path Rotation

*For any* current rotation `r` and target rotation `target`, the computed angular delta must be in `(-PI, PI]`. No rotation transition may produce a delta outside this range.

**Validates: Requirements 11.3**

---

### Property 10: Door Angle Range

*For any* `doorOpen` value in `[0.0, 1.0]` (the eased section progress), the computed door rotation angle must be in `[-PI/2, 0.0]`. The door must never swing past fully open or into a negative-open state.

**Validates: Requirements 20.1, 20.2**

---

### Property 11: Mouse Parallax Bounds

*For any* mouse position `(mx, my)` normalized to `[0.0, 1.0]`, the camera parallax offset must satisfy `|offsetX| <= 0.05` and `|offsetY| <= 0.025`.

**Validates: Requirements 10.4**

---

## Error Handling

### GLB Load Failure

`useGLTF` (via `@react-three/drei`) throws on load failure. The component is wrapped in `<Suspense fallback={null}>` in World, so a failed load silently hides the character rather than crashing the scene. The bounding box calibration guard (`calibrated.current`) prevents re-running if the effect fires multiple times.

### Scroll Beyond Bounds

`sp()` clamps output to `[0, 1]` via `Math.max(0, Math.min(1, …))`. `charPos` clamps its keyframe search so `i` never exceeds `path.length - 2`. `getKFPair` clamps `i` to `n - 1`. No component can receive an out-of-range value even if `progress` momentarily exceeds 1.

### Missing Animation Clips

Character sets up animations with a fallback: if no idle clip is found, it uses the walk clip for both walk and idle. If no clips exist at all, the refs remain null and the weight-setting code is guarded by null checks. The character still moves correctly by position — it just holds its rest pose.

### Camera FOV Threshold

FOV updates are gated: `if (Math.abs(camera.fov - camFov.current) > 0.02)` prevents calling `updateProjectionMatrix()` every frame when FOV is stable, reducing GPU overhead.

### Zero-Length Scroll Container

`useScrollProgress` guards against division by zero: `if (total <= 0) return` before computing progress. This handles the case where the scroll spacer hasn't been rendered yet on first mount.

---

## Testing Strategy

### Dual Testing Approach

Unit and property tests are complementary. Unit tests verify concrete examples and edge cases; property tests verify that universal invariants hold across a wide input space.

### Property-Based Testing Library

Use **fast-check** (JavaScript/TypeScript) for all property tests. It is the standard PBT library for the React/Vite ecosystem and supports shrinking, reproducible seeds, and custom arbitraries.

```bash
npm install --save-dev fast-check
```

Each property test runs a minimum of **100 iterations** (fast-check default). Configuration:

```js
fc.assert(fc.property(arbitrary, (input) => { … }), { numRuns: 100 })
```

Each test is tagged with a comment referencing its design property:
```js
// Feature: strict-modular-scroll-architecture, Property 2: Section progress boundaries
```

### Property Tests

One test per correctness property:

| Test | Property | File |
|---|---|---|
| Progress clamping | P1 | `scrollSections.test.js` |
| sp() boundaries | P2 | `scrollSections.test.js` |
| Easing validity | P3 | `scrollSections.test.js` |
| Scroll determinism | P4 | `scrollSections.test.js` |
| lerp3 correctness | P5 | `cameraController.test.js` |
| Animation weight sum | P6 | `character.test.js` |
| charPos keyframe exactness | P7 | `scrollSections.test.js` |
| Character Y non-negative | P8 | `character.test.js` |
| Shortest-path rotation | P9 | `character.test.js` |
| Door angle range | P10 | `scene.test.js` |
| Mouse parallax bounds | P11 | `cameraController.test.js` |

### Unit Tests

Focused on specific boundary values and integration:

- `sp(0.15, S.WALK)` returns `0.0` (section start)
- `sp(0.30, S.WALK)` returns `1.0` (section end)
- `charPos(0.00)` returns `{ x: 0.0, z: 4.0 }` (first keyframe)
- `charPos(0.70)` returns `{ x: 0.0, z: 3.7 }` (sixth keyframe)
- `charRotY(p)` returns `0` for `p < S.WALK.start`
- `charRotY(p)` returns `PI` for `p >= S.SIT.start` (stationary)
- `CHAR_PATH` has exactly 7 entries
- `Object.keys(S)` returns exactly 8 section names
- `DESK_H === 0.76`
- `WORLD.door.z === 2.2`

### Integration Tests

- Render `<World progress={0.0} />` — SceneGeometry receives `mapOpacity = 0`
- Render `<World progress={0.40} />` — SceneGeometry receives `mapOpacity > 0`
- Render `<World progress={0.80} />` — SceneGeometry receives `monitorActive = false`
- Render `<World progress={0.87} />` — SceneGeometry receives `monitorActive = true`

### Smoke Tests (Static Analysis)

The following architectural constraints are verified by code review and linting rules rather than runtime tests:

- `Math.random()` does not appear in any scroll-driven module
- `progress` is not imported or used directly in `SceneGeometry`, `Door`, `MapPanel`, `Monitor`, or `Lighting` sub-components (only in `World`, `CameraController`, `Character`, `Lighting` root)
- No `setInterval` or `setTimeout` in scene components
- All object positions reference `WORLD.*` or `DESK_H` constants — no magic numbers for world coordinates
