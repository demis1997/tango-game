import { useApp } from '../store/AppContext'
import type { UserSettings } from '../store/settings'
import './SettingsPanel.css'

export function SettingsPanel({ onClose }: { onClose?: () => void }) {
  const { data, setSettings, setTheme } = useApp()
  const s = data.settings

  const toggle = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    setSettings({ [key]: value } as Partial<UserSettings>)
  }

  return (
    <div className="settings-panel">
      <div className="settings-head">
        <h2>Settings</h2>
        {onClose && (
          <button type="button" className="ctrl" onClick={onClose}>
            Close
          </button>
        )}
      </div>

      <label className="setting-row">
        <span>Theme</span>
        <select
          value={data.theme}
          onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </label>

      <label className="setting-row">
        <span>Symbols</span>
        <select
          value={s.symbolStyle}
          onChange={(e) =>
            toggle('symbolStyle', e.target.value as UserSettings['symbolStyle'])
          }
        >
          <option value="celestial">Sun & Moon</option>
          <option value="geometric">Circle & Diamond</option>
        </select>
      </label>

      <label className="setting-row">
        <span>Error checking</span>
        <select
          value={s.validationMode}
          onChange={(e) =>
            toggle(
              'validationMode',
              e.target.value as UserSettings['validationMode'],
            )
          }
        >
          <option value="relaxed">On Check only</option>
          <option value="live">Live while playing</option>
        </select>
      </label>

      <label className="setting-row check">
        <input
          type="checkbox"
          checked={s.highContrast}
          onChange={(e) => toggle('highContrast', e.target.checked)}
        />
        <span>High contrast</span>
      </label>

      <label className="setting-row check">
        <input
          type="checkbox"
          checked={s.sound}
          onChange={(e) => toggle('sound', e.target.checked)}
        />
        <span>Sound effects (subtle)</span>
      </label>

      <label className="setting-row check">
        <input
          type="checkbox"
          checked={s.tutorialDone}
          onChange={(e) => toggle('tutorialDone', e.target.checked)}
        />
        <span>Tutorial completed</span>
      </label>

      <button
        type="button"
        className="ctrl"
        onClick={() => toggle('tutorialDone', false)}
      >
        Replay tutorial
      </button>
    </div>
  )
}
