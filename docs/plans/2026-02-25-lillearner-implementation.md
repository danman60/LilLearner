# Little Learner Tracker Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a mobile-first child development tracker with gamified XP/leveling, achievement badges, and auto-generated seasonal reports — using a hand-drawn "Classroom Scrapbook" aesthetic.

**Architecture:** Expo/React Native app with Supabase backend. Static category/skill definitions ship with the app (from JSON config). All user data (entries, milestones, XP, achievements, reports) lives in Supabase Postgres with RLS. Zustand for local state, TanStack Query for server state.

**Tech Stack:** Expo SDK 52+, TypeScript, Expo Router, Supabase (Auth + Postgres + Storage), Zustand, TanStack Query, React Native Reanimated, Victory Native, react-native-html-to-pdf

---

## Phase 1: Project Scaffolding & Foundation

### Task 1: Initialize Expo Project

**Files:**
- Create: `/mnt/d/ClaudeCode/LilLearner/` (Expo project root)

**Step 1: Create Expo project**

```bash
cd /mnt/d/ClaudeCode/LilLearner
# Remove docs temporarily, init expo, restore docs
mv docs /tmp/lillearner-docs
npx create-expo-app@latest . --template tabs
mv /tmp/lillearner-docs docs
```

**Step 2: Verify project runs**

Run: `npx expo start`
Expected: Metro bundler starts, QR code displayed

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: initialize Expo project with tabs template"
```

---

### Task 2: Install Core Dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install all dependencies**

```bash
# Supabase
npx expo install @supabase/supabase-js react-native-url-polyfill @react-native-async-storage/async-storage

# State management
npm install zustand @tanstack/react-query

# UI & Animations
npx expo install react-native-reanimated expo-haptics expo-image-picker expo-camera

# Fonts
npx expo install expo-font @expo-google-fonts/gaegu @expo-google-fonts/nunito @expo-google-fonts/fredoka-one

# Charts
npm install victory-native react-native-svg

# PDF
npm install react-native-html-to-pdf

# Testing
npm install -D @testing-library/react-native @testing-library/jest-native jest-expo
```

**Step 2: Verify install**

Run: `npx expo start` — should start without errors

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: install core dependencies"
```

---

### Task 3: Set Up Project Structure

**Files:**
- Create: `src/config/categories.ts`
- Create: `src/config/achievements.ts`
- Create: `src/config/xp.ts`
- Create: `src/config/theme.ts`
- Create: `src/lib/supabase.ts`
- Create: `src/stores/` (directory)
- Create: `src/hooks/` (directory)
- Create: `src/components/` (directory)
- Create: `src/types/index.ts`

**Step 1: Create directory structure**

```bash
mkdir -p src/{config,lib,stores,hooks,components,types,utils}
```

**Step 2: Create TypeScript types**

File: `src/types/index.ts`
```typescript
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

// === Gamification ===

export interface LevelInfo {
  level: number;
  title: string;
  xp_required: number;
  xp_for_next: number;
  progress: number; // 0-1
}
```

**Step 3: Create static category config**

