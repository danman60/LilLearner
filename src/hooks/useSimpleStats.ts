import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Entry } from '../types';

export interface CategoryStats {
  categoryId: string;
  categoryName: string;
  thisWeek: number;
  thisMonth: number;
  total: number;
  lastEntryDate: string | null;
  avgPerWeek: number;
}

function getStartOfWeek(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d.toISOString();
}

function getStartOfMonth(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(1);
  return d.toISOString();
}

export function useSimpleStats(childId: string | null) {
  return useQuery({
    queryKey: ['simpleStats', childId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ll_entries')
        .select('id, category_id, user_category_id, logged_at')
        .eq('child_id', childId!)
        .order('logged_at', { ascending: false });

      if (error) throw error;
      const entries = data as Pick<Entry, 'id' | 'category_id' | 'user_category_id' | 'logged_at'>[];

      const weekStart = getStartOfWeek();
      const monthStart = getStartOfMonth();

      // Group by category (prefer user_category_id, fall back to category_id)
      const groups: Record<string, { entries: typeof entries }> = {};
      for (const e of entries) {
        const key = e.user_category_id ?? e.category_id;
        if (!groups[key]) groups[key] = { entries: [] };
        groups[key].entries.push(e);
      }

      // Compute stats per category
      const stats: CategoryStats[] = Object.entries(groups).map(([catId, group]) => {
        const catEntries = group.entries;
        const thisWeek = catEntries.filter((e) => e.logged_at >= weekStart).length;
        const thisMonth = catEntries.filter((e) => e.logged_at >= monthStart).length;
        const total = catEntries.length;
        const lastEntryDate = catEntries.length > 0 ? catEntries[0].logged_at : null;

        // Avg per week: total / weeks since first entry (min 1)
        let avgPerWeek = 0;
        if (catEntries.length > 0) {
          const firstDate = new Date(catEntries[catEntries.length - 1].logged_at);
          const weeksSinceFirst = Math.max(1, (Date.now() - firstDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
          avgPerWeek = Math.round((total / weeksSinceFirst) * 10) / 10;
        }

        return {
          categoryId: catId,
          categoryName: catId, // Will be resolved by the component
          thisWeek,
          thisMonth,
          total,
          lastEntryDate,
          avgPerWeek,
        };
      });

      // Sort by total descending
      stats.sort((a, b) => b.total - a.total);

      return {
        stats,
        totalEntries: entries.length,
        thisWeekTotal: entries.filter((e) => e.logged_at >= weekStart).length,
        thisMonthTotal: entries.filter((e) => e.logged_at >= monthStart).length,
      };
    },
    enabled: !!childId,
  });
}
