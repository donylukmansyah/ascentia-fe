export type AboutStat = {
  target: number
  suffix: string
  label: string
}

export const aboutStatsContent = {
  stats: [
    { target: 1, suffix: 'k', label: 'Total analytical equipment value' },
    { target: 20, suffix: 'k+', label: 'Laboratories supported' },
    { target: 150, suffix: '+', label: 'Analytical solutions delivered' },
    { target: 99, suffix: '%', label: 'Workflow efficiency gain' },
  ] as AboutStat[],
} as const
