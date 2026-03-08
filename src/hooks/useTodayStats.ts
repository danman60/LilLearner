import { useQuery } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { FEATURES } from '../config/features';
import { Entry } from '../types';

const LOCAL_ENTRIES_KEY = 'local_entries';

export function useTodayStats(childId: string | null) {
  return useQuery({
    queryKey: ['todayStats', childId],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];

      if (FEATURES.SKIP_AUTH) {
        // Count today's entries from local storage
        const raw = await AsyncStorage.getItem(LOCAL_ENTRIES_KEY);
        const all: Entry[] = raw ? JSON.parse(raw) : [];
        const todayEntries = all.filter(
          (e) => e.child_id === childId && e.logged_at.startsWith(today)
        );
        return { todayCount: todayEntries.length, totalXp: 0, currentLevel: 1 };
      }

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