File: `src/config/categories.ts`
```typescript
import { CategoryConfig } from '../types';

// Imported from docs/jk-tracking-categories.json — keep in sync
export const CATEGORIES: CategoryConfig[] = [
  {
    id: 'literacy',
    name: 'Literacy',
    icon: '📚',
    color: '#fcefc2',
    skills: [
      { id: 'letter_names', name: 'Letter Names', description: 'Recognizes and names all uppercase and lowercase letters', tracking_type: 'mastery', milestones: ['uppercase', 'lowercase'] },
      { id: 'letter_sounds', name: 'Letter Sounds', description: 'Associates letters with their phonetic sounds', tracking_type: 'mastery', milestones: ['consonants', 'vowels', 'blends'] },
      { id: 'reading_lessons', name: 'Reading Program Progress', description: 'Progress through structured reading curriculum', tracking_type: 'numeric', unit: 'lessons', target: 100 },
      { id: 'cvc_words', name: 'CVC Word Recognition', description: 'Reads consonant-vowel-consonant words', tracking_type: 'mastery', milestones: ['simple_cvc', 'complex_cvc', 'beyond_cvc'] },
      { id: 'printing', name: 'Printing & Writing', description: 'Writes letters and simple words', tracking_type: 'progress', milestones: ['tracing', 'uppercase_independent', 'lowercase_independent', 'name_writing', 'simple_words'] },
      { id: 'books_read', name: 'Books Read', description: 'Chapter books or read-alouds completed', tracking_type: 'count', unit: 'books' },
      { id: 'narration', name: 'Narration & Comprehension', description: 'Retells stories, answers questions, discusses vocabulary', tracking_type: 'progress', milestones: ['answers_questions', 'retells_events', 'discusses_vocabulary', 'makes_predictions'] },
    ],
  },
  {
    id: 'numeracy',
    name: 'Numeracy',
    icon: '🔢',
    color: '#d4e8f7',
    skills: [
      { id: 'counting', name: 'Counting', description: 'Counts objects and recites numbers in sequence', tracking_type: 'numeric', unit: 'highest_number', milestones: [10, 20, 30, 40, 50, 100] },
      { id: 'numeral_recognition', name: 'Numeral Recognition', description: 'Identifies written numerals', tracking_type: 'progress', milestones: ['1-10', '11-20', '21-30', '31-50'] },
      { id: 'math_lessons', name: 'Math Program Progress', description: 'Progress through math curriculum', tracking_type: 'numeric', unit: 'lessons' },
      { id: 'addition', name: 'Early Addition', description: 'Understands combining quantities', tracking_type: 'progress', milestones: ['concept_understanding', 'fingers_manipulatives', 'mental_to_5', 'mental_to_10'] },
      { id: 'practical_math', name: 'Practical Math Skills', description: 'Real-world number applications', tracking_type: 'checklist', items: ['phone_number', 'address', 'birthday', 'age'] },
    ],
  },
  {
    id: 'fine_motor',
    name: 'Fine Motor',
    icon: '✋',
    color: '#f7dce8',
    skills: [
      { id: 'pencil_grip', name: 'Pencil Grip', description: 'Proper tripod grip development', tracking_type: 'progress', milestones: ['fist_grip', 'four_finger', 'tripod_developing', 'tripod_mature'] },
      { id: 'tracing', name: 'Tracing', description: 'Traces lines, shapes, and letters', tracking_type: 'mastery', milestones: ['straight_lines', 'curves', 'shapes', 'letters'] },
      { id: 'cutting', name: 'Scissor Skills', description: 'Cuts with scissors along lines', tracking_type: 'progress', milestones: ['snipping', 'straight_lines', 'curves', 'shapes'] },
      { id: 'coloring', name: 'Coloring', description: 'Colors within boundaries with control', tracking_type: 'progress', milestones: ['scribbling', 'general_area', 'mostly_in_lines', 'precise'] },
      { id: 'manipulatives', name: 'Manipulatives & Crafts', description: 'Works with small objects, beads, playdough, puzzles', tracking_type: 'activity_log' },
    ],
  },
  {
    id: 'gross_motor',
    name: 'Gross Motor',
    icon: '🤸',
    color: '#d8f0d4',
    skills: [
      { id: 'outdoor_time', name: 'Outdoor Time', description: 'Hours spent in outdoor play and nature', tracking_type: 'cumulative', unit: 'hours' },
      { id: 'balance', name: 'Balance & Coordination', description: 'Balance beam, one-foot standing, etc.', tracking_type: 'checklist', items: ['one_foot_5sec', 'balance_beam', 'hopping', 'skipping'] },
      { id: 'gymnastics', name: 'Gymnastics Skills', description: 'Tumbling and gymnastics movements', tracking_type: 'checklist', items: ['forward_roll', 'back_bridge', 'cartwheel', 'handstand'] },
      { id: 'swimming', name: 'Swimming', description: 'Water comfort and swimming skills', tracking_type: 'progress', milestones: ['water_comfort', 'floating', 'kicking', 'basic_strokes', 'independent_swimming'] },
      { id: 'ball_skills', name: 'Ball Skills', description: 'Throwing, catching, kicking', tracking_type: 'checklist', items: ['underhand_throw', 'overhand_throw', 'catch_large_ball', 'catch_small_ball', 'kick'] },
      { id: 'structured_activities', name: 'Structured Activities', description: 'Dance, gymnastics, sports classes', tracking_type: 'activity_log' },
    ],
  },
  {
    id: 'social_emotional',
    name: 'Social & Emotional',
    icon: '💜',
    color: '#e8daf7',
    skills: [
      { id: 'empathy', name: 'Empathy & Awareness', description: 'Recognizes and responds to others\' feelings', tracking_type: 'observation_log' },
      { id: 'self_regulation', name: 'Self-Regulation', description: 'Manages emotions and impulses', tracking_type: 'progress', milestones: ['recognizes_emotions', 'uses_words', 'self_calming', 'problem_solving'] },
      { id: 'self_compassion', name: 'Self-Compassion', description: 'Kind self-talk, handles mistakes gracefully', tracking_type: 'observation_log' },
      { id: 'social_play', name: 'Social Play', description: 'Plays cooperatively with peers and siblings', tracking_type: 'progress', milestones: ['parallel_play', 'interactive_play', 'turn_taking', 'cooperative_games', 'conflict_resolution'] },
      { id: 'sibling_interaction', name: 'Sibling Interaction', description: 'Gentle and appropriate play with siblings', tracking_type: 'observation_log' },
    ],
  },
  {
    id: 'practical_life',
    name: 'Practical Life',
    icon: '🏠',
    color: '#fcefc2',
    skills: [
      { id: 'dressing', name: 'Dressing', description: 'Independently puts on and removes clothing', tracking_type: 'checklist', items: ['shirt', 'pants', 'socks', 'shoes', 'coat', 'buttons', 'zippers'] },
      { id: 'hygiene', name: 'Personal Hygiene', description: 'Handwashing, teeth brushing, toileting', tracking_type: 'checklist', items: ['handwashing', 'teeth_brushing', 'toileting_independent', 'bathing_assistance'] },
      { id: 'chores', name: 'Household Chores', description: 'Contributes to household tasks', tracking_type: 'checklist', items: ['bed_making', 'table_setting', 'cutlery_sorting', 'toy_cleanup', 'laundry_help', 'pet_care'] },
      { id: 'meal_skills', name: 'Meal Skills', description: 'Eating independently and helping with food prep', tracking_type: 'checklist', items: ['utensil_use', 'pouring', 'spreading', 'simple_prep', 'cleanup'] },
    ],
  },
  {
    id: 'creative_expression',
    name: 'Creative Expression',
    icon: '🎨',
    color: '#f7dce8',
    skills: [
      { id: 'music', name: 'Music & Singing', description: 'Singing, rhythm, musical activities', tracking_type: 'activity_log' },
      { id: 'art', name: 'Visual Art', description: 'Drawing, painting, crafts', tracking_type: 'activity_log', sub_activities: ['drawing', 'painting', 'watercolors', 'collage', 'playdough', 'crafts'] },
      { id: 'imaginative_play', name: 'Imaginative Play', description: 'Pretend play, role-playing, storytelling', tracking_type: 'observation_log' },
      { id: 'dance_movement', name: 'Dance & Movement', description: 'Creative movement and dance', tracking_type: 'activity_log' },
    ],
  },
  {
    id: 'nature_science',
    name: 'Nature & Science',
    icon: '🌿',
    color: '#d8f0d4',
    skills: [
      { id: 'outdoor_exploration', name: 'Outdoor Exploration', description: 'Time in nature—forests, parks, beaches', tracking_type: 'cumulative', unit: 'hours' },
      { id: 'nature_knowledge', name: 'Nature Knowledge', description: 'Plants, animals, seasons, weather', tracking_type: 'observation_log' },
      { id: 'science_topics', name: 'Science Topics', description: 'Structured science learning', tracking_type: 'topic_log', example_topics: ['solar_system', 'animals', 'plants', 'weather', 'human_body'] },
      { id: 'curiosity', name: 'Curiosity & Questions', description: 'Asks why/how questions, explores', tracking_type: 'observation_log' },
      { id: 'history_culture', name: 'History & Culture', description: 'Historical figures, geography, cultural learning', tracking_type: 'topic_log' },
      { id: 'memory_recall', name: 'Memory & Recall', description: 'Retains and connects learned information', tracking_type: 'observation_log' },
    ],
  },
];

export function getCategoryById(id: string): CategoryConfig | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

export function getSkillById(categoryId: string, skillId: string): SkillConfig | undefined {
  return getCategoryById(categoryId)?.skills.find((s) => s.id === skillId);
}
```

