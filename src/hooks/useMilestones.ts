import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Milestone } from '../types';
import { useToastStore } from '../stores/toastStore';
import { XP_VALUES } from '../config/xp';

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
          const newTotalXp = levelData.total_xp + XP_VALUES.COMPLETE_MILESTONE;
          const newLevel = Math.max(1, Math.floor(Math.sqrt(newTotalXp / 100)));
          await supabase
            .from('ll_child_levels')
            .update({
              total_xp: newTotalXp,
              current_level: newLevel,
              updated_at: new Date().toISOString(),
            })
            .eq('child_id', childId);
        }
      }

      return { data, completed };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['milestones'] });
      queryClient.invalidateQueries({ queryKey: ['todayStats'] });
      queryClient.invalidateQueries({ queryKey: ['childLevel'] });
      if (result.completed) {
        showToast(XP_VALUES.COMPLETE_MILESTONE);
      }
    },
  });
}
