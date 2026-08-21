import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  applyCampaignCompletion,
  applyDailyCompletion,
  applyUnlimitedCompletion,
  loadAppData,
  saveAppData,
  updateProfile,
  type AppData,
  type PlayerProfile,
  type PuzzleSession,
  type ThemeMode,
} from '../store/appData'
import type { Difficulty } from '../engine/types'

interface AppContextValue {
  data: AppData
  setTheme: (t: ThemeMode) => void
  saveDailySession: (key: string, session: PuzzleSession) => void
  saveUnlimitedSession: (seed: string, session: PuzzleSession) => void
  saveCampaignSession: (level: number, session: PuzzleSession) => void
  completeDaily: (
    key: string,
    seed: string,
    timeMs: number,
    hintsUsed: number,
    mistakes: number,
  ) => void
  completeUnlimited: (difficulty: Difficulty, timeMs: number) => void
  completeCampaign: (
    level: number,
    timeMs: number,
    hintsUsed: number,
  ) => string[]
  setProfile: (patch: Partial<PlayerProfile>) => void
}

const AppCtx = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => loadAppData())

  useEffect(() => {
    document.documentElement.dataset.theme = data.theme
  }, [data.theme])

  const setTheme = useCallback((theme: ThemeMode) => {
    setData((prev) => {
      const next = { ...prev, theme }
      saveAppData(next)
      return next
    })
  }, [])

  const saveDailySession = useCallback((key: string, session: PuzzleSession) => {
    setData((prev) => {
      const next = {
        ...prev,
        daily: { ...prev.daily, [key]: session },
      }
      saveAppData(next)
      return next
    })
  }, [])

  const saveUnlimitedSession = useCallback(
    (seed: string, session: PuzzleSession) => {
      setData((prev) => {
        const next = {
          ...prev,
          unlimitedSessions: { ...prev.unlimitedSessions, [seed]: session },
        }
        saveAppData(next)
        return next
      })
    },
    [],
  )

  const saveCampaignSession = useCallback(
    (level: number, session: PuzzleSession) => {
      setData((prev) => {
        const next = {
          ...prev,
          campaignSessions: {
            ...prev.campaignSessions,
            [String(level)]: session,
          },
        }
        saveAppData(next)
        return next
      })
    },
    [],
  )

  const completeDaily = useCallback(
    (
      key: string,
      seed: string,
      timeMs: number,
      hintsUsed: number,
      mistakes: number,
    ) => {
      setData((prev) =>
        applyDailyCompletion(prev, key, timeMs, hintsUsed, mistakes, seed),
      )
    },
    [],
  )

  const completeUnlimited = useCallback(
    (difficulty: Difficulty, timeMs: number) => {
      setData((prev) => applyUnlimitedCompletion(prev, difficulty, timeMs))
    },
    [],
  )

  const completeCampaign = useCallback(
    (level: number, timeMs: number, hintsUsed: number) => {
      let unlocked: string[] = []
      setData((prev) => {
        const result = applyCampaignCompletion(prev, level, timeMs, hintsUsed)
        unlocked = result.newAchievements
        return result.state
      })
      return unlocked
    },
    [],
  )

  const setProfile = useCallback((patch: Partial<PlayerProfile>) => {
    setData((prev) => updateProfile(prev, patch))
  }, [])

  const value = useMemo(
    () => ({
      data,
      setTheme,
      saveDailySession,
      saveUnlimitedSession,
      saveCampaignSession,
      completeDaily,
      completeUnlimited,
      completeCampaign,
      setProfile,
    }),
    [
      data,
      setTheme,
      saveDailySession,
      saveUnlimitedSession,
      saveCampaignSession,
      completeDaily,
      completeUnlimited,
      completeCampaign,
      setProfile,
    ],
  )

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppCtx)
  if (!ctx) throw new Error('useApp outside provider')
  return ctx
}
