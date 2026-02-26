import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export function useTodayStats(childId: string | null) {
  return useQuery({
    queryKey: ['todayStats', childId],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];

      // Count today's entries
      const { count } = await supabase
        .from('ll_entries')
        .select('*', { count: 'exact', head: true })
        .eq('child_id', childId!)
        .gte('logged_at', today + 'T00:00:00')
        .lte('logged_at', today + 'T23:59:59');

      // Get child level
      const { data: level } = await supabase
        .from('ll_child_levels')
        .select('*')
        .eq('child_id', childId!)
        .single();

      return {
        todayCount: count ?? 0,
        totalXp: level?.total_xp ?? 0,
        currentLevel: level?.current_level ?? 1,
      };
    },
    enabled: !!childId,
  });
}
