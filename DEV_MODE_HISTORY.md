# Developer Mode — Change History

## V1.4
- **Date**: 2026-06-25
- **Title**: CRT glass seat and inward throat correction
- **Summary**: Reworked the Dev CRT screen transition so the flat screen UI sits behind a shallow convex glass surface that physically meets the monitor through an inward throat, angled connector, and retaining lip.
- **Details**:
  - Replaced the simple two-point connector with a three-step front recess, inward bend, and angled screen seat.
  - Added a plastic retaining lip that overlaps the glass/screen edge to remove the floating-screen gap.
  - Kept the screen UI mesh flat and reduced the visible glass bulge to a subtler outward CRT curve.
  - Used vintage CRT reference behavior: thick bezel, recessed inner throat, angled return, and convex glass seated into the plastic.
- **Files**: DevCRT.jsx

## V1.3
- **Date**: 2026-06-25
- **Title**: Monitor screen depth and PC case detail correction
- **Summary**: Reduced the CRT screen/glass inset depth by half, moved PC case front details back onto the panel surface, and made right-click drag explicitly pan/recenter the Dev 3D view.
- **Details**:
  - Screen inset now uses half the previous deep offset while keeping the existing monitor body shape.
  - Front drive bays, vents, screws, LEDs, scratches, and power button now sit flush with the PC case panel instead of floating forward.
  - DevOrbitControls maps right mouse drag to panning and suppresses the browser context menu over the canvas.
- **Files**: DevCRT.jsx, RetroPC.jsx, DevOrbitControls.jsx

## V1.2
- **Date**: 2026-06-25
- **Title**: Dev-only internal tools redesign, isolated test viewport, hardware rebuild pass
- **Summary**: Reworked Developer Mode as a raw internal-tools UI with left controls, center viewport, right info, top mode switch, delayed scene mount, live lighting controls, generated About report, version data parsed from this history, selected-asset test tabs, mouse model switching, rebuilt CRT shell from the provided reference, rebuilt beige tower PC, and replaced the desk lamp. Main website, corridor, loader, routing, main animations, and main assets were not modified.
- **Details**:
  - UI now opens immediately before the Three.js canvas mounts.
  - Sections are SCENE, TESTING, ABOUT, LIGHT, PERFORMANCE, VERSION and stay closed by default.
  - Test tabs are Monitor, PC Case, Lamp, Full Scene, and Mouse; hidden tests unmount.
  - Mouse test includes an instant model dropdown.
  - Lighting controls are rebuilt around lamp intensity, lamp warmth, ambient, monitor glow, case LED, shadow softness, exposure, and dust amount.
  - CRT physical shell now follows the uploaded reference: boxy beige ABS, thick molded bezel, recessed screen, 50 degree connector, convex glass, compressed rear, vents, rear service panel, and integrated stand.
  - PC case is a deeper retro beige tower on the right side of the desk with drive bays, vents, seams, screws, scratches, flat red power button, separate LED, and button travel.
  - Lamp is rebuilt as a warm metal desk lamp with cable, bulb glow, reflector, and light cone.
- **Files**: DeveloperMode.jsx, DevModeUI.jsx, DevMode.css, LightingContext.jsx, DevTestPanel.jsx, DevLightPanel.jsx, DevAboutPanel.jsx, DevProjectScanner.js, DevVersionPanel.jsx, DevVersionData.js, DevCRT.jsx, RetroPC.jsx, DevPowerButton.jsx, DevHDDLED.jsx, DevDeskLamp.jsx, DevStage1PC.jsx, DevStage2Monitor.jsx, DevStage3Room.jsx, DevStageMouse.jsx, DeveloperRoom.jsx

## V1.1
- **Date**: 2026-06-24
- **Title**: CRT + PC case rebuild — continuous shell, flat screen, convex glass, light controls fix
- **Summary**: Rebuilt CRT with new dimensions (58×45×42cm), flat screen (UI not bent), convex glass (bulges OUT, edges recede), ring body with proper profile (front 100% → bulge 108% → rear 42%), shortened rear depth. Rebuilt PC case with new dimensions (22×45×48cm), tapered body, beveled front. Fixed lighting controls — added Apply/Reset/Save Preset with instant live preview, preset storage, visual feedback (✓ APPLIED / ✓ SAVED). Desktop/boot/screen/UI preserved unchanged.
- **Files**: DevCRT.jsx, RetroPC.jsx, LightingContext.jsx, DevLightPanel.jsx

