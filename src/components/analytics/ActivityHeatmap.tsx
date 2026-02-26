import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { colors, fonts, spacing } from '../../config/theme';

interface ActivityHeatmapProps {
  childId: string;
}

const WEEKS = 12;
const DAYS_PER_WEEK = 7;
const CELL_SIZE = 18;
const CELL_GAP = 3;

const DAY_LABELS = ['M', '', 'W', '', 'F', '', ''];

function getHeatColor(count: number): string {
  if (count === 0) return '#F0EDED';
  if (count === 1) return '#C6E0B4';
  if (count <= 3) return '#7BC47F';
  return '#3A8C3F';
}

function getMonthLabel(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short' });
}

export function ActivityHeatmap({ childId }: ActivityHeatmapProps) {
  // Calculate the 84-day window
  const { startDate, dateGrid } = useMemo(() => {
    const today = new Date();
    // Start from the most recent Monday that gives us full weeks up to today
    const todayDay = today.getDay(); // 0=Sun
    const daysSinceMon = (todayDay + 6) % 7;
    const endMonday = new Date(today);
    endMonday.setDate(today.getDate() - daysSinceMon);

    // Go back WEEKS-1 more weeks for start
    const start = new Date(endMonday);
    start.setDate(start.getDate() - (WEEKS - 1) * 7);

    // Build the grid: [week][day] = date string YYYY-MM-DD
    const grid: string[][] = [];
    const current = new Date(start);
    for (let w = 0; w < WEEKS; w++) {
      const week: string[] = [];
      for (let d = 0; d < DAYS_PER_WEEK; d++) {
        week.push(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
      }
      grid.push(week);
    }

    return { startDate: start, dateGrid: grid };
  }, []);

  const totalDays = WEEKS * DAYS_PER_WEEK;
  const periodStart = dateGrid[0][0];
  const lastWeek = dateGrid[dateGrid.length - 1];
  const periodEnd = lastWeek[lastWeek.length - 1];

  // Fetch entries in the period
  const { data: entries } = useQuery({
    queryKey: ['heatmapEntries', childId, periodStart],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ll_entries')
        .select('logged_at')
        .eq('child_id', childId)
        .gte('logged_at', periodStart + 'T00:00:00')
        .lte('logged_at', periodEnd + 'T23:59:59');
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!childId,
  });

  // Count entries per day
  const dayCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    (entries ?? []).forEach((e) => {
      const day = e.logged_at.split('T')[0];
      counts[day] = (counts[day] ?? 0) + 1;
    });
    return counts;
  }, [entries]);

  // Month labels at week boundaries
  const monthLabels = useMemo(() => {
    const labels: { week: number; label: string }[] = [];
    let lastMonth = '';
    dateGrid.forEach((week, wi) => {
      const d = new Date(week[0] + 'T00:00:00');
      const m = getMonthLabel(d);
      if (m !== lastMonth) {
        labels.push({ week: wi, label: m });
        lastMonth = m;
      }
    });
    return labels;
  }, [dateGrid]);

  const today = new Date().toISOString().split('T')[0];

  return (
    <View style={styles.container}>
      {/* Month labels row */}
      <View style={styles.monthRow}>
        <View style={styles.dayLabelSpacer} />
        {dateGrid.map((_, wi) => {
          const label = monthLabels.find((l) => l.week === wi);
          return (
            <View key={wi} style={styles.monthCell}>
              {label ? (
                <Text style={styles.monthText}>{label.label}</Text>
              ) : null}
            </View>
          );
        })}
      </View>

      {/* Grid: rows = days, columns = weeks */}
      {Array.from({ length: DAYS_PER_WEEK }).map((_, dayIndex) => (
        <View key={dayIndex} style={styles.row}>
          <View style={styles.dayLabel}>
            <Text style={styles.dayLabelText}>
              {DAY_LABELS[dayIndex]}
            </Text>
          </View>
          {dateGrid.map((week, weekIndex) => {
            const dateStr = week[dayIndex];
            const count = dayCounts[dateStr] ?? 0;
            const isFuture = dateStr > today;
            return (
              <View
                key={weekIndex}
                style={[
                  styles.cell,
                  {
                    backgroundColor: isFuture
                      ? '#FAFAFA'
                      : getHeatColor(count),
                  },
                ]}
              />
            );
          })}
        </View>
      ))}

      {/* Legend */}
      <View style={styles.legendRow}>
        <Text style={styles.legendText}>Less</Text>
        {[0, 1, 2, 4].map((n) => (
          <View
            key={n}
            style={[
              styles.legendCell,
              { backgroundColor: getHeatColor(n) },
            ]}
          />
        ))}
        <Text style={styles.legendText}>More</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  monthRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  dayLabelSpacer: {
    width: 20,
  },
  monthCell: {
    width: CELL_SIZE + CELL_GAP,
    alignItems: 'center',
  },
  monthText: {
    fontFamily: fonts.display,
    fontSize: 11,
    color: '#8B7E6A',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: CELL_GAP,
  },
  dayLabel: {
    width: 20,
    alignItems: 'center',
  },
  dayLabelText: {
    fontFamily: fonts.display,
    fontSize: 11,
    color: '#8B7E6A',
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 3,
    marginHorizontal: CELL_GAP / 2,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: 4,
  },
  legendText: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: '#8B7E6A',
    marginHorizontal: 4,
  },
  legendCell: {
    width: 14,
    height: 14,
    borderRadius: 2,
  },
});
