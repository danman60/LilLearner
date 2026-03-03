import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { Child } from '../types';
import { useAuthStore } from '../stores/authStore';
import { useChildStore } from '../stores/childStore';
import { FEATURES } from '../config/features';

const LOCAL_CHILDREN_KEY = 'local_children';

async function getLocalChildren(): Promise<Child[]> {
  const raw = await AsyncStorage.getItem(LOCAL_CHILDREN_KEY);
  return raw ? JSON.parse(raw) : [];
}

async function saveLocalChildren(children: Child[]): Promise<void> {
  await AsyncStorage.setItem(LOCAL_CHILDREN_KEY, JSON.stringify(children));
}

function generateId(): string {
  return 'local-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 9);
}

export function useChildren() {
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: ['children', FEATURES.SKIP_AUTH ? 'local' : user?.id],
    queryFn: async () => {
      if (FEATURES.SKIP_AUTH) {
        return getLocalChildren();
      }
      const { data, error } = await supabase
        .from('ll_children')
        .select('*')
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as Child[];
    },
    enabled: FEATURES.SKIP_AUTH || !!user,
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
      if (FEATURES.SKIP_AUTH) {
        const child: Child = {
          id: generateId(),
          user_id: 'local',
          name,
          birthdate,
          avatar_url: avatarUrl ?? null,
          created_at: new Date().toISOString(),
        };
        const existing = await getLocalChildren();
        await saveLocalChildren([...existing, child]);
        return child;
      }

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
      if (!FEATURES.SKIP_AUTH) {
        await supabase.from('ll_child_levels').insert({
          child_id: child.id,
          total_xp: 0,
          current_level: 1,
        });
      }

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
      if (FEATURES.SKIP_AUTH) {
        const children = await getLocalChildren();
        const idx = children.findIndex((c) => c.id === id);
        if (idx === -1) throw new Error('Child not found');
        children[idx] = { ...children[idx], ...updates };
        await saveLocalChildren(children);
        return children[idx] as Child;
      }

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
      if (FEATURES.SKIP_AUTH) {
        const children = await getLocalChildren();
        await saveLocalChildren(children.filter((c) => c.id !== id));
        return;
      }

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