**Step 4: Create XP config**

File: `src/config/xp.ts`
```typescript
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

export function getLevelProgress(totalXp: number): { level: number; progress: number; xpInLevel: number; xpForNext: number } {
  const level = calculateLevel(totalXp);
  const currentLevelXp = xpForLevel(level);
  const nextLevelXp = xpForLevel(level + 1);
  const xpInLevel = totalXp - currentLevelXp;
  const xpForNext = nextLevelXp - currentLevelXp;
  return { level, progress: xpInLevel / xpForNext, xpInLevel, xpForNext };
}
```

**Step 5: Create achievement config**

File: `src/config/achievements.ts`
```typescript
import { AchievementConfig } from '../types';

export const ACHIEVEMENTS: AchievementConfig[] = [
  // Category-based
  { key: 'bookworm', name: 'Bookworm', description: '50 books read', icon: '📖', category: 'category', criteria: { type: 'entry_count', skill_id: 'books_read', target: 50 } },
  { key: 'math_whiz', name: 'Math Whiz', description: 'Counting to 100', icon: '🧮', category: 'category', criteria: { type: 'cumulative_value', skill_id: 'counting', target: 100 } },
  { key: 'nature_scout', name: 'Nature Scout', description: '20 hours outdoors', icon: '🏕️', category: 'category', criteria: { type: 'cumulative_value', skill_id: 'outdoor_exploration', target: 20 } },
  { key: 'creative_spark', name: 'Creative Spark', description: '30 art activities', icon: '🎨', category: 'category', criteria: { type: 'entry_count', category_id: 'creative_expression', target: 30 } },
  { key: 'helping_hand', name: 'Helping Hand', description: 'All practical life checklists complete', icon: '🤝', category: 'category', criteria: { type: 'checklist_complete', category_id: 'practical_life', target: 1 } },

  // Streak-based
  { key: 'on_fire', name: 'On Fire', description: '7-day logging streak', icon: '🔥', category: 'streak', criteria: { type: 'streak_days', target: 7 } },
  { key: 'unstoppable', name: 'Unstoppable', description: '30-day logging streak', icon: '⚡', category: 'streak', criteria: { type: 'streak_days', target: 30 } },
  { key: 'legendary', name: 'Legendary', description: '100-day logging streak', icon: '👑', category: 'streak', criteria: { type: 'streak_days', target: 100 } },

  // Milestone-based
  { key: 'first_steps', name: 'First Steps', description: 'First entry ever', icon: '👣', category: 'milestone', criteria: { type: 'entry_count', target: 1 } },
  { key: 'century_club', name: 'Century Club', description: '100 entries logged', icon: '💯', category: 'milestone', criteria: { type: 'entry_count', target: 100 } },
  { key: 'milestone_master', name: 'Milestone Master', description: '50 milestones completed', icon: '🏆', category: 'milestone', criteria: { type: 'milestone_count', target: 50 } },

  // Seasonal
  { key: 'summer_explorer', name: 'Summer Explorer', description: '10+ entries during summer', icon: '☀️', category: 'seasonal', criteria: { type: 'seasonal_entries', season: 'summer', target: 10 } },
  { key: 'winter_scholar', name: 'Winter Scholar', description: '10+ entries during winter', icon: '❄️', category: 'seasonal', criteria: { type: 'seasonal_entries', season: 'winter', target: 10 } },
  { key: 'spring_bloom', name: 'Spring Bloom', description: '10+ entries during spring', icon: '🌸', category: 'seasonal', criteria: { type: 'seasonal_entries', season: 'spring', target: 10 } },
  { key: 'fall_harvest', name: 'Fall Harvest', description: '10+ entries during fall', icon: '🍂', category: 'seasonal', criteria: { type: 'seasonal_entries', season: 'fall', target: 10 } },
];

export function getAchievementByKey(key: string): AchievementConfig | undefined {
  return ACHIEVEMENTS.find((a) => a.key === key);
}
```

**Step 6: Create theme config**

File: `src/config/theme.ts`
```typescript
export const colors = {
  craftRed: '#E85D5D',
  craftYellow: '#F2C94C',
  craftBlue: '#5B9BD5',
  craftGreen: '#6BBF6B',
  craftPurple: '#9B72CF',
  craftOrange: '#F2994A',
  linedPaper: '#FFF8F0',
  pencilGray: '#4A4A4A',
  eraserPink: '#FFB5B5',
  notebookBlue: '#C5D9F0',
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

export const fonts = {
  display: 'Gaegu_400Regular',
  displayBold: 'Gaegu_700Bold',
  body: 'Nunito_400Regular',
  bodySemiBold: 'Nunito_600SemiBold',
  bodyBold: 'Nunito_700Bold',
  accent: 'FredokaOne_400Regular',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 9999,
} as const;

export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  lifted: {
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
} as const;
```

**Step 7: Create Supabase client**

File: `src/lib/supabase.ts`
```typescript
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

**Step 8: Create .env.example**

File: `.env.example`
```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Step 9: Commit**

```bash
git add -A
git commit -m "feat: set up project structure, types, config, and Supabase client"
```

---

## Phase 2: Supabase Database Schema

### Task 4: Create Database Tables via Supabase MCP

Use the Supabase MCP tool `apply_migration` to create all tables. Run these as a single migration.

**Step 1: Apply migration**

Use `mcp__supabase__apply_migration` with name `create_initial_schema` and the following SQL:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles
CREATE TABLE profiles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  display_name text NOT NULL,
  avatar_url text,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id)
);

