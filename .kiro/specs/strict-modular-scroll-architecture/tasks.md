# Implementation Plan: Strict Modular Scroll Architecture

## Overview

This implementation plan converts the scroll-driven cinematic 3D portfolio design into a series of incremental coding tasks. The architecture enforces strict modular separation: World is the only component that reads scroll progress, all state flows top-down as props, and every visual output is deterministic based on a single progress value (0-1).

The implementation follows this sequence:
1. Core scroll system and data structures
2. Modular component architecture with World as state coordinator
3. Camera controller with keyframe interpolation
4. Character controller with path-based movement
5. Lighting system with intensity interpolation
6. Scene geometry with all props and animations
7. Property-based tests for all 11 correctness properties
8. Integration tests and final validation

## Tasks

- [ ] 1. Set up core scroll system and section definitions
  - Create `src/core/scrollSections.js` with all scroll section boundaries (S), section progress function (sp), easing functions (ease), character path keyframes (CHAR_PATH), world position constants (WORLD), and desk height constant (DESK_H)
  - Implement `charPos(p)` function that interpolates character position from CHAR_PATH keyframes using ease.inOut curve
  - Implement `charRotY(p)` function that computes Y-axis rotation from movement direction (samples position at p±0.005)
  - Export all constants and functions: S, sp, ease, CHAR_PATH, charPos, charRotY, WORLD, DESK_H
  - _Requirements: 1.1, 1.2, 1.3, 15.1, 15.2, 15.3, 15.4, 15.5, 16.1, 16.2, 16.3, 16.4_

- [ ]* 1.1 Write property tests for scroll section system
  - **Property 1: Progress Clamping**
  - **Validates: Requirements 1.1**
  - Test that progress values clamp to [0.0, 1.0] for any input (including negative and values > 1)
  - Use fast-check with fc.float() arbitrary
  - _Requirements: 1.1_

- [ ]* 1.2 Write property test for section progress boundaries
  - **Property 2: Section Progress Boundaries**
  - **Validates: Requirements 1.3, 15.2**
  - Test that sp(p, sec) returns [0.0, 1.0], equals 0.0 when p <= sec.start, equals 1.0 when p >= sec.end
  - Use fast-check with fc.float({min: -0.5, max: 1.5}) and fc.constantFrom(...Object.values(S))
  - _Requirements: 1.3, 15.2_

- [ ]* 1.3 Write property test for easing function validity
  - **Property 3: Easing Function Validity**
  - **Validates: Requirements 15.3**
  - Test that all easing functions (inOut, out3, out2, in2, linear) map [0,1] → [0,1] with f(0)=0 and f(1)=1
  - Use fast-check with fc.float({min: 0, max: 1}) and fc.constantFrom(...Object.keys(ease))
  - _Requirements: 15.3_

- [ ]* 1.4 Write property test for scroll-driven determinism
  - **Property 4: Scroll-Driven Determinism**
  - **Validates: Requirements 14.1, 14.5**
  - Test that charPos(p), charRotY(p) return identical results when called twice with same progress value
  - Use fast-check with fc.float({min: 0, max: 1})
  - _Requirements: 14.1, 14.5_

- [ ]* 1.5 Write property test for charPos keyframe exactness
  - **Property 7: Character Path Keyframe Exactness**
  - **Validates: Requirements 16.1, 16.2**
  - Test that charPos(kf.p) returns exactly {x: kf.x, z: kf.z} for each keyframe in CHAR_PATH
  - Use fast-check with fc.constantFrom(...CHAR_PATH)
  - _Requirements: 16.1, 16.2_

- [ ]* 1.6 Write unit tests for scroll section system
  - Test sp(0.15, S.WALK) === 0.0 (section start)
  - Test sp(0.30, S.WALK) === 1.0 (section end)
  - Test charPos(0.00) returns {x: 0.0, z: 4.0} (first keyframe)
  - Test charPos(0.70) returns {x: 0.0, z: 3.7} (sixth keyframe)
  - Test charRotY(p < 0.15) returns 0 (facing north during intro)
  - Test charRotY(p >= 0.70) returns PI (facing monitor when seated)
  - Test CHAR_PATH has exactly 7 entries
  - Test Object.keys(S) returns exactly 8 section names
  - Test DESK_H === 0.76
  - Test WORLD.door.z === 2.2
  - _Requirements: 1.2, 1.3, 15.1, 15.2, 16.1, 16.3, 16.4, 17.5_

