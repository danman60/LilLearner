import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Milestone } from '../types';
import { useToastStore } from '../stores/toastStore';
import { useLevelUpStore } from '../stores/levelUpStore';
import { useAchievementUnlockStore } from '../stores/achievementUnlockStore';
import { XP_VALUES, calculateLevel } from '../config/xp';
import { checkAchievements } from '../utils/achievementChecker';

export function useMilestones(childId: string | null, skillId?: string) {
  return useQuery({
    queryKey: ['milestones', childId, skillId],
    queryFn: async () => {
      let query = supabase
        .from('ll_milestones')
        .select('*')
        .eq('child_id', childId!);
      if (skillId) query = query.eq('skill_id', skillId);
      const { data, error } = await query;
      if (error) throw error;
      return data as Milestone[];
    },
    enabled: !!childId,
  });
}

export function useToggleMilestone() {
  const queryClient = useQueryClient();
  const showToast = useToastStore((s) => s.showToast);

  return useMutation({
    mutationFn: async ({
      childId,
      skillId,
      milestoneKey,
      completed,
    }: {
      childId: string;
      skillId: string;
      milestoneKey: string;
      completed: boolean;
    }) => {
      const { data, error } = await supabase
        .from('ll_milestones')
        .upsert(
          {
            child_id: childId,
            skill_id: skillId,
            milestone_key: milestoneKey,
            completed,
            completed_at: completed ? new Date().toISOString() : null,
          },
          { onConflict: 'child_id,skill_id,milestone_key' }
        )
        .select()
        .single();
      if (error) throw error;

      let leveledUp = false;
      let newLevelValue = 0;
      let newAchievementKeys: string[] = [];

      // Award XP for completing milestone
      if (completed) {
        await supabase.from('ll_xp_events').insert({
          child_id: childId,
          xp_amount: XP_VALUES.COMPLETE_MILESTONE,
          source_type: 'milestone',
          source_id: data.id,
        });

        // Update child level
        const { data: levelData } = await supabase
          .from('ll_child_levels')
          .select('*')
          .eq('child_id', childId)
          .single();
        if (levelData) {
          const oldLevel = levelData.current_level;
          const newTotalXp = levelData.total_xp + XP_VALUES.COMPLETE_MILESTONE;
          const newLevel = calculateLevel(newTotalXp);
          newLevelValue = newLevel;

          await supabase
            .from('ll_child_levels')
            .update({
              total_xp: newTotalXp,
              current_level: newLevel,
              updated_at: new Date().toISOString(),
            })
            .eq('child_id', childId);

          if (newLevel > oldLevel) {
            leveledUp = true;
          }
        }

        // Check achievements
        try {
          newAchievementKeys = await checkAchievements(childId);
          for (const key of newAchievementKeys) {
            await supabase.from('ll_achievements').insert({
              child_id: childId,
              achievement_key: key,
            });
          }
        } catch {
          // Non-critical
        }
      }

      return { data, completed, leveledUp, newLevel: newLevelValue, newAchievementKeys };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['milestones'] });
      queryClient.invalidateQueries({ queryKey: ['todayStats'] });
      queryClient.invalidateQueries({ queryKey: ['childLevel'] });
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
      if (result.completed) {
        showToast(XP_VALUES.COMPLETE_MILESTONE);

        // Trigger level-up overlay if leveled up
        if (result.leveledUp && result.newLevel > 0) {
          setTimeout(() => {
            useLevelUpStore.getState().showLevelUp(result.newLevel);
          }, 1500);
        }

        // Trigger achievement unlock overlay
        if (result.newAchievementKeys.length > 0) {
          const delay = result.leveledUp ? 4500 : 1500;
          setTimeout(() => {
            useAchievementUnlockStore
              .getState()
              .showUnlock(result.newAchievementKeys[0]);
          }, delay);
        }
      }
    },
  });
}
