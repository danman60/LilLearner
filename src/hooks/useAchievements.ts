import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Achievement } from '../types';
import { checkAchievements } from '../utils/achievementChecker';
import { useAchievementUnlockStore } from '../stores/achievementUnlockStore';

export function useAchievements(childId: string | null) {
  return useQuery({
    queryKey: ['achievements', childId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ll_achievements')
        .select('*')
        .eq('child_id', childId!);
      if (error) throw error;
      return data as Achievement[];
    },
    enabled: !!childId,
  });
}

export function useCheckAndUnlockAchievements() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (childId: string) => {
      const newKeys = await checkAchievements(childId);

      for (const key of newKeys) {
        await supabase.from('ll_achievements').insert({
          child_id: childId,
          achievement_key: key,
        });
      }

      return newKeys;
    },
    onSuccess: (newKeys) => {
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
      // Trigger achievement unlock overlay for first new one
      if (newKeys.length > 0) {
        useAchievementUnlockStore.getState().showUnlock(newKeys[0]);
      }
    },
  });
}
