import { AchievementConfig } from '../types';

export const ACHIEVEMENTS: AchievementConfig[] = [
  { key: 'bookworm', name: 'Bookworm', description: '50 books read', icon: '📖', category: 'category', criteria: { type: 'entry_count', skill_id: 'books_read', target: 50 } },
  { key: 'math_whiz', name: 'Math Whiz', description: 'Counting to 100', icon: '🧮', category: 'category', criteria: { type: 'cumulative_value', skill_id: 'counting', target: 100 } },
  { key: 'nature_scout', name: 'Nature Scout', description: '20 hours outdoors', icon: '🏕️', category: 'category', criteria: { type: 'cumulative_value', skill_id: 'outdoor_exploration', target: 20 } },
  { key: 'creative_spark', name: 'Creative Spark', description: '30 art activities', icon: '🎨', category: 'category', criteria: { type: 'entry_count', category_id: 'creative_expression', target: 30 } },
  { key: 'helping_hand', name: 'Helping Hand', description: 'All practical life checklists complete', icon: '🤝', category: 'category', criteria: { type: 'checklist_complete', category_id: 'practical_life', target: 1 } },
  { key: 'on_fire', name: 'On Fire', description: '7-day logging streak', icon: '🔥', category: 'streak', criteria: { type: 'streak_days', target: 7 } },
  { key: 'unstoppable', name: 'Unstoppable', description: '30-day logging streak', icon: '⚡', category: 'streak', criteria: { type: 'streak_days', target: 30 } },
  { key: 'legendary', name: 'Legendary', description: '100-day logging streak', icon: '👑', category: 'streak', criteria: { type: 'streak_days', target: 100 } },
  { key: 'first_steps', name: 'First Steps', description: 'First entry ever', icon: '👣', category: 'milestone', criteria: { type: 'entry_count', target: 1 } },
  { key: 'century_club', name: 'Century Club', description: '100 entries logged', icon: '💯', category: 'milestone', criteria: { type: 'entry_count', target: 100 } },
  { key: 'milestone_master', name: 'Milestone Master', description: '50 milestones completed', icon: '🏆', category: 'milestone', criteria: { type: 'milestone_count', target: 50 } },
  { key: 'summer_explorer', name: 'Summer Explorer', description: '10+ entries during summer', icon: '☀️', category: 'seasonal', criteria: { type: 'seasonal_entries', season: 'summer', target: 10 } },
  { key: 'winter_scholar', name: 'Winter Scholar', description: '10+ entries during winter', icon: '❄️', category: 'seasonal', criteria: { type: 'seasonal_entries', season: 'winter', target: 10 } },
  { key: 'spring_bloom', name: 'Spring Bloom', description: '10+ entries during spring', icon: '🌸', category: 'seasonal', criteria: { type: 'seasonal_entries', season: 'spring', target: 10 } },
  { key: 'fall_harvest', name: 'Fall Harvest', description: '10+ entries during fall', icon: '🍂', category: 'seasonal', criteria: { type: 'seasonal_entries', season: 'fall', target: 10 } },
];

export function getAchievementByKey(key: string) {
  return ACHIEVEMENTS.find((a) => a.key === key);
}
