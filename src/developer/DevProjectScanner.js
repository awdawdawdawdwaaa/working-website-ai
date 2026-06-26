import { getCurrentDevVersion, parseDevVersions } from './DevVersionData'

const sourceGlob = import.meta.glob('../**/*.{js,jsx,css}', {
  eager: true,
  query: '?raw',
  import: 'default',
})

const assetGlob = import.meta.glob('../../public/**/*.{glb,gltf,png,jpg,jpeg,webp,wasm,js}', {
  eager: false,
  query: '?url',
  import: 'default',
})

const pkgGlob = import.meta.glob('../../package.json', {
  eager: true,
  query: '?raw',
  import: 'default',
})

function normalizeSourcePath(path) {
  return path.replace(/^\.\.\//, 'src/')
}

function normalizeAssetPath(path) {
  return path.replace(/^\.\.\/\.\.\/public\//, 'public/')
}

function getPackage() {
  const entry = Object.entries(pkgGlob)[0]
  if (!entry) return {}
  try {
    return JSON.parse(entry[1])
  } catch {
    return {}
  }
}

function getSources() {
  const sources = {}
  for (const [path, content] of Object.entries(sourceGlob)) {
    sources[normalizeSourcePath(path)] = content
  }
  return sources
}

function count(text, pattern) {
  return (text.match(pattern) || []).length
}

function unique(list) {
  return [...new Set(list)].sort((a, b) => a.localeCompare(b))
}

function getComponentNames(sources) {
  const names = []
  for (const content of Object.values(sources)) {
    const defaultFunctions = content.matchAll(/export\s+default\s+function\s+([A-Z]\w*)/g)
    const namedFunctions = content.matchAll(/export\s+function\s+([A-Z]\w*)/g)
    const constComponents = content.matchAll(/(?:const|function)\s+([A-Z]\w*)/g)
    for (const match of defaultFunctions) names.push(match[1])
    for (const match of namedFunctions) names.push(match[1])
    for (const match of constComponents) names.push(match[1])
  }
  return unique(names)
}

function getAssetReferences(sources) {
  const refs = []
  const assetRegex = /['"]([^'"]+\.(?:glb|gltf|png|jpg|jpeg|webp|wasm|mp3|wav))['"]/gi
  for (const content of Object.values(sources)) {
    for (const match of content.matchAll(assetRegex)) refs.push(match[1])
  }
  for (const path of Object.keys(assetGlob)) refs.push(normalizeAssetPath(path))
  return unique(refs)
}

function getFileTree(paths) {
  const tree = {}
  for (const path of paths) {
    const parts = path.split('/')
    let node = tree
    for (const part of parts) {
      node[part] ||= {}
      node = node[part]
    }
  }

  function print(node, depth = 0) {
    let text = ''
    for (const key of Object.keys(node).sort((a, b) => a.localeCompare(b))) {
      const child = node[key]
      const isFile = Object.keys(child).length === 0 && /\.[a-z0-9]+$/i.test(key)
      text += `${'  '.repeat(depth)}${isFile ? '- ' : ''}${key}${isFile ? '' : '/'}\n`
      if (!isFile) text += print(child, depth + 1)
    }
    return text
  }

  return print(tree).trim()
}

function getImportantFiles(sources) {
  const files = Object.keys(sources)
  return {
    app: files.filter((path) => /src\/App|src\/main/.test(path)),
    developer: files.filter((path) => path.includes('src/developer/')),
    core: files.filter((path) => path.includes('src/core/')),
    loading: files.filter((path) => path.includes('src/loading/')),
    mobile: files.filter((path) => path.includes('src/mobile/')),
    scenes: files.filter((path) => path.includes('src/scenes/')),
    ui: files.filter((path) => path.includes('src/ui/')),
  }
}

function lineList(items, fallback = 'none detected') {
  if (!items.length) return fallback
  return items.map((item) => `- ${item}`).join('\n')
}

export default class ProjectScanner {
  constructor() {
    this.cache = null
  }

  scan() {
    if (this.cache) return this.cache

    const pkg = getPackage()
    const sources = getSources()
    const paths = Object.keys(sources).sort((a, b) => a.localeCompare(b))
    const text = Object.values(sources).join('\n')
    const files = getImportantFiles(sources)
    const components = getComponentNames(sources)
    const assets = getAssetReferences(sources)
    const versions = parseDevVersions()
    const currentVersion = getCurrentDevVersion()

    const stats = {
      sourceFiles: paths.length,
      publicAssets: Object.keys(assetGlob).length,
      lines: text.split('\n').length,
      components: components.length,
      canvases: count(text, /<Canvas\b/g),
      meshes: count(text, /<mesh\b/g),
      lights: count(text, /<(ambientLight|pointLight|spotLight|directionalLight)\b/g),
      controls: count(text, /OrbitControls|DevOrbitControls|CameraRig|CameraSmoother/g),
      interactions: count(text, /on(?:Click|Pointer|Mouse|Key|Wheel)[A-Z]/g),
      useFrame: count(text, /useFrame\s*\(/g),
      useGLTF: count(text, /useGLTF\s*\(/g),
      shaderMaterials: count(text, /ShaderMaterial|shaderMaterial|vertexShader|fragmentShader/g),
    }

    const sections = [
      {
        title: 'PURPOSE',
        content: `${pkg.name || 'ved-portfolio-3d'} is a 3D portfolio site with a cinematic desktop experience, adaptive mobile path, and isolated Developer Mode for inspecting procedural hardware, lighting, scene behavior, and version history.

Dev Mode purpose: debug and iterate on the room hardware without changing the main website flow.`,
      },
      {
        title: 'SYSTEMS',
        content: `React app shell: ${lineList(files.app)}
Core cinematic system: ${files.core.length} files
Loading system: ${files.loading.length} files
Mobile system: ${files.mobile.length} files
Developer system: ${files.developer.length} files

Detected components: ${stats.components}
Detected canvases: ${stats.canvases}
Detected meshes: ${stats.meshes}
Detected lights: ${stats.lights}
Shader references: ${stats.shaderMaterials}`,
      },
      {
        title: 'INTERACTIONS',
        content: `Detected event handlers: ${stats.interactions}

Main site:
- scroll-driven cinematic movement
- loader pointer effects
- intro and overlay UI

Developer Mode:
- top mode switch returns to site
- collapsible controls
- test tabs mount one asset at a time
- PC power button hover/click
- live light sliders
- mouse model dropdown applies instantly
- Escape exits Dev Mode`,
      },
      {
        title: 'NAVIGATION',
        content: `Desktop path:
- App renders CinematicPortfolio until Developer Mode is selected.
- Developer Mode replaces the main site view and unmounts the main scene.
- Escape or return button exits Developer Mode.

Mobile path:
- App routes mobile devices into MobileEntry.

Main routing files remain outside Dev Mode changes.`,
      },
      {
        title: 'SCENE FLOW',
        content: `Main scene:
- loader release
- intro overlay
- corridor/cinematic portfolio
- room and monitor moments are controlled by core timeline files

Developer scene:
- UI mounts immediately
- center canvas mounts after the UI tick
- selected test asset mounts inside the existing Dev canvas
- hidden test assets are unmounted
- Full Scene is the only Dev tab with room, desk, CRT, PC case, lamp, dust, and lights`,
      },
      {
        title: 'CAMERA',
        content: `Main camera:
- core cinematic camera files drive the website experience.

Developer camera:
- DevOrbitControls allows full 360 rotation.
- No azimuth lock.
- Smooth zoom and pan are enabled.
- Near/far clipping is widened for inspection.
- Camera target changes per selected test asset without remounting the canvas.

Detected camera/control references: ${stats.controls}`,
      },
      {
        title: 'ASSETS',
        content: `Source asset references and public asset paths:
${lineList(assets)}

Dev hardware is procedural and avoids loading main website GLB assets unless the main site itself is active.`,
      },
      {
        title: 'LOGIC',
        content: `React hooks:
- useFrame calls: ${stats.useFrame}
- useGLTF calls: ${stats.useGLTF}

Dev Mode logic:
- LightingContext owns live values for lamp intensity, warmth, ambient, monitor glow, case LED, shadow softness, exposure, and dust amount.
- DeveloperMode owns active test, mouse model, delayed scene mount, and exit cleanup.
- DevVersionData reads DEV_MODE_HISTORY.md as the version source of truth.
- DevProjectScanner scans source text and public asset paths for this About report.`,
      },
      {
        title: 'PERFORMANCE',
        content: `Current counts:
- source files: ${stats.sourceFiles}
- public asset paths: ${stats.publicAssets}
- source lines: ${stats.lines}

Main performance remains controlled by the existing website files.

Dev performance:
- UI appears before canvas mount.
- Canvas uses low DPR and antialias off.
- Only the selected Dev test component is mounted.
- Hidden test tabs do not keep animating.
- Dust amount and shadow softness are live-controlled.`,
      },
      {
        title: 'FILE MAP',
        content: getFileTree(paths),
      },
      {
        title: 'VERSION',
        content: versions.length
          ? versions.map((entry) => `${entry.version} | ${entry.date} | ${entry.title}\n${entry.summary}`).join('\n\n')
          : `${currentVersion.version} | ${currentVersion.date} | ${currentVersion.title}\n${currentVersion.summary}`,
      },
    ]

    this.cache = {
      sections,
      stats,
      currentVersion,
      generatedAt: new Date().toLocaleString(),
    }
    return this.cache
  }

  invalidate() {
    this.cache = null
  }
}

export const scanner = new ProjectScanner()