## V1.0
- **Date**: 2026-06-24
- **Title**: CRT & PC case geometry overhaul — convex screen, ring-based body, desktop case
- **Summary**: Fixed CRT screen curve from concave (bowl) to convex (outward bulge), rebuilt CRT body with ring-based custom geometry (no BoxGeometry), thickened bezel to 3cm, added clearcoat glass with envMap. Rebuilt PC case as late-80s desktop style with beveled front frame, tapered body, inset side panels with grooves, curved top, 30 vent slots with depth, proper rear IO/fan/cable panel, panel locks.
- **Files**: DevCRT.jsx, RetroPC.jsx

## V0.9b
- **Date**: 2026-06-24
- **Summary**: Auto-generated ABOUT WEBSITE panel — live project scanner replaces static text
- **Details**:
  - DevProjectScanner.js reads all source files via Vite import.meta.glob, counts components/meshes/scenes/lights/shaders/assets/interactions/UI elements
  - Generates 12 sections: OVERVIEW, PROJECT STRUCTURE, FEATURES, CURRENT SCENES, INTERACTIONS, ASSETS, UI SYSTEM, PERFORMANCE, DEV MODE, VERSION, KNOWN LIMITATIONS, NOTES
  - COPY ALL DETAILS button with "COPIED" animation feedback (no popup)
  - REFRESH ANALYSIS button invalidates scanner cache and re-generates
  - Bottom status bar: last scan timestamp, version, objects, components, scenes, file count
  - Version section reads from DEV_MODE_HISTORY.md (source of truth, not manual text)
  - Draggable, collapsible, searchable window
- **Files**: DevProjectScanner.js, DevAboutPanel.jsx

## V0.9
- **Date**: 2026-06-24
- **Title**: CRT monitor body rebuild — curved shell, picture-frame bezel, vented back, trapezoid stand
- **Summary**: Complete CRT geometry replacement: one integrated curved beige ABS body, bezel with real hole (ExtrudeGeometry shape+hole), recessed screen 1.5cm behind bezel face, back panel with vents/seam/screws/power cable, trapezoid stand with neck+rubber feet, procedural texture (yellowing + grain + micro scratches), mold line detail, brand badge, green power LED. Existing screen/shader/glass/boot/desktop logic untouched.
- **Files**: DevCRT.jsx

## V0.8
- **Date**: 2026-06-24
- **Summary**: UI system rework — dark retro style, auto about, light panel, new entry flow
- **Details**:
  - No immediate intro — UI shown first, user chooses mode
  - Auto-generated ABOUT with collapsible sections + search
  - LIGHT panel: lamp intensity/warmth, monitor glow, ambient, reflection, shadow, dust
  - LightingContext for real-time light overrides
  - Bottom-right version badge with expandable panel
  - Dark retro window-based UI (no Win98 colors)
  - DevStage3Room reads lighting from context
  - DevCRT reflection amount controllable
  - DevDust opacity external prop
- **Files**: DevModeUI.jsx, DevAboutPanel.jsx, DevLightPanel.jsx, DevVersionPanel.jsx, DevTestPanel.jsx, LightingContext.jsx, DeveloperMode.jsx, DevStage3Room.jsx, DeveloperRoom.jsx, DevCRT.jsx, DevDust.jsx, DEV_MODE_HISTORY.md

## V0.7
- **Date**: 2026-06-24
- **Summary**: Test modes + Win98 UI + change tracking
- **Files**: DevModeUI.jsx, DevTestPanel.jsx, DevAboutPanel.jsx, DevVersionPanel.jsx, DevStageKeyboard.jsx, DevStageMouse.jsx, DeveloperMode.jsx

## V0.6
- **Date**: 2026-06-24
- **Summary**: Realistic case depth + power button redesign
- **Files**: RetroPC.jsx, DevPowerButton.jsx, DevHDDLED.jsx

## V0.5
- **Date**: 2026-06-24
- **Summary**: 3-stage intro sequence (PC → Monitor → Room)
- **Files**: DeveloperMode.jsx, DevStage1PC.jsx, DevStage2Monitor.jsx, DevStage3Room.jsx

## V0.4
- **Date**: 2026-06-24
- **Summary**: CRT boot shader + scanlines + text overlay
- **Files**: DevCRT.jsx, crtShaders.js, DevBootText.jsx, DevDesktop.jsx

## V0.3
- **Date**: 2026-06-24
- **Summary**: Monitor geometry + glass reflection + curved screen
- **Files**: DevCRT.jsx

## V0.2
- **Date**: 2026-06-24
- **Summary**: Lamp model + warm 2700K lighting
- **Files**: DeveloperRoom.jsx, DevDust.jsx

## V0.1
- **Date**: 2026-06-24
- **Summary**: Initial room — desk, walls, ambient lights
- **Files**: DeveloperMode.jsx, DeveloperRoom.jsx, DevCRT.jsx, RetroPC.jsx, DevPowerButton.jsx, DevAudio.js, DevCameraRig.jsx
