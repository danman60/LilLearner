import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import { UserPreferences } from '../types';
import { FEATURES } from '../config/features';
import { useFeatureStore } from '../stores/featureStore';

export function useUserPreferences() {
  const user = useAuthStore((s) => s.user);
  const syncFromPrefs = useFeatureStore((s) => s.syncFromPrefs);

  const query = useQuery({
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

  // Sync feature store whenever prefs change
  useEffect(() => {
    if (query.data) {
      syncFromPrefs(query.data);
    }
  }, [query.data, syncFromPrefs]);

  return query;
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
