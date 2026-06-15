# Requirements Document

## Introduction

The **Strict Modular Scroll Architecture** feature refactors the existing 3D cinematic portfolio scroll
experience to enforce a precise 5-prop flow with a two-tier typographic overlay system: a large, thin
white headline and a smaller, warm-yellow handwritten subtitle. The feature changes **prop order**,
**text content**, and **overlay text styling only** — it explicitly preserves all timing values, camera
behaviour, light-line transitions, room geometry, prop positions, animations, and world geometry.

This is a **TEXT UI ONLY** change. No 3D objects, `.glb` files, prop models, textures, camera, light
lines, room geometry, animations, timing/transitions, prop positions, or world geometry are touched.
Text is rendered as a **2D HTML/CSS screen overlay** positioned above the canvas — text is never
attached to props and never enters the 3D world.

---

## Glossary

- **Portfolio**: The React + R3F 3D cinematic scroll application.
- **PropLoader**: `src/scenes/PropLoader.jsx` — places GLB props in the 3D corridor.
- **CinematicTimeline**: `src/core/cinematicTimeline.js` — defines `INFO_REVEALS` timing and overlay
  text content.
- **CinematicOverlay**: `src/ui/CinematicOverlay.jsx` — renders the HTML/CSS text overlay above the
  canvas.
- **NarrativeRegistry**: `src/core/narrativeRegistry.js` — shared runtime state; not modified.
- **INFO_REVEALS**: The ordered array of reveal objects in `CinematicTimeline`, each carrying a
  `title` (White_Headline) and `text` (Yellow_Subtitle), plus `outlineId` referencing a prop.
- **Prop**: A single GLB asset placed in the 3D corridor by `PropLoader`.
- **PropFlow**: The canonical 5-prop/text sequence: BEGIN → BUILD → ORIGIN → TME → CREATE.
- **Slot**: One paired entry in `PROPS` (PropLoader) and `INFO_REVEALS` (CinematicTimeline).
- **White_Headline**: The large, thin, white, centred overlay label — sourced from `title` in each
  `INFO_REVEALS` entry.
- **Yellow_Subtitle**: The smaller, warm-yellow, handwritten overlay text directly below the headline
  — sourced from `text` in each `INFO_REVEALS` entry.
- **Overlay_Block**: The containing element that holds both White_Headline and Yellow_Subtitle,
  positioned as a fixed HTML element at 50% / 56% of the viewport.
- **CriticalRule**: The inviolable constraint that timing, camera, light lines, room geometry,
  animations, prop positions, world geometry, `.glb` files, and typing animation code in
  `CinematicTimeline` MUST NOT be modified.

---

## Requirements

### Requirement 1: Five-Slot Prop Flow

**User Story:** As a visitor, I want to experience exactly five themed props in narrative order,
so that the portfolio tells a coherent personal story.

#### Acceptance Criteria

1. THE `PropLoader` SHALL define exactly five `Slot` entries in its `PROPS` array.
2. THE `PropLoader` SHALL assign the following GLB files to each slot in ascending Z order:
   - Slot 1 (`id: 'AGE_WALL'`) — `/props/Meshy_AI_Age_Wall_0611070403_texture.glb`
   - Slot 2 (`id: 'BRUSHED_STEEL_CITY'`) — `/props/Meshy_AI_Brushed_Steel_City_Sk_0610152611_texture.glb`
   - Slot 3 (`id: 'AHMEDABAD_MAP_INSTALL'`) — `/props/Meshy_AI_Ahmedabad_Map_Install_0611072026_texture.glb`
   - Slot 4 (`id: 'TIME_IN_STEEL'`) — `/props/Meshy_AI_Time_in_Steel_0611065420_texture.glb`
   - Slot 5 (`id: 'PROBLEM_SOLVING_WALL'`) — `/props/Meshy_AI_Problem_Solving_Wall_0611071356_texture.glb`
3. THE `PropLoader` SHALL NOT include any prop outside the five-slot `PropFlow`.
4. THE `PropLoader` SHALL preserve all existing placement logic, wall mounting, material override,
   `registerPropOutline` logic, Z positions, and wall-side assignments exactly as currently implemented.
