import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { colors, fonts, spacing } from '@/src/config/theme';
import { Entry } from '@/src/types';
import { useEntries } from '@/src/hooks/useEntries';
import { EntryCard } from '@/src/components/EntryCard';

function getDateLabel(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const entryDate = dateStr.split('T')[0];

  if (entryDate === todayStr) return 'Today';
  if (entryDate === yesterdayStr) return 'Yesterday';

  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

interface TimelineSection {
  label: string;
  entries: Entry[];
}

function groupByDate(entries: Entry[]): TimelineSection[] {
  const grouped: Record<string, Entry[]> = {};
  const order: string[] = [];

  for (const entry of entries) {
    const dateKey = entry.logged_at.split('T')[0];
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
      order.push(dateKey);
    }
    grouped[dateKey].push(entry);
  }

  return order.map((dateKey) => ({
    label: getDateLabel(dateKey),
    entries: grouped[dateKey],
  }));
}

interface EntryTimelineProps {
  childId: string | null;
  categoryId: string;
  categoryColor: string;
}

export function EntryTimeline({
  childId,
  categoryId,
  categoryColor,
}: EntryTimelineProps) {
  const { data: entries, isLoading, refetch, isRefetching } = useEntries(childId, categoryId);

  const sections = useMemo(() => {
    if (!entries || entries.length === 0) return [];
    return groupByDate(entries);
  }, [entries]);

  // Build a flat list: section headers interleaved with entries
  const flatData = useMemo(() => {
    const items: Array<{ type: 'header'; label: string; key: string } | { type: 'entry'; entry: Entry; key: string }> = [];

    for (const section of sections) {
      items.push({ type: 'header', label: section.label, key: `header-${section.label}` });
      for (const entry of section.entries) {
        items.push({ type: 'entry', entry, key: entry.id });
      }
    }

    return items;
  }, [sections]);

  const renderItem = useCallback(
    ({ item }: { item: (typeof flatData)[number] }) => {
      if (item.type === 'header') {
        return (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>{item.label}</Text>
          </View>
        );
      }

      return <EntryCard entry={item.entry} categoryColor={categoryColor} />;
    },
    [categoryColor]
  );

  if (!childId) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>{'\uD83D\uDC76'}</Text>
        <Text style={styles.emptyText}>Select a child first</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.loadingText}>Loading entries...</Text>
      </View>
    );
  }

  if (!entries || entries.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>{'\uD83C\uDF1F'}</Text>
        <Text style={styles.emptyTitle}>No entries yet!</Text>
        <Text style={styles.emptyText}>
          Start logging activities to see them appear here.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={flatData}
      renderItem={renderItem}
      keyExtractor={(item) => item.key}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          tintColor={colors.craftBlue}
          colors={[colors.craftBlue]}
        />
      }
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContent}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: spacing.xxl,
  },
  sectionHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  sectionLabel: {
    fontFamily: fonts.displayBold,
    fontSize: 18,
    color: colors.pencilGray,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 22,
    color: colors.pencilGray,
    marginBottom: spacing.xs,
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: '#8B7E6A',
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: '#8B7E6A',
  },
});
