import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import { UserCategory } from '../types';

export function useUserCategories() {
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: ['userCategories', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ll_user_categories')
        .select('*')
        .eq('user_id', user!.id)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as UserCategory[];
    },
    enabled: !!user?.id,
  });
}

export function useAddUserCategory() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: async (cat: {
      name: string;
      icon: string;
      color?: string;
      category_type?: 'lesson' | 'journal' | 'book';
      total_lessons?: number;
      sort_order?: number;
    }) => {
      const { data, error } = await supabase
        .from('ll_user_categories')
        .insert({
          user_id: user!.id,
          name: cat.name,
          icon: cat.icon,
          color: cat.color ?? '#5B9BD5',
          category_type: cat.category_type ?? 'lesson',
          total_lessons: cat.total_lessons ?? null,
          sort_order: cat.sort_order ?? 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data as UserCategory;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userCategories'] });
    },
  });
}

export function useBulkAddUserCategories() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: async (cats: {
      name: string;
      icon: string;
      color?: string;
      category_type?: 'lesson' | 'journal' | 'book';
      total_lessons?: number;
      sort_order: number;
    }[]) => {
      const rows = cats.map((cat) => ({
        user_id: user!.id,
        name: cat.name,
        icon: cat.icon,
        color: cat.color ?? '#5B9BD5',
        category_type: cat.category_type ?? 'lesson',
        total_lessons: cat.total_lessons ?? null,
        sort_order: cat.sort_order,
      }));

      const { data, error } = await supabase
        .from('ll_user_categories')
        .insert(rows)
        .select();

      if (error) throw error;
      return data as UserCategory[];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userCategories'] });
    },
  });
}

export function useUpdateUserCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<UserCategory> & { id: string }) => {
      const { data, error } = await supabase
        .from('ll_user_categories')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as UserCategory;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userCategories'] });
    },
  });
}