- [ ] 2. Implement World component as state coordinator
  - Create or refactor `src/core/World.jsx` (or appropriate component file) to accept progress prop and compute all derived state
  - Import S, sp, ease from scrollSections.js
  - Compute mapOpacity: `ease.out3(sp(p, S.MAP)) * (1 - ease.out2(sp(p, S.DOOR)))`
  - Compute wallTextOpacity: same formula as mapOpacity
  - Compute doorOpen: `ease.out3(sp(p, S.DOOR))`
  - Compute monitorActive: `sp(p, S.PROJECTS) > 0.05`
  - Compute screenProgress: `ease.out3(sp(p, S.PROJECTS))`
  - Pass progress to CameraController, Lighting, and Character components as props
  - Pass derived state (mapOpacity, wallTextOpacity, doorOpen, monitorActive, screenProgress) to SceneGeometry as props
  - _Requirements: 1.5, 13.1, 13.2, 13.3, 13.8_

- [ ]* 2.1 Write integration tests for World derived state
  - Test World with progress=0.0 produces mapOpacity=0
  - Test World with progress=0.40 produces mapOpacity > 0
  - Test World with progress=0.80 produces monitorActive=false
  - Test World with progress=0.87 produces monitorActive=true
  - Use React Testing Library to render World and inspect props passed to children
  - _Requirements: 2.5, 3.5, 4.5, 8.4, 13.2_

- [x] 3. Implement CameraController with keyframe system
  - Create or refactor `src/core/CameraController.jsx` to accept progress prop only
  - Define 8 camera keyframes (KF array) with pos, target, and fov for each scroll section endpoint
  - Implement getKFPair(progress) helper that returns {a, b, t} where t = ease.inOut(frac(progress * 7))
  - Implement lerp3(a, b, t) helper for 3D vector interpolation
  - Use useRef to store internal smoothed state: camPos, camTarget, camFov, mouseX, mouseY
  - In useFrame: compute want values from keyframes, apply mouse parallax (±0.05 X, ±0.025 Y), smooth toward want (factors: pos 0.04, target 0.05, fov 0.04), update camera.position/lookAt/fov
  - Add mouse move listener to update mouseX/mouseY refs
  - Use useThree to access camera ref
  - _Requirements: 2.1, 2.2, 3.1, 3.2, 4.1, 4.2, 5.1, 5.2, 6.1, 6.2, 7.1, 7.2, 8.1, 8.2, 9.1, 9.2, 9.3, 10.1, 10.2, 10.3, 10.4, 13.4_

- [ ]* 3.1 Write property test for lerp3 correctness
  - **Property 5: Lerp3 Correctness**
  - **Validates: Requirements 10.1, 10.2, 10.3**
  - Test that lerp3(a, b, t) equals [a[i] + (b[i] - a[i]) * t] for each component, result lies between a and b
  - Use fast-check with fc.tuple(fc.float({min: -10, max: 10}), fc.float({min: -10, max: 10}), fc.float({min: -10, max: 10})) for vectors and fc.float({min: 0, max: 1}) for t
  - _Requirements: 10.1, 10.2, 10.3_

- [ ]* 3.2 Write property test for mouse parallax bounds
  - **Property 11: Mouse Parallax Bounds**
  - **Validates: Requirements 10.4**
  - Test that for any mouse position (mx, my) in [0,1], camera parallax offset satisfies |offsetX| <= 0.05 and |offsetY| <= 0.025
  - Use fast-check with fc.float({min: 0, max: 1}) for mouse coordinates
  - _Requirements: 10.4_

- [ ]* 3.3 Write unit tests for CameraController
  - Test keyframe array has exactly 8 entries
  - Test KF[0].pos === [0.0, 1.6, -3.5] (intro position)
  - Test KF[7].pos === [-1.8, 1.3, 2.2] (end position)
  - Test getKFPair(0.0) returns first two keyframes with t=0
  - Test getKFPair(1.0) returns last two keyframes with t=1
  - Test lerp3([0,0,0], [1,1,1], 0.5) === [0.5, 0.5, 0.5]
  - _Requirements: 2.1, 9.1, 10.1_

