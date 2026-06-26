import { useMemo, useState } from 'react'
import DevTestPanel from './DevTestPanel'
import DevAboutPanel from './DevAboutPanel'
import DevLightPanel from './DevLightPanel'
import DevVersionPanel from './DevVersionPanel'
import { getCurrentDevVersion } from './DevVersionData'
import './DevMode.css'

function Section({ id, title, open, onToggle, children }) {
  return (
    <section className="dev-section">
      <button
        type="button"
        className={open ? 'dev-section-toggle is-open' : 'dev-section-toggle'}
        onClick={() => onToggle(id)}
      >
        <span>{title}</span>
        <span>{open ? '-' : '+'}</span>
      </button>
      {open && <div className="dev-section-body">{children}</div>}
    </section>
  )
}

function ScenePanel({ activeTest, sceneReady }) {
  return (
    <div className="dev-stack">
      <div className="dev-kv">
        <b>viewport</b><span>{sceneReady ? 'mounted' : 'queued'}</span>
        <b>asset</b><span>{activeTest}</span>
        <b>rendering</b><span>visible test only</span>
        <b>website</b><span>unmounted while dev mode is active</span>
      </div>
    </div>
  )
}

function PerformancePanel({ activeTest, sceneReady }) {
  return (
    <div className="dev-stack">
      <div className="dev-kv">
        <b>canvas</b><span>{sceneReady ? 'active center viewport' : 'not started'}</span>
        <b>dpr</b><span>0.75 to 1.25</span>
        <b>antialias</b><span>off</span>
        <b>shadows</b><span>dev only, live softness</span>
        <b>hidden tabs</b><span>unmounted</span>
        <b>current</b><span>{activeTest}</span>
      </div>
      <div className="dev-note">No hidden website assets are loaded by the Dev test scenes.</div>
    </div>
  )
}

function InfoPanel({ activeTest, sceneReady }) {
  return (
    <>
      <div className="dev-panel-title">
        <span>info</span>
        <span>{sceneReady ? 'scene online' : 'ui online'}</span>
      </div>
      <div className="dev-info-block">
        <h3>active test</h3>
        <div className="dev-kv">
          <b>mode</b><span>{activeTest}</span>
          <b>mouse</b><span>beige wired</span>
          <b>keyboard</b><span>live key press</span>
          <b>camera</b><span>360 orbit / smooth zoom / no angle lock</span>
          <b>reload</b><span>canvas preserved between tabs</span>
        </div>
      </div>
      <div className="dev-info-block">
        <h3>dev rules</h3>
        <p>Main website, corridor, loading screen, main animations, routing, and main assets stay outside this mode.</p>
      </div>
      <div className="dev-info-block">
        <h3>asset policy</h3>
        <p>Only the selected test asset is mounted. Full Scene is the only tab that mounts the room with all Dev hardware.</p>
      </div>
      <div className="dev-info-block">
        <h3>reference</h3>
        <p>CRT rebuild follows the uploaded late-1990s office monitor reference: boxy beige ABS, thick molded bezel, recessed convex glass, vents, rear panel, and integrated stand.</p>
      </div>
    </>
  )
}

export default function DevModeUI({
  activeTest,
  onSelectTest,
  onExit,
  sceneReady,
}) {
  const [openSections, setOpenSections] = useState({})
  const [versionOpen, setVersionOpen] = useState(false)
  const currentVersion = useMemo(() => getCurrentDevVersion(), [])

  const toggleSection = (id) => {
    setOpenSections((state) => ({ ...state, [id]: !state[id] }))
  }

  return (
    <>
      <div className="dev-top">
        <div className="dev-top-group">
          <span className="dev-mode-label">developer mode</span>
          <span className="dev-chip">isolated</span>
          <span className="dev-chip">{sceneReady ? 'scene loaded' : 'scene pending'}</span>
        </div>
        <div className="dev-top-group">
          <button type="button" className="dev-action" onClick={onExit}>return to site</button>
        </div>
      </div>

      <aside className="dev-left">
        <div className="dev-panel-title">
          <span>controls</span>
          <span>closed default</span>
        </div>

        <Section id="scene" title="SCENE" open={!!openSections.scene} onToggle={toggleSection}>
          <ScenePanel activeTest={activeTest} sceneReady={sceneReady} />
        </Section>

        <Section id="testing" title="TESTING" open={!!openSections.testing} onToggle={toggleSection}>
          <DevTestPanel
            activeTest={activeTest}
            onSelect={onSelectTest}
          />
        </Section>

        <Section id="about" title="ABOUT" open={!!openSections.about} onToggle={toggleSection}>
          <DevAboutPanel />
        </Section>

        <Section id="light" title="LIGHT" open={!!openSections.light} onToggle={toggleSection}>
          <DevLightPanel />
        </Section>

        <Section id="performance" title="PERFORMANCE" open={!!openSections.performance} onToggle={toggleSection}>
          <PerformancePanel activeTest={activeTest} sceneReady={sceneReady} />
        </Section>

        <Section id="version" title="VERSION" open={!!openSections.version} onToggle={toggleSection}>
          <DevVersionPanel compact />
        </Section>
      </aside>

      <aside className="dev-right">
        <InfoPanel activeTest={activeTest} sceneReady={sceneReady} />
      </aside>

      {versionOpen && (
        <div className="dev-version-flyout">
          <DevVersionPanel />
        </div>
      )}
      <button
        type="button"
        className="dev-version-badge"
        onClick={() => setVersionOpen((open) => !open)}
        title="Version details"
      >
        {currentVersion.version} / {currentVersion.date || 'undated'}
      </button>
    </>
  )
}
