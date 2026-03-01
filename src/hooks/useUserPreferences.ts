import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import { UserPreferences } from '../types';
import { FEATURES } from '../config/features';

export function useUserPreferences() {
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: ['userPreferences', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ll_user_preferences')
        .select('*')
        .eq('user_id', user!.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // No row found — return defaults from FEATURES config
        return null;
      }
      if (error) throw error;
      return data as UserPreferences;
    },
    enabled: !!user?.id,
  });
}

export function useUpsertPreferences() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: async (prefs: Partial<Omit<UserPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
      const { data, error } = await supabase
        .from('ll_user_preferences')
        .upsert(
          {
            user_id: user!.id,
            ...prefs,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        )
        .select()
        .single();

      if (error) throw error;
      return data as UserPreferences;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPreferences'] });
    },
  });
}

/**
 * Returns effective feature state — DB preferences if available, else static FEATURES config.
 */
export function useEffectiveFeature(key: keyof typeof FEATURES, prefs: UserPreferences | null | undefined): boolean {
  if (!prefs) return FEATURES[key];

  const map: Record<keyof typeof FEATURES, keyof UserPreferences> = {
    GAMIFICATION: 'gamification_enabled',
    SKILLS_TRACKING: 'skills_tracking_enabled',
    PHOTO_ENTRIES: 'photo_entries_enabled',
    SCRAPBOOK_THEME: 'scrapbook_theme_enabled',
    VOICE_INPUT: 'voice_input_enabled',
    BOOK_TRACKING: 'book_tracking_enabled',
  };

  const dbKey = map[key];
  return dbKey ? (prefs[dbKey] as boolean) : FEATURES[key];
}