-- Children
CREATE TABLE children (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  birthdate date NOT NULL,
  avatar_url text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Entries
CREATE TABLE entries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id uuid REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category_id text NOT NULL,
  skill_id text NOT NULL,
  entry_type text NOT NULL CHECK (entry_type IN ('activity', 'photo', 'note', 'milestone', 'counter')),
  value text,
  notes text,
  media_urls text[] DEFAULT '{}',
  logged_at timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Milestones
CREATE TABLE milestones (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id uuid REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  skill_id text NOT NULL,
  milestone_key text NOT NULL,
  completed boolean DEFAULT false NOT NULL,
  completed_at timestamptz,
  UNIQUE(child_id, skill_id, milestone_key)
);

-- XP Events
CREATE TABLE xp_events (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id uuid REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  xp_amount integer NOT NULL,
  source_type text NOT NULL CHECK (source_type IN ('entry', 'milestone', 'streak', 'achievement')),
  source_id uuid,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Child Levels
CREATE TABLE child_levels (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id uuid REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  total_xp integer DEFAULT 0 NOT NULL,
  current_level integer DEFAULT 1 NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(child_id)
);

-- Achievements
CREATE TABLE achievements (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id uuid REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  achievement_key text NOT NULL,
  unlocked_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(child_id, achievement_key)
);

-- Reports
CREATE TABLE reports (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id uuid REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  report_type text NOT NULL CHECK (report_type IN ('weekly', 'monthly', 'seasonal')),
  period_start date NOT NULL,
  period_end date NOT NULL,
  season text CHECK (season IN ('spring', 'summer', 'fall', 'winter')),
  data_json jsonb DEFAULT '{}' NOT NULL,
  pdf_url text,
  generated_at timestamptz DEFAULT now() NOT NULL
);

-- Indexes
CREATE INDEX idx_entries_child_id ON entries(child_id);
CREATE INDEX idx_entries_logged_at ON entries(logged_at);
CREATE INDEX idx_entries_category ON entries(category_id);
CREATE INDEX idx_milestones_child_id ON milestones(child_id);
CREATE INDEX idx_xp_events_child_id ON xp_events(child_id);
CREATE INDEX idx_reports_child_id ON reports(child_id);
CREATE INDEX idx_reports_period ON reports(period_start, period_end);
```

**Step 2: Apply RLS policies**

Use `mcp__supabase__apply_migration` with name `add_rls_policies`:

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Profiles: users can only access their own
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);

-- Children: users can only access their own children
CREATE POLICY "Users can view own children" ON children FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own children" ON children FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own children" ON children FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own children" ON children FOR DELETE USING (auth.uid() = user_id);

-- Entries: users can only access entries for their own children
CREATE POLICY "Users can view own entries" ON entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own entries" ON entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own entries" ON entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own entries" ON entries FOR DELETE USING (auth.uid() = user_id);

-- Milestones: via child ownership
CREATE POLICY "Users can view own milestones" ON milestones FOR SELECT USING (child_id IN (SELECT id FROM children WHERE user_id = auth.uid()));
CREATE POLICY "Users can insert own milestones" ON milestones FOR INSERT WITH CHECK (child_id IN (SELECT id FROM children WHERE user_id = auth.uid()));
CREATE POLICY "Users can update own milestones" ON milestones FOR UPDATE USING (child_id IN (SELECT id FROM children WHERE user_id = auth.uid()));

-- XP Events: via child ownership
CREATE POLICY "Users can view own xp_events" ON xp_events FOR SELECT USING (child_id IN (SELECT id FROM children WHERE user_id = auth.uid()));
CREATE POLICY "Users can insert own xp_events" ON xp_events FOR INSERT WITH CHECK (child_id IN (SELECT id FROM children WHERE user_id = auth.uid()));

-- Child Levels: via child ownership
CREATE POLICY "Users can view own child_levels" ON child_levels FOR SELECT USING (child_id IN (SELECT id FROM children WHERE user_id = auth.uid()));
CREATE POLICY "Users can insert own child_levels" ON child_levels FOR INSERT WITH CHECK (child_id IN (SELECT id FROM children WHERE user_id = auth.uid()));
CREATE POLICY "Users can update own child_levels" ON child_levels FOR UPDATE USING (child_id IN (SELECT id FROM children WHERE user_id = auth.uid()));

-- Achievements: via child ownership
CREATE POLICY "Users can view own achievements" ON achievements FOR SELECT USING (child_id IN (SELECT id FROM children WHERE user_id = auth.uid()));
CREATE POLICY "Users can insert own achievements" ON achievements FOR INSERT WITH CHECK (child_id IN (SELECT id FROM children WHERE user_id = auth.uid()));

-- Reports: via child ownership
CREATE POLICY "Users can view own reports" ON reports FOR SELECT USING (child_id IN (SELECT id FROM children WHERE user_id = auth.uid()));
CREATE POLICY "Users can insert own reports" ON reports FOR INSERT WITH CHECK (child_id IN (SELECT id FROM children WHERE user_id = auth.uid()));
CREATE POLICY "Users can update own reports" ON reports FOR UPDATE USING (child_id IN (SELECT id FROM children WHERE user_id = auth.uid()));

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'full_name', new.email));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

**Step 3: Create storage bucket**

Use `mcp__supabase__execute_sql`:

```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('photos', 'photos', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']);
```

Then add storage policies:

```sql
CREATE POLICY "Users can upload photos" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own photos" ON storage.objects FOR SELECT
  USING (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own photos" ON storage.objects FOR DELETE
  USING (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]);
```

**Step 4: Run security advisors**

Use `mcp__supabase__get_advisors` with type `security` to verify RLS is correct.

**Step 5: Commit .env with real values (gitignored)**

Add `.env` to `.gitignore`. Create `.env` with actual Supabase URL and anon key from `mcp__supabase__get_project_url` and `mcp__supabase__get_publishable_keys`.

```bash
git add -A
git commit -m "feat: create Supabase schema with RLS policies"
```

---

## Phase 3: Authentication

### Task 5: Auth Store & Screens

**Files:**
- Create: `src/stores/authStore.ts`
- Create: `src/hooks/useAuth.ts`
- Create: `app/(auth)/sign-in.tsx`
- Create: `app/(auth)/sign-up.tsx`
- Create: `app/(auth)/_layout.tsx`
- Modify: `app/_layout.tsx`

**Step 1: Create auth store**

File: `src/stores/authStore.ts`
```typescript
import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  initialized: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  loading: false,
  initialized: false,

  initialize: () => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      set({ session, user: session?.user ?? null, initialized: true });
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null });
    });
  },

  signIn: async (email, password) => {
    set({ loading: true });
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    set({ loading: false });
    return { error: error?.message ?? null };
  },

  signUp: async (email, password, displayName) => {
    set({ loading: true });
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: displayName } },
    });
    set({ loading: false });
    return { error: error?.message ?? null };
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null });
  },
}));
```

**Step 2: Create auth layout and screens**

File: `app/(auth)/_layout.tsx` — Stack layout for auth screens
File: `app/(auth)/sign-in.tsx` — Email + password sign-in form, scrapbook-styled
File: `app/(auth)/sign-up.tsx` — Email + password + display name, scrapbook-styled

Key design elements for auth screens:
- Lined paper background
- App title "Little Learner Tracker" in Gaegu font
- Crayon-colored input borders
- Construction paper button style
- "Welcome back!" / "Join the adventure!" headers

**Step 3: Modify root layout**

File: `app/_layout.tsx`
- Load fonts (Gaegu, Nunito, Fredoka One)
- Initialize auth store
- Redirect to `(auth)` or `(tabs)` based on session state
- Wrap in TanStack QueryClientProvider

**Step 4: Test auth flow manually**

Run: `npx expo start` — sign up, sign in, sign out
Expected: Auth state persists across reloads

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add Supabase auth with sign-in and sign-up screens"
```

