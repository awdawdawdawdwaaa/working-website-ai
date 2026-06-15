# 👨‍💻 Developer Guide

Complete guide for developers working with this optimized portfolio.

---

## 📚 Project Structure

```
portfolio/
├── src/
│   ├── components/
│   │   ├── World.jsx              # Main 3D scene coordinator
│   │   ├── CameraController.jsx   # Cinematic camera system
│   │   ├── Lighting.jsx           # Multi-light system
│   │   ├── Character.jsx          # Character with animations
│   │   ├── Workstation.jsx        # Developer workspace
│   │   ├── Environment.jsx        # Floor/dots/ambience
│   │   ├── AhmedabadMap.jsx       # City map visualization
│   │   ├── ProjectPanels.jsx      # Portfolio projects
│   │   ├── Timeline3D.jsx         # Timeline visualization
│   │   ├── HUD.jsx                # UI overlays
│   │   └── Cursor.jsx             # Custom cursor
│   ├── hooks/
│   │   └── useScrollProgress.js   # Scroll tracking hook
│   ├── utils/
│   │   ├── responsive.js          # Device detection
│   │   ├── sceneConfig.js         # Scene configuration
│   │   ├── analytics.js           # Performance monitoring
│   │   └── three.js               # Three.js utilities
│   ├── App.jsx                    # Root component
│   ├── main.jsx                   # Entry point
│   └── index.css                  # Global styles
├── public/
│   └── assets/                    # 3D models
├── index.html                     # HTML template
├── vite.config.js                 # Vite configuration
└── package.json                   # Dependencies

```

---

## 🔧 Utils & Helpers

### responsive.js

Device detection and performance tiers.

```javascript
import { getPerformanceTier, isMobile, isTouchDevice } from './utils/responsive'

// Get device performance tier
const tier = getPerformanceTier() // 'low' | 'medium' | 'high'

// Check mobile
if (isMobile()) { /* adjust layout */ }

// Check touch
if (isTouchDevice()) { /* hide cursor */ }
```

### sceneConfig.js

Scene management and configuration.

```javascript
import { 
  getSceneInfo, 
  shouldElementBeVisible,
  getMonitorGlowIntensity 
} from './utils/sceneConfig'

// Get scene info
const scene = getSceneInfo(3)
// { id: 3, name: 'Ahmedabad', ... }

// Check visibility
if (shouldElementBeVisible('workstation', sceneId)) {
  // Show workstation
}

// Get glow intensity
const glow = getMonitorGlowIntensity(sceneId)
```

### analytics.js

Performance monitoring and metrics.

```javascript
import { performanceMonitor, enablePerformanceMonitoring } from './utils/analytics'

// In development, monitoring is auto-enabled
// Access metrics in browser console:
window.portfolioPerformance.log()        // Current metrics
window.portfolioPerformance.logFull()    // Detailed report
window.portfolioPerformance.report()     // Get object
```

### three.js

Three.js helper functions.

```javascript
import { 
  cloneMaterial,
  smoothLerp,
  easing,
  createOptimizedLight,
  disposeObject 
} from './utils/three.js'

// Clone material safely
const cloned = cloneMaterial(originalMaterial)

// Smooth interpolation
value = smoothLerp(value, target, 0.05)

// Use easing functions
const eased = easing.inOutCubic(progress)

// Create light
const light = createOptimizedLight('directional', {
  intensity: 1.0,
  color: 0xffffff,
  position: [0, 5, 0]
})

// Clean up
disposeObject(mesh)
```

---

## 🎬 Component Architecture

### World.jsx - Scene Coordinator

Main scene component that manages all 3D elements.

```javascript
<World scene={scene} sceneProgress={sceneProgress} />
```

**Props:**
- `scene` - Current scene index (0-9)
- `sceneProgress` - Progress within scene (0-1)

**Manages:**
- Camera controller
- Lighting
- Floor and environment
- Character
- Workstation
- Interactive elements

### CameraController.jsx - Cinematic Camera

Smooth, intentional camera movement with inertia.

**Features:**
- Velocity-based mouse tracking
- Smooth lerping with weighted speeds
- Scene-specific keyframes
- Orbit animation (scene 1)
- Passive event listeners

**Optimization:**
- RAF throttling for mouse events
- Memoized keyframes
- Efficient lerp calculations

### Lighting.jsx - Multi-Light System