- [ ] 4. Implement Character component with path-based movement
  - Create or refactor `src/core/Character.jsx` (or animations/CharacterController.jsx) to accept progress prop only
  - Import charPos, charRotY, S, sp, ease from scrollSections.js
  - Load character GLB model with useGLTF hook
  - Implement bounding box calibration in useEffect (once on load): compute pivotY offset as -box.min.y
  - Set up animation mixer with walk and idle clips, store in refs (walkRef, idleRef)
  - In useFrame: update mixer with delta, compute walkP = sp(progress, S.WALK) and sitP = sp(progress, S.SIT)
  - Compute walkWeight based on isWalking state (progress in [S.WALK.start, S.SIT.start)), apply ease.inOut ramp
  - Compute idleWeight = 1 - walkWeight, apply to animation action weights
  - Get {x, z} from charPos(progress), compute targetY with pivotY + seated offset (-0.16 * ease.out3(sitP) when sitting)
  - Smooth position: XZ factor 0.10, Y factor 0.08
  - Compute rotation.y from charRotY(progress), smooth with factor 0.08 using shortest-path delta
  - Apply seated lean: rotation.x → 0.10 * ease.out3(sitP) with factor 0.06
  - _Requirements: 2.3, 3.3, 3.4, 4.3, 5.5, 5.6, 6.3, 6.4, 6.5, 6.6, 7.3, 7.4, 7.5, 8.5, 9.4, 11.1, 11.2, 11.3, 11.4, 11.5, 12.1, 12.2, 12.3, 12.4, 12.5, 13.5, 22.1, 22.2, 22.3, 22.4, 22.5, 23.1_

- [ ]* 4.1 Write property test for animation weight sum
  - **Property 6: Animation Weight Sum**
  - **Validates: Requirements 12.2, 12.3, 12.4**
  - Test that walkWeight + idleWeight === 1.0 and both are in [0.0, 1.0] for any progress value
  - Use fast-check with fc.float({min: 0, max: 1})
  - _Requirements: 12.2, 12.3, 12.4_

- [ ]* 4.2 Write property test for character Y non-negative
  - **Property 8: Character Y Non-Negative**
  - **Validates: Requirements 11.4, 11.5, 22.2, 22.3**
  - Test that character target Y position (pivotY + seated offset) >= 0.0 for any progress
  - Use fast-check with fc.float({min: 0, max: 1}) and fc.float({min: 0, max: 2}) for pivotY
  - _Requirements: 11.4, 11.5, 22.2, 22.3_

- [ ]* 4.3 Write property test for shortest-path rotation
  - **Property 9: Shortest-Path Rotation**
  - **Validates: Requirements 11.3**
  - Test that computed angular delta is in (-PI, PI] for any current and target rotation
  - Use fast-check with fc.float({min: -2*Math.PI, max: 2*Math.PI}) for angles
  - _Requirements: 11.3_

- [ ]* 4.4 Write unit tests for Character component
  - Test character starts at position [0.0, 0, 4.0] when progress=0.0
  - Test character moves to [0.0, 0, 3.7] when progress=0.70
  - Test walkWeight > 0.8 when progress in [0.15, 0.70)
  - Test walkWeight === 0.0 when progress < 0.15 or progress >= 0.80
  - Test rotation.y === 0 when progress < 0.15 (facing north)
  - Test rotation.y === PI when progress >= 0.70 (facing monitor)
  - Test seated Y offset = -0.16 applied when progress >= 0.70
  - _Requirements: 2.3, 3.3, 5.5, 6.3, 7.3, 11.4, 12.3_

- [ ] 5. Checkpoint - Ensure core systems pass tests
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implement Lighting component with intensity interpolation
  - Create or refactor `src/core/Lighting.jsx` (or LightingRig.jsx) to accept progress prop only
  - Import S, sp from scrollSections.js
  - Define 6 light refs: ambRef (AmbientLight), rimRef (DirectionalLight), keyRef (DirectionalLight with shadows), fillRef (PointLight), lampRef (PointLight with shadows), monitorRef (PointLight)
  - Compute section progress for WALK, MAP, ROOM_REVEAL, PROJECTS sections
  - In useFrame: lerp each light intensity toward target with appropriate factors (0.028 base, 0.028*0.7 for lamp, 0.03 for monitor)
  - Set light colors, positions, and shadow properties according to design spec
  - Configure keyRef shadow map 2048×2048, lampRef shadow map 512×512
  - _Requirements: 2.4, 2.5, 3.5, 5.3, 5.4, 13.7, 18.1, 18.2, 18.3, 18.4, 18.5, 23.5_

- [ ]* 6.1 Write unit tests for Lighting component
  - Test ambient intensity === 0.0 when progress < 0.15
  - Test ambient intensity > 0.0 when progress >= 0.15
  - Test desk lamp (lampRef) intensity === 0.0 when progress < 0.50
  - Test desk lamp intensity > 0.0 when progress >= 0.50
  - Test monitor light (monitorRef) intensity === 0.0 when progress < 0.80
  - Test monitor light intensity > 0.0 when progress >= 0.82
  - Test keyRef shadow casting is enabled
  - Test lampRef shadow casting is enabled
  - _Requirements: 2.4, 5.3, 18.1, 18.2, 23.5_

