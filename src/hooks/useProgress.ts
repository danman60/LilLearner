import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export function useChildLevel(childId: string | null) {
  return useQuery({
    queryKey: ['childLevel', childId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ll_child_levels')
        .select('*')
        .eq('child_id', childId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!childId,
  });
}

export function useStreakDays(childId: string | null) {
  return useQuery({
    queryKey: ['streak', childId],
    queryFn: async () => {
      const { data: entries } = await supabase
        .from('ll_entries')
        .select('logged_at')
        .eq('child_id', childId!)
        .order('logged_at', { ascending: false });

      if (!entries?.length) return 0;

      const days = new Set(entries.map(e => e.logged_at.split('T')[0]));
      let streak = 0;
      const today = new Date();

      for (let i = 0; i < 365; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        if (days.has(dateStr)) {
          streak++;
        } else if (i === 0) {
          continue;
        } else {
          break;
        }
      }
      return streak;
    },
    enabled: !!childId,
  });
}

export function useCategoryStats(childId: string | null) {
  return useQuery({
    queryKey: ['categoryStats', childId],
    queryFn: async () => {
      const { data } = await supabase
        .from('ll_entries')
        .select('category_id')
        .eq('child_id', childId!);

      const counts: Record<string, number> = {};
      (data ?? []).forEach(e => {
        counts[e.category_id] = (counts[e.category_id] ?? 0) + 1;
      });
      return counts;
    },
    enabled: !!childId,
  });
}

export function useSkillProgress(childId: string | null, categoryId: string) {
  return useQuery({
    queryKey: ['skillProgress', childId, categoryId],
    queryFn: async () => {
      const { data } = await supabase
        .from('ll_milestones')
        .select('*')
        .eq('child_id', childId!)
        .eq('completed', true);

      // Group by skill_id
      const bySkill: Record<string, number> = {};
      (data ?? []).forEach(m => {
        bySkill[m.skill_id] = (bySkill[m.skill_id] ?? 0) + 1;
      });
      return bySkill;
    },
    enabled: !!childId,
  });
}