---

## Phase 4: Child Management

### Task 6: Child Store, CRUD, and Switcher

**Files:**
- Create: `src/stores/childStore.ts`
- Create: `src/hooks/useChildren.ts`
- Create: `src/components/ChildSwitcher.tsx`
- Create: `app/(tabs)/profile/add-child.tsx`

**Step 1: Create child store**

File: `src/stores/childStore.ts`
```typescript
import { create } from 'zustand';

interface ChildState {
  activeChildId: string | null;
  setActiveChild: (id: string) => void;
}

export const useChildStore = create<ChildState>((set) => ({
  activeChildId: null,
  setActiveChild: (id) => set({ activeChildId: id }),
}));
```

**Step 2: Create TanStack Query hooks for children CRUD**

File: `src/hooks/useChildren.ts`
- `useChildren()` — fetch all children for current user
- `useAddChild(name, birthdate, avatarUrl?)` — insert child
- `useUpdateChild(id, updates)` — update child
- `useDeleteChild(id)` — delete child

All queries use `supabase.from('children')` with proper user_id filtering.

**Step 3: Build ChildSwitcher component**

Horizontal scroll of child avatars at top of Home screen. Tap to switch active child. "+" button to add new child.

Scrapbook style: each avatar in a construction paper circle, active child has gold star sticker overlay.

**Step 4: Build Add Child screen**

Form with: name input, birthdate picker, optional photo. Construction paper card style. Big friendly "Add" button.

**Step 5: Auto-select first child on load**

If `activeChildId` is null and children exist, auto-select the first one.

**Step 6: Test manually**

Run app → add 2 children → switch between them → verify data isolation

**Step 7: Commit**

```bash
git add -A
git commit -m "feat: add child management with CRUD and profile switcher"
```

---

## Phase 5: Design System Components

### Task 7: Core UI Components with Scrapbook Aesthetic

**Files:**
- Create: `src/components/ui/PaperBackground.tsx`
- Create: `src/components/ui/CraftButton.tsx`
- Create: `src/components/ui/CraftCard.tsx`
- Create: `src/components/ui/CraftInput.tsx`
- Create: `src/components/ui/MaskingTapeHeader.tsx`
- Create: `src/components/ui/XpBadge.tsx`
- Create: `src/components/ui/GoldStar.tsx`
- Create: `src/components/ui/ScissorDivider.tsx`

