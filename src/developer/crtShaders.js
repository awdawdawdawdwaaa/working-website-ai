import * as THREE from 'three'

const CRT_VERTEX = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const CRT_FRAGMENT = `
precision highp float;
uniform float uTime;
uniform float uBoot;
uniform vec2 uRes;
uniform sampler2D uTextTex;
uniform float uTextAlpha;
uniform sampler2D uDesktopTex;
uniform float uDesktopAlpha;
uniform float uReflect;
uniform float uContentFill;
uniform float uBarrelStrength;
varying vec2 vUv;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

void main() {
  vec2 uv = vUv;

  // Barrel distortion (CRT curvature)
  vec2 cur = uv * 2.0 - 1.0;
  float dist2 = dot(cur, cur);
  cur *= 1.0 + dist2 * 0.10 * uBarrelStrength;
  uv = cur * 0.5 + 0.5;

  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
    gl_FragColor = vec4(0.0);
    return;
  }

  float b = uBoot;
  vec3 col = vec3(0.0);

  // Reflection (warm lamp glow on glass)
  vec3 ref = vec3(0.03, 0.02, 0.01) * uReflect;
  vec2 rUv = uv * 0.5 + 0.25;
  float rd = dot(rUv - 0.5, rUv - 0.5);
  ref += vec3(0.05, 0.035, 0.015) * exp(-rd * 4.0) * uReflect;

  // ── Boot phases ──
  if (b < 0.12) {
    col = vec3(0.0);
  } else if (b < 0.20) {
    float flash = (0.20 - b) / 0.08;
    col = vec3(flash * 0.5);
  } else if (b < 0.35) {
    float line = smoothstep(0.49, 0.5, uv.y) - smoothstep(0.5, 0.51, uv.y);
    col = vec3(line * 0.7 + 0.005);
    float n = hash(uv + floor(uTime * 40.0)) * 0.015;
    col += vec3(n);
  } else if (b < 0.55) {
    float prog = (b - 0.35) / 0.20;
    float hh = 0.005 + prog * 0.35;
    float l = smoothstep(0.5 - hh, 0.5 - hh + 0.003, uv.y) - smoothstep(0.5 + hh - 0.003, 0.5 + hh, uv.y);
    col = vec3(l * 0.6 + 0.005);
    float bl = exp(-abs(uv.y - 0.5) * 6.0) * 0.05 * prog;
    col += vec3(bl);
  } else if (b < 0.70) {
    col = vec3(0.01);
    float glow = exp(-dist2 * 2.0) * 0.06;
    col += vec3(0.0, glow * 0.5, 0.0);
  } else {
    col = vec3(0.005);
    // Text texture
    if (uTextAlpha > 0.001) {
      vec2 tUv = mix(vec2(uv.x * 0.88 + 0.06, uv.y * 0.82 + 0.09), uv, uContentFill);
      vec4 t = texture2D(uTextTex, tUv);
      col = mix(col, t.rgb * 2.0, t.a * uTextAlpha);
    }
    // Desktop wallpaper
    if (uDesktopAlpha > 0.001) {
      vec2 dUv = mix(vec2(uv.x * 0.88 + 0.06, uv.y * 0.82 + 0.09), uv, uContentFill);
      vec4 d = texture2D(uDesktopTex, dUv);
      col = mix(col, d.rgb * 2.0, d.a * uDesktopAlpha);
    }
  }

  // Reflection overlay
  col += ref;

  // ── CRT effects ──
  // Subpixel-style scanlines (RGB vertical stripes)
  float subX = sin(uv.x * uRes.x * 1.5) * 0.5 + 0.5;
  float rMask = smoothstep(0.3, 0.7, subX);
  float bMask = smoothstep(0.7, 0.3, subX);
  col.r *= 0.85 + rMask * 0.15;
  col.b *= 0.85 + bMask * 0.15;

  // Horizontal scanlines
  float scan = sin(uv.y * uRes.y * 0.5) * 0.025;
  col += scan;

  // Flicker
  float f = 1.0 + (hash(vec2(floor(uTime * 10.0), uv.x * 300.0)) - 0.5) * 0.008;
  col *= f;

  // RGB shift (subtle)
  vec2 rOff = vec2(0.0008, 0);
  float rShift = texture2D(uDesktopTex, uv + rOff).r;
  col.r += (rShift - col.r) * 0.5 * uDesktopAlpha * 0.02;

  // Corner falloff
  float vig = 1.0 - dist2 * 0.45;
  col *= vig;

  col = max(col, vec3(0.0));
  gl_FragColor = vec4(col, 1.0);
}
`

export function createCRTMaterial({ fillScreen = false, barrelStrength = 1 } = {}) {
  const empty = new THREE.DataTexture(new Uint8Array([0, 0, 0, 0]), 1, 1, THREE.RGBAFormat)
  empty.needsUpdate = true
  return new THREE.ShaderMaterial({
    vertexShader: CRT_VERTEX,
    fragmentShader: CRT_FRAGMENT,
    uniforms: {
      uTime: { value: 0 },
      uBoot: { value: 0 },
      uRes: { value: new THREE.Vector2(800, 600) },
      uTextTex: { value: empty },
      uTextAlpha: { value: 0 },
      uDesktopTex: { value: empty },
      uDesktopAlpha: { value: 0 },
      uReflect: { value: 0.5 },
      uContentFill: { value: fillScreen ? 1 : 0 },
      uBarrelStrength: { value: barrelStrength },
    },
    side: THREE.DoubleSide,
  })
}
