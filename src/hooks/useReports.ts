import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Report, ReportType, Season } from '../types';
import { generateReport } from '../utils/reportGenerator';

export function useReports(childId: string | null) {
  return useQuery({
    queryKey: ['reports', childId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ll_reports')
        .select('*')
        .eq('child_id', childId!)
        .order('generated_at', { ascending: false });
      if (error) throw error;
      return data as Report[];
    },
    enabled: !!childId,
  });
}

export function useReport(reportId: string | null) {
  return useQuery({
    queryKey: ['report', reportId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ll_reports')
        .select('*')
        .eq('id', reportId!)
        .single();
      if (error) throw error;
      return data as Report;
    },
    enabled: !!reportId,
  });
}

export function useGenerateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      childId,
      reportType,
      periodStart,
      periodEnd,
      season,
    }: {
      childId: string;
      reportType: ReportType;
      periodStart: string;
      periodEnd: string;
      season?: Season;
    }) => {
      const data = await generateReport(
        childId,
        reportType,
        periodStart,
        periodEnd,
        season
      );

      const { data: report, error } = await supabase
        .from('ll_reports')
        .insert({
          child_id: childId,
          report_type: reportType,
          period_start: periodStart,
          period_end: periodEnd,
          season: season ?? null,
          data_json: data,
        })
        .select()
        .single();
      if (error) throw error;
      return report as Report;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}