Professional lighting with depth.

**Lights:**
- Ambient - Low atmospheric lighting
- Hemisphere - Sky/ground gradient
- Directional (key) - Main modeling light
- Directional (rim) - Silhouette definition
- Point (fill) - Subtle bounce light
- Point (accent) - Environmental depth
- Point (monitor) - CRT glow
- Point (ground) - Shadow fill

**Optimization:**
- Memoized target calculations
- Smooth transitions (lerp)
- Scene-dependent adjustments

---

## 🎨 Hooks & Patterns

### useScrollProgress Hook

Track scroll position and scene transitions.

```javascript
const { progress, scene, sceneProgress } = useScrollProgress(NUM_SCENES)
```

**Returns:**
- `progress` - Overall progress (0-1)
- `scene` - Current scene index
- `sceneProgress` - Progress within scene

**Optimization:**
- RAF throttling prevents jank
- Ticking flag prevents duplicate calls
- Proper cleanup on unmount

---

## 🚀 Performance Tips

### 1. Memoization

Use `useMemo` for expensive calculations:

```javascript
const visibility = useMemo(() => ({
  showWorkstation: scene >= 5,
  monitorGlow: scene >= 6 ? 1.0 : 0,
}), [scene])
```

### 2. Material Cloning

Always clone materials to prevent shared state:

```javascript
scene.traverse(child => {
  if (child.isMesh && child.material) {
    child.material = child.material.clone()
  }
})
```

### 3. Event Listeners

Use passive listeners for scroll performance:

```javascript
window.addEventListener('scroll', handler, { passive: true })
```

### 4. Geometry Reuse

Reuse geometries to save memory:

```javascript
const geometry = useMemo(() => new THREE.SphereGeometry(1, 32, 32), [])

// Use in multiple meshes
<mesh geometry={geometry} />
<mesh geometry={geometry} />
```

### 5. Lazy Loading

Use Suspense for heavy components:

```javascript
<Suspense fallback={null}>
  <Character scene={scene} />
</Suspense>
```

---

## 🧪 Testing & Monitoring

### Enable Performance Monitoring

```javascript
// Automatically enabled in development
// Manual enable:
import { enablePerformanceMonitoring } from './utils/analytics'
enablePerformanceMonitoring()

// View metrics in console:
window.portfolioPerformance.log()
```

### Performance Metrics Available

- Average FPS
- Average frame time
- Memory usage
- Scene transitions count
- User interaction count

### Check in Browser Console

```javascript
// Get current report
window.portfolioPerformance.report()

// Log current metrics
window.portfolioPerformance.log()

// Full detailed report
window.portfolioPerformance.logFull()

// Reset metrics
window.portfolioPerformance.reset()
```

---

## 🔍 Debugging

### Enable Verbose Logging

Add to any component:

```javascript
useEffect(() => {
  console.log(`%c[ComponentName] Mounted`, 'color: #c4a882')
  return () => {
    console.log(`%c[ComponentName] Unmounted`, 'color: #c4a882')
  }
}, [])
```

### Monitor Frame Rate

```javascript
import { performanceMonitor } from './utils/analytics'

useFrame((state, delta) => {
  performanceMonitor.recordFrame(delta)
})
```

### Check Memory Usage

