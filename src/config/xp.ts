export const XP_VALUES = {
  LOG_ACTIVITY: 10,
  ADD_PHOTO: 15,
  WRITE_NOTE: 10,
  COMPLETE_MILESTONE: 50,
  COMPLETE_ALL_SKILL_MILESTONES: 100,
  DAILY_STREAK_BONUS: 25,
  WEEKLY_STREAK_BONUS: 100,
} as const;

export const LEVEL_TITLES: Record<string, string> = {
  '1-3': 'Little Sprout',
  '4-6': 'Curious Explorer',
  '7-9': 'Star Learner',
  '10-12': 'Knowledge Knight',
  '13+': 'Master Adventurer',
};

export function calculateLevel(totalXp: number): number {
  return Math.max(1, Math.floor(Math.sqrt(totalXp / 100)));
}

export function xpForLevel(level: number): number {
  return level * level * 100;
}

export function getLevelTitle(level: number): string {
  if (level <= 3) return LEVEL_TITLES['1-3'];
  if (level <= 6) return LEVEL_TITLES['4-6'];
  if (level <= 9) return LEVEL_TITLES['7-9'];
  if (level <= 12) return LEVEL_TITLES['10-12'];
  return LEVEL_TITLES['13+'];
}

export function getLevelProgress(totalXp: number) {
  const level = calculateLevel(totalXp);
  const currentLevelXp = xpForLevel(level);
  const nextLevelXp = xpForLevel(level + 1);
  const xpInLevel = totalXp - currentLevelXp;
  const xpForNext = nextLevelXp - currentLevelXp;
  return { level, progress: xpInLevel / xpForNext, xpInLevel, xpForNext };
}
