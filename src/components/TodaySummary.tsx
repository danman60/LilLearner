import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CraftCard, XpBadge } from './ui';
import { colors, fonts, spacing } from '../config/theme';
import { getLevelProgress, getLevelTitle } from '../config/xp';
import { useTodayStats } from '../hooks/useTodayStats';
import { Child } from '../types';
import { useFeature } from '../stores/featureStore';

interface TodaySummaryProps {
  child: Child;
}

function formatDate(): string {
  const now = new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}`;
}

export function TodaySummary({ child }: TodaySummaryProps) {
  const { data: stats, isLoading } = useTodayStats(child.id);
  const gamificationEnabled = useFeature('GAMIFICATION');

  const todayCount = stats?.todayCount ?? 0;

  // Simple mode: just child name, date, and entry count
  if (!gamificationEnabled) {
    return (
      <CraftCard color="rgba(91, 155, 213, 0.08)" index={99} style={styles.card}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.childName}>{child.name}'s Day</Text>
            <Text style={styles.date}>{formatDate()}</Text>
          </View>
        </View>
        <View style={styles.simpleStatsRow}>
          <Text style={styles.statValue}>{todayCount}</Text>
          <Text style={styles.statLabel}>logged today</Text>
        </View>
      </CraftCard>
    );
  }

  const totalXp = stats?.totalXp ?? 0;
  const currentLevel = stats?.currentLevel ?? 1;
  const levelProgress = getLevelProgress(totalXp);
  const levelTitle = getLevelTitle(currentLevel);

  return (
    <CraftCard color="rgba(91, 155, 213, 0.08)" index={99} style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.childName}>{child.name}'s Day</Text>
          <Text style={styles.date}>{formatDate()}</Text>
        </View>
        <XpBadge level={currentLevel} size="small" />
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{todayCount}</Text>
          <Text style={styles.statLabel}>logged today</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>{totalXp}</Text>
          <Text style={styles.statLabel}>total XP</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>{levelTitle}</Text>
          <Text style={styles.statLabel}>Lv. {currentLevel}</Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${Math.min(levelProgress.progress * 100, 100)}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {levelProgress.xpInLevel}/{levelProgress.xpForNext} XP to Lv. {currentLevel + 1}
        </Text>
      </View>
    </CraftCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  childName: {
    fontFamily: fonts.displayBold,
    fontSize: 22,
    color: colors.pencilGray,
  },
  date: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: '#8B7E6A',
    marginTop: 2,
  },
  simpleStatsRow: {
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: fonts.accent,
    fontSize: 18,
    color: colors.pencilGray,
  },
  statLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: '#8B7E6A',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(74, 74, 74, 0.15)',
  },
  progressContainer: {
    marginTop: spacing.xs,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(74, 74, 74, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.craftYellow,
    borderRadius: 4,
  },
  progressText: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: '#8B7E6A',
    textAlign: 'right',
    marginTop: 4,
  },
});