**Step 1: PaperBackground** — Full-screen lined notebook paper texture. Faint blue horizontal rules every 28px, red margin line at 40px from left. Warm white (#FFF8F0) base.

**Step 2: CraftButton** — Irregular edge shape via borderRadius variation on each corner. Slightly rotated (1-2deg). Construction paper colors. Text in Nunito bold. Press animation: scale down + shadow reduction.

**Step 3: CraftCard** — Rounded rectangle with subtle irregular clip-path edges. Category color as background. Slight rotation (random -1 to 1 deg). Drop shadow like lifted paper. Press: lifts higher (shadow increases).

**Step 4: CraftInput** — Pencil-line bottom border (no box). Gaegu font for placeholder, Nunito for input text. Focus state: border goes from pencil gray to craft blue.

**Step 5: MaskingTapeHeader** — Semi-transparent beige rectangle, rotated -2deg, with subtle noise texture. Text in Gaegu bold, slightly darker than tape. Used for section headers.

**Step 6: XpBadge** — Circular badge showing current level number in Fredoka One. Ring border in gold. Small star accent. Pulse animation on XP gain.

**Step 7: GoldStar** — SVG five-point star in craft-yellow. Used for streaks, achievements, milestones. Reanimated entrance: drops from top, bounces.

**Step 8: ScissorDivider** — Dotted line with scissors emoji at start. Separates sections.

**Step 9: Commit**

```bash
git add -A
git commit -m "feat: build scrapbook design system components"
```

---

## Phase 6: Home Screen & Quick Logging

### Task 8: Home Tab with Category Cards

**Files:**
- Modify: `app/(tabs)/index.tsx` (Home tab)
- Create: `src/components/CategoryCard.tsx`
- Create: `src/components/TodaySummary.tsx`

**Step 1: Build CategoryCard**

Displays: category icon, name, skill count, last activity preview, streak indicator. Uses category color as background. CraftCard wrapper. 2-column layout with alternating large/small sizes.

Tap → navigates to category quick log screen.

**Step 2: Build TodaySummary**

Top of home screen. Shows: child name, today's date, entries logged today count, current streak, XP bar preview.

**Step 3: Assemble Home screen**

```
[ChildSwitcher]
[TodaySummary]
[CategoryCard grid - 2 columns, alternating sizes]
```

ScrollView with PaperBackground.

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: build home screen with category cards grid"
```

---

### Task 9: Quick Log Flow

**Files:**
- Create: `app/(tabs)/log/[categoryId].tsx`
- Create: `src/components/QuickLogSheet.tsx`
- Create: `src/components/entry/ActivityEntry.tsx`
- Create: `src/components/entry/PhotoEntry.tsx`
- Create: `src/components/entry/NoteEntry.tsx`
- Create: `src/components/entry/CounterEntry.tsx`
- Create: `src/components/entry/MilestoneEntry.tsx`
- Create: `src/hooks/useEntries.ts`
- Create: `src/hooks/useXp.ts`

**Step 1: Create useEntries hook**

TanStack Query mutations for:
- `useAddEntry(entry)` — inserts entry, triggers XP award
- `useEntries(childId, categoryId?, dateRange?)` — fetches entries
- `useTodayEntries(childId)` — today's entries across all categories

**Step 2: Create useXp hook**

- `useAwardXp(childId, amount, sourceType, sourceId?)` — inserts xp_event, updates child_levels
- `useChildLevel(childId)` — fetches current level info
- XP awarding logic: determine amount based on entry_type, insert xp_event, upsert child_levels

**Step 3: Build category log screen**

When tapping a category card, navigate to `/log/[categoryId]`. Shows:
- Category header (MaskingTapeHeader with category name + icon)
- List of skills in this category
- Each skill shows its tracking type with appropriate input:
  - `activity_log` / `observation_log` / `topic_log` → "Log" button → NoteEntry
  - `count` / `numeric` / `cumulative` → CounterEntry (tap +1 or enter number)
  - `mastery` / `progress` → MilestoneEntry (toggle checkboxes)
  - `checklist` → MilestoneEntry with checklist items
- Photo button (camera/gallery picker)
- Floating "Quick Note" button

**Step 4: Build entry components**

- `ActivityEntry` — Single tap to log, shows "+10 XP" toast
- `PhotoEntry` — Opens image picker, uploads to Supabase Storage, creates entry
- `NoteEntry` — Text input modal, save creates entry
- `CounterEntry` — Current value display, +1/-1 buttons, manual input
- `MilestoneEntry` — Checklist of milestones, tap to toggle complete/incomplete

**Step 5: XP toast animation**

On every entry creation, show floating "+N XP" text that rises and fades. Fredoka One font, craft-yellow color.

**Step 6: Test full logging flow**

Log activity → verify entry in DB → verify XP awarded → verify level updated

**Step 7: Commit**

```bash
git add -A
git commit -m "feat: implement quick log flow with XP awards"
```

---

## Phase 7: Gamification — XP, Levels, Achievements

### Task 10: XP System & Level Display

**Files:**
- Create: `src/components/XpBar.tsx`
- Create: `src/components/LevelBadge.tsx`
- Create: `src/components/LevelUpOverlay.tsx`
- Modify: `src/hooks/useXp.ts` (add level-up detection)

**Step 1: Build XpBar component**

Crayon-line progress bar. SVG path with wobbly edge (sine wave perturbation on top edge). Color gradient: craft-blue → craft-green → craft-yellow as it fills. Shows "Level N" and "XP / XP needed" text.

**Step 2: Build LevelBadge**

Circular sticker with level number in Fredoka One. Stitched border effect (dashed border with rounded gaps). Category: level title below in Gaegu.

**Step 3: Build LevelUpOverlay**

Full-screen overlay triggered when level increases:
- Gold star peels from corner (Reanimated translateX/Y + rotation)
- Bounces to center
- "LEVEL UP!" text in Fredoka One with scale animation
- New level title fades in below
- Construction paper confetti (random colored rectangles falling)
- Auto-dismisses after 3 seconds or tap

**Step 4: Detect level-up in useXp**

Compare level before/after XP award. If different, trigger LevelUpOverlay via Zustand state.

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: XP bar, level badges, and level-up animation"
```

---

### Task 11: Achievement System

**Files:**
- Create: `src/hooks/useAchievements.ts`
- Create: `src/components/AchievementBadge.tsx`
- Create: `src/components/AchievementWall.tsx`
- Create: `src/components/AchievementUnlockOverlay.tsx`
- Create: `src/utils/achievementChecker.ts`

**Step 1: Build achievement checker**

File: `src/utils/achievementChecker.ts`

Function `checkAchievements(childId)` that:
1. Fetches all unlocked achievements for child
2. For each unearned achievement, checks criteria against current data:
   - `entry_count` → count entries (optionally filtered by category/skill)
   - `milestone_count` → count completed milestones
   - `streak_days` → calculate current streak from entry dates
   - `cumulative_value` → sum numeric entry values for skill
   - `checklist_complete` → check if all checklist items in category are done
   - `seasonal_entries` → count entries in current season's date range
3. Returns newly unlocked achievement keys

**Step 2: Create useAchievements hook**

- `useAchievements(childId)` — fetches all unlocked achievements
- `useCheckAndUnlock(childId)` — runs checker, inserts newly unlocked, awards XP
- Call `useCheckAndUnlock` after every entry creation and milestone toggle

**Step 3: Build AchievementBadge**

Two states:
- **Unlocked**: Full-color circle, thick border, icon in center, ribbon banner with name below. Merit badge aesthetic.
- **Locked**: Same shape but pencil-sketch style — grayscale, dashed stroke border, "?" in center.

**Step 4: Build AchievementWall**

Grid of all achievement badges (3 per row). Scrapbook page background. Unlocked ones shine slightly (subtle gradient overlay). Locked ones are muted. Tap unlocked → shows description + unlock date.

**Step 5: Build AchievementUnlockOverlay**

Similar to LevelUpOverlay:
- Badge slides in from bottom with bounce
- "Achievement Unlocked!" text
- Achievement name and description
- Construction paper confetti burst
- Auto-dismiss after 3 seconds

**Step 6: Commit**

```bash
git add -A
git commit -m "feat: achievement system with checker, badges, and unlock animation"
```

---

## Phase 8: Progress Screen

### Task 12: Progress Tab

**Files:**
- Modify: `app/(tabs)/progress.tsx`
- Create: `src/components/SkillProgressList.tsx`
- Create: `src/components/CategoryProgress.tsx`
- Create: `src/components/StreakDisplay.tsx`
- Create: `src/hooks/useProgress.ts`

**Step 1: Create useProgress hook**

- `useStreakDays(childId)` — calculates consecutive days with entries
- `useCategoryStats(childId)` — entry counts per category
- `useSkillProgress(childId, categoryId)` — milestones completed per skill

**Step 2: Build StreakDisplay**

Crayon-drawn flame that grows with streak length:
- 1-2 days: small orange flame
- 3-6 days: medium flame with yellow center
- 7-29 days: large flame with gradient
- 30+ days: flame with blue/purple core, sparkle effects

Number display in Fredoka One below: "7 Day Streak!"

**Step 3: Build CategoryProgress**

Horizontal bar per category showing percentage of milestones completed. Bar uses category color. Label in Nunito. Tap → drills into SkillProgressList.

**Step 4: Build SkillProgressList**

For a specific category, shows each skill with:
- Skill name
- Progress bar (milestones completed / total)
- Milestone checkmarks
- Latest entry preview

**Step 5: Assemble Progress screen**

```
[XpBar — full width]
[LevelBadge + Level Title]
[StreakDisplay]
[MaskingTapeHeader: "Skills"]
[CategoryProgress list]
[MaskingTapeHeader: "Achievements"]
[AchievementWall]
```

**Step 6: Commit**

```bash
git add -A
git commit -m "feat: build progress screen with XP, streaks, and achievement wall"
```

---

## Phase 9: Reports & Analytics

### Task 13: Report Generation

**Files:**
- Create: `src/utils/reportGenerator.ts`
- Create: `src/hooks/useReports.ts`
- Create: `app/(tabs)/reports/index.tsx`
- Create: `app/(tabs)/reports/[reportId].tsx`

**Step 1: Build report generator**

File: `src/utils/reportGenerator.ts`

Function `generateReport(childId, reportType, periodStart, periodEnd, season?)`:
1. Query entries in date range
2. Aggregate: counts by category, milestones reached, XP earned
3. Identify top skills (most entries)
4. Select up to 6 photo URLs
5. Calculate streak during period
6. Generate narrative text from templates:
   - "This week, [Child] was most active in [Category] with [N] entries."
   - "[Child] reached [N] new milestones, including [milestone names]."
   - "Keep up the great work in [Category]!"
7. Compare to previous period if available
8. Save to reports table, return report data

**Step 2: Define seasonal periods**

```typescript
export const SEASONS = {
  spring: { start: '03-01', end: '05-31' },
  summer: { start: '06-01', end: '08-31' },
  fall:   { start: '09-01', end: '11-30' },
  winter: { start: '12-01', end: '02-28' }, // handled specially for year wrap
};
```

**Step 3: Create useReports hook**

- `useReports(childId)` — fetches all reports
- `useGenerateReport(childId, type, start, end, season?)` — generates and saves
- `useAutoGenerateWeekly(childId)` — checks if this week's report exists, generates if not (called on app open on Sundays)

**Step 4: Build Reports list screen**

Grouped by type (Weekly, Monthly, Seasonal). Each report card shows: period, entry count preview, generation date. Tap → opens report viewer.

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: report generation engine with weekly/monthly/seasonal periods"
```

---

### Task 14: Report Viewer & PDF Export

**Files:**
- Create: `app/(tabs)/reports/[reportId].tsx`
- Create: `src/components/report/ReportHeader.tsx`
- Create: `src/components/report/ReportCategoryBar.tsx`
- Create: `src/components/report/ReportMilestones.tsx`
- Create: `src/components/report/ReportPhotos.tsx`
- Create: `src/components/report/ReportNarrative.tsx`
- Create: `src/utils/reportPdf.ts`

**Step 1: Build report viewer components**

- **ReportHeader**: Child name in Gaegu, age, date range on masking tape banner
- **ReportCategoryBar**: Horizontal bar chart of entries by category, crayon-style bars
- **ReportMilestones**: List of milestones reached, each with gold star + skill name
- **ReportPhotos**: Polaroid-style photo grid (2x3), slightly rotated, tape pieces
- **ReportNarrative**: Generated text paragraphs on lined paper background

**Step 2: Build report PDF generator**

File: `src/utils/reportPdf.ts`

Generate HTML string with inline styles matching scrapbook aesthetic:
- Google Fonts loaded (Gaegu, Nunito)
- Construction paper colored sections
- Inline SVG for crayon-style bar charts
- Polaroid photo frames
- "Made with love" footer

Use `react-native-html-to-pdf` to convert HTML → PDF file.

**Step 3: Add share functionality**

Use `expo-sharing` to share PDF via system share sheet.

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: report viewer with scrapbook styling and PDF export"
```

---

### Task 15: Analytics Dashboard

**Files:**
- Create: `src/components/analytics/CategoryPieChart.tsx`
- Create: `src/components/analytics/ActivityHeatmap.tsx`
- Create: `src/components/analytics/TrendChart.tsx`
- Modify: `app/(tabs)/reports/index.tsx` (add analytics tab/section)

**Step 1: CategoryPieChart**

Victory Native pie chart showing entry distribution across 8 categories. Each slice uses the category's construction paper color. Labels in Nunito. Center shows total entries count in Fredoka One.

**Step 2: ActivityHeatmap**

GitHub-style contribution grid. Last 12 weeks (84 days). Each cell colored by intensity (white → light green → dark green). Gaegu month labels across top. Tap a day → shows entries from that day.

**Step 3: TrendChart**

Victory Native line chart showing weekly entry counts over time. Crayon-style line (slightly thick, imperfect). Category filter toggle to show specific category trends.

**Step 4: Integrate into Reports tab**

Add segmented control at top: "Reports" | "Analytics". Analytics section shows the three charts stacked vertically with MaskingTapeHeader separators.

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: analytics dashboard with pie chart, heatmap, and trends"
```

---

## Phase 10: Profile & Settings

### Task 16: Profile Tab

**Files:**
- Modify: `app/(tabs)/profile/index.tsx`
- Create: `src/components/ProfileCard.tsx`
- Create: `src/components/ChildProfileCard.tsx`
- Create: `app/(tabs)/profile/edit-child.tsx`
- Create: `app/(tabs)/profile/settings.tsx`

**Step 1: Build ProfileCard**

Current user info: display name, email, member since date. Edit button to update display name.

**Step 2: Build ChildProfileCard**

For each child: name, age (calculated from birthdate), avatar, total entries count, current level badge. Tap → edit child. Swipe left → delete (with confirmation).

**Step 3: Build Settings screen**

- Sign out button
- About section (version, credits)
- Data export (JSON dump of all data)
- Delete account (with confirmation and data deletion)

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: profile tab with child management and settings"
```

---

## Phase 11: Navigation & Polish

### Task 17: Tab Navigation with Scrapbook Styling

**Files:**
- Modify: `app/(tabs)/_layout.tsx`
- Create: `src/components/ui/CraftTabBar.tsx`

**Step 1: Custom tab bar**

Replace default tab bar with CraftTabBar:
- Torn craft paper strip background
- Crayon-style icons (use emoji or custom SVG icons)
- Active tab: circle sticker behind icon (craft-yellow background circle)
- Tab labels in Nunito
- 4 tabs: Home (🏠), Progress (⭐), Reports (📊), Profile (👤)

**Step 2: Stack navigation per tab**

Each tab has nested stack navigation:
- Home → Category Log → Entry Detail
- Progress → Skill Detail
- Reports → Report Viewer
- Profile → Edit Child, Settings, Add Child

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: custom scrapbook tab bar and navigation structure"
```

---

### Task 18: Font Loading & App Shell

**Files:**
- Modify: `app/_layout.tsx`

**Step 1: Load all custom fonts**

```typescript
import { useFonts, Gaegu_400Regular, Gaegu_700Bold } from '@expo-google-fonts/gaegu';
import { Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold } from '@expo-google-fonts/nunito';
import { FredokaOne_400Regular } from '@expo-google-fonts/fredoka-one';
```

Show splash screen until fonts loaded.

**Step 2: App-level providers**

```typescript
<QueryClientProvider client={queryClient}>
  <GestureHandlerRootView>
    <AuthGuard>
      <Slot />
    </AuthGuard>
  </GestureHandlerRootView>
</QueryClientProvider>
```

AuthGuard: if no session → redirect to (auth), else show (tabs).

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: font loading, app shell, and auth guard"
```

---

## Phase 12: Category Timeline & Deep Dive

### Task 19: Category Timeline View

**Files:**
- Create: `app/(tabs)/category/[categoryId].tsx`
- Create: `src/components/EntryCard.tsx`
- Create: `src/components/EntryTimeline.tsx`

**Step 1: Build EntryCard**

Displays a single entry with:
- Entry type icon + skill name
- Timestamp in relative format ("2 hours ago")
- Value/notes preview
- Photo thumbnail if media_urls exist (Polaroid frame)
- XP awarded indicator

Construction paper card style with category color accent.

**Step 2: Build EntryTimeline**

Reverse-chronological FlatList of EntryCards for a specific category. Date group headers ("Today", "Yesterday", "Feb 20"). Infinite scroll with pagination.

**Step 3: Category deep dive screen**

```
[MaskingTapeHeader: category name + icon]
[Skill progress summary — horizontal scroll of skill badges]
[ScissorDivider]
[EntryTimeline]
```

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: category timeline with entry cards and skill progress"
```

---

## Phase 13: Final Integration & Testing

### Task 20: End-to-End Flow Testing

**Step 1: Test complete user flow**

1. Sign up new account
2. Add 2 children
3. Switch between children
4. Log entries in each category (all 5 entry types)
5. Verify XP awards and level progression
6. Complete milestones, verify achievement unlocks
7. Check progress screen shows accurate data
8. Generate weekly report
9. View report, export PDF
10. Check analytics charts
11. Sign out, sign in, verify data persists

**Step 2: Fix any broken flows**

**Step 3: Performance check**

- App launch time
- Entry logging response time
- Report generation time
- Scroll performance on timeline with 100+ entries

**Step 4: Commit any fixes**

```bash
git add -A
git commit -m "fix: end-to-end flow fixes and performance improvements"
```

---

### Task 21: Build & Deploy

**Step 1: Configure app.json**

```json
{
  "expo": {
    "name": "Little Learner Tracker",
    "slug": "lil-learner",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": { "image": "./assets/splash.png", "backgroundColor": "#FFF8F0" },
    "android": { "package": "com.lillearner.app", "adaptiveIcon": { "foregroundImage": "./assets/adaptive-icon.png", "backgroundColor": "#FFF8F0" } },
    "ios": { "bundleIdentifier": "com.lillearner.app", "supportsTablet": true }
  }
}
```

**Step 2: Create EAS build profile**

```bash
npx eas build:configure
```

**Step 3: Build Android APK (for testing)**

```bash
npx eas build --platform android --profile preview
```

**Step 4: Build iOS (when ready)**

```bash
npx eas build --platform ios --profile preview
```

**Step 5: Final commit**

```bash
git add -A
git commit -m "feat: configure EAS build for Android and iOS"
git push
```

---

## Task Summary

| Phase | Tasks | Description |
|-------|-------|-------------|
| 1 | 1-3 | Project scaffolding, dependencies, structure |
| 2 | 4 | Supabase database schema + RLS |
| 3 | 5 | Authentication (store, screens) |
| 4 | 6 | Child management (CRUD, switcher) |
| 5 | 7 | Design system (scrapbook components) |
| 6 | 8-9 | Home screen + quick logging |
| 7 | 10-11 | Gamification (XP, levels, achievements) |
| 8 | 12 | Progress screen |
| 9 | 13-15 | Reports + analytics |
| 10 | 16 | Profile & settings |
| 11 | 17-18 | Navigation + app shell |
| 12 | 19 | Category timeline |
| 13 | 20-21 | Integration testing + build |

**Total: 21 tasks across 13 phases**
