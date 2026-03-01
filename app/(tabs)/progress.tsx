import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, fonts, spacing, borderRadius, shadows } from '@/src/config/theme';
import { useChildStore } from '@/src/stores/childStore';
import { useChildLevel, useStreakDays } from '@/src/hooks/useProgress';
import { getLevelProgress, getLevelTitle } from '@/src/config/xp';
import { PaperBackground } from '@/src/components/ui/PaperBackground';
import { MaskingTapeHeader } from '@/src/components/ui/MaskingTapeHeader';
import { ScissorDivider } from '@/src/components/ui/ScissorDivider';
import { XpBar } from '@/src/components/XpBar';
import { LevelBadge } from '@/src/components/LevelBadge';
import { StreakDisplay } from '@/src/components/StreakDisplay';
import { CategoryProgress } from '@/src/components/CategoryProgress';
import { AchievementWall } from '@/src/components/AchievementWall';
import { FEATURES } from '@/src/config/features';
import { useSimpleStats, CategoryStats } from '@/src/hooks/useSimpleStats';
import { useUserCategories } from '@/src/hooks/useUserCategories';
import { CATEGORIES } from '@/src/config/categories';

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'Never';
  const d = new Date(dateStr);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getDate()}`;
}

function SimpleStatCard({ stat, name }: { stat: CategoryStats; name: string }) {
  return (
    <View style={simpleStyles.statCard}>
      <Text style={simpleStyles.statName} numberOfLines={1}>{name}</Text>
      <View style={simpleStyles.statRow}>
        <View style={simpleStyles.statItem}>
          <Text style={simpleStyles.statValue}>{stat.thisWeek}</Text>
          <Text style={simpleStyles.statLabel}>This week</Text>
        </View>
        <View style={simpleStyles.statItem}>
          <Text style={simpleStyles.statValue}>{stat.thisMonth}</Text>
          <Text style={simpleStyles.statLabel}>This month</Text>
        </View>
        <View style={simpleStyles.statItem}>
          <Text style={simpleStyles.statValue}>{stat.total}</Text>
          <Text style={simpleStyles.statLabel}>Total</Text>
        </View>
        <View style={simpleStyles.statItem}>
          <Text style={simpleStyles.statValue}>{stat.avgPerWeek}</Text>
          <Text style={simpleStyles.statLabel}>Avg/week</Text>
        </View>
      </View>
      <Text style={simpleStyles.lastEntry}>Last: {formatDate(stat.lastEntryDate)}</Text>
    </View>
  );
}

function SimpleStatsView({ childId }: { childId: string }) {
  const { data: statsData, isLoading } = useSimpleStats(childId);
  const { data: userCategories } = useUserCategories();

  // Build name lookup
  const nameMap: Record<string, string> = {};
  for (const cat of CATEGORIES) {
    nameMap[cat.id] = `${cat.icon} ${cat.name}`;
  }
  if (userCategories) {
    for (const uc of userCategories) {
      nameMap[uc.id] = `${uc.icon || ''} ${uc.name}`.trim();
    }
  }

  if (isLoading) {
    return (
      <View style={simpleStyles.loadingContainer}>
        <Text style={simpleStyles.loadingText}>Loading stats...</Text>
      </View>
    );
  }

  if (!statsData || statsData.totalEntries === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>{'\uD83D\uDCCA'}</Text>
        <Text style={styles.emptyTitle}>No Entries Yet</Text>
        <Text style={styles.emptySubtitle}>
          Start logging to see your stats here.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={simpleStyles.container}
      contentContainerStyle={simpleStyles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Summary header */}
      <View style={simpleStyles.summaryCard}>
        <View style={simpleStyles.summaryRow}>
          <View style={simpleStyles.summaryItem}>
            <Text style={simpleStyles.summaryValue}>{statsData.thisWeekTotal}</Text>
            <Text style={simpleStyles.summaryLabel}>This Week</Text>
          </View>
          <View style={simpleStyles.summaryItem}>
            <Text style={simpleStyles.summaryValue}>{statsData.thisMonthTotal}</Text>
            <Text style={simpleStyles.summaryLabel}>This Month</Text>
          </View>
          <View style={simpleStyles.summaryItem}>
            <Text style={simpleStyles.summaryValue}>{statsData.totalEntries}</Text>
            <Text style={simpleStyles.summaryLabel}>All Time</Text>
          </View>
        </View>
      </View>

      {/* Per-category stats */}
      <Text style={simpleStyles.sectionTitle}>By Category</Text>
      {statsData.stats.map((stat) => (
        <SimpleStatCard
          key={stat.categoryId}
          stat={stat}
          name={nameMap[stat.categoryId] ?? stat.categoryId}
        />
      ))}

      <View style={{ height: spacing.xxl }} />
    </ScrollView>
  );
}

export default function ProgressScreen() {
  const activeChildId = useChildStore((s) => s.activeChildId);
  const { data: levelData } = useChildLevel(activeChildId);
  const { data: streak } = useStreakDays(activeChildId);

  if (!activeChildId) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>{'\uD83D\uDC76'}</Text>
        <Text style={styles.emptyTitle}>No Child Selected</Text>
        <Text style={styles.emptySubtitle}>
          Add a child in the Profile tab to start tracking progress!
        </Text>
      </View>
    );
  }

  // Simple stats when gamification is off
  if (!FEATURES.GAMIFICATION) {
    return <SimpleStatsView childId={activeChildId} />;
  }

  const totalXp = levelData?.total_xp ?? 0;
  const { level } = getLevelProgress(totalXp);
  const title = getLevelTitle(level);

  return (
    <PaperBackground scroll>
      <View style={styles.content}>
        <View style={styles.xpSection}>
          <XpBar totalXp={totalXp} />
        </View>

        <View style={styles.levelSection}>
          <LevelBadge level={level} title={title} />
        </View>

        <StreakDisplay streak={streak ?? 0} />

        <ScissorDivider style={styles.divider} />

        <MaskingTapeHeader title="Skills" />
        <CategoryProgress childId={activeChildId} />

        <ScissorDivider style={styles.divider} />

        <AchievementWall childId={activeChildId} />

        <View style={styles.bottomPad} />
      </View>
    </PaperBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.xxl + spacing.md,
    paddingBottom: spacing.xxl,
  },
  xpSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  levelSection: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  divider: {
    marginVertical: spacing.lg,
  },
  bottomPad: {
    height: spacing.xxl,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: colors.linedPaper,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 28,
    color: colors.pencilGray,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: '#8B7E6A',
    textAlign: 'center',
  },
});

const simpleStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.warmWhite,
  },
  scrollContent: {
    padding: spacing.md,
    paddingTop: spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: '#8B7E6A',
  },
  summaryCard: {
    backgroundColor: colors.warmGray,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.small,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontFamily: fonts.bodyBold,
    fontSize: 28,
    color: '#333333',
  },
  summaryLabel: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: '#8B7E6A',
    marginTop: 2,
  },
  sectionTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 18,
    color: '#333333',
    marginBottom: spacing.md,
  },
  statCard: {
    backgroundColor: colors.warmGray,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.small,
  },
  statName: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: '#333333',
    marginBottom: spacing.sm,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontFamily: fonts.bodyBold,
    fontSize: 18,
    color: '#333333',
  },
  statLabel: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: '#8B7E6A',
    marginTop: 1,
  },
  lastEntry: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: '#B0A89A',
    marginTop: spacing.xs,
    textAlign: 'right',
  },
});
