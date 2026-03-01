import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, spacing } from '@/src/config/theme';
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

  // Simple stats placeholder when gamification is off
  if (!FEATURES.GAMIFICATION) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>{'\uD83D\uDCCA'}</Text>
        <Text style={styles.emptyTitle}>Simple Stats</Text>
        <Text style={styles.emptySubtitle}>
          Coming soon — per-category counts, averages, and trends.
        </Text>
      </View>
    );
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
