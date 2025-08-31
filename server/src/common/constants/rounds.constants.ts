export const ROUNDS = {
  STATUS: {
    cooldown: 'cooldown',
    active: 'active',
    finished: 'finished',
  },
  ENV: {
    DURATION: 'ROUND_DURATION',
    COOLDOWN: 'COOLDOWN_DURATION',
  },
} as const;

export type RoundStatus = typeof ROUNDS.STATUS[keyof typeof ROUNDS.STATUS];


