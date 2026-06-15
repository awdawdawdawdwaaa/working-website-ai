import { smoothstep } from '../core/cinematicTimeline'

export default function CinematicOverlay({ progress }) {
  const introVisible = 1 - smoothstep(0.080, 0.145, progress)
  const underlineVisible = progress < 0.080 ? 1 : 0

  return (
    <div className="cinematic-overlay" aria-hidden="true">
      <div className="intro-label" style={{ opacity: introVisible }}>
        about me
      </div>

      <section className="intro-title" style={{ opacity: introVisible }}>
        <h1>VED</h1>
        <div className="ved-underline" style={{ opacity: underlineVisible }}>
          <div className="ved-underline-glow" />
        </div>
        <p>
          <span>Developer</span>
          <span>Builder</span>
        </p>
      </section>
    </div>
  )
}
