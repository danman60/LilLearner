import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { colors, fonts, spacing, borderRadius, shadows } from '../config/theme';
import { useEntries } from '../hooks/useEntries';
import { Entry } from '../types';

interface SimpleCategoryTimelineProps {
  childId: string;
  categoryId: string;
  totalLessons?: number | null;
  categoryColor?: string;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getDate()}`;
}

function TimelineEntry({ entry }: { entry: Entry }) {
  const label = entry.lesson_number
    ? `Lesson ${entry.lesson_number}`
    : entry.notes
    ? entry.notes.slice(0, 60) + (entry.notes.length > 60 ? '...' : '')
    : 'Entry logged';

  return (
    <View style={styles.entryRow}>
      <View style={styles.dot} />
      <View style={styles.entryContent}>
        <Text style={styles.entryDate}>{formatDate(entry.logged_at)}</Text>
        <Text style={styles.entryLabel}>{label}</Text>
      </View>
    </View>
  );
}

export function SimpleCategoryTimeline({
  childId,
  categoryId,
  totalLessons,
  categoryColor,
}: SimpleCategoryTimelineProps) {
  const { data: entries, isLoading } = useEntries(childId, categoryId);

  const latestLesson = entries?.find((e) => e.lesson_number != null)?.lesson_number;
  const entryCount = entries?.length ?? 0;

  const progressText = totalLessons && latestLesson
    ? `Lesson ${latestLesson} of ${totalLessons}`
    : totalLessons
    ? `${entryCount} of ${totalLessons} entries`
    : `${entryCount} entries`;

  return (
    <View style={styles.container}>
      {/* Progress header */}
      <View style={[styles.progressHeader, categoryColor ? { borderLeftColor: categoryColor } : undefined]}>
        <Text style={styles.progressText}>{progressText}</Text>
      </View>

      {isLoading ? (
        <Text style={styles.loadingText}>Loading...</Text>
      ) : entries && entries.length > 0 ? (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <TimelineEntry entry={item} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <Text style={styles.emptyText}>No entries yet</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressHeader: {
    backgroundColor: colors.warmWhite,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderRadius: borderRadius.sm,
    borderLeftWidth: 4,
    borderLeftColor: '#5B9BD5',
    ...shadows.small,
  },
  progressText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 16,
    color: '#333333',
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#5B9BD5',
    marginTop: 6,
    marginRight: spacing.md,
  },
  entryContent: {
    flex: 1,
    backgroundColor: colors.warmWhite,
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    ...shadows.small,
  },
  entryDate: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: '#8B7E6A',
    marginBottom: 2,
  },
  entryLabel: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: '#333333',
  },
  listContent: {
    paddingBottom: spacing.xxl,
  },
  loadingText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: '#8B7E6A',
    textAlign: 'center',
    padding: spacing.lg,
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: '#8B7E6A',
    textAlign: 'center',
    padding: spacing.lg,
  },
});