- [ ] 7. Implement SceneGeometry component with all static props
  - Create or refactor `src/scenes/SceneGeometry.jsx` (or WorldGeometry.jsx) to accept mapOpacity, wallTextOpacity, doorOpen, monitorActive, screenProgress as props
  - Implement Floor component at Y=0.0
  - Implement Walls component (three walls with proper positions)
  - Implement MapPanel component that accepts opacity prop and renders map line geometry (1 river + 7 roads) with useFrame lerp toward target opacity (factor 0.04-0.05)
  - Implement WallText component that accepts opacity prop
  - Implement Door component that accepts doorOpen prop, computes rotation as doorOpen * (-PI/2), applies hinge pivot at X=-0.44
  - Implement Desk component at position WORLD.desk, surface at Y=DESK_H (0.76)
  - Implement Chair component at position WORLD.chair, seat at Y=0.44
  - Implement DeskLamp component at position WORLD.lamp
  - Implement Monitor component that accepts active and screenProgress props, lerps emissiveIntensity toward 0.65 when active (factor 0.05), uses emissive color #0a1a0a
  - Implement Keyboard component on desk surface
  - Implement Mouse component on desk surface
  - Implement PCTower component on floor
  - Use useMemo for all static geometry
  - Ensure all objects reference WORLD.* or DESK_H constants for positions
  - _Requirements: 3.5, 3.6, 4.4, 4.5, 8.3, 8.4, 13.6, 17.1, 17.2, 17.3, 17.4, 17.5, 19.1, 19.2, 19.3, 19.4, 19.5, 20.1, 20.2, 20.3, 20.4, 20.5, 21.1, 21.2, 21.3, 21.4, 21.5, 23.2, 23.3, 23.4, 25.1, 25.2, 25.3, 25.4, 25.5, 25.6, 25.7, 25.8_

- [ ]* 7.1 Write property test for door angle range
  - **Property 10: Door Angle Range**
  - **Validates: Requirements 20.1, 20.2**
  - Test that for any doorOpen in [0.0, 1.0], computed door rotation is in [-PI/2, 0.0]
  - Use fast-check with fc.float({min: 0, max: 1})
  - _Requirements: 20.1, 20.2_

- [ ]* 7.2 Write unit tests for SceneGeometry components
  - Test Floor is rendered at Y=0.0
  - Test Desk surface is at Y=DESK_H (0.76)
  - Test Chair seat is at Y=0.44
  - Test Door rotation === 0 when doorOpen=0 (closed)
  - Test Door rotation === -PI/2 when doorOpen=1 (fully open)
  - Test Monitor emissiveIntensity === 0 when active=false
  - Test Monitor emissiveIntensity > 0 when active=true (after lerp)
  - Test MapPanel renders with opacity=0 when mapOpacity=0
  - Test MapPanel line count === 9 (1 river + 8 roads based on requirements, but design says 1 river + 7 roads - use design spec)
  - Test all desk objects (lamp, monitor, keyboard, mouse) are positioned at Y >= DESK_H
  - _Requirements: 4.4, 8.3, 17.1, 19.1, 19.5, 20.1, 20.2, 21.1, 21.2, 25.1, 25.2, 25.3_

- [ ] 8. Implement shadow configuration for all scene objects
  - Configure all character meshes to cast and receive shadows in Character component
  - Configure all static geometry meshes (desk, chair, lamp, door) to cast shadows in SceneGeometry
  - Configure floor and walls to receive shadows in SceneGeometry
  - Create invisible shadow-only plane at Y=0.001 with shadow material opacity 0.55
  - Set shadow bias -0.0005 and normal bias 0.02 for desk lamp in Lighting component
  - _Requirements: 23.1, 23.2, 23.3, 23.4, 23.5_

- [ ]* 8.1 Write unit tests for shadow configuration
  - Test character model has castShadow=true and receiveShadow=true
  - Test desk mesh has castShadow=true
  - Test floor mesh has receiveShadow=true
  - Test shadow plane exists at Y=0.001
  - Test lampRef has castShadow=true with bias -0.0005
  - _Requirements: 23.1, 23.2, 23.3, 23.4, 23.5_

- [ ] 9. Implement useScrollProgress hook
  - Create or refactor `src/core/useScrollProgress.js` hook that tracks window scroll position
  - Compute scroll spacer height (e.g., 5000px or configurable)
  - Add scroll event listener to track scrollY
  - Compute progress = scrollY / (spacerHeight - windowHeight), clamped to [0.0, 1.0]
  - Guard against zero-length scroll container (division by zero)
  - Return { progress }
  - _Requirements: 1.1, 1.4_

