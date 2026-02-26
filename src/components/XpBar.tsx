import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, fonts, spacing } from '../config/theme';
import { getLevelProgress, getLevelTitle } from '../config/xp';

interface XpBarProps {
  totalXp: number;
  style?: ViewStyle;
}

export function XpBar({ totalXp, style }: XpBarProps) {
  const { level, progress, xpInLevel, xpForNext } = getLevelProgress(totalXp);
  const title = getLevelTitle(level);
  const clampedProgress = Math.min(Math.max(progress, 0), 1);

  return (
    <View style={[styles.container, style]}>
      {/* Level title above */}
      <Text style={styles.levelTitle}>{title}</Text>

      {/* Progress bar */}
      <View style={styles.barBackground}>
        <View
          style={[
            styles.barFill,
            { width: `${clampedProgress * 100}%` as any },
          ]}
        />
      </View>

      {/* Labels below */}
      <View style={styles.labelRow}>
        <Text style={styles.levelLabel}>Level {level}</Text>
        <Text style={styles.xpLabel}>
          {xpInLevel} / {xpForNext} XP
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  levelTitle: {
    fontFamily: fonts.display,
    fontSize: 16,
    color: colors.pencilGray,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  barBackground: {
    height: 20,
    backgroundColor: '#E0E0E0',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 6,
    overflow: 'hidden',
    // Subtle hand-drawn border effect
    borderWidth: 1.5,
    borderColor: '#C0C0C0',
    borderStyle: 'solid',
  },
  barFill: {
    height: '100%',
    backgroundColor: colors.craftBlue,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 4,
    // Slight wobble via asymmetric rounding
    minWidth: 4,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  levelLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.pencilGray,
  },
  xpLabel: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.pencilGray,
  },
});
