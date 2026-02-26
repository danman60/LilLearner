import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CATEGORIES } from '../../config/categories';
import { colors, fonts, spacing } from '../../config/theme';

interface CategoryPieChartProps {
  entriesByCategory: Record<string, number>;
}

/**
 * View-based proportional chart showing entry distribution across categories.
 * Uses colored blocks sized proportionally rather than a true pie chart,
 * for maximum compatibility without Victory Native complexity.
 */
export function CategoryPieChart({
  entriesByCategory,
}: CategoryPieChartProps) {
  const total = Object.values(entriesByCategory).reduce(
    (sum, n) => sum + n,
    0
  );

  if (total === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No entries yet</Text>
      </View>
    );
  }

  // Sort categories by count descending, filter out zeros
  const sorted = CATEGORIES.map((cat) => ({
    ...cat,
    count: entriesByCategory[cat.id] ?? 0,
  }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count);

  return (
    <View style={styles.container}>
      {/* Center total */}
      <View style={styles.totalContainer}>
        <Text style={styles.totalNumber}>{total}</Text>
        <Text style={styles.totalLabel}>entries</Text>
      </View>

      {/* Ring of proportional segments */}
      <View style={styles.ringContainer}>
        {sorted.map((cat) => {
          const pct = (cat.count / total) * 100;
          return (
            <View
              key={cat.id}
              style={[
                styles.segment,
                {
                  backgroundColor: cat.color,
                  flex: pct,
                  borderColor: 'rgba(0,0,0,0.06)',
                },
              ]}
            />
          );
        })}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        {sorted.map((cat) => {
          const pct = Math.round((cat.count / total) * 100);
          return (
            <View key={cat.id} style={styles.legendItem}>
              <View
                style={[
                  styles.legendDot,
                  { backgroundColor: cat.color },
                ]}
              />
              <Text style={styles.legendIcon}>{cat.icon}</Text>
              <Text style={styles.legendName} numberOfLines={1}>
                {cat.name}
              </Text>
              <Text style={styles.legendCount}>
                {cat.count} ({pct}%)
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: '#8B7E6A',
    fontStyle: 'italic',
  },
  totalContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  totalNumber: {
    fontFamily: fonts.accent,
    fontSize: 42,
    color: colors.craftBlue,
  },
  totalLabel: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: '#8B7E6A',
    marginTop: -4,
  },
  ringContainer: {
    flexDirection: 'row',
    width: '100%',
    height: 24,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  segment: {
    height: '100%',
    borderWidth: 0.5,
  },
  legend: {
    width: '100%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  legendName: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.pencilGray,
    flex: 1,
  },
  legendCount: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: '#8B7E6A',
  },
});
