import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { colors, fonts, spacing } from '../../config/theme';

interface TrendChartProps {
  childId: string;
}

const NUM_WEEKS = 8;
const BAR_MAX_HEIGHT = 120;

function getWeekLabel(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function getMondayOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - ((day + 6) % 7));
  d.setHours(0, 0, 0, 0);
  return d;
}

export function TrendChart({ childId }: TrendChartProps) {
  // Build the 8-week date ranges
  const weekRanges = useMemo(() => {
    const today = new Date();
    const currentMonday = getMondayOfWeek(today);
    const weeks: { start: string; end: string; label: string }[] = [];

    for (let i = NUM_WEEKS - 1; i >= 0; i--) {
      const monday = new Date(currentMonday);
      monday.setDate(monday.getDate() - i * 7);
      const sunday = new Date(monday);
      sunday.setDate(sunday.getDate() + 6);

      weeks.push({
        start: monday.toISOString().split('T')[0],
        end: sunday.toISOString().split('T')[0],
        label: getWeekLabel(monday),
      });
    }

    return weeks;
  }, []);

  const periodStart = weekRanges[0].start;
  const periodEnd = weekRanges[weekRanges.length - 1].end;

  // Fetch all entries in the full 8-week window
  const { data: entries } = useQuery({
    queryKey: ['trendEntries', childId, periodStart],
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

  // Count entries per week
  const weekCounts = useMemo(() => {
    const counts: number[] = weekRanges.map(() => 0);
    (entries ?? []).forEach((e) => {
      const day = e.logged_at.split('T')[0];
      for (let i = 0; i < weekRanges.length; i++) {
        if (day >= weekRanges[i].start && day <= weekRanges[i].end) {
          counts[i]++;
          break;
        }
      }
    });
    return counts;
  }, [entries, weekRanges]);

  const maxCount = Math.max(...weekCounts, 1);

  return (
    <View style={styles.container}>
      {/* Y-axis labels */}
      <View style={styles.chartArea}>
        {/* Grid lines */}
        <View style={styles.gridLines}>
          {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
            <View key={pct} style={styles.gridLineRow}>
              <Text style={styles.yLabel}>
                {Math.round(maxCount * (1 - pct))}
              </Text>
              <View style={styles.gridLine} />
            </View>
          ))}
        </View>

        {/* Bars */}
        <View style={styles.barsContainer}>
          {weekCounts.map((count, i) => {
            const height = (count / maxCount) * BAR_MAX_HEIGHT;
            return (
              <View key={i} style={styles.barColumn}>
                <View style={styles.barWrapper}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: Math.max(height, 2),
                        backgroundColor:
                          count > 0
                            ? colors.craftBlue
                            : '#E0DDD8',
                      },
                    ]}
                  />
                </View>
                <Text style={styles.xLabel} numberOfLines={1}>
                  {weekRanges[i].label}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Summary */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryNumber}>
            {weekCounts.reduce((a, b) => a + b, 0)}
          </Text>
          <Text style={styles.summaryLabel}>Total</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryNumber}>
            {Math.round(
              weekCounts.reduce((a, b) => a + b, 0) / NUM_WEEKS
            )}
          </Text>
          <Text style={styles.summaryLabel}>Avg/Week</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryNumber}>
            {Math.max(...weekCounts)}
          </Text>
          <Text style={styles.summaryLabel}>Best Week</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.sm,
  },
  chartArea: {
    height: BAR_MAX_HEIGHT + 40,
    position: 'relative',
  },
  gridLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: BAR_MAX_HEIGHT,
    justifyContent: 'space-between',
  },
  gridLineRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  yLabel: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: '#B0A89A',
    width: 24,
    textAlign: 'right',
    marginRight: 4,
  },
  gridLine: {
    flex: 1,
    height: 0.5,
    backgroundColor: 'rgba(173, 206, 240, 0.3)',
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: BAR_MAX_HEIGHT,
    paddingLeft: 30,
    paddingRight: 4,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
  },
  barWrapper: {
    width: '70%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: BAR_MAX_HEIGHT,
  },
  bar: {
    width: '100%',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    minHeight: 2,
  },
  xLabel: {
    fontFamily: fonts.display,
    fontSize: 9,
    color: '#8B7E6A',
    marginTop: 4,
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(173, 206, 240, 0.3)',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryNumber: {
    fontFamily: fonts.accent,
    fontSize: 22,
    color: colors.craftBlue,
  },
  summaryLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: '#8B7E6A',
  },
});
