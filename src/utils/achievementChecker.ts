import { supabase } from '../lib/supabase';
import { ACHIEVEMENTS } from '../config/achievements';
import { AchievementConfig } from '../types';

export async function checkAchievements(childId: string): Promise<string[]> {
  // Get already unlocked achievements
  const { data: unlocked } = await supabase
    .from('ll_achievements')
    .select('achievement_key')
    .eq('child_id', childId);

  const unlockedKeys = new Set((unlocked ?? []).map((a) => a.achievement_key));
  const newlyUnlocked: string[] = [];

  for (const achievement of ACHIEVEMENTS) {
    if (unlockedKeys.has(achievement.key)) continue;

    const earned = await checkCriteria(childId, achievement);
    if (earned) {
      newlyUnlocked.push(achievement.key);
    }
  }

  return newlyUnlocked;
}

async function checkCriteria(
  childId: string,
  achievement: AchievementConfig
): Promise<boolean> {
  const { criteria } = achievement;

  switch (criteria.type) {
    case 'entry_count': {
      let query = supabase
        .from('ll_entries')
        .select('*', { count: 'exact', head: true })
        .eq('child_id', childId);
      if (criteria.category_id) query = query.eq('category_id', criteria.category_id);
      if (criteria.skill_id) query = query.eq('skill_id', criteria.skill_id);
      const { count } = await query;
      return (count ?? 0) >= criteria.target;
    }

    case 'milestone_count': {
      const { count } = await supabase
        .from('ll_milestones')
        .select('*', { count: 'exact', head: true })
        .eq('child_id', childId)
        .eq('completed', true);
      return (count ?? 0) >= criteria.target;
    }

    case 'streak_days': {
      // Calculate streak: count consecutive days with entries going backward from today
      const { data: entries } = await supabase
        .from('ll_entries')
        .select('logged_at')
        .eq('child_id', childId)
        .order('logged_at', { ascending: false });

      if (!entries?.length) return false;

      const days = new Set(entries.map((e) => e.logged_at.split('T')[0]));
      let streak = 0;
      const today = new Date();

      for (let i = 0; i < 365; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        if (days.has(dateStr)) {
          streak++;
        } else if (i === 0) {
          continue; // today might not have entries yet
        } else {
          break;
        }
      }

      return streak >= criteria.target;
    }

    case 'cumulative_value': {
      const { data: entries } = await supabase
        .from('ll_entries')
        .select('value')
        .eq('child_id', childId)
        .eq('skill_id', criteria.skill_id!)
        .eq('entry_type', 'counter');

      const total = (entries ?? []).reduce(
        (sum, e) => sum + (parseFloat(e.value) || 0),
        0
      );
      return total >= criteria.target;
    }

    case 'checklist_complete': {
      // Check if enough milestones are completed for this category
      const { data: milestones } = await supabase
        .from('ll_milestones')
        .select('*')
        .eq('child_id', childId)
        .eq('completed', true);
      return (milestones?.length ?? 0) >= 10;
    }

    case 'seasonal_entries': {
      const now = new Date();
      const year = now.getFullYear();
      let start: string;
      let end: string;

      switch (criteria.season) {
        case 'spring':
          start = `${year}-03-01`;
          end = `${year}-05-31`;
          break;
        case 'summer':
          start = `${year}-06-01`;
          end = `${year}-08-31`;
          break;
        case 'fall':
          start = `${year}-09-01`;
          end = `${year}-11-30`;
          break;
        case 'winter':
          start = `${year}-12-01`;
          end = `${year + 1}-02-28`;
          break;
        default:
          return false;
      }

      const { count } = await supabase
        .from('ll_entries')
        .select('*', { count: 'exact', head: true })
        .eq('child_id', childId)
        .gte('logged_at', start)
        .lte('logged_at', end + 'T23:59:59');

      return (count ?? 0) >= criteria.target;
    }

    default:
      return false;
  }
}
