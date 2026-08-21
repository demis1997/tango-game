export interface AchievementDef {
  id: string
  title: string
  description: string
  banner: string
  icon: string
  /** Unlock this profile title when earned */
  unlockTitle?: string
  /** Unlock this border when earned */
  unlockBorder?: string
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'first-clear',
    title: 'First Light',
    description: 'Complete your first level.',
    banner: 'Sunrise',
    icon: '☀',
    unlockTitle: 'Novice',
  },
  {
    id: 'level-10',
    title: 'Ten Steps',
    description: 'Reach level 10.',
    banner: 'Pathfinder',
    icon: '①',
    unlockTitle: 'Pathfinder',
  },
  {
    id: 'level-50',
    title: 'Halfway Warm',
    description: 'Reach level 50.',
    banner: 'Steady',
    icon: '⑤',
    unlockTitle: 'Steady Hand',
  },
  {
    id: 'level-100',
    title: 'Century',
    description: 'Reach level 100.',
    banner: 'Centurion',
    icon: '💯',
    unlockTitle: 'Centurion',
    unlockBorder: 'gold',
  },
  {
    id: 'level-250',
    title: 'Quarter Master',
    description: 'Reach level 250.',
    banner: 'Quarter',
    icon: '◆',
    unlockTitle: 'Quarter Master',
  },
  {
    id: 'level-500',
    title: 'Midgame Legend',
    description: 'Reach level 500.',
    banner: 'Halfway Hero',
    icon: '★',
    unlockTitle: 'Midgame Legend',
    unlockBorder: 'aurora',
  },
  {
    id: 'level-750',
    title: 'Deep Orbit',
    description: 'Reach level 750.',
    banner: 'Orbital',
    icon: '☾',
    unlockTitle: 'Deep Orbit',
  },
  {
    id: 'level-1000',
    title: 'Tango Master',
    description: 'Clear all 1000 levels.',
    banner: 'Infinity',
    icon: '∞',
    unlockTitle: 'Tango Master',
    unlockBorder: 'infinity',
  },
  {
    id: 'speed-easy',
    title: 'Easy Blitz',
    description: 'Beat an Easy level in under 60 seconds.',
    banner: 'Blitz Easy',
    icon: '⚡',
    unlockTitle: 'Easy Blitzer',
  },
  {
    id: 'speed-medium',
    title: 'Medium Blitz',
    description: 'Beat a Medium level in under 60 seconds.',
    banner: 'Blitz Medium',
    icon: '⚡',
    unlockTitle: 'Medium Blitzer',
  },
  {
    id: 'speed-hard',
    title: 'Hard Blitz',
    description: 'Beat a Hard level in under 60 seconds.',
    banner: 'Blitz Hard',
    icon: '🔥',
    unlockTitle: 'Hard Blitzer',
    unlockBorder: 'ember',
  },
  {
    id: 'speed-very-hard',
    title: 'Impossible Minute',
    description: 'Beat a Very Hard level in under 60 seconds.',
    banner: 'Lightning',
    icon: '💥',
    unlockTitle: 'Impossible Minute',
    unlockBorder: 'void',
  },
  {
    id: 'no-hints-10',
    title: 'Pure Logic',
    description: 'Clear 10 levels without using hints.',
    banner: 'Untouched',
    icon: '◇',
    unlockTitle: 'Pure Logic',
  },
  {
    id: 'streak-5',
    title: 'On a Roll',
    description: 'Clear 5 levels in a row.',
    banner: 'Streak',
    icon: '↗',
    unlockTitle: 'On a Roll',
  },
  {
    id: 'pb-hunter',
    title: 'Personal Best Hunter',
    description: 'Beat your own best time on any level.',
    banner: 'PB Hunter',
    icon: '⏱',
    unlockTitle: 'PB Hunter',
  },
  {
    id: 'random-10',
    title: 'Chaos Dancer',
    description: 'Clear 10 randomized puzzles.',
    banner: 'Randomizer',
    icon: '🎲',
    unlockTitle: 'Chaos Dancer',
  },
]

export const PROFILE_ICONS = [
  { id: 'sun', emoji: '☀', label: 'Sun' },
  { id: 'moon', emoji: '☾', label: 'Moon' },
  { id: 'star', emoji: '★', label: 'Star' },
  { id: 'comet', emoji: '☄', label: 'Comet' },
  { id: 'eclipse', emoji: '⬤', label: 'Eclipse' },
  { id: 'orbit', emoji: '◎', label: 'Orbit' },
  { id: 'spark', emoji: '✦', label: 'Spark' },
  { id: 'phase', emoji: '☽', label: 'Phase' },
] as const

export const PROFILE_BORDERS = [
  { id: 'plain', label: 'Plain', unlock: true },
  { id: 'gold', label: 'Gold', unlock: false },
  { id: 'aurora', label: 'Aurora', unlock: false },
  { id: 'ember', label: 'Ember', unlock: false },
  { id: 'void', label: 'Void', unlock: false },
  { id: 'infinity', label: 'Infinity', unlock: false },
] as const

export const PROFILE_TITLES = [
  { id: 'wanderer', label: 'Wanderer', unlock: true },
  { id: 'novice', label: 'Novice', unlock: false },
  { id: 'pathfinder', label: 'Pathfinder', unlock: false },
  { id: 'steady-hand', label: 'Steady Hand', unlock: false },
  { id: 'centurion', label: 'Centurion', unlock: false },
  { id: 'quarter-master', label: 'Quarter Master', unlock: false },
  { id: 'midgame-legend', label: 'Midgame Legend', unlock: false },
  { id: 'deep-orbit', label: 'Deep Orbit', unlock: false },
  { id: 'tango-master', label: 'Tango Master', unlock: false },
  { id: 'easy-blitzer', label: 'Easy Blitzer', unlock: false },
  { id: 'medium-blitzer', label: 'Medium Blitzer', unlock: false },
  { id: 'hard-blitzer', label: 'Hard Blitzer', unlock: false },
  { id: 'impossible-minute', label: 'Impossible Minute', unlock: false },
  { id: 'pure-logic', label: 'Pure Logic', unlock: false },
  { id: 'on-a-roll', label: 'On a Roll', unlock: false },
  { id: 'pb-hunter', label: 'PB Hunter', unlock: false },
  { id: 'chaos-dancer', label: 'Chaos Dancer', unlock: false },
] as const
