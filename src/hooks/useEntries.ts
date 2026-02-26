import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Entry, EntryType } from '../types';
import { useAuthStore } from '../stores/authStore';
import { useToastStore } from '../stores/toastStore';
import { useLevelUpStore } from '../stores/levelUpStore';
import { useAchievementUnlockStore } from '../stores/achievementUnlockStore';
import { XP_VALUES, calculateLevel } from '../config/xp';
import { checkAchievements } from '../utils/achievementChecker';

export function useEntries(childId: string | null, categoryId?: string) {
  return useQuery({
    queryKey: ['entries', childId, categoryId],
    queryFn: async () => {
      let query = supabase
        .from('ll_entries')
        .select('*')
        .eq('child_id', childId!)
        .order('logged_at', { ascending: false })
        .limit(50);

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Entry[];
    },
    enabled: !!childId,
  });
}

export function useRecentEntries(childId: string | null, skillId: string, limit = 3) {
  return useQuery({
    queryKey: ['recentEntries', childId, skillId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ll_entries')
        .select('*')
        .eq('child_id', childId!)
        .eq('skill_id', skillId)
        .order('logged_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data as Entry[];
    },
    enabled: !!childId,
  });
}

export function useAddEntry() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const showToast = useToastStore((s) => s.showToast);

  return useMutation({
    mutationFn: async (entry: {
      child_id: string;
      category_id: string;
      skill_id: string;
      entry_type: EntryType;
      value?: string;
      notes?: string;
      media_urls?: string[];
    }) => {
      // Insert the entry
      const { data, error } = await supabase
        .from('ll_entries')
        .insert({
          ...entry,
          user_id: user!.id,
          media_urls: entry.media_urls ?? [],
          logged_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (error) throw error;

      // Award XP based on entry type
      let xpAmount: number = XP_VALUES.LOG_ACTIVITY;
      if (entry.entry_type === 'photo') xpAmount = XP_VALUES.ADD_PHOTO;
      if (entry.entry_type === 'note') xpAmount = XP_VALUES.WRITE_NOTE;
      if (entry.entry_type === 'milestone') xpAmount = XP_VALUES.COMPLETE_MILESTONE;

      // Insert XP event
      await supabase.from('ll_xp_events').insert({
        child_id: entry.child_id,
        xp_amount: xpAmount,
        source_type: 'entry',
        source_id: data.id,
      });

      // Update child level
      const { data: levelData } = await supabase
        .from('ll_child_levels')
        .select('*')
        .eq('child_id', entry.child_id)
        .single();

      let leveledUp = false;
      let newLevelValue = 0;

      if (levelData) {
        const oldLevel = levelData.current_level;
        const newTotalXp = levelData.total_xp + xpAmount;
        const newLevel = calculateLevel(newTotalXp);
        newLevelValue = newLevel;

        await supabase
          .from('ll_child_levels')
          .update({
            total_xp: newTotalXp,
            current_level: newLevel,
            updated_at: new Date().toISOString(),
          })
          .eq('child_id', entry.child_id);

        if (newLevel > oldLevel) {
          leveledUp = true;
        }
      }

      // Check achievements in the background
      let newAchievementKeys: string[] = [];
      try {
        newAchievementKeys = await checkAchievements(entry.child_id);
        for (const key of newAchievementKeys) {
          await supabase.from('ll_achievements').insert({
            child_id: entry.child_id,
            achievement_key: key,
          });
        }
      } catch {
        // Non-critical — don't fail the entry creation
      }

      return {
        entry: data as Entry,
        xpAwarded: xpAmount,
        leveledUp,
        newLevel: newLevelValue,
        newAchievementKeys,
      };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['entries'] });
      queryClient.invalidateQueries({ queryKey: ['recentEntries'] });
      queryClient.invalidateQueries({ queryKey: ['todayStats'] });
      queryClient.invalidateQueries({ queryKey: ['childLevel'] });
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
      showToast(result.xpAwarded);

      // Trigger level-up overlay if leveled up
      if (result.leveledUp && result.newLevel > 0) {
        // Delay slightly so XP toast shows first
        setTimeout(() => {
          useLevelUpStore.getState().showLevelUp(result.newLevel);
        }, 1500);
      }

      // Trigger achievement unlock overlay
      if (result.newAchievementKeys.length > 0) {
        // Delay after level-up if both happened
        const delay = result.leveledUp ? 4500 : 1500;
        setTimeout(() => {
          useAchievementUnlockStore
            .getState()
            .showUnlock(result.newAchievementKeys[0]);
        }, delay);
      }
    },
  });
}