5. IF a slot's GLB file is missing at load time, THEN THE `PropLoader` SHALL skip that slot silently
   and render the remaining props without crashing.

---

### Requirement 2: INFO_REVEALS Text Content

**User Story:** As a visitor, I want each prop reveal to display the correct headline and subtitle,
so that the overlay text tells the narrative story tied to each prop.

#### Acceptance Criteria

1. THE `CinematicTimeline` SHALL define exactly five entries in `INFO_REVEALS`, one per `Slot` in the
   `PropFlow`, in this order: BEGIN, BUILD, ORIGIN, TME, CREATE.
2. THE `CinematicTimeline` SHALL assign the following `title` (White_Headline) values per slot:
   - Slot 1 (Age Wall): `"BEGIN"`
   - Slot 2 (Brushed Steel City): `"BUILD"`
   - Slot 3 (Ahmedabad Map): `"ORIGIN"`
   - Slot 4 (Time in Steel): `"TME"`
   - Slot 5 (Problem Solving Wall): `"CREATE"`
3. THE `CinematicTimeline` SHALL assign the following `text` (Yellow_Subtitle) values per slot:
   - Slot 1 (Age Wall): `"16 Years Old • Started Building At 13"`
   - Slot 2 (Brushed Steel City): `"Developed Multiple Games Inside Roblox"`
   - Slot 3 (Ahmedabad Map): `"Working From Ahmedabad"`
   - Slot 4 (Time in Steel): `"Games • Websites • Server Management"`
   - Slot 5 (Problem Solving Wall): `"Turning Logic Into Real Projects"`
4. THE `CinematicTimeline` SHALL assign the `outlineId` of each `INFO_REVEALS` entry to the matching
   prop `id` defined in `PropLoader` (e.g. `'AGE_WALL'`, `'BRUSHED_STEEL_CITY'`, etc.).
5. THE `CinematicTimeline` SHALL NOT modify any `start`, `writeEnd`, `end`, or `propPoint` numeric
   values in any `INFO_REVEALS` entry.

---

### Requirement 3: Overlay Positioning

**User Story:** As a visitor, I want the text overlay to remain fixed and centred on screen,
so that it is always readable and never distracted by 3D scene movement.

#### Acceptance Criteria

1. THE `CinematicOverlay` SHALL render the `Overlay_Block` as a fixed HTML/CSS element positioned
   at `left: 50%` and `top: 56%` with `transform: translate(-50%, -50%)`.
2. THE `CinematicOverlay` SHALL set `text-align: center` on the `Overlay_Block`.
3. WHILE the scene is scrolling, THE `CinematicOverlay` SHALL maintain the `Overlay_Block` in a
   fixed screen position — the block SHALL NOT move, rotate, or track any 3D prop.
4. THE `CinematicOverlay` SHALL render the `Overlay_Block` above the canvas at a `z-index` that
   places it in the UI layer (above the 3D world).
5. THE `CinematicOverlay` SHALL render only one `Overlay_Block` (one White_Headline and one
   Yellow_Subtitle pair) visible at any given time.
6. THE `CinematicOverlay` SHALL NOT render any text inside the Three.js scene or attach text to any
   3D object.

---

### Requirement 4: White Headline Style

**User Story:** As a visitor, I want the white headline to feel premium and minimal, so that the
label commands attention without visual noise.

#### Acceptance Criteria

1. THE `CinematicOverlay` SHALL render the `White_Headline` using the `Inter Light` font family with
   fallback `'Helvetica Neue', sans-serif`.
2. THE `CinematicOverlay` SHALL render the `White_Headline` at a responsive font size of
   `clamp(92px, 8vw, 150px)`.
3. THE `CinematicOverlay` SHALL render the `White_Headline` with `font-weight: 300`.
4. THE `CinematicOverlay` SHALL render the `White_Headline` with `letter-spacing: -0.06em`.
5. THE `CinematicOverlay` SHALL render the `White_Headline` at `opacity: 0.90`.
6. THE `CinematicOverlay` SHALL render the `White_Headline` in white (`#ffffff` or equivalent).
7. THE `CinematicOverlay` SHALL NOT apply bold, italic, typing animation, movement animation, or
   scale animation to the `White_Headline`.

