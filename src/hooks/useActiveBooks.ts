import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import { ActiveBook } from '../types';

export function useActiveBooks(childId: string | null, categoryId?: string) {
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: ['activeBooks', childId, categoryId],
    queryFn: async () => {
      let query = supabase
        .from('ll_active_books')
        .select('*')
        .eq('user_id', user!.id)
        .eq('child_id', childId!)
        .order('started_at', { ascending: false });

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ActiveBook[];
    },
    enabled: !!user?.id && !!childId,
  });
}

export function useAddBook() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: async (book: {
      child_id: string;
      category_id: string;
      title: string;
    }) => {
      const { data, error } = await supabase
        .from('ll_active_books')
        .insert({
          user_id: user!.id,
          child_id: book.child_id,
          category_id: book.category_id,
          title: book.title,
          status: 'reading',
        })
        .select()
        .single();

      if (error) throw error;
      return data as ActiveBook;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeBooks'] });
    },
  });
}

export function useFinishBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookId: string) => {
      const { data, error } = await supabase
        .from('ll_active_books')
        .update({
          status: 'finished',
          finished_at: new Date().toISOString(),
        })
        .eq('id', bookId)
        .select()
        .single();

      if (error) throw error;
      return data as ActiveBook;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeBooks'] });
    },
  });
}
