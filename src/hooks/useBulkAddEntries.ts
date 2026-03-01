import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import { Entry, UserCategory } from '../types';
import { FEATURES } from '../config/features';
import { XP_VALUES } from '../config/xp';

interface BulkEntryInput {
  child_id: string;
  category_id: string;
  skill_id: string;
  entry_type: 'activity';
  notes?: string;
  lesson_number?: number;
  user_category_id?: string;
}

export function useBulkAddEntries() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: async (entries: BulkEntryInput[]) => {
      if (entries.length === 0) return [];

      const rows = entries.map((entry) => ({
        child_id: entry.child_id,
        category_id: entry.category_id,
        skill_id: entry.skill_id,
        entry_type: entry.entry_type,
        notes: entry.notes ?? null,
        user_id: user!.id,
        media_urls: [],
        logged_at: new Date().toISOString(),
        ...(entry.lesson_number != null ? { lesson_number: entry.lesson_number } : {}),
        ...(entry.user_category_id ? { user_category_id: entry.user_category_id } : {}),
      }));

      const { data, error } = await supabase
        .from('ll_entries')
        .insert(rows)
        .select();

      if (error) throw error;

      // Optional XP when gamification is on
      if (FEATURES.GAMIFICATION && data) {
        const xpRows = data.map((entry: Entry) => ({
          child_id: entry.child_id,
          xp_amount: XP_VALUES.LOG_ACTIVITY,
          source_type: 'entry' as const,
          source_id: entry.id,
        }));

        await supabase.from('ll_xp_events').insert(xpRows);
      }

      return data as Entry[];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entries'] });
      queryClient.invalidateQueries({ queryKey: ['recentEntries'] });
      queryClient.invalidateQueries({ queryKey: ['todayStats'] });
      queryClient.invalidateQueries({ queryKey: ['simpleStats'] });
    },
  });
}