---

### Requirement 5: Yellow Subtitle Style

**User Story:** As a visitor, I want the yellow subtitle to feel personal and handcrafted, so that
it contrasts warmly with the cold minimal headline.

#### Acceptance Criteria

1. THE `CinematicOverlay` SHALL render the `Yellow_Subtitle` using the `Caveat` font family with
   fallback `'Segoe Script', cursive`.
2. THE `CinematicOverlay` SHALL render the `Yellow_Subtitle` at a responsive font size of
   `clamp(24px, 2vw, 38px)`.
3. THE `CinematicOverlay` SHALL render the `Yellow_Subtitle` with `font-weight: 400`.
4. THE `CinematicOverlay` SHALL render the `Yellow_Subtitle` in a warm gold colour in the range
   `#c8a050`–`#f5c842`.
5. THE `CinematicOverlay` SHALL render the `Yellow_Subtitle` at `opacity: 0.75`.
6. THE `CinematicOverlay` SHALL position the `Yellow_Subtitle` approximately 70px below the
   `White_Headline`, with no intervening elements between them.
7. THE `CinematicOverlay` SHALL NOT apply character-by-character typing animation, movement
   animation, or scale animation to the `Yellow_Subtitle`.
8. THE `Stylesheet` SHALL import the `Caveat` font from Google Fonts.

---

### Requirement 6: Fade Transition Behaviour

**User Story:** As a visitor, I want text to fade cleanly between props, so that transitions feel
smooth without distracting motion.

#### Acceptance Criteria

1. WHEN the active `INFO_REVEALS` entry changes, THE `CinematicOverlay` SHALL fade out the previous
   text pair over 220 ms.
2. WHEN the active `INFO_REVEALS` entry changes, THE `CinematicOverlay` SHALL fade in the next text
   pair over 300 ms.
3. THE `CinematicOverlay` SHALL NOT apply any movement (translate, slide), typing animation
   (character-by-character reveal), or scale animation during transitions.
4. THE `CinematicOverlay` SHALL NOT render a blinking caret or cursor element alongside the
   `Yellow_Subtitle`.
5. THE `CinematicOverlay` SHALL keep the existing `introVisible` and `getActiveInfo` logic
   unmodified — only the rendering of the info section and its CSS are permitted to change.

---

### Requirement 7: CriticalRule — No Side-Effects on Preserved Systems

**User Story:** As a developer, I want the refactor to be strictly scoped, so that no timing,
camera, scene geometry, animations, or non-text systems are affected.

#### Acceptance Criteria

1. THE `CinematicTimeline` SHALL NOT modify the numeric values of `start`, `writeEnd`, `end`, or
   `propPoint` for any `INFO_REVEALS` entry.
2. THE `CameraRig` (`src/core/CameraRig.jsx`) SHALL NOT be modified by this feature.
3. THE `SingleLightLine` (`src/core/SingleLightLine.jsx`) SHALL NOT be modified by this feature.
4. THE `NarrativeRegistry` (`src/core/narrativeRegistry.js`) SHALL NOT be modified by this feature.
5. THE `WorldGeometry` (`src/scenes/WorldGeometry.jsx`) SHALL NOT be modified by this feature.
6. THE `ScrollCinematicFlow` (`src/scenes/ScrollCinematicFlow.jsx`) SHALL NOT be modified by this
   feature.
7. No `.glb` file, prop model, texture, room geometry, animation, prop position, or world text
   SHALL be created or modified by this feature.
8. WHEN the five-slot `PropFlow` is rendered, THE `PropLoader` SHALL produce `registerPropOutline`
   calls using the same outline registration logic currently in use, unmodified.
9. THE `CinematicOverlay` SHALL NOT modify the `introVisible` or `getActiveInfo` call-sites —
   only the JSX markup and CSS classes for the info section are permitted changes.
10. IF the existing `getTypedCount` function remains in `CinematicTimeline`, THEN THE
    `CinematicTimeline` SHALL NOT remove or alter it, as it may be used elsewhere; the UI simply
    stops consuming it.