- [ ]* 9.1 Write unit tests for useScrollProgress
  - Test progress === 0.0 when scrollY === 0
  - Test progress === 1.0 when scrollY >= (spacerHeight - windowHeight)
  - Test progress is clamped to [0.0, 1.0] for negative scrollY
  - Test hook returns 0 when spacer height is 0 (guard against division by zero)
  - _Requirements: 1.1, 1.4_

- [ ] 10. Wire all components together in App.jsx
  - Import and call useScrollProgress hook to get progress value
  - Pass progress to World component
  - Ensure Canvas is configured with proper renderer settings (DPR max 1.5)
  - Add scroll spacer div with appropriate height (5000px or configurable)
  - Render HUD/UI overlay components if needed
  - _Requirements: 1.5, 13.1, 24.5_

- [ ]* 10.1 Write integration tests for full system
  - Test complete render: App → World → all child components with progress=0.0
  - Test complete render with progress=0.50 (mid-experience state)
  - Test complete render with progress=1.0 (end state)
  - Verify camera position changes based on progress
  - Verify character position changes based on progress
  - Verify scene element visibility (map, door, monitor) changes based on progress
  - _Requirements: 1.5, 13.1, 13.2, 13.3_

- [ ] 11. Checkpoint - Ensure all integration tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Performance optimization and validation
  - Verify renderer DPR is set to max 1.5 in Canvas configuration
  - Verify shadow map resolutions: keyRef 2048×2048, lampRef 512×512
  - Add useMemo for all static geometry that doesn't change per frame
  - Add guards to prevent updateProjectionMatrix() calls when FOV change < 0.02
  - Test frame time in development mode, ensure < 16ms on target hardware
  - _Requirements: 24.1, 24.2, 24.3, 24.4, 24.5_

- [ ]* 12.1 Write performance validation tests
  - Test Canvas props include dpr clamped to max 1.5
  - Test keyRef shadow map size === 2048
  - Test lampRef shadow map size === 512
  - Test static geometry components use useMemo
  - _Requirements: 24.3, 24.5_

- [ ] 13. Verify deterministic behavior and strict modular separation
  - Run linter to verify Math.random() does not appear in scroll-driven modules
  - Verify progress is not imported directly in SceneGeometry, Door, MapPanel, Monitor sub-components
  - Verify no setInterval or setTimeout in scene components
  - Verify all object positions reference WORLD.* or DESK_H constants
  - Run all property-based tests with seed variation to ensure determinism
  - _Requirements: 13.1, 13.2, 13.4, 13.5, 13.6, 13.7, 13.8, 14.1, 14.2, 14.3, 14.4, 14.5, 17.2, 17.3, 17.5_

- [ ]* 13.1 Write static analysis verification tests
  - Test that scrollSections.js, World.jsx, CameraController.jsx, Character.jsx, Lighting.jsx do not contain Math.random()
  - Test that SceneGeometry and sub-components do not import or use 'progress' prop (only World, CameraController, Character, Lighting may use it)
  - Test that all position constants are exported from scrollSections.js
  - _Requirements: 13.1, 13.4, 13.6, 14.2, 14.3, 17.5_

- [ ] 14. Final validation and cleanup
  - Run full test suite (property tests + unit tests + integration tests)
  - Test scroll interaction manually at key progress values (0.0, 0.15, 0.30, 0.45, 0.58, 0.70, 0.80, 0.92, 1.0)
  - Verify all 7 scroll states render correctly
  - Verify camera movements are smooth and cinematic
  - Verify character animations blend smoothly
  - Verify lighting transitions match design spec
  - Verify door opens smoothly during door entry state
  - Verify map appears and fades correctly
  - Verify monitor turns on with screen content during projects state
  - Clean up any console warnings or errors
  - _Requirements: All requirements (end-to-end validation)_

- [ ] 15. Final checkpoint - Complete implementation
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties (11 properties total)
- Unit tests validate specific examples and edge cases
- Integration tests validate component coordination and data flow
- Checkpoints ensure incremental validation at major milestones
- All code uses JavaScript/JSX (React Three Fiber ecosystem)
- Property-based testing uses fast-check library (100+ iterations per property)
- The architecture enforces strict separation: only World reads scroll progress directly
- All positions use constants from scrollSections.js (no magic numbers)
- All visual output is deterministic based solely on progress value (no randomness)
