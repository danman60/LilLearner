// === Database Row Types ===

export interface Profile {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  created_at: string;
}

export interface Child {
  id: string;
  user_id: string;
  name: string;
  birthdate: string;
  avatar_url: string | null;
  created_at: string;
}

export type EntryType = 'activity' | 'photo' | 'note' | 'milestone' | 'counter';

export interface Entry {
  id: string;
  child_id: string;
  user_id: string;
  category_id: string;
  skill_id: string;
  entry_type: EntryType;
  value: string | null;
  notes: string | null;
  media_urls: string[];
  logged_at: string;
  created_at: string;
}

export interface Milestone {
  id: string;
  child_id: string;
  skill_id: string;
  milestone_key: string;
  completed: boolean;
  completed_at: string | null;
}

export interface XpEvent {
  id: string;
  child_id: string;
  xp_amount: number;
  source_type: 'entry' | 'milestone' | 'streak' | 'achievement';
  source_id: string | null;
  created_at: string;
}

export interface ChildLevel {
  id: string;
  child_id: string;
  total_xp: number;
  current_level: number;
  updated_at: string;
}

export interface Achievement {
  id: string;
  child_id: string;
  achievement_key: string;
  unlocked_at: string;
}

export type ReportType = 'weekly' | 'monthly' | 'seasonal';
export type Season = 'spring' | 'summer' | 'fall' | 'winter';

export interface Report {
  id: string;
  child_id: string;
  report_type: ReportType;
  period_start: string;
  period_end: string;
  season: Season | null;
  data_json: ReportData;
  pdf_url: string | null;
  generated_at: string;
}

export interface ReportData {
  entries_by_category: Record<string, number>;
  milestones_reached: string[];
  xp_earned: number;
  levels_gained: number;
  top_skills: string[];
  photo_urls: string[];
  total_entries: number;
  streak_days: number;
}

// === Static Config Types ===

export type TrackingType =
  | 'mastery'
  | 'progress'
  | 'numeric'
  | 'count'
  | 'cumulative'
  | 'checklist'
  | 'activity_log'
  | 'observation_log'
  | 'topic_log';

export interface SkillConfig {
  id: string;
  name: string;
  description: string;
  tracking_type: TrackingType;
  milestones?: (string | number)[];
  items?: string[];
  unit?: string;
  target?: number;
  sub_activities?: string[];
  example_topics?: string[];
}

export interface CategoryConfig {
  id: string;
  name: string;
  icon: string;
  color: string;
  skills: SkillConfig[];
}

export interface AchievementConfig {
  key: string;
  name: string;
  description: string;
  icon: string;
  category: 'category' | 'streak' | 'milestone' | 'seasonal';
  criteria: AchievementCriteria;
}

export interface AchievementCriteria {
  type: 'entry_count' | 'milestone_count' | 'streak_days' | 'cumulative_value' | 'checklist_complete' | 'seasonal_entries';
  category_id?: string;
  skill_id?: string;
  target: number;
  season?: Season;
}

export interface LevelInfo {
  level: number;
  title: string;
  xp_required: number;
  xp_for_next: number;
  progress: number;
}
