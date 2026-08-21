export interface AchievementDef {
  id: string
  title: string
  description: string
  icon: string
  unlockAvatar?: string
  unlockBorder?: string
  unlockTitle?: string
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'camp-1',
    title: 'First Clear',
    description: 'Complete campaign level 1.',
    icon: '☀',
    unlockTitle: 'Novice',
  },
  {
    id: 'camp-10',
    title: 'Ten Deep',
    description: 'Reach campaign level 10.',
    icon: '①',
    unlockAvatar: 'star',
    unlockTitle: 'Pathfinder',
  },
  {
    id: 'camp-25',
    title: 'Quarter Way',
    description: 'Reach campaign level 25.',
    icon: '◆',
    unlockAvatar: 'comet',
    unlockBorder: 'gold',
    unlockTitle: 'Steady Hand',
  },
  {
    id: 'camp-50',
    title: 'Halfway Hero',
    description: 'Reach campaign level 50.',
    icon: '★',
    unlockAvatar: 'orbit',
    unlockBorder: 'aurora',
    unlockTitle: 'Campaign Ace',
  },
  {
    id: 'camp-75',
    title: 'Deep Orbit',
    description: 'Reach campaign level 75.',
    icon: '☾',
    unlockAvatar: 'eclipse',
    unlockBorder: 'ember',
    unlockTitle: 'Deep Orbit',
  },
  {
    id: 'camp-100',
    title: 'Campaign Master',
    description: 'Clear all 100 campaign levels.',
    icon: '∞',
    unlockAvatar: 'spark',
    unlockBorder: 'infinity',
    unlockTitle: 'Tango Master',
  },
  {
    id: 'camp-no-hint-5',
    title: 'Pure Logic',
    description: 'Clear 5 campaign levels without hints.',
    icon: '◇',
    unlockAvatar: 'phase',
    unlockTitle: 'Pure Logic',
  },
  {
    id: 'camp-speed',
    title: 'Blitz Clear',
    description: 'Beat a campaign level in under 60 seconds.',
    icon: '⚡',
    unlockBorder: 'void',
    unlockTitle: 'Blitzer',
  },
]

export const AVATARS = [
  { id: 'sun', emoji: '☀', label: 'Sun', free: true },
  { id: 'moon', emoji: '☾', label: 'Moon', free: true },
  { id: 'star', emoji: '★', label: 'Star', free: false },
  { id: 'comet', emoji: '☄', label: 'Comet', free: false },
  { id: 'orbit', emoji: '◎', label: 'Orbit', free: false },
  { id: 'eclipse', emoji: '⬤', label: 'Eclipse', free: false },
  { id: 'spark', emoji: '✦', label: 'Spark', free: false },
  { id: 'phase', emoji: '☽', label: 'Phase', free: false },
] as const

export const BORDERS = [
  { id: 'plain', label: 'Plain', free: true },
  { id: 'gold', label: 'Gold', free: false },
  { id: 'aurora', label: 'Aurora', free: false },
  { id: 'ember', label: 'Ember', free: false },
  { id: 'void', label: 'Void', free: false },
  { id: 'infinity', label: 'Infinity', free: false },
] as const

export const TITLES = [
  { id: 'wanderer', label: 'Wanderer', free: true },
  { id: 'novice', label: 'Novice', free: false },
  { id: 'pathfinder', label: 'Pathfinder', free: false },
  { id: 'steady-hand', label: 'Steady Hand', free: false },
  { id: 'campaign-ace', label: 'Campaign Ace', free: false },
  { id: 'deep-orbit', label: 'Deep Orbit', free: false },
  { id: 'tango-master', label: 'Tango Master', free: false },
  { id: 'pure-logic', label: 'Pure Logic', free: false },
  { id: 'blitzer', label: 'Blitzer', free: false },
] as const
