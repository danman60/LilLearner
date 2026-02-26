import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Child } from '../types';
import { useAuthStore } from '../stores/authStore';
import { useChildStore } from '../stores/childStore';

export function useChildren() {
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: ['children', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ll_children')
        .select('*')
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as Child[];
    },
    enabled: !!user,
  });
}

export function useAddChild() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const setActiveChild = useChildStore((s) => s.setActiveChild);

  return useMutation({
    mutationFn: async ({
      name,
      birthdate,
      avatarUrl,
    }: {
      name: string;
      birthdate: string;
      avatarUrl?: string;
    }) => {
      const { data, error } = await supabase
        .from('ll_children')
        .insert({
          user_id: user!.id,
          name,
          birthdate,
          avatar_url: avatarUrl ?? null,
        })
        .select()
        .single();
      if (error) throw error;
      return data as Child;
    },
    onSuccess: async (child) => {
      // Create the initial child_levels row
      await supabase.from('ll_child_levels').insert({
        child_id: child.id,
        total_xp: 0,
        current_level: 1,
      });

      queryClient.invalidateQueries({ queryKey: ['children'] });
      setActiveChild(child.id);
    },
  });
}

export function useUpdateChild() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: {
      id: string;
      name?: string;
      birthdate?: string;
      avatar_url?: string;
    }) => {
      const { data, error } = await supabase
        .from('ll_children')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Child;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['children'] });
    },
  });
}

export function useDeleteChild() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('ll_children')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['children'] });
    },
  });
}
