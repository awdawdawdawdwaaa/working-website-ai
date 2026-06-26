let ctx = null
let fanOsc = null
let fanGain = null
let humOsc = null
let humGain = null

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)()
  return ctx
}

export function playClick() {
  try {
    const c = getCtx()
    const osc = c.createOscillator()
    const g = c.createGain()
    osc.connect(g)
    g.connect(c.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(800, c.currentTime)
    osc.frequency.exponentialRampToValueAtTime(400, c.currentTime + 0.08)
    g.gain.setValueAtTime(0.3, c.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.12)
    osc.start(c.currentTime)
    osc.stop(c.currentTime + 0.12)
  } catch {}
}

export function playBoot() {
  try {
    const c = getCtx()
    const osc = c.createOscillator()
    const g = c.createGain()
    osc.connect(g)
    g.connect(c.destination)
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(60, c.currentTime)
    osc.frequency.exponentialRampToValueAtTime(220, c.currentTime + 0.8)
    g.gain.setValueAtTime(0.08, c.currentTime)
    g.gain.linearRampToValueAtTime(0.02, c.currentTime + 0.4)
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 1.5)
    osc.start(c.currentTime)
    osc.stop(c.currentTime + 1.5)
  } catch {}
}

export function startFan() {
  try {
    const c = getCtx()
    stopFan()
    fanOsc = c.createOscillator()
    fanGain = c.createGain()
    fanOsc.type = 'sine'
    fanOsc.frequency.setValueAtTime(85, c.currentTime)
    fanOsc.frequency.linearRampToValueAtTime(92, c.currentTime + 2)
    fanGain.gain.setValueAtTime(0.025, c.currentTime)
    fanOsc.connect(fanGain)
    fanGain.connect(c.destination)
    fanOsc.start()
  } catch {}
}

export function stopFan() {
  try {
    if (fanOsc) { fanOsc.stop(); fanOsc.disconnect(); fanOsc = null }
    if (fanGain) { fanGain.disconnect(); fanGain = null }
  } catch {}
}

export function startMonitorHum() {
  try {
    const c = getCtx()
    stopMonitorHum()
    humOsc = c.createOscillator()
    humGain = c.createGain()
    humOsc.type = 'sine'
    humOsc.frequency.setValueAtTime(60, c.currentTime)
    humGain.gain.setValueAtTime(0.008, c.currentTime)
    humOsc.connect(humGain)
    humGain.connect(c.destination)
    humOsc.start()
  } catch {}
}

export function stopMonitorHum() {
  try {
    if (humOsc) { humOsc.stop(); humOsc.disconnect(); humOsc = null }
    if (humGain) { humGain.disconnect(); humGain = null }
  } catch {}
}

export function stopAll() {
  stopFan()
  stopMonitorHum()
}
