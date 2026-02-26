import { supabase } from '../lib/supabase';
import { CATEGORIES } from '../config/categories';
import { ReportData, ReportType, Season } from '../types';

export const SEASONS = {
  spring: { start: '03-01', end: '05-31', name: 'Spring' },
  summer: { start: '06-01', end: '08-31', name: 'Summer' },
  fall: { start: '09-01', end: '11-30', name: 'Fall' },
  winter: { start: '12-01', end: '02-28', name: 'Winter' },
} as const;

export async function generateReport(
  childId: string,
  reportType: ReportType,
  periodStart: string,
  periodEnd: string,
  season?: Season
): Promise<ReportData> {
  // Fetch entries in date range
  const { data: entries } = await supabase
    .from('ll_entries')
    .select('*')
    .eq('child_id', childId)
    .gte('logged_at', periodStart + 'T00:00:00')
    .lte('logged_at', periodEnd + 'T23:59:59');

  const entryList = entries ?? [];

  // Count entries by category
  const entries_by_category: Record<string, number> = {};
  CATEGORIES.forEach((c) => {
    entries_by_category[c.id] = 0;
  });
  entryList.forEach((e) => {
    entries_by_category[e.category_id] =
      (entries_by_category[e.category_id] ?? 0) + 1;
  });

  // Milestones reached in this period
  const { data: milestones } = await supabase
    .from('ll_milestones')
    .select('*')
    .eq('child_id', childId)
    .eq('completed', true)
    .gte('completed_at', periodStart + 'T00:00:00')
    .lte('completed_at', periodEnd + 'T23:59:59');

  const milestones_reached = (milestones ?? []).map(
    (m) => `${m.skill_id}:${m.milestone_key}`
  );

  // XP earned in period
  const { data: xpEvents } = await supabase
    .from('ll_xp_events')
    .select('xp_amount')
    .eq('child_id', childId)
    .gte('created_at', periodStart + 'T00:00:00')
    .lte('created_at', periodEnd + 'T23:59:59');

  const xp_earned = (xpEvents ?? []).reduce(
    (sum, e) => sum + e.xp_amount,
    0
  );

  // Top skills (most entries)
  const skillCounts: Record<string, number> = {};
  entryList.forEach((e) => {
    skillCounts[e.skill_id] = (skillCounts[e.skill_id] ?? 0) + 1;
  });
  const top_skills = Object.entries(skillCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id]) => id);

  // Photo URLs (up to 6)
  const photo_urls = entryList
    .filter((e) => e.entry_type === 'photo' && e.media_urls?.length > 0)
    .slice(0, 6)
    .flatMap((e) => e.media_urls);

  // Calculate streak days in period
  const days = new Set(entryList.map((e) => e.logged_at.split('T')[0]));
  const streak_days = days.size;

  return {
    entries_by_category,
    milestones_reached,
    xp_earned,
    levels_gained: 0,
    top_skills,
    photo_urls,
    total_entries: entryList.length,
    streak_days,
  };
}

export function getWeekRange(): { start: string; end: string } {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((day + 6) % 7));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return {
    start: monday.toISOString().split('T')[0],
    end: sunday.toISOString().split('T')[0],
  };
}

export function getMonthRange(): { start: string; end: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
}

export function getSeasonRange(season: Season): {
  start: string;
  end: string;
} {
  const year = new Date().getFullYear();
  const s = SEASONS[season];
  if (season === 'winter') {
    return {
      start: `${year}-${s.start}`,
      end: `${year + 1}-${s.end}`,
    };
  }
  return {
    start: `${year}-${s.start}`,
    end: `${year}-${s.end}`,
  };
}

export function generateNarrative(
  childName: string,
  data: ReportData
): string {
  const parts: string[] = [];

  // Top category
  const topCategory = Object.entries(data.entries_by_category).sort(
    (a, b) => b[1] - a[1]
  )[0];
  if (topCategory && topCategory[1] > 0) {
    const catConfig = CATEGORIES.find((c) => c.id === topCategory[0]);
    parts.push(
      `${childName} was most active in ${catConfig?.name ?? topCategory[0]} with ${topCategory[1]} entries.`
    );
  }

  // Milestones
  if (data.milestones_reached.length > 0) {
    parts.push(
      `${childName} reached ${data.milestones_reached.length} new milestone${data.milestones_reached.length === 1 ? '' : 's'}!`
    );
  }

  // XP
  if (data.xp_earned > 0) {
    parts.push(`Earned ${data.xp_earned} XP this period.`);
  }

  // Encouragement
  if (data.total_entries > 0) {
    parts.push('Keep up the great work!');
  } else {
    parts.push("Let's start logging some activities!");
  }

  return parts.join(' ');
}
