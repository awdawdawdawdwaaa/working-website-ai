export const INFO_REVEALS = [
  {
    id: 'age',
    title: 'BEGIN',
    text: '16 Years Old • Started Building At 13',
    outlineId: 'AGE_WALL',
    start: 0.205,
    writeEnd: 0.275,
    end: 0.330,
    propPoint: [3.00, 1.55, 8.0],
  },
  {
    id: 'city',
    title: 'BUILD',
    text: 'Developed Multiple Games In Roblox',
    outlineId: 'BRUSHED_STEEL_CITY',
    start: 0.345,
    writeEnd: 0.415,
    end: 0.470,
    propPoint: [-3.00, 1.55, 16.0],
  },
  {
    id: 'ahmedabad',
    title: 'ORIGIN',
    text: 'Working From Ahmedabad',
    outlineId: 'AHMEDABAD_MAP_INSTALL',
    start: 0.515,
    writeEnd: 0.585,
    end: 0.640,
    propPoint: [3.00, 1.55, 24.0],
  },
  {
    id: 'time',
    title: 'TME',
    text: 'Games • Websites • Server Management',
    outlineId: 'TIME_IN_STEEL',
    start: 0.660,
    writeEnd: 0.730,
    end: 0.785,
    propPoint: [-3.00, 1.55, 32.0],
  },
  {
    id: 'python',
    title: 'CREATE',
    text: 'Turning Logic Into Real Projects',
    outlineId: 'PYTHON_DEV',
    start: 0.845,
    writeEnd: 0.915,
    end: 0.945,
    propPoint: [3.00, 1.55, 38.0],
  },
  {
    id: 'desk',
    title: 'Workstation',
    text: 'Where ideas become projects',
    outlineId: 'WORKSTATION',
    start: 0.940,
    writeEnd: 0.980,
    end: 1.000,
    propPoint: [0.00, 1.28, 47.22],
  },
]

export function clamp01(value) {
  return Math.min(1, Math.max(0, value))
}

export function smoothstep(edge0, edge1, value) {
  const t = clamp01((value - edge0) / Math.max(0.00001, edge1 - edge0))
  return t * t * (3 - 2 * t)
}

export function smootherstep(edge0, edge1, value) {
  const t = clamp01((value - edge0) / Math.max(0.00001, edge1 - edge0))
  return t * t * t * (t * (t * 6 - 15) + 10)
}

export function mix(a, b, t) {
  return a + (b - a) * t
}

export function getActiveInfo(progress) {
  return INFO_REVEALS.find((item) => progress >= item.start && progress <= item.end) ?? null
}

export function getTypedCount(item, progress) {
  if (!item) return 0
  const amount = smoothstep(item.start, item.writeEnd, progress)
  return Math.round(item.text.length * amount)
}

export function getCharacterTravel(progress) {
  const walk = smootherstep(0.105, 0.860, progress)
  const slow = smootherstep(0.860, 0.930, progress)
  const sit = smootherstep(0.930, 0.970, progress)
  const z = mix(0, 38.0, walk) + mix(0, 2.5, slow)
  const x = mix(0, 0.08, slow)
  return { x, z, walk, slow, sit }
}