```javascript
if (performance.memory) {
  console.log(`Memory: ${(performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`)
}
```

---

## 🎯 Common Tasks

### Add New Scene

1. Update `NUM_SCENES` in App.jsx
2. Add scene config in `sceneConfig.js`
3. Add camera keyframe in `CameraController.jsx`
4. Add lighting config in `Lighting.jsx`
5. Add HUD content in `HUD.jsx`
6. Add scene-specific elements in `World.jsx`

### Modify Camera Movement

Edit `src/components/CameraController.jsx`:

```javascript
// Adjust lerp speeds for smoothness
const posLerpSpeed = 0.035  // Position smoothness
const lookLerpSpeed = 0.045 // Look-at smoothness
const fovLerpSpeed = 0.03   // FOV smoothness

// Adjust mouse sensitivity
mouseInfluence.current[0] += (mouseRaw.current[0] - mouseInfluence.current[0]) * 0.035
```

### Adjust Lighting

Edit `src/components/Lighting.jsx`:

```javascript
// Adjust intensity targets based on scene
const targetAmb = sceneIdx === 0 ? 0.05 : sceneIdx <= 2 ? 0.08 : 0.12
const targetRim = sceneIdx === 0 ? 0.4 : 0.65
```

### Change Colors

Edit `src/index.css`:

```css
:root {
  --bg: #080706;
  --ink: #e2d8cc;
  --accent: #c4a882;
  --crt: #6dff6d;
}
```

---

## 📊 Browser DevTools Tips

### Performance Tab

1. Open DevTools (F12)
2. Go to Performance tab
3. Record for a few seconds while scrolling
4. Analyze for jank (frame drops)

### Console Monitoring

```javascript
// Monitor FPS in real-time
performance.now() // Get timestamp

// Profile CPU usage
console.time('operation')
// ... code to profile ...
console.timeEnd('operation')
```

### Three.js Inspector

Install extension:
- Chrome: "Spline Inspector"
- Firefox: Similar tools available

---

## 🔐 Best Practices

### 1. Always Cleanup Effects

```javascript
useEffect(() => {
  const handler = () => { /* ... */ }
  window.addEventListener('scroll', handler)
  
  // ✅ Cleanup
  return () => window.removeEventListener('scroll', handler)
}, [])
```

### 2. Clone Materials

```javascript
// ❌ Don't share materials
const mesh1 = <mesh material={sharedMaterial} />
const mesh2 = <mesh material={sharedMaterial} />

// ✅ Clone materials
const mesh1 = <mesh material={sharedMaterial.clone()} />
const mesh2 = <mesh material={sharedMaterial.clone()} />
```

### 3. Memoize Expensive Computations

```javascript
// ✅ Memoize
const visibility = useMemo(() => ({
  show: scene >= 5
}), [scene])

// ❌ Don't compute every render
const visibility = { show: scene >= 5 }
```

### 4. Use Passive Event Listeners

```javascript
// ✅ Better performance
window.addEventListener('scroll', handler, { passive: true })

// ❌ Can block scrolling
window.addEventListener('scroll', handler)
```

---

## 🚀 Optimization Checklist

When optimizing components:

- [ ] Use `useMemo` for expensive calculations
- [ ] Use `useCallback` for event handlers
- [ ] Clone materials to avoid shared state
- [ ] Use passive event listeners
- [ ] Lazy load heavy components
- [ ] Clean up effects properly
- [ ] Avoid inline object creation
- [ ] Profile with DevTools
- [ ] Check console for warnings
- [ ] Monitor memory usage

---

## 📖 Resources

### Three.js Documentation
- https://threejs.org/docs/
- Great for understanding 3D concepts

### React Three Fiber
- https://docs.pmnd.rs/react-three-fiber/
- R3F specific patterns and best practices

### React Documentation
- https://react.dev/
- Hooks, performance optimization

### Vite Documentation
- https://vitejs.dev/
- Build optimization, configuration

---

## 🎓 Learning Path

1. Start: Understand component structure
2. Explore: Read through World.jsx
3. Debug: Use browser DevTools
4. Modify: Change small things (colors, timings)
5. Optimize: Profile and improve performance
6. Extend: Add new scenes or features

---

## 💡 Pro Tips

1. **Use keyboard shortcut** `Ctrl+Shift+J` (Chrome) to open console
2. **Use `console.table()`** for better data visualization
3. **Throttle console logs** to avoid performance hits
4. **Test on real devices** for accurate performance
5. **Monitor memory** with `performance.memory` API
6. **Use lighthouse** for comprehensive audits

---

## 🐛 Common Issues & Fixes

### Issue: Black Screen
**Cause**: Asset not loading  
**Fix**: Check Network tab, verify asset paths

### Issue: Janky Scroll
**Cause**: Expensive operations in scroll handler  
**Fix**: Use RAF throttling, check for `console.log` calls

### Issue: High Memory Usage
**Cause**: Not disposing geometries/materials  
**Fix**: Call `dispose()` when removing objects

### Issue: Poor Mobile Performance
**Cause**: High DPR or complex rendering  
**Fix**: Performance tier automatically handles this

---

## 📞 Support

For specific issues:
1. Check console for errors (F12)
2. Review relevant component file
3. Check IMPROVEMENTS.md for technical details
4. Profile with DevTools Performance tab

---

**Happy Coding! 🎉**

This codebase is production-ready and optimized for performance.
